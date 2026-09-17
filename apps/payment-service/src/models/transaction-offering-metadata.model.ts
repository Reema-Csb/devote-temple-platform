import {UserModifiableEntity} from '@devote/core';
import {model, property} from '@loopback/repository';

@model({
  settings: {
    strict: false,
    idInjection: false,
    postgresql: {
      schema: 'main',
      table: 'transaction_offering_metadata',
    },
    sequelize: {
      tableName: 'transaction_offering_metadata',
      schema: 'main',
    },
  },
  name: 'transaction_offering_metadata',
})
export class TransactionOfferingMetadata extends UserModifiableEntity {
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
    name: 'user_id',
    postgresql: {
      columnName: 'user_id',
      dataType: 'uuid',
    },
  })
  userId: string;

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
    type: 'string',
    required: false,
    name: 'payment_transaction_id',
    postgresql: {
      columnName: 'payment_transaction_id',
      dataType: 'uuid',
    },
  })
  paymentTransactionId?: string;

  @property({
    type: 'string',
    required: true,
    name: 'devotee_name',
    postgresql: {
      columnName: 'devotee_name',
      dataType: 'varchar',
      dataLength: 255,
    },
  })
  devoteeName: string;

  @property({
    type: 'string',
    required: false,
    name: 'nakshatra',
    postgresql: {
      columnName: 'nakshatra',
      dataType: 'varchar',
      dataLength: 100,
    },
  })
  nakshatra?: string;

  @property({
    type: 'string',
    required: false,
    name: 'gotra',
    postgresql: {
      columnName: 'gotra',
      dataType: 'varchar',
      dataLength: 100,
    },
  })
  gotra?: string;

  @property({
    type: 'string',
    required: true,
    name: 'offering_type',
    postgresql: {
      columnName: 'offering_type',
      dataType: 'varchar',
      dataLength: 20,
    },
  })
  offeringType: string;

  @property({
    type: 'date',
    required: true,
    name: 'offering_date',
    postgresql: {
      columnName: 'offering_date',
      dataType: 'date',
    },
  })
  offeringDate: string;

  constructor(data?: Partial<TransactionOfferingMetadata>) {
    super(data);
  }
}
