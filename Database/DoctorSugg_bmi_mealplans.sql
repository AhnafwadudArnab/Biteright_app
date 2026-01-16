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
