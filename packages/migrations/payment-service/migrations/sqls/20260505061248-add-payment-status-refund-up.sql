SET search_path TO main, public;

-- Step 1: Rename table
ALTER TABLE main.payments RENAME TO payment_transactions;

-- Step 2: All ALTER statements use NEW name
ALTER TABLE main.payment_transactions
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'Pending';

ALTER TABLE main.payment_transactions
    ADD CONSTRAINT chk_payment_status
    CHECK (status IN ('Success', 'Pending', 'Failed'));

ALTER TABLE main.payment_transactions
    ADD COLUMN IF NOT EXISTS is_refunded    BOOLEAN       NOT NULL DEFAULT FALSE;

ALTER TABLE main.payment_transactions
    ADD COLUMN IF NOT EXISTS refund_amount  NUMERIC(10,2);

ALTER TABLE main.payment_transactions
    ADD COLUMN IF NOT EXISTS refunded_on    TIMESTAMPTZ;

ALTER TABLE main.payment_transactions
    ADD COLUMN IF NOT EXISTS failed_reason  TEXT;

ALTER TABLE main.payment_transactions
    ADD COLUMN IF NOT EXISTS remarks        TEXT;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status
    ON main.payment_transactions (status);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_is_refunded
    ON main.payment_transactions (is_refunded);