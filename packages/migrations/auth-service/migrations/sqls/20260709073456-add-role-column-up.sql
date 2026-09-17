ALTER TABLE main.users
ADD COLUMN IF NOT EXISTS role varchar(50) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS temple_id uuid;

WITH new_user AS (
  INSERT INTO main.users (
    first_name,
    last_name,
    username,
    email,
    phone,
    role,
    temple_id,
    deleted,
    created_on,
    modified_on
  )
  SELECT
    'Super',
    'Admin',
    'superadmin',
    'admin@devote.com',
    '0000000000',
    'super_admin',
    NULL,
    false,
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM main.users WHERE email = 'admin@devote.com'
  )
  RETURNING id
)
INSERT INTO main.user_credentials (
  user_id,
  auth_provider,
  password,
  created_on,
  modified_on,
  deleted
)
SELECT
  id,
  'local',
  '$2b$10$tswsc/kZV7KT0adQX1PJlOAyExRB1fPh5FGWzyBcYUYl6lH6S6oBa',
  NOW(),
  NOW(),
  false
FROM new_user;