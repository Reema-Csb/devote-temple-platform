SET search_path TO main, public;

ALTER TABLE main.payment_transactions
    DROP COLUMN IF EXISTS offering_date;
