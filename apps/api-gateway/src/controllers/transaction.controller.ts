import {Count, Filter, FilterExcludingWhere, Where} from '@loopback/repository';
import {
  del,
  get,
  HttpErrors,
  param,
  patch,
  post,
  Request,
  requestBody,
  response,
  RestBindings,
} from '@loopback/rest';
import {inject} from '@loopback/core';
import jwt from 'jsonwebtoken';

import {ModifiedRestService, restService} from '@sourceloop/core';
import {PaymentTransaction, Temple} from '../models';
import {PaymentService} from '../services/payment-service.service';

const basePath = '/payment-transactions';

export class TransactionController {
  constructor(
    @restService(PaymentTransaction)
    private paymentService: ModifiedRestService<PaymentTransaction>,
    @restService(Temple)
    private templeService: ModifiedRestService<Temple>,
    @inject('services.PaymentService')
    private customPaymentService: PaymentService,
    @inject(RestBindings.Http.REQUEST)
    private req: Request,
  ) {}

  private getAuthHeader(): string {
    const authHeader = this.req.headers['authorization'];
    return typeof authHeader === 'string' ? authHeader : '';
  }

  private getAuthenticatedUserId(): string {
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
      ) as {id?: string};

      if (!decoded.id) {
        throw new Error('Invalid token payload');
      }

      return decoded.id;
    } catch {
      throw new HttpErrors.Unauthorized(
        'Invalid or expired authentication token',
      );
    }
  }

  @post(basePath)
  @response(200)
  async create(
    @requestBody() paymentTransaction: Omit<PaymentTransaction, 'id'>,
  ) {
    return this.paymentService.create(paymentTransaction);
  }

  @get(`${basePath}/count`)
  @response(200, {description: 'Count'})
  async count(
    @param.where(PaymentTransaction) where?: Where<PaymentTransaction>,
  ): Promise<Count> {
    const userId = this.getAuthenticatedUserId();
    return this.paymentService.count({...where, userId}, this.getAuthHeader());
  }
  @get('/transaction-offering-metadata')
  async findOfferingMetadata() {
    return this.customPaymentService.getTransactionOfferingMetadata();
  }
  @get(basePath)
  async find(
    @param.filter(PaymentTransaction) filter?: Filter<PaymentTransaction>,
  ) {
    const userId = this.getAuthenticatedUserId();
    const scopedFilter: Filter<PaymentTransaction> = {
      ...filter,
      where: {...filter?.where, userId},
    };
    const transactions = await this.paymentService.find(
      scopedFilter,
      this.getAuthHeader(),
    );
    const uniqueTempleIds = [
      ...new Set(
        transactions
          .map(tx => tx.templeId)
          .filter(
            (id): id is string => typeof id === 'string' && id.length > 0,
          ),
      ),
    ];

    const templeNameMap: Record<string, string> = {};
    await Promise.all(
      uniqueTempleIds.map(async templeId => {
        try {
          const temple = await this.templeService.findById(templeId);
          templeNameMap[templeId] = temple?.name ?? 'Unknown Temple';
        } catch {
          templeNameMap[templeId] = 'Unknown Temple';
        }
      }),
    );

    return transactions.map(tx => ({
      ...tx,
      templeName: tx.templeId
        ? (templeNameMap[tx.templeId] ?? 'Unknown Temple')
        : 'Unknown Temple',
    }));
  }

  @get(`${basePath}/{id}`)
  async findById(
    @param.path.string('id') id: string,
    @param.filter(PaymentTransaction, {exclude: 'where'})
    filter?: FilterExcludingWhere<PaymentTransaction>,
  ) {
    const userId = this.getAuthenticatedUserId();
    const transaction = await this.paymentService.findById(
      id,
      filter,
      this.getAuthHeader(),
    );
    if (transaction?.userId !== userId) {
      throw new HttpErrors.NotFound('Transaction not found');
    }
    return transaction;
  }

  @patch(`${basePath}/{id}`)
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() data: Partial<PaymentTransaction>,
  ) {
    await this.paymentService.updateById(id, data);
  }

  @del(`${basePath}/{id}`)
  async deleteById(@param.path.string('id') id: string) {
    await this.paymentService.deleteById(id);
  }

  @post('/webhook/razorpay')
  @response(200, {
    description: 'Proxy Razorpay webhook to payment service',
  })
  async razorpayWebhook(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
    })
    body: Record<string, unknown>,
  ): Promise<object> {
    const signatureHeader = this.req.headers['x-razorpay-signature'];

    const signature =
      typeof signatureHeader === 'string' ? signatureHeader : '';

    if (!signature) {
      throw new HttpErrors.Unauthorized('Missing Razorpay webhook signature');
    }

    return this.customPaymentService.forwardRazorpayWebhook(body, signature);
  }
}
