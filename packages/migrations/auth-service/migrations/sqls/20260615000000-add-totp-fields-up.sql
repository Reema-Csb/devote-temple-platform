/* Add TOTP 2FA fields to users table */

ALTER TABLE main.users
    ADD COLUMN IF NOT EXISTS totp_secret text,
    ADD COLUMN IF NOT EXISTS totp_enabled boolean DEFAULT false NOT NULL;
