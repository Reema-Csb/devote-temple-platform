import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {AuthServiceDataSourceConfig} from './configs';

@lifeCycleObserver('datasource')
export class AuthServiceDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'authService';
  static readonly defaultConfig = AuthServiceDataSourceConfig;

  constructor(
    @inject('datasources.config.authService', {optional: true})
    dsConfig: object = AuthServiceDataSourceConfig,
  ) {
    super(dsConfig);
  }
}
