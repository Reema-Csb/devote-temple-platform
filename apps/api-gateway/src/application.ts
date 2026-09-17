import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {ProxyBuilderBindings, ProxyBuilderComponent} from '@sourceloop/core';
import {PaymentTransaction} from './models/payment-service';
import {Temple} from './models/temple-service';
import {WebhookService} from './services/webhook.service';
import {Notification} from './models/auth-service';
import {NotificationService} from './services';
import {NotificationPreference} from './models/auth-service';
import {AuthServiceProvider} from './services/auth-service.service';
import {PaymentServiceProvider} from './services/payment-service.service';
export {ApplicationConfig};

export class ApiGatewayApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.sequence(MySequence);
    this.bind('services.NotificationService').toClass(NotificationService);
    this.bind('services.AuthService').toProvider(AuthServiceProvider);
    this.bind('services.PaymentService').toProvider(PaymentServiceProvider);

    this.static('/', path.join(__dirname, '../public'));

    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.bind(ProxyBuilderBindings.CONFIG).to([
      {
        baseUrl: process.env.PAYMENT_SERVICE_URL as string,
        configs: [
          {
            model: PaymentTransaction,
            basePath: '/payment-transactions',
          },
        ],
      },
      {
        baseUrl: process.env.TEMPLE_SERVICE_URL as string,
        configs: [
          {
            model: Temple,
            basePath: '/temples',
          },
        ],
      },
      {
        baseUrl: process.env.AUTH_SERVICE_URL as string,
        configs: [
          {
            model: NotificationPreference,
            basePath: '/notification-preferences',
          },
          {
            model: Notification,
            basePath: '/notifications',
          },
        ],
      },
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.component(ProxyBuilderComponent as any);
    // Override default token validator — no auth on gateway yet
    this.bind(ProxyBuilderBindings.TOKEN_VALIDATOR).to(
      (_context: object, token?: string) => token ?? '',
    );
    this.service(WebhookService);
    this.projectRoot = __dirname;
    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
