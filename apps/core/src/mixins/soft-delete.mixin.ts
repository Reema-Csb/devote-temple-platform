import {MixinTarget} from '@loopback/core';
import {property} from '@loopback/repository';

export function SoftDeleteMixin<T extends MixinTarget<object>>(base: T) {
  class SoftDeletable extends base {
    @property({
      type: 'boolean',
      default: false,
      name: 'deleted',
    })
    deleted?: boolean;

    @property({
      type: 'date',
      name: 'deleted_on',
    })
    deletedOn?: string;

    @property({
      type: 'string',
      name: 'deleted_by',
    })
    deletedBy?: string;
  }
  return SoftDeletable;
}
