import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {PaymentServiceDataSource} from '../datasources';
import {PaymentTransaction} from '../models';

export interface PaymentService {
  getTransactionOfferingMetadata: () => Promise<object>;

  forwardRazorpayWebhook: (
    body: Record<string, unknown>,
    signature: string,
  ) => Promise<object>;

  findTransactionsByUserId: (userId: string) => Promise<PaymentTransaction[]>;
}

export class PaymentServiceProvider implements Provider<PaymentService> {
  constructor(
    @inject('datasources.paymentService')
    protected dataSource: PaymentServiceDataSource = new PaymentServiceDataSource(),
  ) {}

  value(): Promise<PaymentService> {
    return getService(this.dataSource);
  }
}
