-- =============================================
-- USER SERVICE: Users & Audit
-- =============================================

CREATE TABLE IF NOT EXISTS users (
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

CREATE TABLE IF NOT EXISTS activity_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    event_type  VARCHAR(50) NOT NULL,                      -- 'LESSON_COMPLETED', 'REVIEW_SESSION', etc.
    payload     JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user_time ON activity_log(user_id, created_at DESC);
