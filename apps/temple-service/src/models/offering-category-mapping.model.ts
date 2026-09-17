import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    postgresql: {
      schema: 'main',
      table: 'offering_category_mappings',
    },
  },
  name: 'offering_category_mappings',
})
export class OfferingCategoryMapping extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    name: 'offering_id',
    required: true,
    postgresql: {
      columnName: 'offering_id',
      dataType: 'uuid',
    },
  })
  offeringId: string;
  @property({
    type: 'string',
    name: 'temple_id',
    postgresql: {
      columnName: 'temple_id',
      dataType: 'uuid',
    },
  })
  templeId?: string;

  @property({
    type: 'string',
    name: 'category_name',
    required: true,
    postgresql: {
      columnName: 'category_name',
      dataType: 'text',
    },
  })
  categoryName: string;

  constructor(data?: Partial<OfferingCategoryMapping>) {
    super(data);
  }
}

export interface OfferingCategoryMappingRelations {}

export type OfferingCategoryMappingWithRelations = OfferingCategoryMapping &
  OfferingCategoryMappingRelations;
