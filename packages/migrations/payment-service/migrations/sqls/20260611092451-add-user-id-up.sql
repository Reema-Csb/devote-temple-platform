/* Replace with your SQL commands */SET search_path TO main, public;

ALTER TABLE main.payment_transactions
    ADD COLUMN IF NOT EXISTS user_id UUID;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id
    ON main.payment_transactions (user_id);