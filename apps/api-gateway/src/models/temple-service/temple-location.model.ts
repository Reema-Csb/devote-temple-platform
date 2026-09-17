import {UserModifiableEntity} from '@devote/core';

import {model, property, belongsTo} from '@loopback/repository';
import {Temple} from './temple.model';

@model({
  name: 'temple_locations',

  settings: {
    postgresql: {
      schema: 'main',
      table: 'temple_locations',
    },
  },
})
export class TempleLocation extends UserModifiableEntity {
  @property({
    type: 'string',

    id: true,

    generated: true,

    postgresql: {
      columnName: 'id',
    },
  })
  id?: string;

  @property({
    type: 'string',
    required: true,

    postgresql: {
      columnName: 'address_line1',
    },
  })
  addressLine1: string;

  @property({
    type: 'string',

    postgresql: {
      columnName: 'address_line2',
    },
  })
  addressLine2?: string;

  @property({
    type: 'string',

    required: true,

    postgresql: {
      columnName: 'city',
    },
  })
  city: string;

  @property({
    type: 'string',

    required: true,

    postgresql: {
      columnName: 'state',
    },
  })
  state: string;

  @property({
    type: 'string',

    required: true,

    postgresql: {
      columnName: 'country',
    },
  })
  country: string;

  @property({
    type: 'string',

    postgresql: {
      columnName: 'postal_code',
    },
  })
  postalCode?: string;

  @property({
    type: 'number',

    postgresql: {
      columnName: 'latitude',

      dataType: 'numeric',

      precision: 10,

      scale: 7,
    },
  })
  latitude?: number;

  @property({
    type: 'number',

    postgresql: {
      columnName: 'longitude',

      dataType: 'numeric',

      precision: 10,

      scale: 7,
    },
  })
  longitude?: number;

  @belongsTo(
    () => Temple,

    {keyTo: 'id'},

    {
      name: 'temple_id',
    },
  )
  templeId: string;

  constructor(data?: Partial<TempleLocation>) {
    super(data);
  }
}

export interface TempleLocationRelations {
  temple?: Temple;
}

export type TempleLocationWithRelations = TempleLocation &
  TempleLocationRelations;
