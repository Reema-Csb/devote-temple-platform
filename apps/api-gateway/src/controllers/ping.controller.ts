import {inject} from '@loopback/core';
import {NotificationService} from '../services';
import {
  Request,
  RestBindings,
  get,
  param,
  response,
  ResponseObject,
} from '@loopback/rest';
import {NotificationEvents} from '../enums';

/**
 * OpenAPI response for ping()
 */

const TEMPLE_SERVICE_URL =
  process.env.TEMPLE_SERVICE_URL ?? 'http://127.0.0.1:3001';

const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */

export class PingController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,

    @inject('services.NotificationService')
    private notificationService: NotificationService,
  ) {}

  // Map to `GET /ping`
  @get('/ping')
  @response(200, PING_RESPONSE)
  ping(): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }

  // Map to `GET /ping/test-notification/{userId}`
  // @get('/ping/test-notification/{userId}')
  // @response(200, {description: 'Test push notification'})
  // async testNotification(
  //   @param.path.string('userId') userId: string,
  // ): Promise<{success: boolean; userId: string}> {
  //   console.log('=== TEST NOTIFICATION START ===');
  //   console.log('Target userId:', userId);

  //   await this.notificationService.sendNotificationForEvent(
  //     NotificationEvents.DONATION_RECEIVED,
  //     userId,
  //   );

  //   console.log('=== TEST NOTIFICATION END ===');

  //   return {success: true, userId};
  // }

  @get('/ping/test-festival-reminder/{userId}')
  @response(200, {description: 'Test festival reminder notifications'})
  async testFestivalReminder(
    @param.path.string('userId') userId: string,
  ): Promise<{success: boolean; userId: string; festivalsNotified: number}> {
    console.log('=== TEST FESTIVAL REMINDER START ===');
    console.log('Target userId:', userId);

    const filter = encodeURIComponent(
      JSON.stringify({
        where: {status: 'upcoming', isActive: true, deleted: false},
      }),
    );

    const res = await fetch(
      `${TEMPLE_SERVICE_URL}/event-festivals?filter=${filter}`,
    );

    if (!res.ok) {
      console.error('Failed to fetch upcoming festivals:', res.status);
      return {success: false, userId, festivalsNotified: 0};
    }

    const festivals: {id: string; name: string}[] = await res.json();
    console.log('Upcoming festivals found:', festivals.length);

    for (const festival of festivals) {
      console.log('Sending festival reminder for:', festival.name);
      await this.notificationService.sendNotificationForEvent(
        NotificationEvents.FESTIVAL_REMINDER,
        userId,
      );
    }

    console.log('=== TEST FESTIVAL REMINDER END ===');

    return {success: true, userId, festivalsNotified: festivals.length};
  }
}
