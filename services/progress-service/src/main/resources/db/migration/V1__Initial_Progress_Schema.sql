-- =============================================
-- PROGRESS SERVICE: User Progress & SRS
-- =============================================

CREATE TABLE IF NOT EXISTS user_progress (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    lesson_id       UUID NOT NULL,
    status          VARCHAR(20) DEFAULT 'NOT_STARTED',
    score           DECIMAL(5,2),
    attempts        INT DEFAULT 0,
    xp_earned       INT DEFAULT 0,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    last_accessed   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id, status);

CREATE TABLE IF NOT EXISTS srs_cards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    flashcard_id    UUID NOT NULL,
    ease_factor     DECIMAL(4,2) DEFAULT 2.50,
    interval_days   INT DEFAULT 0,
    repetitions     INT DEFAULT 0,
    next_review     TIMESTAMPTZ DEFAULT NOW(),
    last_reviewed   TIMESTAMPTZ,
    status          VARCHAR(15) DEFAULT 'NEW',
    UNIQUE(user_id, flashcard_id)
);
