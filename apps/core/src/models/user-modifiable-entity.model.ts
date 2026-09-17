import {Entity} from '@loopback/repository';
import {SoftDeleteUserModifiableMixin} from '../mixins';

export class UserModifiableEntity extends SoftDeleteUserModifiableMixin(
  Entity,
) {
  constructor(data?: Partial<UserModifiableEntity>) {
    super(data);
  }
}
