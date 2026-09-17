import { Entity, model, property } from '@loopback/repository';

@model({
    settings: {
        postgresql: {
            schema: 'main',
            table: 'user_address',
        },
    },
})
export class UserAddress extends Entity {
    @property({
        type: 'string',
        id: true,
        generated: false,
        useDefaultIdType: false,
        postgresql: {
            dataType: 'uuid',
            defaultFn: 'gen_random_uuid()',
        },
    })
    id?: string;

    @property({
        type: 'string',
        required: true,
        postgresql: {
            columnName: 'user_id',
            dataType: 'uuid',
        },
    })
    userId: string;

    @property({
        type: 'string',
        required: true,
    })
    address: string;

    @property({
        type: 'string',
    })
    city?: string;

    @property({
        type: 'string',
    })
    state?: string;

    @property({
        type: 'string',
        default: 'India',
    })
    country?: string;

    @property({
        type: 'string',
    })
    pincode?: string;

    @property({
        type: 'date',
        postgresql: {
            columnName: 'created_on',
        },
    })
    createdOn?: string;

    @property({
        type: 'date',
        postgresql: {
            columnName: 'modified_on',
        },
    })
    modifiedOn?: string;

    constructor(data?: Partial<UserAddress>) {
        super(data);
    }
}

export interface UserAddressRelations {}

export type UserAddressWithRelations = UserAddress & UserAddressRelations;
