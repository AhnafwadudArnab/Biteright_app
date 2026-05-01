-- =============================================================================
-- BiteRight — Performance Indexes
-- Run this in Supabase SQL Editor after the main migration
-- These indexes speed up the most common queries in the app
-- =============================================================================

-- meals: most queries filter by user_id + eaten_at (today's meals)
CREATE INDEX IF NOT EXISTS idx_meals_user_eaten
  ON meals (user_id, eaten_at DESC);

-- meal_items: always joined to meals via meal_id
CREATE INDEX IF NOT EXISTS idx_meal_items_meal_id
  ON meal_items (meal_id);

-- water_intake: filter by user_id + logged_at (today's water)
CREATE INDEX IF NOT EXISTS idx_water_intake_user_logged
  ON water_intake (user_id, logged_at DESC);

-- daily_nutrition_summary: filter by user_id + date
CREATE INDEX IF NOT EXISTS idx_nutrition_summary_user_date
  ON daily_nutrition_summary (user_id, date DESC);

-- weight_history: filter by user_id, order by recorded_at
CREATE INDEX IF NOT EXISTS idx_weight_history_user_recorded
  ON weight_history (user_id, recorded_at DESC);

-- health_reports: filter by user_id, order by created_at
CREATE INDEX IF NOT EXISTS idx_health_reports_user_created
  ON health_reports (user_id, created_at DESC);

-- meal_plans: filter by user_id, order by created_at
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_created
  ON meal_plans (user_id, created_at DESC);

-- meal_plan_days: join to meal_plans via plan_id
CREATE INDEX IF NOT EXISTS idx_meal_plan_days_plan_id
  ON meal_plan_days (plan_id, day_index);

-- user_streaks: PK is user_id (already indexed), no extra needed

-- profileUser: PK is user_id (already indexed), no extra needed

-- bmi_records: filter by user_id
CREATE INDEX IF NOT EXISTS idx_bmi_records_user
  ON bmi_records (user_id, recorded_at DESC);

-- =============================================================================
-- DONE — These indexes will significantly speed up:
--   - Daily meal log queries (meals + meal_items)
--   - Water intake today queries
--   - Nutrition summary lookups
--   - Weight history chart
--   - Health reports list
--   - Meal plan retrieval
-- =============================================================================
