import {inject} from '@loopback/core';
import {
  Request,
  RestBindings,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {ModifiedRestService, restService} from '@sourceloop/core';
import {PaymentTransaction} from '../models';
import {WebhookService} from '../services/webhook.service';
import {NotificationService} from '../services/notification.service';

export class WebhookController {
  constructor(
    @restService(PaymentTransaction)
    private paymentService: ModifiedRestService<PaymentTransaction>,
    @inject('services.WebhookService')
    private webhookService: WebhookService,
    @inject('services.NotificationService')
    private notificationService: NotificationService,
  ) {
    console.log('WebhookController initialized');
  }

  @post('/webhook/razorpay')
  @response(200, {description: 'Razorpay webhook received and processed'})
  async handleRazorpayWebhook(
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
    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      return {success: false, message: 'Missing x-razorpay-signature header'};
    }
    if (!this.webhookService.verifySignature(body, signature)) {
      return {success: false, message: 'Invalid webhook signature'};
    }
    const {event, entity, razorpayOrderId, razorpayPaymentId} =
      this.webhookService.parsePayload(body);
    if (!razorpayOrderId) {
      return {success: true, message: 'Event received, no order_id in payload'};
    }
    const existing = await this.webhookService.findTransaction(
      this.paymentService,
      razorpayOrderId,
    );
    if (!existing) {
      return {success: true, message: 'No matching transaction found'};
    }
    await this.webhookService.updateTransactionStatus(
      this.paymentService,
      existing,
      event,
      razorpayPaymentId,
      entity,
      this.notificationService,
    );
    return {success: true, message: `Webhook processed: ${event}`};
  }
}
