import {UserModifiableEntity} from '@devote/core';
import {model, property} from '@loopback/repository';

@model({
  settings: {
    strict: false,
    idInjection: false,
    postgresql: {
      schema: 'main',
      table: 'payouts',
    },
    sequelize: {
      tableName: 'payouts',
      schema: 'main',
    },
  },
  name: 'payouts',
})
export class Payout extends UserModifiableEntity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    useDefaultIdType: false,
    name: 'id',
    postgresql: {
      columnName: 'id',
      dataType: 'uuid',
    },
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
    name: 'temple_id',
    postgresql: {
      columnName: 'temple_id',
      dataType: 'uuid',
    },
  })
  templeId: string;

  @property({
    type: 'number',
    default: 0,
    name: 'total_collected',
    postgresql: {
      columnName: 'total_collected',
      dataType: 'numeric',
    },
  })
  totalCollected?: number;

  @property({
    type: 'number',
    default: 0,
    name: 'commission_amount',
    postgresql: {
      columnName: 'commission_amount',
      dataType: 'numeric',
    },
  })
  commissionAmount?: number;

  @property({
    type: 'number',
    default: 0,
    name: 'platform_commission_amount',
    postgresql: {
      columnName: 'platform_commission_amount',
      dataType: 'numeric',
    },
  })
  platformCommissionAmount?: number;

  @property({
    type: 'number',
    default: 0,
    name: 'gst_amount',
    postgresql: {
      columnName: 'gst_amount',
      dataType: 'numeric',
    },
  })
  gstAmount?: number;

  @property({
    type: 'number',
    default: 0,
    name: 'gateway_charge_amount',
    postgresql: {
      columnName: 'gateway_charge_amount',
      dataType: 'numeric',
    },
  })
  gatewayChargeAmount?: number;

  @property({
    type: 'number',
    default: 0,
    name: 'payout_amount',
    postgresql: {
      columnName: 'payout_amount',
      dataType: 'numeric',
    },
  })
  payoutAmount?: number;

  @property({
    type: 'number',
    default: 0,
    name: 'transaction_count',
    postgresql: {
      columnName: 'transaction_count',
      dataType: 'integer',
    },
  })
  transactionCount?: number;

  @property({
    type: 'string',
    default: 'manual',
    name: 'payout_method',
    postgresql: {
      columnName: 'payout_method',
      dataType: 'varchar',
    },
  })
  payoutMethod?: string;

  @property({
    type: 'string',
    default: 'pending',
    name: 'payout_status',
    postgresql: {
      columnName: 'payout_status',
      dataType: 'varchar',
    },
  })
  payoutStatus?: string;

  @property({
    type: 'string',
    name: 'remarks',
    postgresql: {
      columnName: 'remarks',
      dataType: 'text',
    },
  })
  remarks?: string;

  @property({
    type: 'date',
    name: 'paid_on',
    postgresql: {
      columnName: 'paid_on',
      dataType: 'timestamptz',
    },
  })
  paidOn?: Date;

  constructor(data?: Partial<Payout>) {
    super(data);
  }
}

export interface PayoutRelations {}

export type PayoutWithRelations = Payout & PayoutRelations;