import {UserModifiableEntity} from '@sourceloop/core';
import {belongsTo, model, property} from '@loopback/repository';
import {EventFestival} from './event-festival.model';
import {Temple} from './temple.model';

@model({
  settings: {
    strict: false,
    postgresql: {
      schema: 'main',
      table: 'festival_sevas',
    },
  },
  name: 'festival_sevas',
})
export class FestivalSeva extends UserModifiableEntity {
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
    type: 'boolean',
    name: 'is_selected',
    default: false,
    postgresql: {
      columnName: 'is_selected',
      dataType: 'bool',
    },
  })
  isSelected?: boolean;

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
    () => EventFestival,
    {keyFrom: 'festivalId', keyTo: 'id'},
    {
      name: 'festival_id',
      required: true,
      postgresql: {
        columnName: 'festival_id',
        dataType: 'uuid',
      },
    },
  )
  festivalId: string;

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

  constructor(data?: Partial<FestivalSeva>) {
    super(data);
  }
}

export interface FestivalSevaRelations {
  festival?: EventFestival;
  temple?: Temple;
}

export type FestivalSevaWithRelations = FestivalSeva & FestivalSevaRelations;
