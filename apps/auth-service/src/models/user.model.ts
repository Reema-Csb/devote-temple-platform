import {UserModifiableEntity} from '@devote/core';
import {model, property} from '@loopback/repository';

@model({
  settings: {
    postgresql: {
      schema: 'main',
      table: 'users',
    },
  },
})
export class User extends UserModifiableEntity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    useDefaultIdType: false,
    postgresql: {
      dataType: 'uuid',
      defaultFn: 'gen_random_uuid()',
    },
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'first_name',
    },
  })
  firstName: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'middle_name',
    },
  })
  middleName?: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'last_name',
    },
  })
  lastName: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  phone: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'last_login',
    },
  })
  lastLogin?: string;

  @property.array(Number, {
    postgresql: {
      columnName: 'auth_client_ids',
    },
  })
  authClientIds?: number[];

  @property({
    type: 'string',
  })
  gender?: string;

  @property({
    type: 'date',
  })
  dob?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'default_tenant_id',
    },
  })
  defaultTenantId?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'user_image',
    },
  })
  userImage?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'totp_secret',
    },
  })
  totpSecret?: string;

  @property({
    type: 'boolean',
    default: false,
    postgresql: {
      columnName: 'totp_enabled',
    },
  })
  totpEnabled?: boolean;

  @property({
    type: 'string',
    default: 'user',
  })
  role?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'temple_id',
      dataType: 'uuid',
    },
  })
  templeId?: string;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
