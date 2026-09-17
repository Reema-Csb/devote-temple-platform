import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  Where,
  repository,
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
  HttpErrors,
} from '@loopback/rest';

import {EventFestival} from '../models';
import {EventFestivalRepository} from '../repositories';

const basePath = '/event-festivals';

export class EventFestivalController {
  constructor(
    @repository(EventFestivalRepository)
    public eventFestivalRepository: EventFestivalRepository,
  ) {}

  @post(basePath)
  @response(200, {
    description: 'EventFestival model instance',
    content: {'application/json': {schema: getModelSchemaRef(EventFestival)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EventFestival, {
            title: 'NewEventFestival',
            exclude: ['id'],
          }),
        },
      },
    })
    eventFestival: EventFestival,
  ): Promise<EventFestival> {
    try {
      return await this.eventFestivalRepository.create({
        ...eventFestival,
        isActive: eventFestival.isActive ?? true,
        isFeatured: eventFestival.isFeatured ?? false,
        specialSevaCount: eventFestival.specialSevaCount ?? 0,
        status: eventFestival.status ?? 'upcoming',
      });
    } catch (error) {
      console.error('CREATE EVENT FESTIVAL ERROR:', error);

      throw new HttpErrors.InternalServerError(
        JSON.stringify({
          message: (error as any).message,
          parent: (error as any).parent,
          original: (error as any).original,
          sql: (error as any).sql,
        }),
      );
    }
  }

  @get(`${basePath}/count`)
  @response(200, {
    description: 'EventFestival model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(EventFestival) where?: Where<EventFestival>,
  ): Promise<Count> {
    return this.eventFestivalRepository.count(where);
  }

  @get(basePath)
  @response(200, {
    description: 'Array of EventFestival model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EventFestival, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(EventFestival) filter?: Filter<EventFestival>,
  ): Promise<EventFestival[]> {
    return this.eventFestivalRepository.find({
      include: [{relation: 'temple'}],
      limit: filter?.limit ?? 20,
      order: filter?.order ?? ['startDate ASC'],
      where: {
        deleted: false,
        ...(filter?.where ?? {}),
      },
    });
  }

  @get(`${basePath}/upcoming`)
  @response(200, {
    description: 'Upcoming EventFestival list',
  })
  async findUpcoming(): Promise<EventFestival[]> {
    const today = new Date();

    return this.eventFestivalRepository.find({
      where: {
        deleted: false,
        isActive: true,
        startDate: {
          gte: today,
        },
      },
      include: [{relation: 'temple'}],
      order: ['startDate ASC'],
      limit: 10,
    });
  }

  @get(`${basePath}/{id}`)
  @response(200, {
    description: 'EventFestival model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EventFestival, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(EventFestival, {exclude: 'where'})
    filter?: FilterExcludingWhere<EventFestival>,
  ): Promise<EventFestival> {
    return this.eventFestivalRepository.findById(id, {
      include: [{relation: 'temple'}],
      ...filter,
    });
  }

  @patch(basePath)
  @response(200, {
    description: 'EventFestival PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EventFestival, {partial: true}),
        },
      },
    })
    eventFestival: EventFestival,
    @param.where(EventFestival) where?: Where<EventFestival>,
  ): Promise<Count> {
    return this.eventFestivalRepository.updateAll(eventFestival, where);
  }

  @patch(`${basePath}/{id}`)
  @response(204, {
    description: 'EventFestival PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EventFestival, {partial: true}),
        },
      },
    })
    eventFestival: EventFestival,
  ): Promise<void> {
    await this.eventFestivalRepository.updateById(id, eventFestival);
  }

  @put(`${basePath}/{id}`)
  @response(204, {
    description: 'EventFestival PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() eventFestival: EventFestival,
  ): Promise<void> {
    await this.eventFestivalRepository.replaceById(id, eventFestival);
  }

  @del(`${basePath}/{id}`)
  @response(204, {
    description: 'EventFestival DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.eventFestivalRepository.deleteById(id);
  }
}
