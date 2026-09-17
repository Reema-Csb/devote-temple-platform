import {Getter} from '@loopback/core';
import {
  AnyObject,
  DataObject,
  Entity,
  Filter,
  Where,
  Condition,
} from '@loopback/repository';
import {Count} from '@loopback/repository/src/common-types';
import {HttpErrors} from '@loopback/rest';
import {cloneDeep} from 'lodash';
import {
  SequelizeCrudRepository,
  SequelizeDataSource,
} from '@loopback/sequelize';
import {ErrorKeys, SoftDeleteEntity, IUser} from 'loopback4-soft-delete';
import {SoftFilterBuilder} from './utils/soft-filter-builder';

export abstract class SequelizeSoftCrudRepository<
  E extends SoftDeleteEntity,
  ID,
  R extends object = {},
> extends SequelizeCrudRepository<E, ID, R> {
  constructor(
    entityClass: typeof Entity & {
      prototype: E;
    },
    dataSource: SequelizeDataSource,
    protected readonly getCurrentUser?: Getter<IUser | undefined>,
  ) {
    super(entityClass, dataSource);
  }

  find(filter?: Filter<E>, options?: AnyObject): Promise<(E & R)[]> {
    const modifiedFilter = new SoftFilterBuilder(filter)
      .imposeCondition({
        deleted: false,
      } as Condition<E>)
      .injectSoftDeleteConditionInIncludes()
      .build();

    return super.find(modifiedFilter, options);
  }

  findAll(filter?: Filter<E>, options?: AnyObject): Promise<(E & R)[]> {
    return super.find(filter, options);
  }

  findOne(filter?: Filter<E>, options?: AnyObject): Promise<(E & R) | null> {
    const modifiedFilter = new SoftFilterBuilder(filter)
      .imposeCondition({
        deleted: false,
      } as Condition<E>)
      .build();

    return super.findOne(modifiedFilter, options);
  }

  findOneIncludeSoftDelete(
    filter?: Filter<E>,
    options?: AnyObject,
  ): Promise<(E & R) | null> {
    return super.findOne(filter, options);
  }

  async findById(
    id: ID,
    filter?: Filter<E>,
    options?: AnyObject,
  ): Promise<E & R> {
    const originalFilter = filter ?? {};
    const idProp = this.entityClass.getIdProperties()[0];

    const modifiedFilter = new SoftFilterBuilder(cloneDeep(originalFilter))
      .imposeCondition({
        deleted: false,
        [idProp]: id,
      } as Condition<E>)
      .limit(1)
      .build();

    const entity = await super.find(modifiedFilter, options);

    if (entity && entity.length > 0) {
      return entity[0];
    } else {
      throw new HttpErrors.NotFound(ErrorKeys.EntityNotFound);
    }
  }

  async findByIdIncludeSoftDelete(
    id: ID,
    filter?: Filter<E>,
    options?: AnyObject,
  ): Promise<E & R> {
    const entity = await super.findOne(filter, options);

    if (entity) {
      return super.findById(id, filter, options);
    } else {
      throw new HttpErrors.NotFound(ErrorKeys.EntityNotFound);
    }
  }

  updateAll(
    data: DataObject<E>,
    where?: Where<E>,
    options?: AnyObject,
  ): Promise<Count> {
    const filter = new SoftFilterBuilder({where})
      .imposeCondition({
        deleted: false,
      } as Condition<E>)
      .build();

    return super.updateAll(data, filter.where, options);
  }

  count(where?: Where<E>, options?: AnyObject): Promise<Count> {
    const filter = new SoftFilterBuilder({where})
      .imposeCondition({
        deleted: false,
      } as Condition<E>)
      .build();
    return super.count(filter.where, options);
  }

  countAll(where?: Where<E>, options?: AnyObject): Promise<Count> {
    return super.count(where, options);
  }

  async delete(entity: E, options?: AnyObject): Promise<void> {
    return this.deleteById(entity.getId(), options);
  }

  async deleteAll(where?: Where<E>, options?: AnyObject): Promise<Count> {
    const deletedBy = await this.getUserId(this.getCurrentUser);
    const dataToUpdate: DataObject<E> = {
      deleted: true,
      deletedOn: new Date(),
      deletedBy,
    };
    return super.updateAll(dataToUpdate, where, options);
  }

  async deleteById(id: ID, options?: AnyObject): Promise<void> {
    const deletedBy = await this.getUserId(this.getCurrentUser);
    return super.updateById(
      id,
      {
        deleted: true,
        deletedOn: new Date(),
        deletedBy,
      },
      options,
    );
  }

  deleteHard(entity: E, options?: AnyObject): Promise<void> {
    return super.deleteById(entity.getId(), options);
  }

  deleteAllHard(where?: Where<E>, options?: AnyObject): Promise<Count> {
    return super.deleteAll(where, options);
  }

  deleteByIdHard(id: ID, options?: AnyObject): Promise<void> {
    return super.deleteById(id, options);
  }

  private async getUserId(options?: AnyObject): Promise<string | undefined> {
    if (!this.getCurrentUser) {
      return undefined;
    }
    let currentUser = await this.getCurrentUser();
    currentUser = currentUser ?? options?.currentUser;
    if (!currentUser) {
      return undefined;
    }
    const userId = currentUser.getIdentifier?.() ?? currentUser.id;
    return userId?.toString();
  }
}
