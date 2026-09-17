import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';

import {PgDataSource} from '../datasources';
import {TempleVendor, TempleVendorRelations} from '../models';

export class TempleVendorRepository extends SequelizeCrudRepository<
  TempleVendor,
  typeof TempleVendor.prototype.id,
  TempleVendorRelations
> {
  constructor(@inject('datasources.pg') dataSource: PgDataSource) {
    super(TempleVendor, dataSource);
  }
}
