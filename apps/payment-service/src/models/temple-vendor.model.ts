import {UserModifiableEntity} from '@devote/core';
import {model, property} from '@loopback/repository';

@model({
  settings: {
    strict: false,
    idInjection: false,
    postgresql: {
      schema: 'main',
      table: 'temple_vendors',
    },
    sequelize: {
      tableName: 'temple_vendors',
      schema: 'main',
    },
  },
  name: 'temple_vendors',
})
export class TempleVendor extends UserModifiableEntity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    useDefaultIdType: false,
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
      columnName: 'temple_id',
      dataType: 'uuid',
    },
  })
  templeId: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'razorpay_contact_id',
      dataType: 'varchar',
    },
  })
  razorpayContactId?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'razorpay_fund_account_id',
      dataType: 'varchar',
    },
  })
  razorpayFundAccountId?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'beneficiary_name',
      dataType: 'varchar',
    },
  })
  beneficiaryName?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'masked_account_number',
      dataType: 'varchar',
    },
  })
  maskedAccountNumber?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'ifsc',
      dataType: 'varchar',
    },
  })
  ifsc?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'bank_name',
      dataType: 'varchar',
    },
  })
  bankName?: string;

  @property({
    type: 'string',
    default: 'manual',
    postgresql: {
      columnName: 'payout_schedule',
      dataType: 'varchar',
    },
  })
  payoutSchedule?: string;

  @property({
    type: 'string',
    default: 'pending',
    postgresql: {
      columnName: 'vendor_status',
      dataType: 'varchar',
    },
  })
  vendorStatus?: string;

  constructor(data?: Partial<TempleVendor>) {
    super(data);
  }
}

export interface TempleVendorRelations {}

export type TempleVendorWithRelations = TempleVendor & TempleVendorRelations;
