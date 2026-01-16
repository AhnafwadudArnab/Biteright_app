-- MySQL schema for Biteright_app

CREATE DATABASE IF NOT EXISTS biteright_app;

USE biteright_app;

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(100),
    age INT,
    gender VARCHAR(20),
    height_cm INT,
    weight_kg DECIMAL(5,2),
    activity_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE user_goals (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    daily_calorie_goal INT,
    daily_water_ml INT,
    target_weight_kg DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE foods (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    calories INT NOT NULL,
    protein_g DECIMAL(5,2),
    carbs_g DECIMAL(5,2),
    fats_g DECIMAL(5,2),
    serving_size VARCHAR(100)
);

CREATE TABLE meals (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    meal_type VARCHAR(50),
    eaten_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE meal_items (
    id CHAR(36) PRIMARY KEY,
    meal_id CHAR(36),
    food_id CHAR(36),
    quantity DECIMAL(5,2),
    calories INT,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id)
);

CREATE TABLE daily_nutrition_summary (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    date DATE NOT NULL,
    total_calories INT,
    protein_g DECIMAL(6,2),
    carbs_g DECIMAL(6,2),
    fats_g DECIMAL(6,2),
    UNIQUE KEY uniq_user_date (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE water_intake (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    amount_ml INT NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (diet_plan_id) REFERENCES diet_plans(id)
);

CREATE TABLE motivation_logs (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE bmi_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
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

CREATE TABLE diet_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bmi_min DECIMAL(4, 1),
    bmi_max DECIMAL(4, 1),
    gender ENUM('male', 'female'),
    goal ENUM(
        'weight_gain',
        'maintenance',
        'weight_loss'
    ),
    daily_calories INT,
    description TEXT
);

CREATE TABLE meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150),
    meal_type ENUM(
        'breakfast',
        'lunch',
        'snack',
        'dinner'
    ),
    calories INT,
    protein DECIMAL(5, 2),
    carbs DECIMAL(5, 2),
    fat DECIMAL(5, 2)
);

CREATE TABLE diet_plan_meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diet_plan_id INT,
    meal_id INT,
    FOREIGN KEY (diet_plan_id) REFERENCES diet_plans (id) ON DELETE CASCADE,
    FOREIGN KEY (meal_id) REFERENCES meals (id) ON DELETE CASCADE
);

CREATE TABLE meal_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    meal_id INT,
    eaten_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (meal_id) REFERENCES meals (id) ON DELETE CASCADE
);

CREATE TABLE progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    weight_kg DECIMAL(5, 2),
    note VARCHAR(255),
    recorded_at DATE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    meal_type ENUM(
        'breakfast',
        'lunch',
        'snack',
        'dinner'
    ),
    remind_at TIME,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    daily_summary_time TIME,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_user_id ON bmi_records (user_id);

CREATE INDEX idx_diet_plan ON diet_plans (
    bmi_min,
    bmi_max,
    gender,
    goal
);

CREATE INDEX idx_meal_type ON meals (meal_type);

CREATE INDEX idx_meal_logs_user ON meal_logs (user_id);

CREATE INDEX idx_progress_user ON progress (user_id);

CREATE INDEX idx_reminders_user ON reminders (user_id);

CREATE INDEX idx_settings_user ON settings (user_id);