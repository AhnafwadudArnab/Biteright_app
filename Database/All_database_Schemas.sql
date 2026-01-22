-- MySQL schema for Biteright_app
CREATE DATABASE IF NOT EXISTS biteright_app;

USE biteright_app;

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name VARCHAR(100),
    age INT,
    gender VARCHAR(20),
    height_cm INT,
    weight_kg DECIMAL(5, 2),
    activity_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_goals (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    daily_calorie_goal INT,
    daily_water_ml INT,
    target_weight_kg DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE foods (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    calories INT NOT NULL,
    protein_g DECIMAL(5, 2),
    carbs_g DECIMAL(5, 2),
    fats_g DECIMAL(5, 2),
    serving_size VARCHAR(100)
);

CREATE TABLE meals (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    meal_type VARCHAR(50),
    eaten_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE meal_items (
    id CHAR(36) PRIMARY KEY,
    meal_id CHAR(36),
    food_id CHAR(36),
    quantity DECIMAL(5, 2),
    calories INT,
    FOREIGN KEY (meal_id) REFERENCES meals (id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods (id)
);

CREATE TABLE daily_nutrition_summary (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    date DATE NOT NULL,
    total_calories INT,
    protein_g DECIMAL(6, 2),
    carbs_g DECIMAL(6, 2),
    fats_g DECIMAL(6, 2),
    UNIQUE KEY uniq_user_date (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE water_intake (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    amount_ml INT NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE diet_plans (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    calorie_target INT,
    duration_days INT
);

CREATE TABLE user_diet_plans (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    diet_plan_id CHAR(36),
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (diet_plan_id) REFERENCES diet_plans (id)
);

CREATE TABLE motivation_logs (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE bmi_records (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    bmi_value DECIMAL(4, 2) NOT NULL,
    category ENUM(
        'severely_underweight',
        'underweight',
        'normal',
        'overweight',
        'obese'
    ) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor_bmi_mealplans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gender VARCHAR(10) NOT NULL,
    bmi_range VARCHAR(20) NOT NULL,
    category VARCHAR(50),
    daily_calories INT,
    doctor_focus TEXT,
    meal_type VARCHAR(20),
    meal_name VARCHAR(255),
    meal_kcal INT
);


--Plans:

-- DoctorSugg_bmi_mealplans.sql (cleaned)

-- MALE BMI PLANS
INSERT INTO diet_plans (id, name, description, calorie_target, duration_days) VALUES
('male-10-10.9', 'Male 10-10.9 Severely Underweight', 'Rapid weight gain, Muscle recovery', 3200, NULL),
('male-11-11.9', 'Male 11-11.9 Severely Underweight', 'Weight gain, High protein', 3100, NULL),
('male-18-18.9', 'Male 18-18.9 Underweight', 'Healthy weight gain', 2800, NULL),
('male-22-22.9', 'Male 22-22.9 Normal', 'Maintenance', 2400, NULL),
('male-27-27.9', 'Male 27-27.9 Overweight', 'Fat loss, Portion control', 2000, NULL),
('male-35-35.9', 'Male 35-35.9 Obese Class II', 'Medical weight loss', 1700, NULL);

-- FEMALE BMI PLANS
INSERT INTO diet_plans (id, name, description, calorie_target, duration_days) VALUES
('female-10-10.9', 'Female 10-10.9 Severely Underweight', 'Hormonal balance, Healthy weight gain', 2800, NULL),
('female-22-22.9', 'Female 22-22.9 Normal', 'Maintenance', 2000, NULL),
('female-30-30.9', 'Female 30-30.9 Obese Class I', 'Fat loss, Blood sugar control', 1500, NULL);

-- FOODS & MEALS (sample for male-10-10.9)
INSERT INTO foods (id, name, calories) VALUES
('food-male-10-10.9-1', 'Oats with milk, banana & peanut butter', 700),
('food-male-10-10.9-2', 'Rice, chicken curry & lentils', 900),
('food-male-10-10.9-3', 'Protein shake & nuts', 500),
('food-male-10-10.9-4', 'Fish, potatoes & vegetables', 800),
('food-male-10-10.9-5', 'Yogurt & honey', 300);

INSERT INTO meals (id, user_id, meal_type, eaten_at, created_at) VALUES
('meal-male-10-10.9-breakfast', NULL, 'Breakfast', NULL, NOW()),
('meal-male-10-10.9-lunch', NULL, 'Lunch', NULL, NOW()),
('meal-male-10-10.9-snack1', NULL, 'Snack', NULL, NOW()),
('meal-male-10-10.9-dinner', NULL, 'Dinner', NULL, NOW()),
('meal-male-10-10.9-snack2', NULL, 'Snack', NULL, NOW());

INSERT INTO meal_items (id, meal_id, food_id, quantity, calories) VALUES
('mi-male-10-10.9-1', 'meal-male-10-10.9-breakfast', 'food-male-10-10.9-1', 1, 700),
('mi-male-10-10.9-2', 'meal-male-10-10.9-lunch', 'food-male-10-10.9-2', 1, 900),
('mi-male-10-10.9-3', 'meal-male-10-10.9-snack1', 'food-male-10-10.9-3', 1, 500),
('mi-male-10-10.9-4', 'meal-male-10-10.9-dinner', 'food-male-10-10.9-4', 1, 800),
('mi-male-10-10.9-5', 'meal-male-10-10.9-snack2', 'food-male-10-10.9-5', 1, 300);
