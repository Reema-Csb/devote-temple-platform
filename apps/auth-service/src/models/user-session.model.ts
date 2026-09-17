import { Entity, model, property } from '@loopback/repository';

@model({
    settings: {
        postgresql: {
            schema: 'main',
            table: 'user_sessions',
        },
    },
})
export class UserSession extends Entity {

    @property({
        type: 'string',
        id: true,
        generated: true,
    })
    id?: string;

    @property({
        type: 'string',
        required: true,
        postgresql: {
            columnName: 'user_id',
        },
    })
    userId: string;

    @property({
        type: 'string',
        postgresql: {
            columnName: 'device_info',
        },
    })
    deviceInfo?: string;

    @property({
        type: 'string',
        postgresql: {
            columnName: 'ip_address',
        },
    })
    ipAddress?: string;

    @property({
        type: 'date',
        postgresql: {
            columnName: 'created_on',
        },
    })
    createdOn?: string;

    @property({
        type: 'date',
        required: true,
        postgresql: {
            columnName: 'expires_at',
        },
    })
    expiresAt: string;

    @property({
        type: 'boolean',
        default: false,
    })
    revoked?: boolean;

    @property({
        type: 'date',
        postgresql: {
            columnName: 'revoked_on',
        },
    })
    revokedOn?: string;

    constructor(data?: Partial<UserSession>) {
        super(data);
    }
}

export interface UserSessionRelations {}

export type UserSessionWithRelations = UserSession & UserSessionRelations;
