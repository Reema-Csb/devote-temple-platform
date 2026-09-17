import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';

import { PgDataSource } from '../datasources';
import {
    NotificationPreference,
    NotificationPreferenceRelations,
} from '../models';

export class NotificationPreferenceRepository extends DefaultCrudRepository<
    NotificationPreference,
    typeof NotificationPreference.prototype.id,
    NotificationPreferenceRelations
> {
    constructor(
        @inject('datasources.pg')
        dataSource: PgDataSource,
    ) {
        super(NotificationPreference, dataSource);
    }
}