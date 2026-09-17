import * as admin from 'firebase-admin';
import {NotificationEvents, NotificationType} from '../enums';
import {
  notificationEventContentMap,
  NotificationPreferenceEventMap,
} from '../constants';
import {ModifiedRestService, restService} from '@sourceloop/core';
import {NotificationPreference} from '../models/auth-service';
import {inject, injectable, BindingScope} from '@loopback/core';
import {AuthService} from './auth-service.service';

interface UserFcmToken {
  id?: string;
  userId: string;
  fcmToken: string;
  deviceType?: string;
}

@injectable({scope: BindingScope.SINGLETON})
export class NotificationService {
  constructor(
    @restService(NotificationPreference)
    private notificationPreferenceService: ModifiedRestService<NotificationPreference>,

    @inject('services.AuthService')
    private authService: AuthService,
  ) {
    if (!admin.apps.length) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!raw) {
        console.warn(
          'FIREBASE_SERVICE_ACCOUNT_KEY not set — push notifications disabled',
        );
        return;
      }
      try {
        const serviceAccount = JSON.parse(raw);
        if (!serviceAccount.project_id) {
          console.warn(
            'FIREBASE_SERVICE_ACCOUNT_KEY missing project_id — push notifications disabled',
          );
          return;
        }
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch {
        console.warn(
          'FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON — push notifications disabled',
        );
      }
    }
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    console.log('sendPushNotification started');
    console.log('========== sendPushNotification ==========');
    console.log('admin.apps.length =', admin.apps.length);

    try {
      console.log('Saving notification to Auth Service...');

      const result = await this.authService.createNotification({
        userId,
        title,
        body,
        type: 'Push',
        data,
      });

      console.log('Notification created:', result);
    } catch (err) {
      console.error('createNotification FAILED:', err);
    }

    if (!admin.apps.length) {
      console.log('Firebase not initialized');
      return;
    }

    try {
      const tokens = await this.authService.getFcmTokens(userId);

      console.log('FCM Tokens:', tokens);

      const fcmTokens = tokens.map(t => t.fcmToken).filter(Boolean);

      if (!fcmTokens.length) {
        console.log('No FCM tokens found');
        return;
      }

      const response = await admin.messaging().sendEachForMulticast({
        tokens: fcmTokens,
        notification: {title, body},
        data,
      });

      console.log('Firebase Response:', response);
    } catch (err) {
      console.error('getFcmTokens / Firebase FAILED:', err);
    }
  }

  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (type === NotificationType.PUSH) {
      await this.sendPushNotification(userId, title, message, data);
    } else if (type === NotificationType.EMAIL) {
      console.info(`Email notification not yet implemented for user ${userId}`);
    } else if (type === NotificationType.SMS) {
      console.info(`SMS notification not yet implemented for user ${userId}`);
    }
  }

  private async checkPreferenceForEvent(
    userId: string,
    event: NotificationEvents,
  ): Promise<boolean> {
    try {
      const [preference] = await this.notificationPreferenceService.find({
        where: {userId},
        limit: 1,
        order: ['createdOn DESC'],
      });

      const preferenceKey = NotificationPreferenceEventMap[event];

      if (!preferenceKey) {
        return false;
      }

      return (
        preference[preferenceKey as keyof NotificationPreference] !== false
      );
    } catch (error) {
      console.error('Error checking notification preference:', error);
      return false;
    }
  }

  async sendNotificationForEvent(
    event: NotificationEvents,
    userId: string,
  ): Promise<void> {
    console.log('sendNotificationForEvent called');
    console.log('event =', event);
    console.log('userId =', userId);
    const canSend = await this.checkPreferenceForEvent(userId, event);

    if (!canSend) {
      console.info(
        `Notification for event ${event} blocked by user preference for user ${userId}`,
      );
      return;
    }

    const {title, body} = notificationEventContentMap[event];

    await this.sendNotification(userId, NotificationType.PUSH, title, body, {
      type: NotificationPreferenceEventMap[event],
      event,
    });
  }
}
