import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    postgresql: {
      schema: 'main',
      table: 'notification_preferences',
    },
  },
})
export class NotificationPreference extends Entity {
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
    type: 'boolean',
    default: true,
    postgresql: {
      columnName: 'push_notifications',
      dataType: 'boolean',
    },
  })
  pushNotifications?: boolean;

  @property({
    type: 'boolean',
    default: true,
    postgresql: {
      columnName: 'donation_alerts',
      dataType: 'boolean',
    },
  })
  donationAlerts?: boolean;

  @property({
    type: 'boolean',
    default: true,
    postgresql: {
      columnName: 'festival_reminders',
      dataType: 'boolean',
    },
  })
  festivalReminders?: boolean;

  @property({
    type: 'boolean',
    default: true,
    postgresql: {
      columnName: 'temple_updates',
      dataType: 'boolean',
    },
  })
  templeUpdates?: boolean;

  @property({
    type: 'boolean',
    default: true,
    postgresql: {
      columnName: 'promotions',
      dataType: 'boolean',
    },
  })
  promotions?: boolean;

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

  constructor(data?: Partial<NotificationPreference>) {
    super(data);
  }
}

export interface NotificationPreferenceRelations {}

export type NotificationPreferenceWithRelations = NotificationPreference &
  NotificationPreferenceRelations;
