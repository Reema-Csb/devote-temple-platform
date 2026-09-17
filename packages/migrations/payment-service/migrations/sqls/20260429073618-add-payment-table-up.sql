CREATE SCHEMA IF NOT EXISTS main;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

SET search_path TO main,public;
GRANT ALL ON SCHEMA main TO public;

CREATE TABLE IF NOT EXISTS main.payments (
    id                  uuid DEFAULT md5(random()::text || clock_timestamp()::text)::uuid NOT NULL,
    order_id            uuid NOT NULL,
    payment_method      varchar(50) NOT NULL, -- e.g., cashfree, razorpay, stripe
    payment_status      varchar(50) DEFAULT 'pending' NOT NULL, -- pending, success, failed
    transaction_id      varchar(255),
    amount              numeric(10,2) NOT NULL,
    currency            varchar(10) DEFAULT 'INR' NOT NULL,
    payment_date        timestamptz,
    created_on          timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_on         timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted             bool DEFAULT false NOT NULL,
    deleted_on          timestamptz,
    deleted_by          uuid,
    created_by          uuid,
    modified_by         uuid,
    CONSTRAINT pk_payments PRIMARY KEY (id)
);


-- Create indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON main.payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON main.payments (payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON main.payments (payment_date);