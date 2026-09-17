import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PgDataSource} from '../datasources';
import {NotificationToken, NotificationTokenRelations} from '../models';

export class NotificationTokenRepository extends DefaultCrudRepository<
  NotificationToken,
  typeof NotificationToken.prototype.id,
  NotificationTokenRelations
> {
  constructor(
    @inject('datasources.pg') dataSource: PgDataSource,
  ) {
    super(NotificationToken, dataSource);
  }
}
