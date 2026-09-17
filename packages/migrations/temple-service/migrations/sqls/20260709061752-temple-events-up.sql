CREATE TABLE IF NOT EXISTS main.event_festivals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    temple_id UUID NOT NULL,

    name VARCHAR(255) NOT NULL,
    description TEXT,

    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,

    image_url TEXT,
    location VARCHAR(255),

    is_featured BOOLEAN DEFAULT FALSE,

    status VARCHAR(20) NOT NULL DEFAULT 'upcoming',

    special_seva_count INTEGER DEFAULT 0,

 is_active BOOLEAN DEFAULT TRUE,

deleted BOOLEAN DEFAULT FALSE,
deleted_on TIMESTAMP,
deleted_by UUID,

created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,
    modified_by UUID,

    CONSTRAINT fk_event_festivals_temple
        FOREIGN KEY (temple_id)
        REFERENCES main.temples(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_festivals_temple_id
ON main.event_festivals(temple_id);

CREATE INDEX IF NOT EXISTS idx_event_festivals_status
ON main.event_festivals(status);

CREATE INDEX IF NOT EXISTS idx_event_festivals_start_date
ON main.event_festivals(start_date);