SET search_path TO main,public;

ALTER TABLE main.temples
DROP COLUMN IF EXISTS email;

ALTER TABLE main.temples
ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE main.temples
ADD COLUMN IF NOT EXISTS image_urls jsonb DEFAULT '[]'::jsonb NOT NULL;