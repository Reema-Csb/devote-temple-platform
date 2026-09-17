import {MixinTarget} from '@loopback/core';
import {property} from '@loopback/repository';

export function AuditMixin<T extends MixinTarget<object>>(base: T) {
  class Auditable extends base {
    @property({
      type: 'string',
      name: 'created_by',
    })
    createdBy?: string;

    @property({
      type: 'string',
      name: 'modified_by',
    })
    modifiedBy?: string;
  }
  return Auditable;
}
