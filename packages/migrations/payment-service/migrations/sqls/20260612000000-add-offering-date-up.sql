SET search_path TO main, public;

ALTER TABLE main.payment_transactions
    ADD COLUMN IF NOT EXISTS offering_date DATE;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_offering_date
    ON main.payment_transactions (offering_date);
