-- V2__Seed_Initial_Data.sql

-- Languages
INSERT INTO languages (id, code, name, framework) VALUES 
(gen_random_uuid(), 'en', 'English', 'CEFR'),
(gen_random_uuid(), 'ja', 'Japanese', 'JLPT');

-- Levels for English (A1-C2)
DO $$
DECLARE
    eng_id UUID;
BEGIN
    SELECT id INTO eng_id FROM languages WHERE code = 'en';

    INSERT INTO levels (language_id, code, name, sort_order, total_xp_required) VALUES
    (eng_id, 'A1', 'Beginner', 1, 0),
    (eng_id, 'A2', 'Elementary', 2, 1000),
    (eng_id, 'B1', 'Intermediate', 3, 3000),
    (eng_id, 'B2', 'Upper Intermediate', 4, 6000),
    (eng_id, 'C1', 'Advanced', 5, 10000),
    (eng_id, 'C2', 'Proficiency', 6, 15000);
END $$;

-- Levels for Japanese (N5-N1)
DO $$
DECLARE
    jp_id UUID;
BEGIN
    SELECT id INTO jp_id FROM languages WHERE code = 'ja';

    INSERT INTO levels (language_id, code, name, sort_order, total_xp_required) VALUES
    (jp_id, 'N5', 'Beginner', 1, 0),
    (jp_id, 'N4', 'Elementary', 2, 1000),
    (jp_id, 'N3', 'Intermediate', 3, 3000),
    (jp_id, 'N2', 'Upper Intermediate', 4, 6000),
    (jp_id, 'N1', 'Advanced', 5, 10000);
END $$;
