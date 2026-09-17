import crypto from 'crypto';
import {injectable} from '@loopback/core';
import {ModifiedRestService} from '@sourceloop/core';
import {PaymentTransaction} from '../models';
import {NotificationService} from './notification.service';
import {NotificationEvents} from '../enums';

@injectable()
export class WebhookService {
  verifySignature(body: Record<string, unknown>, signature: string): boolean {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');
    return expectedSignature === signature;
  }

  parsePayload(body: Record<string, unknown>) {
    const event = body.event as string;
    const payload = body.payload as Record<string, unknown>;
    const paymentEntity = payload?.payment as Record<string, unknown>;
    const entity = paymentEntity?.entity as Record<string, unknown>;
    const razorpayOrderId = entity?.order_id as string;
    const razorpayPaymentId = entity?.id as string;
    return {event, entity, razorpayOrderId, razorpayPaymentId};
  }

  async findTransaction(
    paymentService: ModifiedRestService<PaymentTransaction>,
    razorpayOrderId: string,
  ): Promise<PaymentTransaction | undefined> {
    const transactions = await paymentService.find({
      where: {transactionId: razorpayOrderId} as object,
      limit: 1,
    });
    return transactions[0];
  }

  async updateTransactionStatus(
    paymentService: ModifiedRestService<PaymentTransaction>,
    existing: PaymentTransaction,
    event: string,
    razorpayPaymentId: string,
    entity: Record<string, unknown>,
    notificationService: NotificationService,
  ): Promise<void> {
    let notificationEvent: NotificationEvents | null = null;
    if (event === 'payment.captured' || event === 'order.paid') {
      notificationEvent = NotificationEvents.DONATION_RECEIVED;
      await paymentService.updateById(existing.id!, {
        transactionId: razorpayPaymentId,
        paymentStatus: 'success',
        status: 'Success',
        paymentDate: new Date(),
      });
      //send push notification to user about successful payment
    } else if (event === 'payment.failed') {
      notificationEvent = NotificationEvents.DONATION_FAILED;
      const errorDesc =
        (entity?.error_description as string) ?? 'Payment failed';
      await paymentService.updateById(existing.id!, {
        paymentStatus: 'failed',
        status: 'Failed',
        failedReason: errorDesc,
      });
    }

    if (existing.userId && notificationEvent) {
      console.log('Webhook Event:', event);
      console.log('Existing User:', existing.userId);
      console.log('Notification Event:', notificationEvent);
      console.log('Calling sendNotificationForEvent...');
      await notificationService.sendNotificationForEvent(
        notificationEvent,
        existing.userId,
      );
    }
  }
}
