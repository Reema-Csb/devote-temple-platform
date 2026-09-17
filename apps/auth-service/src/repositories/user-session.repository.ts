import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { PgDataSource } from '../datasources';
import { UserSession, UserSessionRelations } from '../models';

export class UserSessionRepository extends DefaultCrudRepository<
    UserSession,
    typeof UserSession.prototype.id,
    UserSessionRelations
> {
    constructor(
        @inject('datasources.pg') dataSource: PgDataSource,
    ) {
        super(UserSession, dataSource);
    }
}
