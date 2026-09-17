SET search_path TO main, public;

ALTER TABLE main.payment_transactions
    ADD COLUMN IF NOT EXISTS offering_id UUID;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_offering_id
    ON main.payment_transactions (offering_id);