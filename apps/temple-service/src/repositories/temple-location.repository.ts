import {inject, Getter} from '@loopback/core';
import { repository, BelongsToAccessor} from '@loopback/repository';
import {PgDataSource} from '../datasources';
import {TempleLocation, TempleLocationRelations, Temple} from '../models';
import {TempleRepository} from './temple.repository';

import { SequelizeUserModifyCrudRepositoryCore } from "@devote/core";
import { IAuthUserWithPermissions } from "@sourceloop/core";
import {AuthenticationBindings} from 'loopback4-authentication';

export class TempleLocationRepository extends SequelizeUserModifyCrudRepositoryCore<
  TempleLocation,
  typeof TempleLocation.prototype.id,
  TempleLocationRelations
> {

  public readonly temple: BelongsToAccessor<Temple, typeof TempleLocation.prototype.id>;

  constructor(
    @inject('datasources.pg') dataSource: PgDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public readonly getCurrentUser: Getter<IAuthUserWithPermissions>,
     @repository.getter('TempleRepository') protected templeRepositoryGetter: Getter<TempleRepository>,
  ) {
    super(TempleLocation, dataSource,getCurrentUser);
    this.temple = this.createBelongsToAccessorFor('temple', templeRepositoryGetter,);
    this.registerInclusionResolver('temple', this.temple.inclusionResolver);
  }
}
