CREATE TABLE IF NOT EXISTS main.festival_sevas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    festival_id UUID NOT NULL,
    temple_id UUID NOT NULL,

    name VARCHAR(255) NOT NULL,
    is_selected BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_on TIMESTAMP,
    deleted_by UUID,

    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    modified_by UUID,

    CONSTRAINT fk_festival_sevas_festival
        FOREIGN KEY (festival_id)
        REFERENCES main.event_festivals(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_festival_sevas_temple
        FOREIGN KEY (temple_id)
        REFERENCES main.temples(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_festival_sevas_festival_id
ON main.festival_sevas(festival_id);

CREATE INDEX IF NOT EXISTS idx_festival_sevas_temple_id
ON main.festival_sevas(temple_id);