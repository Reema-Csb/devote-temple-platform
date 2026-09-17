DELETE FROM main.user_credentials
WHERE user_id IN (
  SELECT id FROM main.users WHERE email = 'admin@devote.com'
);

DELETE FROM main.users
WHERE email = 'admin@devote.com';

ALTER TABLE main.users
DROP COLUMN IF EXISTS temple_id,
DROP COLUMN IF EXISTS role;