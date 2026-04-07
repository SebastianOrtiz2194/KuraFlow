-- V1__Create_Users_Table.sql

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),                          -- NULL for OAuth users
    display_name    VARCHAR(100) NOT NULL,
    avatar_url      VARCHAR(500),
    auth_provider   VARCHAR(20) DEFAULT 'local',           -- 'local', 'google', 'github'
    preferred_language_id UUID,
    current_level_id UUID,
    timezone        VARCHAR(50) DEFAULT 'UTC',
    is_premium      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
