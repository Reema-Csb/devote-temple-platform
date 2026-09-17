SET search_path TO main, public;

-- Drop indexes
DROP INDEX IF EXISTS main.idx_payment_transactions_is_refunded;
DROP INDEX IF EXISTS main.idx_payment_transactions_status;

-- Drop constraint
ALTER TABLE main.payment_transactions
    DROP CONSTRAINT IF EXISTS chk_payment_status;

-- Drop added columns
ALTER TABLE main.payment_transactions
    DROP COLUMN IF EXISTS remarks;

ALTER TABLE main.payment_transactions
    DROP COLUMN IF EXISTS failed_reason;

ALTER TABLE main.payment_transactions
    DROP COLUMN IF EXISTS refunded_on;

ALTER TABLE main.payment_transactions
    DROP COLUMN IF EXISTS refund_amount;

ALTER TABLE main.payment_transactions
    DROP COLUMN IF EXISTS is_refunded;

ALTER TABLE main.payment_transactions
    DROP COLUMN IF EXISTS status;

-- Rename back
ALTER TABLE main.payment_transactions RENAME TO payments;