import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  Where,
  repository,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';

import {FestivalSeva} from '../models';
import {FestivalSevaRepository} from '../repositories';

const basePath = '/festival-sevas';

export class FestivalSevaController {
  constructor(
    @repository(FestivalSevaRepository)
    public festivalSevaRepository: FestivalSevaRepository,
  ) {}

  @post(basePath)
  @response(200, {
    description: 'FestivalSeva model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(FestivalSeva),
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FestivalSeva, {
            title: 'NewFestivalSeva',
            exclude: ['id'],
          }),
        },
      },
    })
    festivalSeva: FestivalSeva,
  ): Promise<FestivalSeva> {
    return this.festivalSevaRepository.create({
      ...festivalSeva,
      isSelected: festivalSeva.isSelected ?? false,
      isActive: festivalSeva.isActive ?? true,
    });
  }

  @post(`${basePath}/bulk`)
  @response(200, {
    description: 'Array of FestivalSeva model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(FestivalSeva),
        },
      },
    },
  })
  async createBulk(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(FestivalSeva, {
              title: 'NewFestivalSeva',
              exclude: ['id'],
            }),
          },
        },
      },
    })
    festivalSevas: FestivalSeva[],
  ): Promise<FestivalSeva[]> {
    if (!festivalSevas.length) return [];

    const systemUserId = '00000000-0000-4000-8000-000000000000';
    const now = new Date();

    return this.festivalSevaRepository.createAll(
      festivalSevas.map(seva => ({
        ...seva,
        isSelected: seva.isSelected ?? false,
        isActive: seva.isActive ?? true,
        deleted: false,
        createdOn: now,
        modifiedOn: now,
        createdBy: systemUserId,
        modifiedBy: systemUserId,
      })),
    );
  }

  @get(`${basePath}/count`)
  @response(200, {
    description: 'FestivalSeva model count',
    content: {
      'application/json': {
        schema: CountSchema,
      },
    },
  })
  async count(
    @param.where(FestivalSeva) where?: Where<FestivalSeva>,
  ): Promise<Count> {
    return this.festivalSevaRepository.count(where);
  }

  @get(basePath)
  @response(200, {
    description: 'Array of FestivalSeva model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(FestivalSeva, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(
    @param.filter(FestivalSeva) filter?: Filter<FestivalSeva>,
  ): Promise<FestivalSeva[]> {
    return this.festivalSevaRepository.find({
      ...filter,
      where: {
        deleted: false,
        ...(filter?.where ?? {}),
      },
      order: filter?.order ?? ['createdOn ASC'],
    });
  }

  @get(`${basePath}/festival/{festivalId}`)
  @response(200, {
    description: 'Festival sevas for one festival',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(FestivalSeva),
        },
      },
    },
  })
  async findByFestivalId(
    @param.path.string('festivalId') festivalId: string,
  ): Promise<FestivalSeva[]> {
    return this.festivalSevaRepository.find({
      where: {
        festivalId,
        deleted: false,
      },
      order: ['createdOn ASC'],
    });
  }

  @get(`${basePath}/{id}`)
  @response(200, {
    description: 'FestivalSeva model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(FestivalSeva, {
          includeRelations: true,
        }),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(FestivalSeva, {exclude: 'where'})
    filter?: FilterExcludingWhere<FestivalSeva>,
  ): Promise<FestivalSeva> {
    return this.festivalSevaRepository.findById(id, filter);
  }

  @patch(basePath)
  @response(200, {
    description: 'FestivalSeva PATCH success count',
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
          schema: getModelSchemaRef(FestivalSeva, {
            partial: true,
          }),
        },
      },
    })
    festivalSeva: FestivalSeva,
    @param.where(FestivalSeva) where?: Where<FestivalSeva>,
  ): Promise<Count> {
    return this.festivalSevaRepository.updateAll(festivalSeva, where);
  }

  @patch(`${basePath}/{id}`)
  @response(204, {
    description: 'FestivalSeva PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FestivalSeva, {
            partial: true,
          }),
        },
      },
    })
    festivalSeva: FestivalSeva,
  ): Promise<void> {
    await this.festivalSevaRepository.updateById(id, festivalSeva);
  }

  @put(`${basePath}/{id}`)
  @response(204, {
    description: 'FestivalSeva PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() festivalSeva: FestivalSeva,
  ): Promise<void> {
    await this.festivalSevaRepository.replaceById(id, festivalSeva);
  }

  @del(`${basePath}/{id}`)
  @response(204, {
    description: 'FestivalSeva DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.festivalSevaRepository.deleteById(id);
  }

  @del(`${basePath}/festival/{festivalId}`)
  @response(204, {
    description: 'Delete all sevas for a festival',
  })
  async deleteByFestivalId(
    @param.path.string('festivalId') festivalId: string,
  ): Promise<void> {
    await this.festivalSevaRepository.deleteAll({
      festivalId,
    });
  }
}
