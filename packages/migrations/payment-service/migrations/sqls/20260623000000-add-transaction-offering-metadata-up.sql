CREATE TABLE IF NOT EXISTS main.transaction_offering_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    temple_id UUID NOT NULL,

    payment_transaction_id UUID,

    devotee_name VARCHAR(255) NOT NULL,

    nakshatra VARCHAR(100),

    gotra VARCHAR(100),

    offering_type VARCHAR(20) NOT NULL,

    offering_date DATE NOT NULL,

    created_on          timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_on         timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted             bool DEFAULT false NOT NULL,
    deleted_on          timestamptz,
    deleted_by          uuid,
    created_by          uuid,
    modified_by         uuid
);

CREATE INDEX idx_transaction_offering_metadata_user_id
ON main.transaction_offering_metadata(user_id);

CREATE INDEX idx_transaction_offering_metadata_temple_id
ON main.transaction_offering_metadata(temple_id);

CREATE INDEX idx_transaction_offering_metadata_payment_transaction_id
ON main.transaction_offering_metadata(payment_transaction_id);

ALTER TABLE main.payment_transactions
DROP COLUMN IF EXISTS offering_date;
