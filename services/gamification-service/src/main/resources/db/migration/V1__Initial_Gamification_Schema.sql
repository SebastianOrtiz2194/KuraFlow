-- =============================================
-- GAMIFICATION SERVICE: Streaks & Badges
-- =============================================

-- Note: Reference user_id from User Service by UUID only.

CREATE TABLE IF NOT EXISTS user_streaks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE,
    current_streak  INT DEFAULT 0,
    longest_streak  INT DEFAULT 0,
    last_activity   DATE,
    streak_freezes  INT DEFAULT 0,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(50) NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url    VARCHAR(500),
    xp_reward   INT DEFAULT 0,
    category    VARCHAR(30),
    criteria    JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,                         -- Reference to User Service
    badge_id    UUID NOT NULL REFERENCES badges(id),
    earned_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);
