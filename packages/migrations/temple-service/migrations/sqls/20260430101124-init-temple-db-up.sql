CREATE SCHEMA IF NOT EXISTS main;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

SET search_path TO main,public;
GRANT USAGE ON SCHEMA main TO public;

-- =========================
-- TEMPLES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS main.temples (
    id              uuid DEFAULT gen_random_uuid() NOT NULL,
    name            varchar(255) NOT NULL,
    description     text,
    deity           varchar(255), -- e.g., Shiva, Vishnu, Murugan
    image_url       text,
    image_urls      jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active       bool DEFAULT true NOT NULL,

    created_on      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_on     timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted         bool DEFAULT false NOT NULL,
    deleted_on      timestamptz,
    deleted_by      uuid,
    created_by      uuid,
    modified_by     uuid,

    CONSTRAINT pk_temples PRIMARY KEY (id)
);

-- =========================
-- TEMPLE LOCATIONS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS main.temple_locations (
    id              uuid DEFAULT gen_random_uuid() NOT NULL,
    temple_id       uuid NOT NULL,

    address_line1   varchar(255),
    address_line2   varchar(255),
    city            varchar(100),
    state           varchar(100),
    country         varchar(100) DEFAULT 'India',
    postal_code     varchar(20),

    latitude        numeric(10,7),
    longitude       numeric(10,7),

    created_on      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_on     timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted         bool DEFAULT false NOT NULL,
    deleted_on      timestamptz,
    deleted_by      uuid,
    created_by      uuid,
    modified_by     uuid,

    CONSTRAINT pk_temple_locations PRIMARY KEY (id),
    CONSTRAINT fk_temple_locations_temple
        FOREIGN KEY (temple_id)
        REFERENCES main.temples(id)
        ON DELETE CASCADE
);

-- =========================
-- TEMPLE OFFERINGS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS main.temple_offerings (
    id              uuid DEFAULT gen_random_uuid() NOT NULL,
    temple_id       uuid NOT NULL,

    name            varchar(255) NOT NULL, -- e.g., Archana, Abhishekam
    description     text,
    archana         bool DEFAULT false NOT NULL,
    price           numeric(10,2) NOT NULL,
    currency        varchar(10) DEFAULT 'INR' NOT NULL,
    is_active       bool DEFAULT true NOT NULL,
    

    created_on      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_on     timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted         bool DEFAULT false NOT NULL,
    deleted_on      timestamptz,
    deleted_by      uuid,
    created_by      uuid,
    modified_by     uuid,

    CONSTRAINT pk_temple_offerings PRIMARY KEY (id),
    CONSTRAINT fk_temple_offerings_temple
        FOREIGN KEY (temple_id)
        REFERENCES main.temples(id)
        ON DELETE CASCADE
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_temples_name 
    ON main.temples (name);

CREATE INDEX IF NOT EXISTS idx_temple_locations_temple_id 
    ON main.temple_locations (temple_id);

CREATE INDEX IF NOT EXISTS idx_temple_locations_city 
    ON main.temple_locations (city);

CREATE INDEX IF NOT EXISTS idx_temple_offerings_temple_id 
    ON main.temple_offerings (temple_id);

CREATE INDEX IF NOT EXISTS idx_temple_offerings_active 
    ON main.temple_offerings (is_active);
