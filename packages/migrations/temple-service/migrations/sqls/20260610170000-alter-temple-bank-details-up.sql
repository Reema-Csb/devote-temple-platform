SET search_path TO main, public;

ALTER TABLE main.temple_bank_details
  ADD COLUMN IF NOT EXISTS templeid UUID,
  ADD COLUMN IF NOT EXISTS razorpaycontactid VARCHAR(255),
  ADD COLUMN IF NOT EXISTS razorpayfundaccountid VARCHAR(255),
  ADD COLUMN IF NOT EXISTS verificationstatus VARCHAR(50) DEFAULT 'pending';

ALTER TABLE main.temple_bank_details
  ALTER COLUMN temple_id DROP NOT NULL;