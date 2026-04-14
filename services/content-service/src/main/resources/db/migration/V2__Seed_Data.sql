-- =============================================
-- SEED DATA: Languages & Levels
-- =============================================

INSERT INTO languages (code, name, framework) VALUES 
('en', 'English', 'CEFR'),
('ja', 'Japanese', 'JLPT')
ON CONFLICT (code) DO NOTHING;

-- English Levels (CEFR)
INSERT INTO levels (language_id, code, name, sort_order, total_xp_required)
SELECT id, 'A1', 'Beginner', 1, 0 FROM languages WHERE code = 'en'
UNION ALL
SELECT id, 'A2', 'Elementary', 2, 500 FROM languages WHERE code = 'en'
UNION ALL
SELECT id, 'B1', 'Intermediate', 3, 1500 FROM languages WHERE code = 'en'
UNION ALL
SELECT id, 'B2', 'Upper Intermediate', 4, 3000 FROM languages WHERE code = 'en'
UNION ALL
SELECT id, 'C1', 'Advanced', 5, 6000 FROM languages WHERE code = 'en'
UNION ALL
SELECT id, 'C2', 'Mastery', 6, 12000 FROM languages WHERE code = 'en'
ON CONFLICT (language_id, code) DO NOTHING;

-- Japanese Levels (JLPT)
INSERT INTO levels (language_id, code, name, sort_order, total_xp_required)
SELECT id, 'N5', 'Novice', 1, 0 FROM languages WHERE code = 'ja'
UNION ALL
SELECT id, 'N4', 'Basic', 2, 800 FROM languages WHERE code = 'ja'
UNION ALL
SELECT id, 'N3', 'Intermediate', 3, 2000 FROM languages WHERE code = 'ja'
UNION ALL
SELECT id, 'N2', 'Pre-Advanced', 4, 4500 FROM languages WHERE code = 'ja'
UNION ALL
SELECT id, 'N1', 'Advanced', 5, 9000 FROM languages WHERE code = 'ja'
ON CONFLICT (language_id, code) DO NOTHING;
