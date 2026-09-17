import {inject} from '@loopback/core';

import {SequelizeCrudRepository} from '@loopback/sequelize';
import {PgDataSource} from '../datasources';

import {
  OfferingCategoryMapping,
  OfferingCategoryMappingRelations,
} from '../models';

export class OfferingCategoryMappingRepository extends SequelizeCrudRepository<
  OfferingCategoryMapping,
  typeof OfferingCategoryMapping.prototype.id,
  OfferingCategoryMappingRelations
> {
  constructor(
    @inject('datasources.pg')
    dataSource: PgDataSource,
  ) {
    super(OfferingCategoryMapping, dataSource);
  }
}
