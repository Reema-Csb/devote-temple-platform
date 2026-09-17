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
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';

import {NotificationPreference} from '../models';
import {NotificationPreferenceRepository} from '../repositories';

export class NotificationPreferenceController {
  constructor(
    @repository(NotificationPreferenceRepository)
    public notificationPreferenceRepository: NotificationPreferenceRepository,
  ) {}

  // ─────────────────────────────────────────────
  // Standard LoopBack CRUD APIs
  // ─────────────────────────────────────────────

  @post('/notification-preferences')
  @response(200, {
    description: 'NotificationPreference model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(NotificationPreference),
      },
    },
  })
  async createPreference(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NotificationPreference, {
            title: 'NewNotificationPreference',
            exclude: ['id'],
          }),
        },
      },
    })
    notificationPreference: Omit<NotificationPreference, 'id'>,
  ): Promise<NotificationPreference> {
    return this.notificationPreferenceRepository.create({
      ...notificationPreference,
      deleted: false,
      createdOn: new Date(),
    });
  }

  @get('/notification-preferences/count')
  @response(200, {
    description: 'NotificationPreference model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(NotificationPreference) where?: Where<NotificationPreference>,
  ): Promise<Count> {
    return this.notificationPreferenceRepository.count(where);
  }

  @get('/notification-preferences')
  @response(200, {
    description: 'Array of NotificationPreference model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(NotificationPreference, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(
    @param.filter(NotificationPreference)
    filter?: Filter<NotificationPreference>,
  ): Promise<NotificationPreference[]> {
    return this.notificationPreferenceRepository.find(filter);
  }

  @patch('/notification-preferences')
  @response(200, {
    description: 'NotificationPreference PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NotificationPreference, {partial: true}),
        },
      },
    })
    notificationPreference: NotificationPreference,
    @param.where(NotificationPreference) where?: Where<NotificationPreference>,
  ): Promise<Count> {
    return this.notificationPreferenceRepository.updateAll(
      {
        ...notificationPreference,
        modifiedOn: new Date(),
      },
      where,
    );
  }

  @get('/notification-preferences/{id}')
  @response(200, {
    description: 'NotificationPreference model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(NotificationPreference, {
          includeRelations: true,
        }),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(NotificationPreference, {exclude: 'where'})
    filter?: FilterExcludingWhere<NotificationPreference>,
  ): Promise<NotificationPreference> {
    return this.notificationPreferenceRepository.findById(id, filter);
  }

  @patch('/notification-preferences/{id}')
  @response(204, {
    description: 'NotificationPreference PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NotificationPreference, {partial: true}),
        },
      },
    })
    notificationPreference: NotificationPreference,
  ): Promise<void> {
    await this.notificationPreferenceRepository.updateById(id, {
      ...notificationPreference,
      modifiedOn: new Date(),
    });
  }

  @put('/notification-preferences/{id}')
  @response(204, {
    description: 'NotificationPreference PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() notificationPreference: NotificationPreference,
  ): Promise<void> {
    await this.notificationPreferenceRepository.replaceById(id, {
      ...notificationPreference,
      modifiedOn: new Date(),
    });
  }

  @del('/notification-preferences/{id}')
  @response(204, {
    description: 'NotificationPreference DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.notificationPreferenceRepository.deleteById(id);
  }

  // ─────────────────────────────────────────────
  // Custom user-based APIs used by frontend
  // ─────────────────────────────────────────────

  @post('/users/{userId}/notification-preferences')
  async createByUserId(
    @param.path.string('userId') userId: string,
  ): Promise<NotificationPreference> {
    const existing = await this.notificationPreferenceRepository.findOne({
      where: {
        userId,
        deleted: false,
      },
    });

    if (existing) return existing;

    return this.notificationPreferenceRepository.create({
      userId,
      pushNotifications: true,
      donationAlerts: true,
      festivalReminders: true,
      templeUpdates: true,
      promotions: true,
      deleted: false,
      createdOn: new Date(),
    });
  }

  @get('/users/{userId}/notification-preferences')
  async findByUserId(
    @param.path.string('userId') userId: string,
  ): Promise<NotificationPreference | null> {
    return this.notificationPreferenceRepository.findOne({
      where: {
        userId,
        deleted: false,
      },
    });
  }

  @patch('/users/{userId}/notification-preferences')
  async updateByUserId(
    @param.path.string('userId') userId: string,
    @requestBody()
    body: Partial<NotificationPreference>,
  ): Promise<void> {
    if (body.pushNotifications === false) {
      body.donationAlerts = false;
      body.festivalReminders = false;
      body.templeUpdates = false;
      body.promotions = false;
    }

    await this.notificationPreferenceRepository.updateAll(
      {
        ...body,
        modifiedOn: new Date(),
      },
      {
        userId,
        deleted: false,
      },
    );
  }

  @del('/users/{userId}/notification-preferences')
  async deleteByUserId(
    @param.path.string('userId') userId: string,
  ): Promise<void> {
    await this.notificationPreferenceRepository.updateAll(
      {
        deleted: true,
        modifiedOn: new Date(),
      },
      {
        userId,
      },
    );
  }
}
