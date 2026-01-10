-- MySQL schema for Biteright_app

CREATE DATABASE IF NOT EXISTS biteright_app;
USE biteright_app;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE,
  gender ENUM('male', 'female') NOT NULL,
  age INT,
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE bmi_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bmi_value DECIMAL(4,2) NOT NULL,
  category ENUM(
    'severely_underweight',
    'underweight',
    'normal',
    'overweight',
    'obese'
  ) NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE diet_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bmi_min DECIMAL(4,1),
  bmi_max DECIMAL(4,1),
  gender ENUM('male','female'),
  goal ENUM('weight_gain','maintenance','weight_loss'),
  daily_calories INT,
  description TEXT
);
CREATE TABLE meals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  meal_type ENUM('breakfast','lunch','snack','dinner'),
  calories INT,
  protein DECIMAL(5,2),
  carbs DECIMAL(5,2),
  fat DECIMAL(5,2)
);
CREATE TABLE diet_plan_meals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  diet_plan_id INT,
  meal_id INT,
  FOREIGN KEY (diet_plan_id) REFERENCES diet_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
);
CREATE TABLE meal_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  meal_id INT,
  eaten_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
);
CREATE TABLE progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  weight_kg DECIMAL(5,2),
  note VARCHAR(255),
  recorded_at DATE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
