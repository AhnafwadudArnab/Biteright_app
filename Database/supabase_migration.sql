-- =============================================================================
-- Supabase Migration Script — BiteRight App
-- PostgreSQL DDL for all tables
--
-- Run this in the Supabase SQL editor against a fresh project.
-- Seed data is in a separate section (task 3.2).
-- RLS policies are in a separate section (task 3.3).
-- =============================================================================

-- Enable the pgcrypto extension for gen_random_uuid() if not already enabled
-- (Supabase enables this by default, but included for safety)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- USERS
-- =============================================================================
CREATE TABLE users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) UNIQUE NOT NULL,
  password       TEXT NOT NULL,           -- bcrypt hash, never plain-text
  name           VARCHAR(100),
  age            INT,
  gender         VARCHAR(20),
  height_cm      INT,
  weight_kg      DECIMAL(5, 2),
  activity_level VARCHAR(50),
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- PROFILE USER
-- =============================================================================
CREATE TABLE "profileUser" (
  user_id           uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  gender            TEXT CHECK (gender IN ('male', 'female', 'other')),
  age               INT,
  avatar            VARCHAR(255),
  height_cm         DECIMAL(5, 2) DEFAULT 0,
  start_weight_kg   DECIMAL(5, 2) DEFAULT 0,
  current_weight_kg DECIMAL(5, 2) DEFAULT 0,
  target_weight_kg  DECIMAL(5, 2) DEFAULT 0,
  goal              TEXT CHECK (goal IN ('Weight Loss', 'Weight Gain', 'Maintain Weight'))
                    DEFAULT 'Maintain Weight',
  diet              TEXT,     -- JSON string
  activity          TEXT      -- JSON string
);

-- =============================================================================
-- FOODS  (public read, no user_id)
-- =============================================================================
CREATE TABLE foods (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(255) NOT NULL,
  calories     INT NOT NULL,
  protein_g    DECIMAL(5, 2),
  carbs_g      DECIMAL(5, 2),
  fats_g       DECIMAL(5, 2),
  serving_size VARCHAR(100)
);

-- =============================================================================
-- MEALS
-- =============================================================================
CREATE TABLE meals (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES users(id) ON DELETE CASCADE,
  meal_type  VARCHAR(50),
  eaten_at   TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- MEAL ITEMS
-- =============================================================================
CREATE TABLE meal_items (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id  uuid REFERENCES meals(id) ON DELETE CASCADE,
  food_id  uuid REFERENCES foods(id),
  quantity DECIMAL(5, 2),
  calories INT
);

-- =============================================================================
-- DAILY NUTRITION SUMMARY
-- =============================================================================
CREATE TABLE daily_nutrition_summary (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES users(id) ON DELETE CASCADE,
  date           DATE NOT NULL,
  total_calories INT,
  protein_g      DECIMAL(6, 2),
  carbs_g        DECIMAL(6, 2),
  fats_g         DECIMAL(6, 2),
  UNIQUE (user_id, date)
);

-- =============================================================================
-- WATER INTAKE
-- =============================================================================
CREATE TABLE water_intake (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid REFERENCES users(id) ON DELETE CASCADE,
  amount_ml INT NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- DIET PLANS  (public read)
-- =============================================================================
CREATE TABLE diet_plans (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(100),
  description    TEXT,
  calorie_target INT,
  duration_days  INT
);

-- =============================================================================
-- USER DIET PLANS
-- =============================================================================
CREATE TABLE user_diet_plans (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES users(id) ON DELETE CASCADE,
  diet_plan_id uuid REFERENCES diet_plans(id),
  start_date   DATE,
  end_date     DATE
);

-- =============================================================================
-- MOTIVATION LOGS
-- =============================================================================
CREATE TABLE motivation_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES users(id) ON DELETE CASCADE,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- BMI RECORDS
-- =============================================================================
CREATE TABLE bmi_records (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bmi_value   DECIMAL(4, 2) NOT NULL,
  category    TEXT NOT NULL CHECK (category IN (
                'severely_underweight',
                'underweight',
                'normal',
                'overweight',
                'obese'
              )),
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- DOCTOR BMI MEALPLANS  (public read, seeded reference data)
-- AUTO_INCREMENT INT → SERIAL PRIMARY KEY
-- =============================================================================
CREATE TABLE doctor_bmi_mealplans (
  id             SERIAL PRIMARY KEY,
  gender         VARCHAR(10) NOT NULL,
  bmi_range      VARCHAR(20) NOT NULL,
  category       VARCHAR(50),
  daily_calories INT,
  doctor_focus   TEXT,         -- JSON array string
  meal_type      VARCHAR(20),
  meal_name      VARCHAR(255),
  meal_kcal      INT
);

-- ============================================================
-- SEED DATA: doctor_bmi_mealplans
-- ============================================================
INSERT INTO doctor_bmi_mealplans
  (gender, bmi_range, category, daily_calories, doctor_focus, meal_type, meal_name, meal_kcal)
VALUES
  ('male',   '10-10.9',    'Severely Underweight', 3200, '["Rapid weight gain","Muscle recovery"]',       'Breakfast', 'Oats with milk, banana & peanut butter', 700),
  ('male',   '10-10.9',    'Severely Underweight', 3200, '["Rapid weight gain","Muscle recovery"]',       'Lunch',     'Rice, chicken curry & lentils',          900),
  ('male',   '10-10.9',    'Severely Underweight', 3200, '["Rapid weight gain","Muscle recovery"]',       'Snack',     'Protein shake & nuts',                   500),
  ('male',   '10-10.9',    'Severely Underweight', 3200, '["Rapid weight gain","Muscle recovery"]',       'Dinner',    'Fish, potatoes & vegetables',            800),
  ('male',   '10-10.9',    'Severely Underweight', 3200, '["Rapid weight gain","Muscle recovery"]',       'Snack',     'Yogurt & honey',                         300),
  ('male',   '11-11.9',    'Severely Underweight', 3100, '["Weight gain","High protein"]',                'Breakfast', 'Egg omelette & toast',                   650),
  ('male',   '11-11.9',    'Severely Underweight', 3100, '["Weight gain","High protein"]',                'Lunch',     'Chicken rice bowl',                      850),
  ('male',   '11-11.9',    'Severely Underweight', 3100, '["Weight gain","High protein"]',                'Snack',     'Milk & dates',                           450),
  ('male',   '11-11.9',    'Severely Underweight', 3100, '["Weight gain","High protein"]',                'Dinner',    'Salmon & quinoa',                        750),
  ('male',   '11-11.9',    'Severely Underweight', 3100, '["Weight gain","High protein"]',                'Snack',     'Banana smoothie',                        400),
  ('male',   '18-18.9',    'Underweight',          2800, '["Healthy weight gain"]',                       'Breakfast', 'Oatmeal with fruits',                    550),
  ('male',   '18-18.9',    'Underweight',          2800, '["Healthy weight gain"]',                       'Lunch',     'Grilled chicken & rice',                 750),
  ('male',   '18-18.9',    'Underweight',          2800, '["Healthy weight gain"]',                       'Snack',     'Nuts & yogurt',                          400),
  ('male',   '18-18.9',    'Underweight',          2800, '["Healthy weight gain"]',                       'Dinner',    'Fish & vegetables',                      700),
  ('male',   '18-18.9',    'Underweight',          2800, '["Healthy weight gain"]',                       'Snack',     'Milk',                                   400),
  ('male',   '22-22.9',    'Normal',               2400, '["Maintenance"]',                               'Breakfast', 'Egg toast & fruit',                      450),
  ('male',   '22-22.9',    'Normal',               2400, '["Maintenance"]',                               'Lunch',     'Chicken salad',                          600),
  ('male',   '22-22.9',    'Normal',               2400, '["Maintenance"]',                               'Snack',     'Apple & almonds',                        300),
  ('male',   '22-22.9',    'Normal',               2400, '["Maintenance"]',                               'Dinner',    'Fish, rice & veggies',                   650),
  ('male',   '22-22.9',    'Normal',               2400, '["Maintenance"]',                               'Snack',     'Milk',                                   400),
  ('male',   '27-27.9',    'Overweight',           2000, '["Fat loss","Portion control"]',                'Breakfast', 'Omelette & vegetables',                  350),
  ('male',   '27-27.9',    'Overweight',           2000, '["Fat loss","Portion control"]',                'Lunch',     'Grilled chicken & quinoa',               500),
  ('male',   '27-27.9',    'Overweight',           2000, '["Fat loss","Portion control"]',                'Snack',     'Fruit bowl',                             250),
  ('male',   '27-27.9',    'Overweight',           2000, '["Fat loss","Portion control"]',                'Dinner',    'Steamed fish & salad',                   500),
  ('male',   '27-27.9',    'Overweight',           2000, '["Fat loss","Portion control"]',                'Snack',     'Green tea',                              150),
  ('male',   '35-35.9',    'Obese Class II',       1700, '["Medical weight loss"]',                       'Breakfast', 'Oats & berries',                         300),
  ('male',   '35-35.9',    'Obese Class II',       1700, '["Medical weight loss"]',                       'Lunch',     'Vegetable soup & chicken',               450),
  ('male',   '35-35.9',    'Obese Class II',       1700, '["Medical weight loss"]',                       'Snack',     'Cucumber yogurt',                        200),
  ('male',   '35-35.9',    'Obese Class II',       1700, '["Medical weight loss"]',                       'Dinner',    'Grilled fish & greens',                  450),
  ('male',   '35-35.9',    'Obese Class II',       1700, '["Medical weight loss"]',                       'Snack',     'Herbal tea',                             100),
  ('male',   '23.0-29.9',  'Slightly Overweight',  2200, '["Weight management","Balanced nutrition"]',    'Breakfast', 'Whole grain toast & eggs',               400),
  ('male',   '23.0-29.9',  'Slightly Overweight',  2200, '["Weight management","Balanced nutrition"]',    'Lunch',     'Grilled chicken & brown rice',           600),
  ('male',   '23.0-29.9',  'Slightly Overweight',  2200, '["Weight management","Balanced nutrition"]',    'Snack',     'Greek yogurt & berries',                 250),
  ('male',   '23.0-29.9',  'Slightly Overweight',  2200, '["Weight management","Balanced nutrition"]',    'Dinner',    'Baked fish & vegetables',                650),
  ('male',   '23.0-29.9',  'Slightly Overweight',  2200, '["Weight management","Balanced nutrition"]',    'Snack',     'Apple',                                  300),
  ('female', '10-10.9',    'Severely Underweight', 2800, '["Hormonal balance","Healthy weight gain"]',    'Breakfast', 'Smoothie bowl & granola',                600),
  ('female', '10-10.9',    'Severely Underweight', 2800, '["Hormonal balance","Healthy weight gain"]',    'Lunch',     'Rice, lentils & egg',                    750),
  ('female', '10-10.9',    'Severely Underweight', 2800, '["Hormonal balance","Healthy weight gain"]',    'Snack',     'Nuts & dates',                           450),
  ('female', '10-10.9',    'Severely Underweight', 2800, '["Hormonal balance","Healthy weight gain"]',    'Dinner',    'Chicken pasta',                          700),
  ('female', '10-10.9',    'Severely Underweight', 2800, '["Hormonal balance","Healthy weight gain"]',    'Snack',     'Milk',                                   300),
  ('female', '22-22.9',    'Normal',               2000, '["Maintenance"]',                               'Breakfast', 'Avocado toast & egg',                    400),
  ('female', '22-22.9',    'Normal',               2000, '["Maintenance"]',                               'Lunch',     'Fish salad',                             500),
  ('female', '22-22.9',    'Normal',               2000, '["Maintenance"]',                               'Snack',     'Fruit bowl',                             250),
  ('female', '22-22.9',    'Normal',               2000, '["Maintenance"]',                               'Dinner',    'Rice, veggies & chicken',                550),
  ('female', '22-22.9',    'Normal',               2000, '["Maintenance"]',                               'Snack',     'Yogurt',                                 300),
  ('female', '30-30.9',    'Obese Class I',        1500, '["Fat loss","Blood sugar control"]',            'Breakfast', 'Boiled eggs & fruit',                    250),
  ('female', '30-30.9',    'Obese Class I',        1500, '["Fat loss","Blood sugar control"]',            'Lunch',     'Vegetable stir fry',                     400),
  ('female', '30-30.9',    'Obese Class I',        1500, '["Fat loss","Blood sugar control"]',            'Snack',     'Apple',                                  200),
  ('female', '30-30.9',    'Obese Class I',        1500, '["Fat loss","Blood sugar control"]',            'Dinner',    'Steamed fish & salad',                   450),
  ('female', '30-30.9',    'Obese Class I',        1500, '["Fat loss","Blood sugar control"]',            'Snack',     'Green tea',                              100),
  ('female', '23.0-29.9',  'Slightly Overweight',  1800, '["Weight management","Balanced nutrition"]',    'Breakfast', 'Oatmeal & banana',                       350),
  ('female', '23.0-29.9',  'Slightly Overweight',  1800, '["Weight management","Balanced nutrition"]',    'Lunch',     'Grilled chicken salad',                  500),
  ('female', '23.0-29.9',  'Slightly Overweight',  1800, '["Weight management","Balanced nutrition"]',    'Snack',     'Yogurt & nuts',                          250),
  ('female', '23.0-29.9',  'Slightly Overweight',  1800, '["Weight management","Balanced nutrition"]',    'Dinner',    'Baked salmon & veggies',                 500),
  ('female', '23.0-29.9',  'Slightly Overweight',  1800, '["Weight management","Balanced nutrition"]',    'Snack',     'Orange',                                 200);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Enables per-user data isolation on all user-owned tables.
-- Public reference tables (foods, diet_plans, doctor_bmi_mealplans) are left
-- without RLS so they remain readable by all roles.
-- =============================================================================

-- Enable RLS on user-owned tables
ALTER TABLE meals                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake           ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_nutrition_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivation_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmi_records            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profileUser"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_diet_plans        ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- meals
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- meal_items  (no direct user_id — join through meals)
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own meal_items"
  ON meal_items FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM meals WHERE id = meal_items.meal_id));

CREATE POLICY "Users can insert own meal_items"
  ON meal_items FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM meals WHERE id = meal_items.meal_id));

CREATE POLICY "Users can update own meal_items"
  ON meal_items FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM meals WHERE id = meal_items.meal_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM meals WHERE id = meal_items.meal_id));

-- ---------------------------------------------------------------------------
-- water_intake
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own water_intake"
  ON water_intake FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water_intake"
  ON water_intake FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own water_intake"
  ON water_intake FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- daily_nutrition_summary
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own daily_nutrition_summary"
  ON daily_nutrition_summary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily_nutrition_summary"
  ON daily_nutrition_summary FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily_nutrition_summary"
  ON daily_nutrition_summary FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- motivation_logs
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own motivation_logs"
  ON motivation_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own motivation_logs"
  ON motivation_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own motivation_logs"
  ON motivation_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- bmi_records
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own bmi_records"
  ON bmi_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bmi_records"
  ON bmi_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bmi_records"
  ON bmi_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- profileUser  (PK is user_id, so the column name is user_id)
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own profileUser"
  ON "profileUser" FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profileUser"
  ON "profileUser" FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profileUser"
  ON "profileUser" FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- user_diet_plans
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own user_diet_plans"
  ON user_diet_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_diet_plans"
  ON user_diet_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_diet_plans"
  ON user_diet_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- NOTE: foods, diet_plans, and doctor_bmi_mealplans intentionally have NO RLS.
-- They are public reference tables readable by all roles (including anon).
-- =============================================================================

-- =============================================================================
-- NEW TABLES (added for full DB connectivity)
-- =============================================================================

-- User streaks & gamification
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id                  uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak           INT DEFAULT 0,
  total_points             INT DEFAULT 0,
  last_logged_date         DATE,
  meals_logged_week        INT DEFAULT 0,
  water_goal_days_week     INT DEFAULT 0,
  calorie_goal_days_week   INT DEFAULT 0,
  updated_at               TIMESTAMPTZ DEFAULT now()
);

-- Weight history (separate from profileUser for trend tracking)
CREATE TABLE IF NOT EXISTS weight_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight_kg   DECIMAL(5,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Health insight reports
CREATE TABLE IF NOT EXISTS health_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_range   VARCHAR(50) NOT NULL,
  avg_calories INT NOT NULL,
  status       VARCHAR(30) DEFAULT 'On Track',
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- RLS for new tables
ALTER TABLE user_streaks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_reports  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own streaks"
  ON user_streaks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own weight_history"
  ON weight_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own health_reports"
  ON health_reports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
