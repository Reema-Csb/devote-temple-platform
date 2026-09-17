import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {PgDataSource} from '../datasources';
import {TempleOffering, TempleOfferingRelations, Temple} from '../models';
import {TempleRepository} from './temple.repository';

import { SequelizeUserModifyCrudRepositoryCore } from "@devote/core";
import { IAuthUserWithPermissions } from "@sourceloop/core";
import {AuthenticationBindings} from 'loopback4-authentication';

export class TempleOfferingRepository extends SequelizeUserModifyCrudRepositoryCore<
  TempleOffering,
  typeof TempleOffering.prototype.id,
  TempleOfferingRelations
> {

  public readonly temple: BelongsToAccessor<Temple, typeof TempleOffering.prototype.id>;

  constructor(
    @inject('datasources.pg') dataSource: PgDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public readonly getCurrentUser: Getter<IAuthUserWithPermissions>,
     @repository.getter('TempleRepository') protected templeRepositoryGetter: Getter<TempleRepository>,
  ) {
    super(TempleOffering, dataSource, getCurrentUser);
    this.temple = this.createBelongsToAccessorFor('temple', templeRepositoryGetter,);
    this.registerInclusionResolver('temple', this.temple.inclusionResolver);
  }
}
