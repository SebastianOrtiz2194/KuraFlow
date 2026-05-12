-- =============================================
-- GAMIFICATION SERVICE: Initial Badges
-- =============================================

INSERT INTO gamification_schema.badges (code, name, description, icon_url, xp_reward, category, criteria)
VALUES
-- STREAK
('STREAK_3', 'First Steps', 'Maintain a 3-day streak', '/assets/badges/streak-3.svg', 50, 'STREAK', '{"type": "streak", "threshold": 3}'),
('STREAK_7', 'Week One', 'Maintain a 7-day streak', '/assets/badges/streak-7.svg', 100, 'STREAK', '{"type": "streak", "threshold": 7}'),
('STREAK_14', 'Fortnight', 'Maintain a 14-day streak', '/assets/badges/streak-14.svg', 200, 'STREAK', '{"type": "streak", "threshold": 14}'),
('STREAK_30', 'Monthly Habit', 'Maintain a 30-day streak', '/assets/badges/streak-30.svg', 500, 'STREAK', '{"type": "streak", "threshold": 30}'),
('STREAK_50', 'Half Century', 'Maintain a 50-day streak', '/assets/badges/streak-50.svg', 1000, 'STREAK', '{"type": "streak", "threshold": 50}'),
('STREAK_100', 'Centurion', 'Maintain a 100-day streak', '/assets/badges/streak-100.svg', 2000, 'STREAK', '{"type": "streak", "threshold": 100}'),
('STREAK_365', 'Year of Learning', 'Maintain a 365-day streak', '/assets/badges/streak-365.svg', 10000, 'STREAK', '{"type": "streak", "threshold": 365}'),

-- COMPLETION
('FIRST_LESSON', 'Getting Started', 'Complete your first lesson', '/assets/badges/first-lesson.svg', 20, 'COMPLETION', '{"type": "completion", "threshold": 1}'),
('LESSONS_10', 'Ten Lessons Deep', 'Complete 10 lessons', '/assets/badges/lessons-10.svg', 100, 'COMPLETION', '{"type": "completion", "threshold": 10}'),
('LESSONS_50', 'Learning Machine', 'Complete 50 lessons', '/assets/badges/lessons-50.svg', 500, 'COMPLETION', '{"type": "completion", "threshold": 50}'),
('LESSONS_100', 'Master Student', 'Complete 100 lessons', '/assets/badges/lessons-100.svg', 1500, 'COMPLETION', '{"type": "completion", "threshold": 100}'),
('MODULE_COMPLETE', 'Specialist', 'Complete your first full module', '/assets/badges/module-complete.svg', 250, 'COMPLETION', '{"type": "completion", "subtype": "module", "threshold": 1}'),
('LEVEL_UP', 'Level Up', 'Reach a new proficiency level', '/assets/badges/level-up.svg', 500, 'COMPLETION', '{"type": "completion", "subtype": "level", "threshold": 1}'),

-- MASTERY
('PERFECT_SCORE', 'Perfect 10', 'Score 100% on a lesson', '/assets/badges/perfect-score.svg', 50, 'MASTERY', '{"type": "mastery", "subtype": "perfect_score", "threshold": 1}'),
('PERFECT_5', 'Flawless Five', 'Score 100% on 5 different lessons', '/assets/badges/perfect-5.svg', 300, 'MASTERY', '{"type": "mastery", "subtype": "perfect_score", "threshold": 5}'),
('QUICK_LEARNER', 'Flash', 'Complete a lesson in under 5 minutes with >90% score', '/assets/badges/quick-learner.svg', 150, 'MASTERY', '{"type": "mastery", "subtype": "speed", "threshold": 5}'),
('SRS_MASTER', 'Memory Master', 'Reach Graduated status on 50 flashcards', '/assets/badges/srs-master.svg', 1000, 'MASTERY', '{"type": "mastery", "subtype": "srs", "threshold": 50}'),

-- XP
('XP_1000', 'Kura Apprentice', 'Earn 1,000 total XP', '/assets/badges/xp-1000.svg', 100, 'XP', '{"type": "xp", "threshold": 1000}'),
('XP_5000', 'Kura Scholar', 'Earn 5,000 total XP', '/assets/badges/xp-5000.svg', 500, 'XP', '{"type": "xp", "threshold": 5000}'),
('XP_10000', 'Kura Sage', 'Earn 10,000 total XP', '/assets/badges/xp-10000.svg', 2000, 'XP', '{"type": "xp", "threshold": 10000}'),

-- SOCIAL
('SOCIAL_FIRST', 'Icebreaker', 'Post your first comment in a lesson forum', '/assets/badges/social-first.svg', 50, 'SOCIAL', '{"type": "social", "subtype": "comment", "threshold": 1}'),
('SOCIAL_HELPER', 'Community Helper', 'Receive 10 likes on your lesson comments', '/assets/badges/social-helper.svg', 200, 'SOCIAL', '{"type": "social", "subtype": "likes", "threshold": 10}');
