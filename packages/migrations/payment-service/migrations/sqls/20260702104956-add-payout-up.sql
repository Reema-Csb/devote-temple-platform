CREATE TABLE IF NOT EXISTS main.payouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    temple_id uuid NOT NULL,

    total_collected numeric(10,2) NOT NULL DEFAULT 0,
    commission_amount numeric(10,2) NOT NULL DEFAULT 0,
    platform_commission_amount numeric(10,2) NOT NULL DEFAULT 0,
    gst_amount numeric(10,2) NOT NULL DEFAULT 0,
    gateway_charge_amount numeric(10,2) NOT NULL DEFAULT 0,
    payout_amount numeric(10,2) NOT NULL DEFAULT 0,

    transaction_count integer DEFAULT 0,

    payout_method varchar(50) DEFAULT 'manual',
    payout_status varchar(50) DEFAULT 'pending',

    remarks text,

    paid_on timestamptz,

    created_on timestamptz DEFAULT now(),
    modified_on timestamptz DEFAULT now(),

    created_by varchar,
    modified_by varchar,

    deleted boolean DEFAULT false,
    deleted_on timestamptz,
    deleted_by varchar
);