import {randomUUID} from 'crypto';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {UserAddress} from '../models';
import {UserAddressRepository} from '../repositories';

export class UserAddressController {
  constructor(
    @repository(UserAddressRepository)
    public userAddressRepository: UserAddressRepository,
  ) {}

  @post('/user-addresses')
  @response(200, {
    description: 'UserAddress model instance',
    content: {'application/json': {schema: getModelSchemaRef(UserAddress)}},
  })
  async createAddress(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserAddress, {
            title: 'NewUserAddress',
            exclude: ['id'],
          }),
        },
      },
    })
    userAddress: Omit<UserAddress, 'id'>,
  ): Promise<UserAddress> {
    return this.userAddressRepository.create({
      id: randomUUID(),
      ...userAddress,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    });
  }

  @get('/user-addresses/count')
  @response(200, {
    description: 'UserAddress model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(UserAddress) where?: Where<UserAddress>,
  ): Promise<Count> {
    return this.userAddressRepository.count(where);
  }

  @get('/user-addresses')
  @response(200, {
    description: 'Array of UserAddress model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(UserAddress, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(UserAddress) filter?: Filter<UserAddress>,
  ): Promise<UserAddress[]> {
    return this.userAddressRepository.find(filter);
  }

  @patch('/user-addresses')
  @response(200, {
    description: 'UserAddress PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserAddress, {partial: true}),
        },
      },
    })
    userAddress: UserAddress,
    @param.where(UserAddress) where?: Where<UserAddress>,
  ): Promise<Count> {
    return this.userAddressRepository.updateAll(
      {
        ...userAddress,
        modifiedOn: new Date().toISOString(),
      },
      where,
    );
  }

  @get('/user-addresses/{id}')
  @response(200, {
    description: 'UserAddress model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UserAddress, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(UserAddress, {exclude: 'where'})
    filter?: FilterExcludingWhere<UserAddress>,
  ): Promise<UserAddress> {
    return this.userAddressRepository.findById(id, filter);
  }

  @patch('/user-addresses/{id}')
  @response(204, {
    description: 'UserAddress PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserAddress, {partial: true}),
        },
      },
    })
    userAddress: UserAddress,
  ): Promise<void> {
    await this.userAddressRepository.updateById(id, {
      ...userAddress,
      modifiedOn: new Date().toISOString(),
    });
  }

  @put('/user-addresses/{id}')
  @response(204, {
    description: 'UserAddress PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() userAddress: UserAddress,
  ): Promise<void> {
    await this.userAddressRepository.replaceById(id, {
      ...userAddress,
      modifiedOn: new Date().toISOString(),
    });
  }

  @del('/user-addresses/{id}')
  @response(204, {
    description: 'UserAddress DELETE success',
  })
  async deleteAddressById(@param.path.string('id') id: string): Promise<void> {
    await this.userAddressRepository.deleteById(id);
  }

  @post('/users/{userId}/address')
  @response(200, {description: 'UserAddress created'})
  async create(
    @param.path.string('userId') userId: string,
    @requestBody()
    body: {
      address: string;
      city?: string;
      state?: string;
      country?: string;
      pincode?: string;
    },
  ): Promise<UserAddress> {
    const existing = await this.userAddressRepository.findOne({
      where: {userId},
    });

    if (existing) {
      await this.userAddressRepository.updateById(existing.id!, {
        ...body,
        modifiedOn: new Date().toISOString(),
      });
      return this.userAddressRepository.findById(existing.id!);
    }

    return this.userAddressRepository.create({
      id: randomUUID(),
      userId,
      ...body,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    });
  }

  @get('/users/{userId}/address')
  @response(200, {description: 'UserAddress for a user'})
  async findByUserId(
    @param.path.string('userId') userId: string,
  ): Promise<UserAddress | null> {
    return this.userAddressRepository.findOne({where: {userId}});
  }

  @patch('/users/{userId}/address')
  @response(204, {description: 'UserAddress updated'})
  async updateByUserId(
    @param.path.string('userId') userId: string,
    @requestBody()
    body: Partial<UserAddress>,
  ): Promise<void> {
    const existing = await this.userAddressRepository.findOne({
      where: {userId},
    });

    if (!existing) {
      throw new HttpErrors.NotFound('Address not found for this user');
    }

    await this.userAddressRepository.updateById(existing.id!, {
      ...body,
      modifiedOn: new Date().toISOString(),
    });
  }

  @del('/users/{userId}/address')
  @response(204, {description: 'UserAddress deleted'})
  async deleteByUserId(
    @param.path.string('userId') userId: string,
  ): Promise<void> {
    const existing = await this.userAddressRepository.findOne({
      where: {userId},
    });

    if (!existing) {
      throw new HttpErrors.NotFound('Address not found for this user');
    }

    await this.userAddressRepository.deleteById(existing.id!);
  }
}
