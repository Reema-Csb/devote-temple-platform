DROP TABLE IF EXISTS main.transaction_offering_metadata;
ALTER TABLE main.payment_transactions
ADD COLUMN IF NOT EXISTS offering_date DATE;