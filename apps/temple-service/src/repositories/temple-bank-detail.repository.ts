import {Getter, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {AuthenticationBindings} from 'loopback4-authentication';
import {IAuthUserWithPermissions} from '@sourceloop/core';
import {SequelizeUserModifyCrudRepositoryCore} from '@devote/core';

import {PgDataSource} from '../datasources';
import {TempleBankDetail, TempleBankDetailRelations} from '../models';

export class TempleBankDetailRepository extends SequelizeUserModifyCrudRepositoryCore<
  TempleBankDetail,
  typeof TempleBankDetail.prototype.id,
  TempleBankDetailRelations
> {
  constructor(
    @inject('datasources.pg') dataSource: PgDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public readonly getCurrentUser: Getter<IAuthUserWithPermissions>,
  ) {
    super(TempleBankDetail, dataSource, getCurrentUser);
  }
}
