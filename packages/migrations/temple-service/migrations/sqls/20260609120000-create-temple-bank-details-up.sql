SET search_path TO main, public;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS main.temple_bank_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  temple_id UUID NOT NULL,

  razorpay_contact_id VARCHAR(255),
  razorpay_fund_account_id VARCHAR(255),
  verification_status VARCHAR(50) DEFAULT 'pending',

  pan_number VARCHAR(50),
  gstin VARCHAR(50),
  payout_schedule VARCHAR(50),

  deleted BOOLEAN DEFAULT false,
  deleted_on TIMESTAMP,
  deleted_by UUID,

  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  modified_by UUID,

  CONSTRAINT fk_temple_bank_details_temple
    FOREIGN KEY (temple_id)
    REFERENCES main.temples(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_temple_bank_details_temple_id
  ON main.temple_bank_details (temple_id);