/* Replace with your SQL commands */-- =========================
-- TEMPLE LOCATIONS TABLE
-- ADD SOFT CRUD FIELDS
-- =========================

ALTER TABLE main.temple_locations
ADD COLUMN IF NOT EXISTS deleted bool DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS deleted_on timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid,
ADD COLUMN IF NOT EXISTS created_by uuid,
ADD COLUMN IF NOT EXISTS modified_by uuid;

-- =========================
-- TEMPLE OFFERINGS TABLE
-- ADD SOFT CRUD FIELDS
-- =========================

ALTER TABLE main.temple_offerings
ADD COLUMN IF NOT EXISTS deleted_by uuid,
ADD COLUMN IF NOT EXISTS created_by uuid,
ADD COLUMN IF NOT EXISTS modified_by uuid;