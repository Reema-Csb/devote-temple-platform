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

import {
  NotificationRepository,
  NotificationPreferenceRepository,
} from '../repositories';
import {Notification} from '../models';

export class NotificationController {
  constructor(
    @repository(NotificationRepository)
    public notificationRepository: NotificationRepository,

    @repository(NotificationPreferenceRepository)
    public notificationPreferenceRepository: NotificationPreferenceRepository,
  ) {}

  private async isNotificationAllowed(
    userId: string,
    type?: string,
  ): Promise<boolean> {
    const preference = await this.notificationPreferenceRepository.findOne({
      where: {
        userId,
        deleted: false,
      },
    });

    if (!preference) return true;
    if (preference.pushNotifications === false) return false;

    const notificationType = type?.toLowerCase();

    if (notificationType === 'donation' && !preference.donationAlerts) {
      return false;
    }

    if (notificationType === 'festival' && !preference.festivalReminders) {
      return false;
    }

    if (notificationType === 'temple' && !preference.templeUpdates) {
      return false;
    }

    if (notificationType === 'promotion' && !preference.promotions) {
      return false;
    }

    return true;
  }

  // ─────────────────────────────────────────────
  // Standard LoopBack CRUD APIs
  // ─────────────────────────────────────────────

  @post('/notifications')
  @response(200, {
    description: 'Notification model instance',
    content: {'application/json': {schema: getModelSchemaRef(Notification)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notification, {
            title: 'NewNotification',
            exclude: ['id'],
          }),
        },
      },
    })
    notification: Omit<Notification, 'id'>,
  ): Promise<Notification | {skipped: boolean; reason: string}> {
    const allowed = await this.isNotificationAllowed(
      notification.userId,
      notification.type,
    );

    if (!allowed) {
      return {
        skipped: true,
        reason: 'Notification blocked by user preference',
      };
    }

    return this.notificationRepository.create({
      ...notification,
      isRead: false,
      deleted: false,
      createdOn: new Date(),
    });
  }

  @get('/notifications/count')
  @response(200, {
    description: 'Notification model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Notification) where?: Where<Notification>,
  ): Promise<Count> {
    return this.notificationRepository.count(where);
  }

  @get('/notifications')
  @response(200, {
    description: 'Array of Notification model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Notification, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Notification) filter?: Filter<Notification>,
  ): Promise<Notification[]> {
    return this.notificationRepository.find(filter);
  }

  @patch('/notifications')
  @response(200, {
    description: 'Notification PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notification, {partial: true}),
        },
      },
    })
    notification: Notification,
    @param.where(Notification) where?: Where<Notification>,
  ): Promise<Count> {
    return this.notificationRepository.updateAll(
      {
        ...notification,
        modifiedOn: new Date(),
      },
      where,
    );
  }

  @get('/notifications/{id}')
  @response(200, {
    description: 'Notification model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Notification, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Notification, {exclude: 'where'})
    filter?: FilterExcludingWhere<Notification>,
  ): Promise<Notification> {
    return this.notificationRepository.findById(id, filter);
  }

  @patch('/notifications/{id}')
  @response(204, {
    description: 'Notification PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notification, {partial: true}),
        },
      },
    })
    notification: Notification,
  ): Promise<void> {
    await this.notificationRepository.updateById(id, {
      ...notification,
      modifiedOn: new Date(),
    });
  }

  @put('/notifications/{id}')
  @response(204, {
    description: 'Notification PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() notification: Notification,
  ): Promise<void> {
    await this.notificationRepository.replaceById(id, {
      ...notification,
      modifiedOn: new Date(),
    });
  }

  @del('/notifications/{id}')
  @response(204, {
    description: 'Notification DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.notificationRepository.updateById(id, {
      deleted: true,
      modifiedOn: new Date(),
    });
  }

  // ─────────────────────────────────────────────
  // Custom user-based APIs used by frontend
  // ─────────────────────────────────────────────

  @get('/users/{userId}/notifications')
  @response(200, {description: 'Get notifications for user'})
  async findByUserId(
    @param.path.string('userId') userId: string,
    @param.query.string('status') status?: string,
  ): Promise<Notification[]> {
    const where: Record<string, unknown> = {
      userId,
      deleted: false,
    };

    if (status === 'unread') {
      where['isRead'] = false;
    } else if (status === 'read') {
      where['isRead'] = true;
    }

    return this.notificationRepository.find({
      where: where as any,
      order: ['createdOn DESC'],
    });
  }

  @get('/users/{userId}/notifications/unread-count')
  @response(200, {description: 'Get unread notification count'})
  async unreadCount(
    @param.path.string('userId') userId: string,
  ): Promise<{count: number}> {
    const count = await this.notificationRepository.count({
      userId,
      isRead: false,
      deleted: false,
    } as any);

    return {count: count.count};
  }

  @patch('/notifications/{id}/read')
  @response(200, {description: 'Mark notification as read'})
  async markAsRead(@param.path.string('id') id: string): Promise<void> {
    await this.notificationRepository.updateById(id, {
      isRead: true,
      readAt: new Date(),
      modifiedOn: new Date(),
    });
  }

  @patch('/users/{userId}/notifications/read-all')
  @response(200, {description: 'Mark all notifications as read'})
  async markAllAsRead(
    @param.path.string('userId') userId: string,
  ): Promise<void> {
    await this.notificationRepository.updateAll(
      {
        isRead: true,
        readAt: new Date(),
        modifiedOn: new Date(),
      },
      {userId, isRead: false, deleted: false} as any,
    );
  }
}
