SET search_path TO main, public;

ALTER TABLE main.payment_transactions
    ADD COLUMN IF NOT EXISTS temple_id UUID;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_temple_id
    ON main.payment_transactions (temple_id);
