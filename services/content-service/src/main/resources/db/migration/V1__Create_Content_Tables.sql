-- V1__Create_Content_Tables.sql

-- Languages
CREATE TABLE languages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(5) NOT NULL UNIQUE,                -- 'en', 'ja'
    name        VARCHAR(50) NOT NULL,                      -- 'English', 'Japanese'
    framework   VARCHAR(10) NOT NULL,                      -- 'CEFR', 'JLPT'
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Levels
CREATE TABLE levels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language_id     UUID NOT NULL REFERENCES languages(id),
    code            VARCHAR(5) NOT NULL,                   -- 'A1', 'N5', etc.
    name            VARCHAR(100) NOT NULL,                 -- 'Beginner', 'Elementary'
    description     TEXT,
    sort_order      INT NOT NULL,                          -- 1=easiest, ascending
    total_xp_required INT DEFAULT 0,                      -- XP threshold to "unlock"
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(language_id, code)
);

-- Modules
CREATE TABLE modules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id    UUID NOT NULL REFERENCES levels(id),
    type        VARCHAR(30) NOT NULL,                      -- 'GRAMMAR', 'VOCABULARY', etc.
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    sort_order  INT NOT NULL,
    icon_url    VARCHAR(500),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons
CREATE TABLE lessons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id       UUID NOT NULL REFERENCES modules(id),
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    sort_order      INT NOT NULL,
    estimated_minutes INT DEFAULT 10,
    xp_reward       INT DEFAULT 10,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Lesson Content (polymorphic)
CREATE TABLE lesson_content (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id   UUID NOT NULL REFERENCES lessons(id),
    content_type VARCHAR(30) NOT NULL,                     -- 'EXPLANATION', 'QUIZ_MCQ', etc.
    sort_order  INT NOT NULL,
    title       VARCHAR(200),
    body        JSONB NOT NULL,                            -- Flexible content structure
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lesson_content_lesson ON lesson_content(lesson_id, sort_order);
