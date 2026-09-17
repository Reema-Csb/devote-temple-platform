import {MixinTarget} from '@loopback/core';
import {SoftDeleteMixin} from './soft-delete.mixin';
import {UserModifiableMixin} from './user-modifiable.mixin';

export function SoftDeleteUserModifiableMixin<T extends MixinTarget<object>>(
  base: T,
) {
  return SoftDeleteMixin(UserModifiableMixin(base));
}
