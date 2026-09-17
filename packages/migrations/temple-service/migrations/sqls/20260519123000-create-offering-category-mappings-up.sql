SET search_path TO main, public;

CREATE TABLE IF NOT EXISTS main.offering_category_mappings (
    id SERIAL PRIMARY KEY,

    offering_id UUID NOT NULL,

    category_id UUID NOT NULL,

    temple_id UUID,

    CONSTRAINT fk_offering_category_mappings_temple
        FOREIGN KEY (temple_id)
        REFERENCES main.temples(id)
);

CREATE INDEX IF NOT EXISTS idx_offering_category_mappings_temple_id
    ON main.offering_category_mappings (temple_id);