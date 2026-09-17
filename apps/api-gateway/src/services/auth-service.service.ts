import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {AuthServiceDataSource} from '../datasources';

export interface AuthService {
  getFcmTokens: (
    userId: string,
  ) => Promise<{fcmToken: string; userId: string; deviceType?: string}[]>;
  createNotification: (notificationData: object) => Promise<object>;
}

export class AuthServiceProvider implements Provider<AuthService> {
  constructor(
    @inject('datasources.authService')
    protected dataSource: AuthServiceDataSource = new AuthServiceDataSource(),
  ) {}

  value(): Promise<AuthService> {
    return getService(this.dataSource);
  }
}
