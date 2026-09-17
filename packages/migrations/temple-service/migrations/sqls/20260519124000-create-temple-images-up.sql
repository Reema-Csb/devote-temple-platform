CREATE TABLE IF NOT EXISTS main.temple_images (
  id SERIAL PRIMARY KEY,

  temple_id uuid NOT NULL,

  image_url text NOT NULL
);