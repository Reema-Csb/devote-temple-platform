import { UserModifiableEntity } from '@devote/core';
import { model, property } from '@loopback/repository';

@model({
  settings: {
    strict: false,
    idInjection: false,
    postgresql: {
      schema: 'main',
      table: 'payment_transactions',
    },
    sequelize: {
      tableName: 'payment_transactions',
      schema: 'main',
    },
  },
  name: 'payment_transactions',
})
export class PaymentTransaction extends UserModifiableEntity {
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
    name: 'order_id',
    postgresql: {
      columnName: 'order_id',
      dataType: 'uuid',
    },
  })
  orderId: string;

  @property({
    type: 'string',
    required: false,
    name: 'temple_id',
    postgresql: {
      columnName: 'temple_id',
      dataType: 'uuid',
    },
  })
  templeId?: string;

  @property({
    type: 'string',
    required: false,
    name: 'offering_id',
    postgresql: {
      columnName: 'offering_id',
      dataType: 'uuid',
    },
  })
  offeringId?: string;


  @property({
    type: 'string',
    required: true,
    name: 'payment_method',
    postgresql: {
      columnName: 'payment_method',
      dataType: 'varchar',
      dataLength: 50,
    },
  })
  paymentMethod: string;

  @property({
    type: 'string',
    required: false,
    default: 'pending',
    name: 'payment_status',
    postgresql: {
      columnName: 'payment_status',
      dataType: 'varchar',
      dataLength: 50,
    },
  })
  paymentStatus?: string;

  @property({
    type: 'string',
    required: false,
    name: 'transaction_id',
    postgresql: {
      columnName: 'transaction_id',
      dataType: 'varchar',
      dataLength: 255,
    },
  })
  transactionId?: string;

  @property({
    type: 'number',
    required: true,
    name: 'amount',
    postgresql: {
      columnName: 'amount',
      dataType: 'numeric',
      dataPrecision: 10,
      dataScale: 2,
    },
  })
  amount: number;

  @property({
    type: 'string',
    required: false,
    default: 'INR',
    name: 'currency',
    postgresql: {
      columnName: 'currency',
      dataType: 'varchar',
      dataLength: 10,
    },
  })
  currency?: string;

  @property({
    type: 'date',
    required: false,
    name: 'payment_date',
    postgresql: {
      columnName: 'payment_date',
      dataType: 'timestamptz',
    },
  })
  paymentDate?: Date;

  @property({
    type: 'string',
    required: false,
    default: 'Pending',
    name: 'status',
    jsonSchema: {
      enum: ['Success', 'Pending', 'Failed'],
    },
    postgresql: {
      columnName: 'status',
      dataType: 'varchar',
      dataLength: 50,
    },
  })
  status?: string;

  @property({
    type: 'boolean',
    required: false,
    default: false,
    name: 'is_refunded',
    postgresql: {
      columnName: 'is_refunded',
      dataType: 'boolean',
    },
  })
  isRefunded?: boolean;

  @property({
    type: 'number',
    required: false,
    name: 'refund_amount',
    postgresql: {
      columnName: 'refund_amount',
      dataType: 'numeric',
      dataPrecision: 10,
      dataScale: 2,
    },
  })
  refundAmount?: number;

  @property({
    type: 'date',
    required: false,
    name: 'refunded_on',
    postgresql: {
      columnName: 'refunded_on',
      dataType: 'timestamptz',
    },
  })
  refundedOn?: Date;

  @property({
    type: 'string',
    required: false,
    name: 'failed_reason',
    postgresql: {
      columnName: 'failed_reason',
      dataType: 'text',
    },
  })
  failedReason?: string;

  @property({
    type: 'string',
    required: false,
    name: 'remarks',
    postgresql: {
      columnName: 'remarks',
      dataType: 'text',
    },
  })
  remarks?: string;

  @property({
    type: 'string',
    required: false, name: 'user_id',
    postgresql: {
      columnName: 'user_id',
      dataType: 'uuid',
    },
  })
  userId?: string;

  constructor(data?: Partial<PaymentTransaction>) {
    super(data);
  }
}

export interface PaymentTransactionRelations {
  // describe navigational properties here
}

export type PaymentTransactionWithRelations = PaymentTransaction &
  PaymentTransactionRelations;
