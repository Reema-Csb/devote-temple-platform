/* Create user_sessions table for active session tracking */

CREATE TABLE IF NOT EXISTS main.user_sessions (
    id              uuid DEFAULT md5(random()::text || clock_timestamp()::text)::uuid NOT NULL,
    user_id         uuid NOT NULL,
    device_info     varchar(255),
    ip_address      varchar(45),
    created_on      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at      timestamptz NOT NULL,
    revoked         boolean DEFAULT false NOT NULL,
    revoked_on      timestamptz,

    CONSTRAINT pk_user_sessions_id PRIMARY KEY (id),

    CONSTRAINT fk_user_sessions_users FOREIGN KEY (user_id)
        REFERENCES main.users (id)
        MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id
    ON main.user_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at
    ON main.user_sessions (expires_at);
