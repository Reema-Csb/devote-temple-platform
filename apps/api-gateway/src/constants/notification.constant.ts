import {NotificationEvents} from '../enums';

export const NotificationPreferenceEventMap = {
  [NotificationEvents.DONATION_RECEIVED]: 'donationAlerts',
  [NotificationEvents.DONATION_FAILED]: 'donationAlerts',
  [NotificationEvents.PAYMENT_CAPTURED]: 'templeUpdates',
  [NotificationEvents.ORDER_PAID]: 'promotions',
  [NotificationEvents.FESTIVAL_REMINDER]: 'festivalReminders',
};

export const notificationEventContentMap: Record<
  NotificationEvents,
  {title: string; body: string}
> = {
  [NotificationEvents.DONATION_RECEIVED]: {
    title: 'Donation Received',
    body: 'Thank you for your generous donation!',
  },
  [NotificationEvents.DONATION_FAILED]: {
    title: 'Donation Failed',
    body: 'Unfortunately, your donation failed. Please try again.',
  },
  [NotificationEvents.PAYMENT_CAPTURED]: {
    title: 'Payment Captured',
    body: 'Your payment has been successfully captured.',
  },
  [NotificationEvents.ORDER_PAID]: {
    title: 'Order Paid',
    body: 'Your order has been paid and is being processed.',
  },
  [NotificationEvents.FESTIVAL_REMINDER]: {
    title: 'Festival Reminder',
    body: 'A festival is coming up soon at a temple you follow!',
  },
};
