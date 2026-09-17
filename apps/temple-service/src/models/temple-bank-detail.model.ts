import {model, property} from '@loopback/repository';
import {UserModifiableEntity} from '@sourceloop/core';

@model({
  name: 'temple_bank_details',
  settings: {
    strict: false,
    postgresql: {
      schema: 'main',
      table: 'temple_bank_details',
    },
    sequelize: {
      schema: 'main',
      table: 'temple_bank_details',
      timestamps: false,
      freezeTableName: true,
    },
  },
})
export class TempleBankDetail extends UserModifiableEntity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'uuid'},
    name: 'id',
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'temple_id', dataType: 'uuid'},
    name: 'temple_id',
  })
  templeId: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'razorpay_contact_id', dataType: 'varchar'},
    name: 'razorpay_contact_id',
  })
  razorpayContactId?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'razorpay_fund_account_id', dataType: 'varchar'},
    name: 'razorpay_fund_account_id',
  })
  razorpayFundAccountId?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'verification_status', dataType: 'varchar'},
    name: 'verification_status',
  })
  verificationStatus?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'pan_number', dataType: 'varchar'},
    name: 'pan_number',
  })
  panNumber?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'gstin', dataType: 'varchar'},
    name: 'gstin',
  })
  gstin?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'payout_schedule', dataType: 'varchar'},
    name: 'payout_schedule',
  })
  payoutSchedule?: string;

  @property({
    type: 'string',
    default: 'approved',
    postgresql: {
      columnName: 'status',
      dataType: 'varchar',
      dataLength: 50,
    },
    name: 'status',
    jsonSchema: {
      enum: ['approved', 'pending', 'rejected'],
    },
  })
  status?: string;

  constructor(data?: Partial<TempleBankDetail>) {
    super(data);
  }
}

export interface TempleBankDetailRelations {}

export type TempleBankDetailWithRelations = TempleBankDetail &
  TempleBankDetailRelations;
