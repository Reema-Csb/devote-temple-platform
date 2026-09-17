CREATE TABLE IF NOT EXISTS main.temple_vendors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    temple_id uuid NOT NULL,

    razorpay_contact_id varchar(255),
    razorpay_fund_account_id varchar(255),

    beneficiary_name varchar(255),
    masked_account_number varchar(50),
    ifsc varchar(20),
    bank_name varchar(255),

    payout_schedule varchar(50) DEFAULT 'manual',
    vendor_status varchar(50) DEFAULT 'pending',

    created_on timestamptz DEFAULT now(),
    modified_on timestamptz DEFAULT now(),

    created_by varchar,
    modified_by varchar,

    deleted boolean DEFAULT false,
    deleted_on timestamptz,
    deleted_by varchar
);