-- =============================================
-- GAMIFICATION SERVICE: Daily Quests
-- =============================================

CREATE TABLE IF NOT EXISTS gamification_schema.daily_quests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    quest_date      DATE NOT NULL,
    quest_type      VARCHAR(50) NOT NULL,
    title           VARCHAR(150) NOT NULL,
    description     VARCHAR(300),
    target_count    INT NOT NULL DEFAULT 1,
    current_count   INT NOT NULL DEFAULT 0,
    xp_reward       INT NOT NULL DEFAULT 20,
    is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
    is_claimed      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_quests_user_date ON gamification_schema.daily_quests(user_id, quest_date);
