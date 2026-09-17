import {UserModifiableEntity} from '@sourceloop/core';
import {belongsTo, model, property} from '@loopback/repository';
import {Temple} from './temple.model';

@model({
  settings: {
    strict: false,
    postgresql: {
      schema: 'main',
      table: 'event_festivals',
    },
  },
  name: 'event_festivals',
})
export class EventFestival extends UserModifiableEntity {
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
      columnName: 'name',
      dataType: 'varchar',
    },
  })
  name: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'description',
      dataType: 'text',
    },
  })
  description?: string;

  @property({
    type: 'date',
    required: true,
    name: 'start_date',
    postgresql: {
      columnName: 'start_date',
      dataType: 'timestamp',
    },
  })
  startDate: Date;

  @property({
    type: 'date',
    required: true,
    name: 'end_date',
    postgresql: {
      columnName: 'end_date',
      dataType: 'timestamp',
    },
  })
  endDate: Date;

  @property({
    type: 'string',
    name: 'image_url',
    postgresql: {
      columnName: 'image_url',
      dataType: 'text',
    },
  })
  imageUrl?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'location',
      dataType: 'varchar',
    },
  })
  location?: string;

  @property({
    type: 'boolean',
    name: 'is_featured',
    default: false,
    postgresql: {
      columnName: 'is_featured',
      dataType: 'bool',
    },
  })
  isFeatured?: boolean;

  @property({
    type: 'string',
    required: true,
    default: 'upcoming',
    jsonSchema: {
      enum: ['upcoming', 'ongoing', 'completed'],
    },
    postgresql: {
      columnName: 'status',
      dataType: 'varchar',
    },
  })
  status: 'upcoming' | 'ongoing' | 'completed';

  @property({
    type: 'number',
    name: 'special_seva_count',
    default: 0,
    postgresql: {
      columnName: 'special_seva_count',
      dataType: 'int',
    },
  })
  specialSevaCount?: number;

  @property({
    type: 'boolean',
    name: 'is_active',
    default: true,
    postgresql: {
      columnName: 'is_active',
      dataType: 'bool',
    },
  })
  isActive?: boolean;

  @belongsTo(
    () => Temple,
    {keyFrom: 'templeId', keyTo: 'id'},
    {
      name: 'temple_id',
      required: true,
      postgresql: {
        columnName: 'temple_id',
        dataType: 'uuid',
      },
    },
  )
  templeId: string;

  constructor(data?: Partial<EventFestival>) {
    super(data);
  }
}

export interface EventFestivalRelations {
  temple?: Temple;
}

export type EventFestivalWithRelations = EventFestival & EventFestivalRelations;
