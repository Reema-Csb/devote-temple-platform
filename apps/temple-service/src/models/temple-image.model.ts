import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    postgresql: {
      schema: 'main',
      table: 'temple_images',
    },
  }, name: 'temple_images'
})
export class TempleImage extends Entity {

  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    name: 'temple_id',
    required: true,
    postgresql: {
      columnName: 'temple_id',
      dataType: 'uuid',
    },
  })
  templeId: string;

  @property({
    type: 'string',
    name: 'image_url',
    required: true,
    postgresql: {
      columnName: 'image_url',
      dataType: 'text',
    },
  })
  imageUrl: string;

  constructor(data?: Partial<TempleImage>) {
    super(data);
  }
}

export interface TempleImageRelations {}

export type TempleImageWithRelations =
  TempleImage & TempleImageRelations;
