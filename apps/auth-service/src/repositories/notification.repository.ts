import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { PgDataSource } from '../datasources';
import { Notification, NotificationRelations } from '../models';

export class NotificationRepository extends DefaultCrudRepository<Notification, string, NotificationRelations> {
    constructor(
        @inject('datasources.pg') dataSource: PgDataSource,
    ) {
        super(Notification, dataSource);
    }
}