import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';

import {
  post,
  param,
  get,
  del,
  getModelSchemaRef,
  patch,
  requestBody,
  response,
} from '@loopback/rest';

import {TempleOffering} from '../models';
import {TempleOfferingRepository} from '../repositories';

const basePath = '/temple-offerings';

export class TempleOfferingController {
  constructor(
    @repository(TempleOfferingRepository)
    public templeOfferingRepository: TempleOfferingRepository,
  ) {}

  @post(basePath)
  @response(200, {
    description: 'TempleOffering model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(TempleOffering),
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TempleOffering, {
            title: 'NewTempleOffering',
            exclude: ['id'],
          }),
        },
      },
    })
    offering: Omit<TempleOffering, 'id'>,
  ): Promise<TempleOffering> {
    return this.templeOfferingRepository.create(offering);
  }

  @get(basePath)
  @response(200, {
    description: 'Array of TempleOffering model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(TempleOffering, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(
    @param.filter(TempleOffering)
    filter?: Filter<TempleOffering>,
  ): Promise<TempleOffering[]> {
    return this.templeOfferingRepository.find(filter);
  }

  @get(`${basePath}/count`)
  @response(200, {
    description: 'TempleOffering count',
    content: {
      'application/json': {
        schema: CountSchema,
      },
    },
  })
  async count(
    @param.where(TempleOffering)
    where?: Where<TempleOffering>,
  ): Promise<Count> {
    return this.templeOfferingRepository.count(where);
  }

  @patch(basePath)
  @response(200, {
    description: 'TempleOffering PATCH success count',
    content: {
      'application/json': {
        schema: CountSchema,
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TempleOffering, {
            partial: true,
          }),
        },
      },
    })
    offering: TempleOffering,

    @param.where(TempleOffering)
    where?: Where<TempleOffering>,
  ): Promise<Count> {
    return this.templeOfferingRepository.updateAll(offering, where);
  }

  @del(`${basePath}/{id}`)
  @response(204, {
    description: 'TempleOffering DELETE success',
  })
  async deleteById(
    @param.path.string('id') id: string,
  ): Promise<void> {
    await this.templeOfferingRepository.deleteById(id);
  }
}