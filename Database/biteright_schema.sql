-- MySQL schema for Biteright_app
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    age INT,
    gender VARCHAR(10),
    height_cm FLOAT,
    weight_kg FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meal Plans table
CREATE TABLE meal_plans (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meals table
CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    meal_plan_id INT REFERENCES meal_plans(id) ON DELETE CASCADE,
    meal_type VARCHAR(20) NOT NULL, -- e.g., breakfast, lunch, dinner, snack
    meal_time TIME,
    calories INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Water Intake table
CREATE TABLE water_intake (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    intake_date DATE NOT NULL,
    amount_ml INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Progress table
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    progress_date DATE NOT NULL,
    weight_kg FLOAT,
    calories_consumed INT,
    calories_burned INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Motivation/Notifications table (optional)
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE DATABASE IF NOT EXISTS biteright_app;

USE biteright_app;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    gender ENUM('male', 'female') NOT NULL,
    age INT,
    height_cm DECIMAL(5, 2),
    weight_kg DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    password VARCHAR(255) NOT NULL
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