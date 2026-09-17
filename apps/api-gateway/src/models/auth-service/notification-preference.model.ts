import {Entity, model, property} from '@loopback/repository';
import {UserModifiableEntity} from '@devote/core';

@model({
  settings: {
    postgresql: {
      schema: 'main',
      table: 'notification_preferences',
    },
  },
})
export class NotificationPreference extends UserModifiableEntity {
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

  constructor(data?: Partial<NotificationPreference>) {
    super(data);
  }
}

export interface NotificationPreferenceRelations {}

export type NotificationPreferenceWithRelations = NotificationPreference &
  NotificationPreferenceRelations;
