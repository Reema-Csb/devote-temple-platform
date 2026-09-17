import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {TempleLocation} from '../models';
import {TempleLocationRepository} from '../repositories';

const basePath = '/temple-locations';

export class TempleLocationControllerController {
  constructor(
    @repository(TempleLocationRepository)
    public templeLocationRepository: TempleLocationRepository,
  ) {}

  @post(basePath)
  @response(200, {
    description: 'TempleLocation model instance',
    content: {'application/json': {schema: getModelSchemaRef(TempleLocation)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TempleLocation, {
            title: 'NewTempleLocation',
            exclude: ['id'],
          }),
        },
      },
    })
    templeLocation: Omit<TempleLocation, 'id'>,
  ): Promise<TempleLocation> {
    return this.templeLocationRepository.create(templeLocation);
  }

  @get(`${basePath}/count`)
  @response(200, {
    description: 'TempleLocation model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(TempleLocation) where?: Where<TempleLocation>,
  ): Promise<Count> {
    return this.templeLocationRepository.count(where);
  }

  @get(basePath)
  @response(200, {
    description: 'Array of TempleLocation model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(TempleLocation, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(
    @param.filter(TempleLocation) filter?: Filter<TempleLocation>,
  ): Promise<TempleLocation[]> {
    return this.templeLocationRepository.find(filter);
  }

  @patch(basePath)
  @response(200, {
    description: 'TempleLocation PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TempleLocation, {partial: true}),
        },
      },
    })
    templeLocation: TempleLocation,
    @param.where(TempleLocation) where?: Where<TempleLocation>,
  ): Promise<Count> {
    return this.templeLocationRepository.updateAll(
      templeLocation,
      where,
    );
  }

  @get(`${basePath}/{id}`)
  @response(200, {
    description: 'TempleLocation model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(TempleLocation, {
          includeRelations: true,
        }),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(TempleLocation, {exclude: 'where'})
    filter?: FilterExcludingWhere<TempleLocation>,
  ): Promise<TempleLocation> {
    return this.templeLocationRepository.findById(id, filter);
  }

  @patch(`${basePath}/{id}`)
  @response(204, {
    description: 'TempleLocation PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TempleLocation, {partial: true}),
        },
      },
    })
    templeLocation: TempleLocation,
  ): Promise<void> {
    await this.templeLocationRepository.updateById(
      id,
      templeLocation,
    );
  }

  @put(`${basePath}/{id}`)
  @response(204, {
    description: 'TempleLocation PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() templeLocation: TempleLocation,
  ): Promise<void> {
    await this.templeLocationRepository.replaceById(
      id,
      templeLocation,
    );
  }

  @del(`${basePath}/{id}`)
  @response(204, {
    description: 'TempleLocation DELETE success',
  })
  async deleteById(
    @param.path.string('id') id: string,
  ): Promise<void> {
    await this.templeLocationRepository.deleteById(id);
  }
}