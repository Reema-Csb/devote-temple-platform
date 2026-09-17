/* Add user_address table */

CREATE TABLE IF NOT EXISTS main.user_address (
    id              uuid DEFAULT md5(random()::text || clock_timestamp()::text)::uuid NOT NULL,
    user_id         uuid NOT NULL,
    address         text NOT NULL,
    city            varchar(100),
    state           varchar(100),
    country         varchar(100) DEFAULT 'India',
    pincode         varchar(20),
    created_on      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_on     timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted         boolean DEFAULT false NOT NULL,
    deleted_on      timestamptz,
    deleted_by      uuid,

    CONSTRAINT pk_user_address_id PRIMARY KEY (id),

    CONSTRAINT fk_user_address_users FOREIGN KEY (user_id)
        REFERENCES main.users (id)
        MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_address_user_id
    ON main.user_address (user_id);
