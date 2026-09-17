SET search_path TO main,public;

ALTER TABLE main.temples
DROP COLUMN IF EXISTS image_url,
DROP COLUMN IF EXISTS image_urls;

ALTER TABLE main.temples
ADD COLUMN IF NOT EXISTS email varchar(255);