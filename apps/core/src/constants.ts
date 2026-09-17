export const UPLOAD_FILE_SIZE = 10 * 1024 * 1024;

export const MAX_FILES = 5;

export const ALLOWED_FILE_EXTENSIONS = ['.doc', '.txt', '.pdf'];

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.svg', '.heic', '.webp'];

export const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export const PREFIXES = {
  TEMPLE: 'DVTMP',
  DEVOTEE: 'DVDEV',
  ADMIN: 'DVADM',
  DONATION: 'DVDON',
  EVENT: 'DVEVT',
};

export const DEFAULT_CURRENCY = 'INR';

export const NOTIFICATION_TOPICS = {
  ALL_USERS: 'all_users',
  DEVOTEES: 'devotees',
  TEMPLE_ADMINS: 'temple_admins',
  SUPER_ADMINS: 'super_admins',

  // Donation events
  DONATION_SUCCESS: 'donation_success',
  DONATION_FAILED: 'donation_failed',
  DONATION_REFUNDED: 'donation_refunded',

  // Temple events
  TEMPLE_APPROVED: 'temple_approved',
  TEMPLE_SUSPENDED: 'temple_suspended',

  // Event notifications
  EVENT_UPCOMING: 'event_upcoming',
  EVENT_STARTED: 'event_started',
  EVENT_CANCELLED: 'event_cancelled',
} as const;

export type NotificationTopic =
  (typeof NOTIFICATION_TOPICS)[keyof typeof NOTIFICATION_TOPICS];
