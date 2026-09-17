/* Replace with your SQL commands */-- =========================
-- TEMPLE LOCATIONS TABLE
-- REMOVE SOFT CRUD FIELDS
-- =========================

ALTER TABLE main.temple_locations
DROP COLUMN IF EXISTS deleted,
DROP COLUMN IF EXISTS deleted_on,
DROP COLUMN IF EXISTS deleted_by,
DROP COLUMN IF EXISTS created_by,
DROP COLUMN IF EXISTS modified_by;

-- =========================
-- TEMPLE OFFERINGS TABLE
-- REMOVE SOFT CRUD FIELDS
-- =========================

ALTER TABLE main.temple_offerings
DROP COLUMN IF EXISTS deleted_by,
DROP COLUMN IF EXISTS created_by,
DROP COLUMN IF EXISTS modified_by;