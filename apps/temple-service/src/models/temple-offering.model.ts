import { UserModifiableEntity } from '@sourceloop/core';
import { model, property, belongsTo } from '@loopback/repository';
import { Temple } from './temple.model';

@model({
  settings: {
    postgresql: {
      schema: 'main',
      table: 'temple_offerings',
    },
  },
  name: 'temple_offerings',
})
export class TempleOffering extends UserModifiableEntity {
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
      columnName: 'name',
    },
  })
  name: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'description',
    },
  })
  description?: string;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'price',
      dataType: 'numeric',
      precision: 10,
      scale: 5,
    },
  })
  price: number;

  @property({
    type: 'string',
    default: 'INR',
    postgresql: {
      columnName: 'currency',
    },
  })
  currency?: string;

  /* =========================
     OFFERING CATEGORIES
  ========================= */

  @property({
    type: 'boolean',
    name: 'is_active',
    default: true,
    postgresql: {
      columnName: 'is_active',
    },
  })
  isActive?: boolean;

  @belongsTo(
    () => Temple,
    { keyFrom: 'templeId', keyTo: 'id' },
    {
      name: 'temple_id',
      postgresql: {
        columnName: 'temple_id',
      },
    },
  )
  templeId: string;
  @property({
    type: 'boolean',
    default: false,
    postgresql: {
      columnName: 'archana',
    },
  })
  archana?: boolean;

  constructor(data?: Partial<TempleOffering>) {
    super(data);
  }
}

export interface TempleOfferingRelations {
  // describe navigational properties here
}

export type TempleOfferingWithRelations = TempleOffering &
  TempleOfferingRelations;
