import { inject, Getter } from "@loopback/core";

import {
  DefaultCrudRepository,
  repository,
  HasOneRepositoryFactory,
  HasManyRepositoryFactory,
} from "@loopback/repository";

import { PgDataSource } from "../datasources";

import {
  Temple,
  TempleRelations,
  TempleLocation,
  TempleOffering,
} from "../models";

import { TempleLocationRepository } from "./temple-location.repository";
import { TempleOfferingRepository } from './temple-offering.repository';
import { SequelizeUserModifyCrudRepositoryCore } from "@devote/core";
import { IAuthUserWithPermissions } from "@sourceloop/core";
import {AuthenticationBindings} from 'loopback4-authentication';

export class TempleRepository extends SequelizeUserModifyCrudRepositoryCore<
  Temple,
  typeof Temple.prototype.id,
  TempleRelations
> {

  public readonly templeLocation: HasOneRepositoryFactory<TempleLocation, typeof Temple.prototype.id>;

  public readonly templeOfferings: HasManyRepositoryFactory<TempleOffering, typeof Temple.prototype.id>;

  constructor(
    @inject('datasources.pg') dataSource: PgDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public readonly getCurrentUser: Getter<IAuthUserWithPermissions>,
     @repository.getter('TempleLocationRepository') protected templeLocationRepositoryGetter: Getter<TempleLocationRepository>, @repository.getter('TempleOfferingRepository') protected templeOfferingRepositoryGetter: Getter<TempleOfferingRepository>,
  ) {
    super(Temple, dataSource, getCurrentUser);
    this.templeOfferings = this.createHasManyRepositoryFactoryFor('templeOfferings', templeOfferingRepositoryGetter,);
    this.registerInclusionResolver('templeOfferings', this.templeOfferings.inclusionResolver);
    this.templeLocation = this.createHasOneRepositoryFactoryFor('templeLocation', templeLocationRepositoryGetter);
    this.registerInclusionResolver('templeLocation', this.templeLocation.inclusionResolver);
  }
}