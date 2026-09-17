import {MixinTarget} from '@loopback/core';
import {TimestampMixin} from './timestamp.mixin';
import {AuditMixin} from './audit.mixin';

export function UserModifiableMixin<T extends MixinTarget<object>>(base: T) {
  return AuditMixin(TimestampMixin(base));
}
