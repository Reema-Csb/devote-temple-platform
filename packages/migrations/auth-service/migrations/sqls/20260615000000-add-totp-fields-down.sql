/* Remove TOTP 2FA fields from users table */

ALTER TABLE main.users
    DROP COLUMN IF EXISTS totp_secret,
    DROP COLUMN IF EXISTS totp_enabled;
