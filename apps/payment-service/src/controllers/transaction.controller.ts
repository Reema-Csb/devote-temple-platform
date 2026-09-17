import {inject, service} from '@loopback/core';
import {
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  Request,
  RestBindings,
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import jwt from 'jsonwebtoken';

import {PaymentTransaction} from '../models';
import {RazorpayService} from '../services/razorpay.service';
import {
  PaymentTransactionRepository,
  TransactionOfferingMetadataRepository,
} from '../repositories';

const basePath = '/payment-transactions';

export class TransactionController {
  constructor(
    @repository(PaymentTransactionRepository)
    public paymentTransactionRepository: PaymentTransactionRepository,

    @repository(TransactionOfferingMetadataRepository)
    public transactionOfferingMetadataRepository: TransactionOfferingMetadataRepository,

    @service(RazorpayService)
    private razorpayService: RazorpayService,

    @inject(RestBindings.Http.REQUEST)
    private req: Request,
  ) {}

  private getAuthContext(): {id: string; role?: string; templeId?: string} {
    const authHeader = this.req.headers['authorization'];
    const token =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : undefined;

    if (!token) {
      throw new HttpErrors.Unauthorized('Missing authentication token');
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET ?? 'devote_secret',
      ) as {id?: string; role?: string; templeId?: string};

      if (!decoded.id) {
        throw new Error('Invalid token payload');
      }

      return {id: decoded.id, role: decoded.role, templeId: decoded.templeId};
    } catch {
      throw new HttpErrors.Unauthorized(
        'Invalid or expired authentication token',
      );
    }
  }

  // Super admins see every transaction; temple admins see only their
  // temple's transactions; everyone else sees only their own.
  private getScopeFilter(): Where<PaymentTransaction> {
    const {id, role, templeId} = this.getAuthContext();

    if (role === 'super_admin') {
      return {};
    }

    if (role === 'temple_admin') {
      return templeId ? {templeId} : {userId: id};
    }

    return {userId: id};
  }

  @post(`${basePath}/create-order`)
  @response(200, {
    description: 'Razorpay order created',
  })
  async createOrder(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['amount', 'orderId'],
            properties: {
              amount: {type: 'number'},
              currency: {type: 'string'},
              orderId: {type: 'string'},
              templeId: {type: 'string'},
              offeringId: {type: 'string'},
              remarks: {type: 'string'},
              offeringDate: {type: 'string'},
              userId: {type: 'string'},
              devoteeName: {type: 'string'},
              nakshatra: {type: 'string'},
              gotra: {type: 'string'},
              offeringType: {type: 'string'},
            },
          },
        },
      },
    })
    body: {
      amount: number;
      currency?: string;
      orderId: string;
      templeId?: string;
      offeringId?: string;
      remarks?: string;
      offeringDate?: string;
      userId?: string;
      devoteeName?: string;
      nakshatra?: string;
      gotra?: string;
      offeringType?: string;
    },
  ): Promise<object> {
    try {
      console.log('Step 1: Creating Razorpay order...');

      const order = await this.razorpayService.createOrder(
        body.amount,
        body.currency ?? 'INR',
      );

      console.log('Step 1 SUCCESS: Razorpay order created:', order.id);

      const transaction = await this.paymentTransactionRepository.create({
        orderId: body.orderId,
        templeId: body.templeId,
        offeringId: body.offeringId,
        userId: body.userId,
        remarks: body.remarks,
        transactionId: order.id,
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        status: 'Pending',
        amount: body.amount,
        currency: body.currency ?? 'INR',
        paymentDate: new Date(),
      });

      console.log('Step 2 SUCCESS: Transaction saved:', transaction.id);

      if (body.userId && body.templeId && body.offeringDate) {
        await this.transactionOfferingMetadataRepository.create({
          userId: body.userId,
          templeId: body.templeId,
          paymentTransactionId: transaction.id,
          devoteeName: body.devoteeName?.trim() || 'Devotee',
          nakshatra: body.nakshatra,
          gotra: body.gotra,
          offeringType: body.offeringType ?? 'donation',
          offeringDate: body.offeringDate,
        });

        console.log('Step 3 SUCCESS: Offering metadata saved');
      }

      return {
        dbTransactionId: transaction.id,
        orderId: body.orderId,
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    } catch (error: any) {
      console.error('=== CREATE ORDER ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);

      if (error.errors) {
        console.error('Sequelize validation errors:');
        error.errors.forEach((e: any) => {
          console.error(' -', e.path, ':', e.message);
        });
      }

      if (error.original) {
        console.error('Original DB error:', error.original.message);
        console.error('SQL query:', error.sql);
      }

      if (error.parent) {
        console.error('Parent error:', error.parent.message);
      }

      throw error;
    }
  }

  // Called from the browser right after Razorpay Checkout resolves, so the
  // transaction status flips immediately instead of waiting on the webhook
  // (which never fires against a localhost/dev callback URL).
  @post(`${basePath}/verify-payment`)
  @response(200, {description: 'Payment verified'})
  async verifyPayment(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: [
              'razorpayOrderId',
              'razorpayPaymentId',
              'razorpaySignature',
            ],
            properties: {
              razorpayOrderId: {type: 'string'},
              razorpayPaymentId: {type: 'string'},
              razorpaySignature: {type: 'string'},
            },
          },
        },
      },
    })
    body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    },
  ): Promise<object> {
    const isValid = this.razorpayService.verifyPaymentSignature(
      body.razorpayOrderId,
      body.razorpayPaymentId,
      body.razorpaySignature,
    );

    if (!isValid) {
      return {success: false, message: 'Signature verification failed'};
    }

    const [existing] = await this.paymentTransactionRepository.find({
      where: {transactionId: body.razorpayOrderId},
      limit: 1,
    });

    if (!existing) {
      return {success: false, message: 'No matching transaction found'};
    }

    if (existing.paymentStatus !== 'success') {
      await this.paymentTransactionRepository.updateById(existing.id, {
        transactionId: body.razorpayPaymentId,
        paymentStatus: 'success',
        status: 'Success',
        paymentDate: new Date(),
      });

      // Trigger donation-confirmation notification via api-gateway
      if (existing.userId) {
        try {
          const gatewayUrl =
            process.env.API_GATEWAY_URL ?? 'http://127.0.0.1:3005';
          await fetch(
            `${gatewayUrl}/notifications/events/donation.received/${existing.userId}`,
            {method: 'POST'},
          );
        } catch (err) {
          console.error('Failed to trigger donation notification:', err);
        }
      }
    }

    const transaction = await this.paymentTransactionRepository.findById(
      existing.id,
    );

    return {success: true, transaction};
  }

  // Called from the browser when Razorpay Checkout reports a failed payment
  // or the user closes the modal, so the transaction doesn't sit at
  // "Pending" forever waiting on a webhook that may never arrive.
  @post(`${basePath}/mark-failed`)
  @response(200, {description: 'Payment marked as failed'})
  async markFailed(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['razorpayOrderId'],
            properties: {
              razorpayOrderId: {type: 'string'},
              reason: {type: 'string'},
            },
          },
        },
      },
    })
    body: {
      razorpayOrderId: string;
      reason?: string;
    },
  ): Promise<object> {
    const [existing] = await this.paymentTransactionRepository.find({
      where: {transactionId: body.razorpayOrderId},
      limit: 1,
    });

    if (!existing) {
      return {success: false, message: 'No matching transaction found'};
    }

    if (existing.paymentStatus === 'pending') {
      await this.paymentTransactionRepository.updateById(existing.id, {
        paymentStatus: 'failed',
        status: 'Failed',
        failedReason: body.reason ?? 'Payment cancelled or failed',
      });
    }

    return {success: true};
  }

  @post(`${basePath}/webhook`)
  @response(200, {description: 'Webhook received'})
  async handleWebhook(
    @requestBody({
      content: {
        'application/json': {
          schema: {type: 'object', additionalProperties: true},
        },
      },
    })
    body: Record<string, unknown>,
    @inject(RestBindings.Http.REQUEST) req: Request,
  ): Promise<object> {
    const signature = req.headers['x-razorpay-signature'] as string | undefined;

    const isValid = this.razorpayService.verifyWebhookSignature(
      JSON.stringify(body),
      signature,
    );

    if (!isValid) {
      console.error('[Webhook] Signature verification failed');
      return {success: false, message: 'Invalid webhook signature'};
    }

    const event = body.event as string;

    const paymentEntity = (body.payload as Record<string, unknown>)?.payment as
      | Record<string, unknown>
      | undefined;

    const entity = paymentEntity?.entity as Record<string, unknown> | undefined;

    const razorpayOrderId = entity?.order_id as string | undefined;
    const razorpayPaymentId = entity?.id as string | undefined;

    if (!razorpayOrderId) {
      return {success: true, message: 'Event received, no order_id found'};
    }

    const [existing] = await this.paymentTransactionRepository.find({
      where: {transactionId: razorpayOrderId},
      limit: 1,
    });

    if (!existing) {
      console.warn(
        '[Webhook] No transaction found for orderId:',
        razorpayOrderId,
      );
      return {success: true, message: 'No matching transaction found'};
    }

    if (event === 'payment.captured' || event === 'order.paid') {
      await this.paymentTransactionRepository.updateById(existing.id, {
        transactionId: razorpayPaymentId,
        paymentStatus: 'success',
        status: 'Success',
        paymentDate: new Date(),
      });
    } else if (event === 'payment.failed') {
      const errorDesc =
        (entity?.error_description as string) ?? 'Payment failed';

      await this.paymentTransactionRepository.updateById(existing.id, {
        paymentStatus: 'failed',
        status: 'Failed',
        failedReason: errorDesc,
      });
    }

    return {success: true, message: `Webhook processed: ${event}`};
  }

  @get('/transaction-offering-metadata')
  async findOfferingMetadata() {
    return this.transactionOfferingMetadataRepository.find();
  }

  @post(basePath)
  @response(200)
  async create(
    @requestBody() paymentTransaction: Omit<PaymentTransaction, 'id'>,
  ) {
    return this.paymentTransactionRepository.create(paymentTransaction);
  }

  @get(`${basePath}/count`)
  @response(200, {description: 'Count'})
  async count(
    @param.where(PaymentTransaction) where?: Where<PaymentTransaction>,
  ) {
    return this.paymentTransactionRepository.count({
      ...where,
      ...this.getScopeFilter(),
    });
  }

  @get(basePath)
  async find(
    @param.filter(PaymentTransaction) filter?: Filter<PaymentTransaction>,
  ) {
    return this.paymentTransactionRepository.find({
      ...filter,
      where: {...filter?.where, ...this.getScopeFilter()},
    });
  }

  @get(`${basePath}/{id}`)
  async findById(
    @param.path.string('id') id: string,
    @param.filter(PaymentTransaction, {exclude: 'where'})
    filter?: FilterExcludingWhere<PaymentTransaction>,
  ) {
    const {id: userId, role, templeId} = this.getAuthContext();
    const transaction = await this.paymentTransactionRepository.findById(
      id,
      filter,
    );

    const withinScope =
      role === 'super_admin' ||
      (role === 'temple_admin'
        ? !!templeId && transaction?.templeId === templeId
        : transaction?.userId === userId);

    if (!withinScope) {
      throw new HttpErrors.NotFound('Transaction not found');
    }

    return transaction;
  }





  

  // Internal endpoint for service-to-service calls (e.g. AnalyticsController
  // in api-gateway). Not user-auth-gated since the caller already trusts the
  // userId passed in — used only for read-only aggregation, never mutates data.
  @get(`${basePath}/by-user/{userId}`)
  @response(200, {description: 'Transactions for a given user (internal use)'})
  async findByUserId(
    @param.path.string('userId') userId: string,
  ): Promise<PaymentTransaction[]> {
    return this.paymentTransactionRepository.find({
      where: {userId},
    });
  }








  @patch(`${basePath}/{id}`)
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() data: Partial<PaymentTransaction>,
  ) {
    await this.paymentTransactionRepository.updateById(id, data);
  }

  @del(`${basePath}/{id}`)
  async deleteById(@param.path.string('id') id: string) {
    await this.paymentTransactionRepository.deleteById(id);
  }
}
