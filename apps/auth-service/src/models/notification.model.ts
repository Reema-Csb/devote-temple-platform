import { Entity, model, property } from '@loopback/repository';

@model({
    settings: {
        postgresql: {
            schema: 'main',
            table: 'notifications',
        },
    },
})
export class Notification extends Entity {
    @property({
        type: 'string',
        id: true,
        generated: true,
        postgresql: {
            columnName: 'id',
            dataType: 'uuid',
        },
    })
    id?: string;

    @property({
        type: 'string',
        required: true,
        postgresql: {
            columnName: 'user_id',
            dataType: 'varchar',
        },
    })
    userId: string;

    @property({
        type: 'string',
        required: true,
        postgresql: {
            columnName: 'title',
            dataType: 'varchar',
        },
    })
    title: string;

    @property({
        type: 'string',
        required: true,
        postgresql: {
            columnName: 'body',
            dataType: 'text',
        },
    })
    body: string;

    @property({
        type: 'string',
        default: 'Push',
        postgresql: {
            columnName: 'type',
            dataType: 'varchar',
        },
    })
    type?: string;

    @property({
        type: 'object',
        postgresql: {
            columnName: 'data',
            dataType: 'jsonb',
        },
    })
    data?: Record<string, string>;

    @property({
        type: 'boolean',
        default: false,
        postgresql: {
            columnName: 'is_read',
            dataType: 'boolean',
        },
    })
    isRead?: boolean;

    @property({
        type: 'date',
        postgresql: {
            columnName: 'read_at',
            dataType: 'timestamp with time zone',
        },
    })
    readAt?: Date;

    @property({
        type: 'boolean',
        default: false,
        postgresql: {
            columnName: 'deleted',
            dataType: 'boolean',
        },
    })
    deleted?: boolean;

    @property({
        type: 'date',
        postgresql: {
            columnName: 'created_on',
            dataType: 'timestamp with time zone',
        },
    })
    createdOn?: Date;

    @property({
        type: 'date',
        postgresql: {
            columnName: 'modified_on',
            dataType: 'timestamp with time zone',
        },
    })
    modifiedOn?: Date;

    constructor(data?: Partial<Notification>) {
        super(data);
    }
}

export interface NotificationRelations { }

export type NotificationWithRelations = Notification & NotificationRelations;