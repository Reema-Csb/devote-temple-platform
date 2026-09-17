import { Entity, model, property } from '@loopback/repository';

@model({
    settings: {
        postgresql: {
            schema: 'main',
            table: 'user_credentials',
        },
    },
})
export class UserCredential extends Entity {

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
        required: true,
        postgresql: {
            columnName: 'auth_provider',
        },
    })
    authProvider: string;

    @property({
        type: 'string',
        postgresql: {
            columnName: 'auth_id',
        },
    })
    authId?: string;

    @property({
        type: 'string',
        postgresql: {
            columnName: 'auth_token',
        },
    })
    authToken?: string;

    @property({
        type: 'string',
    })
    password?: string;

    @property({
        type: 'date',
        required: true,
        postgresql: {
            columnName: 'created_on',
        },
    })
    createdOn: string;

    @property({
        type: 'date',
        required: true,
        postgresql: {
            columnName: 'modified_on',
        },
    })
    modifiedOn: string;

    @property({
        type: 'boolean',
        default: false,
        postgresql: {
            columnName: 'deleted',
        },
    })
    deleted?: boolean;

    @property({
        type: 'date',
        postgresql: {
            columnName: 'deleted_on',
        },
    })
    deletedOn?: string;

    @property({
        type: 'string',
        postgresql: {
            columnName: 'deleted_by',
        },
    })
    deletedBy?: string;

    constructor(data?: Partial<UserCredential>) {
        super(data);
    }
}

export interface UserCredentialRelations {
    // describe navigational properties here
}

export type UserCredentialWithRelations =
    UserCredential & UserCredentialRelations;