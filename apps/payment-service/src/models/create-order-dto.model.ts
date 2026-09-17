import {model, property} from '@loopback/repository';

@model()
export class CreateOrderRequest {
  @property({
    type: 'number',
    required: true,
  })
  amount: number;

  @property({
    type: 'string',
  })
  currency?: string;

  @property({
    type: 'string',
    required: true,
  })
  orderId: string;

  @property({
    type: 'string',
  })
  templeId?: string;

  @property({
    type: 'string',
  })
  offeringId?: string;

  @property({
    type: 'string',
  })
  remarks?: string;

  @property({
    type: 'string',
  })
  offeringDate?: string;

  @property({
    type: 'string',
  })
  userId?: string;

  @property({
    type: 'string',
  })
  devoteeName?: string;

  @property({
    type: 'string',
  })
  nakshatra?: string;

  @property({
    type: 'string',
  })
  gotra?: string;

  @property({
    type: 'string',
  })
  offeringType?: string;
}
