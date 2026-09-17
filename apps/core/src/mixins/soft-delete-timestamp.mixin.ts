import {MixinTarget} from '@loopback/core';
import {SoftDeleteMixin} from './soft-delete.mixin';
import {TimestampMixin} from './timestamp.mixin';

export function SoftDeleteTimeStampMixin<T extends MixinTarget<object>>(
  base: T,
) {
  return SoftDeleteMixin(TimestampMixin(base));
}
