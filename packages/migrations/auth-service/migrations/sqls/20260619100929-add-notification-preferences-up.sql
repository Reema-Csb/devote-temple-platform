CREATE TABLE IF NOT EXISTS main.notification_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id varchar NOT NULL UNIQUE,

  push_notifications boolean DEFAULT true,
  donation_alerts boolean DEFAULT true,
  festival_reminders boolean DEFAULT true,
  temple_updates boolean DEFAULT true,
  promotions boolean DEFAULT true,
  

  deleted boolean DEFAULT false,
  created_on timestamptz DEFAULT NOW(),
  modified_on timestamptz DEFAULT NOW()
);