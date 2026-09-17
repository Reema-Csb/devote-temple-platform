SET search_path TO main, public;

DROP INDEX IF EXISTS main.idx_payment_transactions_offering_id;

ALTER TABLE main.payment_transactions
    DROP COLUMN IF EXISTS offering_id; 