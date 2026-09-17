import {model, property} from '@loopback/repository';

import {Temple} from './temple.model';
import {TempleLocation} from './temple-location.model';
import {TempleOffering} from './temple-offering.model';

@model()
export class TempleDto extends Temple {
  @property({
    type: 'object',
    required: true,
  })
  templeLocation: TempleLocation;

  @property.array(TempleOffering)
  offerings?: TempleOffering[];

  constructor(data?: Partial<TempleDto>) {
    super(data);
  }
}
