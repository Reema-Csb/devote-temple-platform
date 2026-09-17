import {model, property, hasOne, hasMany} from '@loopback/repository';
import {UserModifiableEntity} from '@sourceloop/core';
import {TempleLocation} from './temple-location.model';
import {TempleOffering} from './temple-offering.model';

@model({
  settings: {
    strict: false,

    postgresql: {
      schema: 'main',
      table: 'temples',
    },
  },
  name: 'temples',
})
export class Temple extends UserModifiableEntity {
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

    required: false,

    postgresql: {
      columnName: 'description',

      dataType: 'text',
    },
  })
  description?: string;

  @property({
    type: 'string',

    required: false,

    postgresql: {
      columnName: 'deity',

      dataType: 'varchar',
    },
  })
  deity?: string;

  @property({
    type: 'boolean',
    name: 'is_active',
    required: true,

    postgresql: {
      columnName: 'is_active',

      dataType: 'bool',
    },
  })
  isActive: boolean;

  @hasOne(() => TempleLocation, {keyTo: 'templeId'})
  templeLocation: TempleLocation;

  @hasMany(() => TempleOffering, {keyTo: 'templeId'})
  templeOfferings?: TempleOffering[];

  constructor(data?: Partial<Temple>) {
    super(data);
  }
}

export interface TempleRelations {
  templeLocation?: TempleLocation;
}

export type TempleWithRelations = Temple & TempleRelations;
