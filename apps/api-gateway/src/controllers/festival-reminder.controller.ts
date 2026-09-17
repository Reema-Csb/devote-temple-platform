import {inject} from '@loopback/core';
import {get, param, response} from '@loopback/rest';
import {NotificationService} from '../services';
import {NotificationEvents} from '../enums';

const TEMPLE_SERVICE_URL =
  process.env.TEMPLE_SERVICE_URL ?? 'http://127.0.0.1:3001';

const REMINDER_DAYS_BEFORE = 3;

function isExactlyDaysFromNow(dateStr: string, days: number): boolean {
  const target = new Date(dateStr);
  const today = new Date();

  // Normalize both to midnight so time-of-day doesn't affect comparison
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return diffDays === days;
}

export class FestivalReminderController {
  constructor(
    @inject('services.NotificationService')
    private notificationService: NotificationService,
  ) {}

  @get('/festivals/check-reminders/{userId}')
  @response(200, {description: 'Check and send festival reminders for a user'})
  async checkReminders(
    @param.path.string('userId') userId: string,
  ): Promise<{success: boolean; remindersSent: number}> {
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
      return {success: false, remindersSent: 0};
    }

    const festivals: {id: string; name: string; startDate: string}[] =
      await res.json();

    const dueFestivals = festivals.filter(f =>
      isExactlyDaysFromNow(f.startDate, REMINDER_DAYS_BEFORE),
    );

    for (const festival of dueFestivals) {
      console.log(
        `Sending festival reminder for "${festival.name}" to user ${userId}`,
      );
      await this.notificationService.sendNotificationForEvent(
        NotificationEvents.FESTIVAL_REMINDER,
        userId,
      );
    }

    return {success: true, remindersSent: dueFestivals.length};
  }
}
