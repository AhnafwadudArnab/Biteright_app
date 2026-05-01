-- =============================================================================
-- BiteRight — New Tables Migration (idempotent version)
-- Safe to run multiple times — drops existing policies before recreating
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. USER STREAKS
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id                uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak         INT         DEFAULT 0,
  total_points           INT         DEFAULT 0,
  last_logged_date       DATE,
  meals_logged_week      INT         DEFAULT 0,
  water_goal_days_week   INT         DEFAULT 0,
  calorie_goal_days_week INT         DEFAULT 0,
  updated_at             TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own streaks" ON user_streaks;
CREATE POLICY "Users manage own streaks"
  ON user_streaks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 2. WEIGHT HISTORY
-- =============================================================================
CREATE TABLE IF NOT EXISTS weight_history (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight_kg   DECIMAL(5,2) NOT NULL,
  recorded_at TIMESTAMPTZ  DEFAULT now()
);

ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own weight_history" ON weight_history;
CREATE POLICY "Users manage own weight_history"
  ON weight_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 3. HEALTH REPORTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS health_reports (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_range   VARCHAR(50) NOT NULL,
  avg_calories INT         NOT NULL,
  status       VARCHAR(30) DEFAULT 'On Track',
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE health_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own health_reports" ON health_reports;
CREATE POLICY "Users manage own health_reports"
  ON health_reports FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 4. MEAL PLANS
-- =============================================================================
CREATE TABLE IF NOT EXISTS meal_plans (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bmi            DECIMAL(4,2),
  gender         VARCHAR(10),
  category       VARCHAR(50),
  daily_calories INT,
  doctor_focus   TEXT,
  source         VARCHAR(10) DEFAULT 'ai',
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own meal_plans" ON meal_plans;
CREATE POLICY "Users manage own meal_plans"
  ON meal_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 5. MEAL PLAN DAYS
-- =============================================================================
CREATE TABLE IF NOT EXISTS meal_plan_days (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id   uuid        NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_index INT         NOT NULL,
  meal_type VARCHAR(20),
  meal_name VARCHAR(255),
  meal_kcal INT
);

ALTER TABLE meal_plan_days ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own meal_plan_days" ON meal_plan_days;
CREATE POLICY "Users manage own meal_plan_days"
  ON meal_plan_days FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM meal_plans WHERE id = meal_plan_days.plan_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM meal_plans WHERE id = meal_plan_days.plan_id)
  );

-- =============================================================================
-- 6. WATER GOALS
-- =============================================================================
CREATE TABLE IF NOT EXISTS water_goals (
  user_id    uuid        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  glasses    INT         NOT NULL DEFAULT 8,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE water_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own water_goals" ON water_goals;
CREATE POLICY "Users manage own water_goals"
  ON water_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- PERFORMANCE INDEXES (idempotent)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_meals_user_eaten
  ON meals (user_id, eaten_at DESC);

CREATE INDEX IF NOT EXISTS idx_meal_items_meal_id
  ON meal_items (meal_id);

CREATE INDEX IF NOT EXISTS idx_water_intake_user_logged
  ON water_intake (user_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_nutrition_summary_user_date
  ON daily_nutrition_summary (user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_weight_history_user_recorded
  ON weight_history (user_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_health_reports_user_created
  ON health_reports (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_created
  ON meal_plans (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_meal_plan_days_plan_id
  ON meal_plan_days (plan_id, day_index);

-- =============================================================================
-- DONE
-- =============================================================================

-- =============================================================================
-- PASSWORD RESETS (OTP-based forgot password)
-- =============================================================================
CREATE TABLE IF NOT EXISTS password_resets (
  email      VARCHAR(255) PRIMARY KEY,
  otp        VARCHAR(6)   NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  created_at TIMESTAMPTZ  DEFAULT now()
);

-- No RLS needed — accessed only by backend service role
-- Supabase Storage bucket for avatars must be created manually:
--   Dashboard → Storage → New bucket → name: "avatars" → Public: true
