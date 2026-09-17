SET search_path TO main, public;

DROP INDEX IF EXISTS main.idx_payment_transactions_temple_id;

ALTER TABLE main.payment_transactions
    DROP COLUMN IF EXISTS temple_id;
