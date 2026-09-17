import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';

import {ModifiedRestService, restService} from '@sourceloop/core';
import {Notification} from '../models/auth-service';
import {NotificationService} from '../services/notification.service';
import {NotificationEvents} from '../enums';
import {service} from '@loopback/core';

const basePath = '/notifications';

export class NotificationController {
  constructor(
    @restService(Notification)
    private notificationService: ModifiedRestService<Notification>,
    @service(NotificationService)
    private pushNotificationService: NotificationService,
  ) {}

  @post(basePath)
  @response(200)
  async create(@requestBody() notification: Omit<Notification, 'id'>) {
    return this.notificationService.create(notification);
  }

  @get(`${basePath}/count`)
  @response(200, {
    description: 'Notification count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Notification) where?: Where<Notification>,
  ): Promise<Count> {
    return this.notificationService.count(where);
  }

  @get(basePath)
  async find(@param.filter(Notification) filter?: Filter<Notification>) {
    return this.notificationService.find(filter);
  }

  @get(`${basePath}/{id}`)
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Notification, {exclude: 'where'})
    filter?: FilterExcludingWhere<Notification>,
  ) {
    return this.notificationService.findById(id, filter);
  }

  @patch(`${basePath}/{id}`)
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() data: Partial<Notification>,
  ) {
    await this.notificationService.updateById(id, data);
  }

  @del(`${basePath}/{id}`)
  async deleteById(@param.path.string('id') id: string) {
    await this.notificationService.deleteById(id);
  }

  @patch('/notifications/{id}/read')
  @response(200, {description: 'Mark notification as read'})
  async markAsRead(@param.path.string('id') id: string): Promise<void> {
    await this.notificationService.updateById(id, {
      isRead: true,
      readAt: new Date(),
      modifiedOn: new Date(),
    });
  }

  @patch('/users/{userId}/notifications/read-all')
  @response(200, {description: 'Mark all notifications as read'})
  async markAllAsRead(
    @param.path.string('userId') userId: string,
  ): Promise<Count> {
    return this.notificationService.update(
      {
        isRead: true,
        readAt: new Date(),
        modifiedOn: new Date(),
      },
      {
        userId,
        isRead: false,
        deleted: false,
      } as Where<Notification>,
    );
  }

  @post('/notifications/events/{event}/{userId}')
  @response(200, {description: 'Trigger a notification for an event'})
  async triggerEvent(
    @param.path.string('event') event: NotificationEvents,
    @param.path.string('userId') userId: string,
  ): Promise<{success: boolean}> {
    await this.pushNotificationService.sendNotificationForEvent(event, userId);
    return {success: true};
  }
}
