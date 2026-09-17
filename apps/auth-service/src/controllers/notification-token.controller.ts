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
import {NotificationToken} from '../models';
import {NotificationTokenRepository} from '../repositories';

export class NotificationTokenController {
  constructor(
    @repository(NotificationTokenRepository)
    public notificationTokenRepository: NotificationTokenRepository,
  ) {}

  @post('/notification-tokens')
  @response(200, {
    description: 'Create or update NotificationToken',
    content: {
      'application/json': {schema: getModelSchemaRef(NotificationToken)},
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NotificationToken, {
            title: 'NewNotificationToken',
            exclude: ['id'],
          }),
        },
      },
    })
    notificationToken: Omit<NotificationToken, 'id'>,
  ): Promise<NotificationToken> {
    const existingToken = await this.notificationTokenRepository.findOne({
      where: {
        userId: notificationToken.userId,
      },
    });

    if (existingToken?.id) {
      await this.notificationTokenRepository.updateById(existingToken.id, {
        fcmToken: notificationToken.fcmToken,
      });

      return this.notificationTokenRepository.findById(existingToken.id);
    }

    return this.notificationTokenRepository.create(notificationToken);
  }

  @get('/notification-tokens/count')
  @response(200, {
    description: 'NotificationToken model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(NotificationToken) where?: Where<NotificationToken>,
  ): Promise<Count> {
    return this.notificationTokenRepository.count(where);
  }

  @get('/notification-tokens')
  @response(200, {
    description: 'Array of NotificationToken model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(NotificationToken, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(NotificationToken) filter?: Filter<NotificationToken>,
  ): Promise<NotificationToken[]> {
    return this.notificationTokenRepository.find(filter);
  }

  @patch('/notification-tokens')
  @response(200, {
    description: 'NotificationToken PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NotificationToken, {partial: true}),
        },
      },
    })
    notificationToken: NotificationToken,
    @param.where(NotificationToken) where?: Where<NotificationToken>,
  ): Promise<Count> {
    return this.notificationTokenRepository.updateAll(notificationToken, where);
  }

  @get('/notification-tokens/{id}')
  @response(200, {
    description: 'NotificationToken model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(NotificationToken, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(NotificationToken, {exclude: 'where'})
    filter?: FilterExcludingWhere<NotificationToken>,
  ): Promise<NotificationToken> {
    return this.notificationTokenRepository.findById(id, filter);
  }

  @patch('/notification-tokens/{id}')
  @response(204, {
    description: 'NotificationToken PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NotificationToken, {partial: true}),
        },
      },
    })
    notificationToken: NotificationToken,
  ): Promise<void> {
    await this.notificationTokenRepository.updateById(id, notificationToken);
  }

  @put('/notification-tokens/{id}')
  @response(204, {
    description: 'NotificationToken PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() notificationToken: NotificationToken,
  ): Promise<void> {
    await this.notificationTokenRepository.replaceById(id, notificationToken);
  }

  @del('/notification-tokens/{id}')
  @response(204, {
    description: 'NotificationToken DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.notificationTokenRepository.deleteById(id);
  }

  @get('/users/{userId}/fcm-tokens')
  @response(200, {
    description: 'FCM tokens for a user',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(NotificationToken, {includeRelations: true}),
        },
      },
    },
  })
  async findByUserId(
    @param.path.string('userId') userId: string,
  ): Promise<NotificationToken[]> {
    return this.notificationTokenRepository.find({
      where: {userId},
    });
  }
}
