import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';

import {PgDataSource} from '../datasources';
import {Payout, PayoutRelations} from '../models';

export class PayoutRepository extends SequelizeCrudRepository<
  Payout,
  typeof Payout.prototype.id,
  PayoutRelations
> {
  constructor(@inject('datasources.pg') dataSource: PgDataSource) {
    super(Payout, dataSource);
  }
}
