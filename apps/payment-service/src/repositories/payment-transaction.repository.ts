import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';

import {PgDataSource} from '../datasources';
import {
  PaymentTransaction,
  PaymentTransactionRelations,
} from '../models';

export class PaymentTransactionRepository extends SequelizeCrudRepository<
  PaymentTransaction,
  typeof PaymentTransaction.prototype.id,
  PaymentTransactionRelations
> {
  constructor(
    @inject('datasources.pg') dataSource: PgDataSource,
  ) {
    super(PaymentTransaction, dataSource);
  }
}