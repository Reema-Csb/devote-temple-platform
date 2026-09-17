import {MixinTarget} from '@loopback/core';
import {property} from '@loopback/repository';

export function TimestampMixin<T extends MixinTarget<object>>(base: T) {
  class Timestamped extends base {
    @property({
      type: 'date',
      defaultFn: 'now',
      name: 'created_on',
    })
    createdOn?: string;

    @property({
      type: 'date',
      defaultFn: 'now',
      name: 'modified_on',
    })
    modifiedOn?: string;
  }
  return Timestamped;
}
