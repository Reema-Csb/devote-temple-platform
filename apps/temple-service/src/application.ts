import {RestBindings} from '@loopback/rest';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {IAuthUserWithPermissions} from '@sourceloop/core';
import {AuthenticationBindings} from 'loopback4-authentication';
import path from 'path';
import {MySequence} from './sequence';
import {TempleHelperService} from './services';

export {ApplicationConfig};

export class TempleServiceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.service(TempleHelperService);

    // Set up the custom sequence
    this.sequence(MySequence);

    this.bind(AuthenticationBindings.CURRENT_USER).to({
      id: '00000000-0000-4000-8000-000000000000',
      identifier: '00000000-0000-4000-8000-000000000000',
      username: 'system',
      permissions: [],
      authClientId: 0,
      role: 'system',
      firstName: 'System',
      lastName: 'User',
      userTenantId: '00000000-0000-4000-8000-000000000000',
    } as IAuthUserWithPermissions);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.bind(RestBindings.REQUEST_BODY_PARSER_OPTIONS).to({
      json: {
        limit: '50mb',
      },
    });

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
