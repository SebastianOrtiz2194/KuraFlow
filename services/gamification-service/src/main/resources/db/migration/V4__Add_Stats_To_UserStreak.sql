-- =============================================
-- GAMIFICATION SERVICE: Add Stats for Badges
-- =============================================

ALTER TABLE gamification_schema.user_streaks 
ADD COLUMN total_lessons_completed INT DEFAULT 0,
ADD COLUMN total_perfect_scores INT DEFAULT 0;
