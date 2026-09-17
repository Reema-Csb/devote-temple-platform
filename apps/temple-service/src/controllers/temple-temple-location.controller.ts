import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Temple,
  TempleLocation,
} from '../models';
import {TempleRepository} from '../repositories';

export class TempleTempleLocationController {
  constructor(
    @repository(TempleRepository) protected templeRepository: TempleRepository,
  ) { }

  @get('/temples/{id}/temple-location', {
    responses: {
      '200': {
        description: 'Temple has one TempleLocation',
        content: {
          'application/json': {
            schema: getModelSchemaRef(TempleLocation),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<TempleLocation>,
  ): Promise<TempleLocation> {
    return this.templeRepository.templeLocation(id).get(filter);
  }

  @post('/temples/{id}/temple-location', {
    responses: {
      '200': {
        description: 'Temple model instance',
        content: {'application/json': {schema: getModelSchemaRef(TempleLocation)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Temple.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TempleLocation, {
            title: 'NewTempleLocationInTemple',
            exclude: ['id'],
            optional: ['templeId']
          }),
        },
      },
    }) templeLocation: Omit<TempleLocation, 'id'>,
  ): Promise<TempleLocation> {
    return this.templeRepository.templeLocation(id).create(templeLocation);
  }

  @patch('/temples/{id}/temple-location', {
    responses: {
      '200': {
        description: 'Temple.TempleLocation PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TempleLocation, {partial: true}),
        },
      },
    })
    templeLocation: Partial<TempleLocation>,
    @param.query.object('where', getWhereSchemaFor(TempleLocation)) where?: Where<TempleLocation>,
  ): Promise<Count> {
    return this.templeRepository.templeLocation(id).patch(templeLocation, where);
  }

  @del('/temples/{id}/temple-location', {
    responses: {
      '200': {
        description: 'Temple.TempleLocation DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(TempleLocation)) where?: Where<TempleLocation>,
  ): Promise<Count> {
    return this.templeRepository.templeLocation(id).delete(where);
  }
}
