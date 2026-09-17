import {Where} from '@loopback/repository';
import {get, param, patch, response} from '@loopback/rest';
import {ModifiedRestService, restService} from '@sourceloop/core';
import {Notification} from '../models/auth-service';
export class NotificationHistoryController {
  constructor(
    @restService(Notification)
    private notificationService: ModifiedRestService<Notification>,
  ) {}
  @get('/users/{userId}/notifications')
  @response(200, {description: 'Get notifications for user'})
  async findByUserId(
    @param.path.string('userId') userId: string,

    @param.query.string('status') status?: string,
  ) {
    const where: Record<string, unknown> = {userId, deleted: false};
    if (status === 'unread') {
      where.isRead = false;
    }

    if (status === 'read') {
      where.isRead = true;
    }
    return this.notificationService.find({
      where: where as Where<Notification>,
      order: ['createdOn DESC'],
    });
  }
  @get('/users/{userId}/notifications/unread-count')
  @response(200, {description: 'Get unread notification count'})
  async unreadCount(
    @param.path.string('userId') userId: string,
  ): Promise<{count: number}> {
    const result = await this.notificationService.count({
      userId,
      isRead: false,
      deleted: false,
    } as Where<Notification>);
    return {count: result.count};
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
}
