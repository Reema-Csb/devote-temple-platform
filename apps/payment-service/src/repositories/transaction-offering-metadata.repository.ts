import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';

import {PgDataSource} from '../datasources';
import {TransactionOfferingMetadata} from '../models';

export class TransactionOfferingMetadataRepository extends SequelizeCrudRepository<
  TransactionOfferingMetadata,
  typeof TransactionOfferingMetadata.prototype.id
> {
  constructor(
    @inject('datasources.pg')
    dataSource: PgDataSource,
  ) {
    super(TransactionOfferingMetadata, dataSource);
  }
}
