import Razorpay from 'razorpay';
import crypto from 'crypto';
import 'dotenv/config';

export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      throw new Error('Razorpay keys missing in environment');
    }

    this.razorpay = new Razorpay({
      key_id,
      key_secret,
    });
  }

  // Returns true if signature matches.
  // If RAZORPAY_WEBHOOK_SECRET is not set, skips check (dev mode) and returns true.
  verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.warn('[Webhook] RAZORPAY_WEBHOOK_SECRET not set — skipping signature check (dev mode)');
      return true;
    }

    if (!signature) {
      console.error('[Webhook] x-razorpay-signature header missing');
      return false;
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return expected === signature;
  }

  // Verifies the signature Razorpay Checkout returns to the browser after a
  // successful payment (HMAC-SHA256 of "order_id|payment_id" using the key secret).
  verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string,
  ): boolean {
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    return expected === signature;
  }

  async createOrder(amount: number, currency = 'INR') {
    console.log(
      'Creating Razorpay order with amount:',
      amount,
      'currency:',
      currency,
    );
    return this.razorpay.orders
      .create({
        amount: Number((amount * 100).toFixed(0)), // convert to paise
        currency,
        receipt: `rcpt_${Date.now()}`,
      })
      .catch(err => {
        console.error('Error creating Razorpay order:', err);
        throw err;
      });
  }

}
