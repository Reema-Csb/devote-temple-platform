/* Replace with your SQL commands */
CREATE SCHEMA IF NOT EXISTS main;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

SET search_path TO main,public;
GRANT ALL ON SCHEMA main TO public;

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS main.users (
    id                  uuid DEFAULT md5(random()::text || clock_timestamp()::text)::uuid NOT NULL,
    first_name          varchar(50) NOT NULL,
    middle_name         varchar(50),
    last_name           varchar(50),
    username            varchar(150) NOT NULL,
    email               varchar(150),
    phone               varchar(15),
    created_on          timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_on         timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by          uuid,
    modified_by         uuid,
    deleted             boolean DEFAULT false NOT NULL,
    last_login          timestamptz,
    auth_client_ids     integer[],
    gender              char(1),
    dob                 date,
    default_tenant_id   uuid,
    deleted_by          uuid,
    deleted_on          timestamptz,

    CONSTRAINT pk_users_id PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_users_username
    ON main.users (username);

CREATE INDEX IF NOT EXISTS idx_users_email
    ON main.users (email);

CREATE INDEX IF NOT EXISTS idx_users_phone
    ON main.users (phone);

-- =====================================================
-- USER CREDENTIALS
-- =====================================================

CREATE TABLE IF NOT EXISTS main.user_credentials (
    id                  uuid DEFAULT md5(random()::text || clock_timestamp()::text)::uuid NOT NULL,
    user_id             uuid NOT NULL,
    auth_provider       varchar(50) NOT NULL DEFAULT 'internal',
    auth_id             varchar(100),
    auth_token          varchar(100),
    password            varchar(60),
    created_on          timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_on         timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted             boolean DEFAULT false NOT NULL,
    deleted_on          timestamptz,
    deleted_by          uuid,

    CONSTRAINT pk_user_credentials_id PRIMARY KEY (id),

    CONSTRAINT idx_user_credentials_unique UNIQUE (
        auth_provider,
        auth_id,
        auth_token,
        password
    ),

    CONSTRAINT idx_user_credentials_user_id UNIQUE (user_id),

    CONSTRAINT fk_user_credentials_users FOREIGN KEY (user_id)
        REFERENCES main.users (id)
        MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE INDEX IF NOT EXISTS idx_user_credentials_auth_provider
    ON main.user_credentials (auth_provider);

CREATE INDEX IF NOT EXISTS idx_user_credentials_auth_id
    ON main.user_credentials (auth_id);

-- =====================================================
-- NOTIFICATION TOKENS
-- =====================================================

CREATE TABLE IF NOT EXISTS main.notification_tokens (
    id                  uuid DEFAULT md5(random()::text || clock_timestamp()::text)::uuid NOT NULL,
    user_id             uuid NOT NULL,
    fcm_token           text NOT NULL,
    device_type         varchar(50),
    device_id           varchar(100),
    created_on          timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_on         timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted             boolean DEFAULT false NOT NULL,
    deleted_on          timestamptz,
    deleted_by          uuid,
    created_by          uuid,
    modified_by         uuid,

    CONSTRAINT pk_notification_tokens PRIMARY KEY (id),

    CONSTRAINT fk_notification_tokens_user FOREIGN KEY (user_id)
        REFERENCES main.users (id)
        MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE INDEX IF NOT EXISTS idx_notification_tokens_user_id
    ON main.notification_tokens (user_id);

CREATE INDEX IF NOT EXISTS idx_notification_tokens_fcm_token
    ON main.notification_tokens (fcm_token);

CREATE INDEX IF NOT EXISTS idx_notification_tokens_device_type
    ON main.notification_tokens (device_type);

CREATE INDEX IF NOT EXISTS idx_notification_tokens_device_id
    ON main.notification_tokens (device_id);