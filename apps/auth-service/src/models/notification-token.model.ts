import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    postgresql: {
      schema: 'main',
      table: 'notification_tokens',
    },
  },
})
export class NotificationToken extends Entity {
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
      columnName: 'fcm_token',
      dataType: 'text',
    },
  })
  fcmToken: string;


  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'device_id',
      dataType: 'varchar',
    },
  })
  deviceId: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'device_type',
      dataType: 'varchar',
    },
  })
  deviceType?: string;

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

  constructor(data?: Partial<NotificationToken>) {
    super(data);
  }
}

export interface NotificationTokenRelations {
  // describe navigational properties here
}

export type NotificationTokenWithRelations =
  NotificationToken & NotificationTokenRelations;