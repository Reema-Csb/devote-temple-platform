import {inject} from '@loopback/core';

import {PgDataSource} from '../datasources';

import {TempleImage, TempleImageRelations} from '../models';
import { SequelizeCrudRepository } from '@loopback/sequelize';

export class TempleImageRepository extends SequelizeCrudRepository<
  TempleImage,
  typeof TempleImage.prototype.id,
  TempleImageRelations
> {
  constructor(
    @inject('datasources.pg')
    dataSource: PgDataSource,
  ) {
    super(TempleImage, dataSource);
  }
}