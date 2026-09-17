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
  TempleOffering,
} from '../models';
import {TempleRepository} from '../repositories';

export class TempleTempleOfferingController {
  constructor(
    @repository(TempleRepository) protected templeRepository: TempleRepository,
  ) { }

  @get('/temples/{id}/temple-offerings', {
    responses: {
      '200': {
        description: 'Array of Temple has many TempleOffering',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(TempleOffering)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<TempleOffering>,
  ): Promise<TempleOffering[]> {
    return this.templeRepository.templeOfferings(id).find(filter);
  }

  @post('/temples/{id}/temple-offerings', {
    responses: {
      '200': {
        description: 'Temple model instance',
        content: {'application/json': {schema: getModelSchemaRef(TempleOffering)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Temple.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TempleOffering, {
            title: 'NewTempleOfferingInTemple',
            exclude: ['id'],
            optional: ['templeId']
          }),
        },
      },
    }) templeOffering: Omit<TempleOffering, 'id'>,
  ): Promise<TempleOffering> {
    return this.templeRepository.templeOfferings(id).create(templeOffering);
  }

  @patch('/temples/{id}/temple-offerings', {
    responses: {
      '200': {
        description: 'Temple.TempleOffering PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TempleOffering, {partial: true}),
        },
      },
    })
    templeOffering: Partial<TempleOffering>,
    @param.query.object('where', getWhereSchemaFor(TempleOffering)) where?: Where<TempleOffering>,
  ): Promise<Count> {
    return this.templeRepository.templeOfferings(id).patch(templeOffering, where);
  }

  @del('/temples/{id}/temple-offerings', {
    responses: {
      '200': {
        description: 'Temple.TempleOffering DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(TempleOffering)) where?: Where<TempleOffering>,
  ): Promise<Count> {
    return this.templeRepository.templeOfferings(id).delete(where);
  }
}
