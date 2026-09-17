import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {PaymentServiceDataSourceConfig} from './configs';

@lifeCycleObserver('datasource')
export class PaymentServiceDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'paymentService';
  static readonly defaultConfig = PaymentServiceDataSourceConfig;

  constructor(
    @inject('datasources.config.paymentService', {optional: true})
    dsConfig: object = PaymentServiceDataSourceConfig,
  ) {
    super(dsConfig);
  }
}
