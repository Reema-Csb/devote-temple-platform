import {Entity} from '@loopback/repository';
import {SoftDeleteTimeStampMixin} from '../mixins';

export class SoftDeleteEntity extends SoftDeleteTimeStampMixin(Entity) {
  constructor(data?: Partial<SoftDeleteEntity>) {
    super(data);
  }
}
