SET search_path TO main, public;

ALTER TABLE main.temple_bank_details
  DROP COLUMN IF EXISTS templeid,
  DROP COLUMN IF EXISTS razorpaycontactid,
  DROP COLUMN IF EXISTS razorpayfundaccountid,
  DROP COLUMN IF EXISTS verificationstatus;

ALTER TABLE main.temple_bank_details
  ALTER COLUMN temple_id SET NOT NULL;