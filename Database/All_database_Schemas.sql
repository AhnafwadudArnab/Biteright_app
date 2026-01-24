-- MySQL schema for Biteright_app (UPDATED DATABASE NAME)

CREATE DATABASE IF NOT EXISTS sql12815086;

USE sql12815086;

-- User information
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
    updated_at TIMESTAMP NULL
);

-- User goals (calorie, water, target weight)
CREATE TABLE user_goals (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    daily_calorie_goal INT,
    daily_water_ml INT,
    target_weight_kg DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Food items (master list)
CREATE TABLE foods (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    calories INT NOT NULL,
    protein_g DECIMAL(5, 2),
    carbs_g DECIMAL(5, 2),
    fats_g DECIMAL(5, 2),
    serving_size VARCHAR(100)
);

-- Meals (user's meal log)
CREATE TABLE meals (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    meal_type VARCHAR(50),
    eaten_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Meal items (foods in a meal)
CREATE TABLE meal_items (
    id CHAR(36) PRIMARY KEY,
    meal_id CHAR(36),
    food_id CHAR(36),
    quantity DECIMAL(5, 2),
    calories INT,
    FOREIGN KEY (meal_id) REFERENCES meals (id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods (id)
);

-- Daily nutrition summary (for dashboard)
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

-- Water intake log
CREATE TABLE water_intake (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    amount_ml INT NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Diet plans (master)
CREATE TABLE diet_plans (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    calorie_target INT,
    duration_days INT
);

-- User's selected diet plans
CREATE TABLE user_diet_plans (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    diet_plan_id CHAR(36),
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (diet_plan_id) REFERENCES diet_plans (id)
);

-- Motivation logs (user notes)
CREATE TABLE motivation_logs (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- BMI records (user's BMI history)
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

-- Doctor suggested meal plans (optional, can be deleted if not used)

CREATE TABLE `doctor_bmi_mealplans` (
    `id` int(11) NOT NULL,
    `gender` varchar(10) NOT NULL,
    `bmi_range` varchar(20) NOT NULL,
    `category` varchar(50) DEFAULT NULL,
    `daily_calories` int(11) DEFAULT NULL,
    `doctor_focus` text DEFAULT NULL,
    `meal_type` varchar(20) DEFAULT NULL,
    `meal_name` varchar(255) DEFAULT NULL,
    `meal_kcal` int(11) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Doctor suggested BMI meal plans (seed data)

-- MALE BMI PLANS
INSERT INTO
    diet_plans (
        id,
        name,
        description,
        calorie_target,
        duration_days
    )
VALUES (
        'male-10-10.9',
        'Male 10-10.9 Severely Underweight',
        'Rapid weight gain, Muscle recovery',
        3200,
        NULL
    ),
    (
        'male-11-11.9',
        'Male 11-11.9 Severely Underweight',
        'Weight gain, High protein',
        3100,
        NULL
    ),
    (
        'male-18-18.9',
        'Male 18-18.9 Underweight',
        'Healthy weight gain',
        2800,
        NULL
    ),
    (
        'male-22-22.9',
        'Male 22-22.9 Normal',
        'Maintenance',
        2400,
        NULL
    ),
    (
        'male-27-27.9',
        'Male 27-27.9 Overweight',
        'Fat loss, Portion control',
        2000,
        NULL
    ),
    (
        'male-35-35.9',
        'Male 35-35.9 Obese Class II',
        'Medical weight loss',
        1700,
        NULL
    );

-- FEMALE BMI PLANS
INSERT INTO
    diet_plans (
        id,
        name,
        description,
        calorie_target,
        duration_days
    )
VALUES (
        'female-10-10.9',
        'Female 10-10.9 Severely Underweight',
        'Hormonal balance, Healthy weight gain',
        2800,
        NULL
    ),
    (
        'female-22-22.9',
        'Female 22-22.9 Normal',
        'Maintenance',
        2000,
        NULL
    ),
    (
        'female-30-30.9',
        'Female 30-30.9 Obese Class I',
        'Fat loss, Blood sugar control',
        1500,
        NULL
    );

-- FOODS & MEALS (sample for male-10-10.9)
INSERT INTO
    foods (id, name, calories)
VALUES (
        'food-male-10-10.9-1',
        'Oats with milk, banana & peanut butter',
        700
    ),
    (
        'food-male-10-10.9-2',
        'Rice, chicken curry & lentils',
        900
    ),
    (
        'food-male-10-10.9-3',
        'Protein shake & nuts',
        500
    ),
    (
        'food-male-10-10.9-4',
        'Fish, potatoes & vegetables',
        800
    ),
    (
        'food-male-10-10.9-5',
        'Yogurt & honey',
        300
    );

INSERT INTO
    meals (
        id,
        user_id,
        meal_type,
        eaten_at,
        created_at
    )
VALUES (
        'meal-male-10-10.9-breakfast',
        NULL,
        'Breakfast',
        NULL,
        NOW()
    ),
    (
        'meal-male-10-10.9-lunch',
        NULL,
        'Lunch',
        NULL,
        NOW()
    ),
    (
        'meal-male-10-10.9-snack1',
        NULL,
        'Snack',
        NULL,
        NOW()
    ),
    (
        'meal-male-10-10.9-dinner',
        NULL,
        'Dinner',
        NULL,
        NOW()
    ),
    (
        'meal-male-10-10.9-snack2',
        NULL,
        'Snack',
        NULL,
        NOW()
    );

INSERT INTO
    meal_items (
        id,
        meal_id,
        food_id,
        quantity,
        calories
    )
VALUES (
        'mi-male-10-10.9-1',
        'meal-male-10-10.9-breakfast',
        'food-male-10-10.9-1',
        1,
        700
    ),
    (
        'mi-male-10-10.9-2',
        'meal-male-10-10.9-lunch',
        'food-male-10-10.9-2',
        1,
        900
    ),
    (
        'mi-male-10-10.9-3',
        'meal-male-10-10.9-snack1',
        'food-male-10-10.9-3',
        1,
        500
    ),
    (
        'mi-male-10-10.9-4',
        'meal-male-10-10.9-dinner',
        'food-male-10-10.9-4',
        1,
        800
    ),
    (
        'mi-male-10-10.9-5',
        'meal-male-10-10.9-snack2',
        'food-male-10-10.9-5',
        1,
        300
    );

-- If you want to DROP any table, use:
-- DROP TABLE IF EXISTS doctor_bmi_mealplans;

-- doctor BMI mealplans.sql (cleaned)

INSERT INTO
    `doctor_bmi_mealplans` (
        `id`,
        `gender`,
        `bmi_range`,
        `category`,
        `daily_calories`,
        `doctor_focus`,
        `meal_type`,
        `meal_name`,
        `meal_kcal`
    )
VALUES (
        1,
        'male',
        '10-10.9',
        'Severely Underweight',
        3200,
        '[\"Rapid weight gain\",\"Muscle recovery\"]',
        'Breakfast',
        'Oats with milk, banana & peanut butter',
        700
    ),
    (
        2,
        'male',
        '10-10.9',
        'Severely Underweight',
        3200,
        '[\"Rapid weight gain\",\"Muscle recovery\"]',
        'Lunch',
        'Rice, chicken curry & lentils',
        900
    ),
    (
        3,
        'male',
        '10-10.9',
        'Severely Underweight',
        3200,
        '[\"Rapid weight gain\",\"Muscle recovery\"]',
        'Snack',
        'Protein shake & nuts',
        500
    ),
    (
        4,
        'male',
        '10-10.9',
        'Severely Underweight',
        3200,
        '[\"Rapid weight gain\",\"Muscle recovery\"]',
        'Dinner',
        'Fish, potatoes & vegetables',
        800
    ),
    (
        5,
        'male',
        '10-10.9',
        'Severely Underweight',
        3200,
        '[\"Rapid weight gain\",\"Muscle recovery\"]',
        'Snack',
        'Yogurt & honey',
        300
    ),
    (
        6,
        'male',
        '11-11.9',
        'Severely Underweight',
        3100,
        '[\"Weight gain\",\"High protein\"]',
        'Breakfast',
        'Egg omelette & toast',
        650
    ),
    (
        7,
        'male',
        '11-11.9',
        'Severely Underweight',
        3100,
        '[\"Weight gain\",\"High protein\"]',
        'Lunch',
        'Chicken rice bowl',
        850
    ),
    (
        8,
        'male',
        '11-11.9',
        'Severely Underweight',
        3100,
        '[\"Weight gain\",\"High protein\"]',
        'Snack',
        'Milk & dates',
        450
    ),
    (
        9,
        'male',
        '11-11.9',
        'Severely Underweight',
        3100,
        '[\"Weight gain\",\"High protein\"]',
        'Dinner',
        'Salmon & quinoa',
        750
    ),
    (
        10,
        'male',
        '11-11.9',
        'Severely Underweight',
        3100,
        '[\"Weight gain\",\"High protein\"]',
        'Snack',
        'Banana smoothie',
        400
    ),
    (
        11,
        'male',
        '18-18.9',
        'Underweight',
        2800,
        '[\"Healthy weight gain\"]',
        'Breakfast',
        'Oatmeal with fruits',
        550
    ),
    (
        12,
        'male',
        '18-18.9',
        'Underweight',
        2800,
        '[\"Healthy weight gain\"]',
        'Lunch',
        'Grilled chicken & rice',
        750
    ),
    (
        13,
        'male',
        '18-18.9',
        'Underweight',
        2800,
        '[\"Healthy weight gain\"]',
        'Snack',
        'Nuts & yogurt',
        400
    ),
    (
        14,
        'male',
        '18-18.9',
        'Underweight',
        2800,
        '[\"Healthy weight gain\"]',
        'Dinner',
        'Fish & vegetables',
        700
    ),
    (
        15,
        'male',
        '18-18.9',
        'Underweight',
        2800,
        '[\"Healthy weight gain\"]',
        'Snack',
        'Milk',
        400
    ),
    (
        16,
        'male',
        '22-22.9',
        'Normal',
        2400,
        '[\"Maintenance\"]',
        'Breakfast',
        'Egg toast & fruit',
        450
    ),
    (
        17,
        'male',
        '22-22.9',
        'Normal',
        2400,
        '[\"Maintenance\"]',
        'Lunch',
        'Chicken salad',
        600
    ),
    (
        18,
        'male',
        '22-22.9',
        'Normal',
        2400,
        '[\"Maintenance\"]',
        'Snack',
        'Apple & almonds',
        300
    ),
    (
        19,
        'male',
        '22-22.9',
        'Normal',
        2400,
        '[\"Maintenance\"]',
        'Dinner',
        'Fish, rice & veggies',
        650
    ),
    (
        20,
        'male',
        '22-22.9',
        'Normal',
        2400,
        '[\"Maintenance\"]',
        'Snack',
        'Milk',
        400
    ),
    (
        21,
        'male',
        '27-27.9',
        'Overweight',
        2000,
        '[\"Fat loss\",\"Portion control\"]',
        'Breakfast',
        'Omelette & vegetables',
        350
    ),
    (
        22,
        'male',
        '27-27.9',
        'Overweight',
        2000,
        '[\"Fat loss\",\"Portion control\"]',
        'Lunch',
        'Grilled chicken & quinoa',
        500
    ),
    (
        23,
        'male',
        '27-27.9',
        'Overweight',
        2000,
        '[\"Fat loss\",\"Portion control\"]',
        'Snack',
        'Fruit bowl',
        250
    ),
    (
        24,
        'male',
        '27-27.9',
        'Overweight',
        2000,
        '[\"Fat loss\",\"Portion control\"]',
        'Dinner',
        'Steamed fish & salad',
        500
    ),
    (
        25,
        'male',
        '27-27.9',
        'Overweight',
        2000,
        '[\"Fat loss\",\"Portion control\"]',
        'Snack',
        'Green tea',
        150
    ),
    (
        26,
        'male',
        '35-35.9',
        'Obese Class II',
        1700,
        '[\"Medical weight loss\"]',
        'Breakfast',
        'Oats & berries',
        300
    ),
    (
        27,
        'male',
        '35-35.9',
        'Obese Class II',
        1700,
        '[\"Medical weight loss\"]',
        'Lunch',
        'Vegetable soup & chicken',
        450
    ),
    (
        28,
        'male',
        '35-35.9',
        'Obese Class II',
        1700,
        '[\"Medical weight loss\"]',
        'Snack',
        'Cucumber yogurt',
        200
    ),
    (
        29,
        'male',
        '35-35.9',
        'Obese Class II',
        1700,
        '[\"Medical weight loss\"]',
        'Dinner',
        'Grilled fish & greens',
        450
    ),
    (
        30,
        'male',
        '35-35.9',
        'Obese Class II',
        1700,
        '[\"Medical weight loss\"]',
        'Snack',
        'Herbal tea',
        100
    ),
    (
        31,
        'male',
        '23.0-29.9',
        'Slightly Overweight',
        2200,
        '[\"Weight management\",\"Balanced nutrition\"]',
        'Breakfast',
        'Whole grain toast & eggs',
        400
    ),
    (
        32,
        'male',
        '23.0-29.9',
        'Slightly Overweight',
        2200,
        '[\"Weight management\",\"Balanced nutrition\"]',
        'Lunch',
        'Grilled chicken & brown rice',
        600
    ),
    (
        33,
        'male',
        '23.0-29.9',
        'Slightly Overweight',
        2200,
        '[\"Weight management\",\"Balanced nutrition\"]',
        'Snack',
        'Greek yogurt & berries',
        250
    ),
    (
        34,
        'male',
        '23.0-29.9',
        'Slightly Overweight',
        2200,
        '[\"Weight management\",\"Balanced nutrition\"]',
        'Dinner',
        'Baked fish & vegetables',
        650
    ),
    (
        35,
        'male',
        '23.0-29.9',
        'Slightly Overweight',
        2200,
        '[\"Weight management\",\"Balanced nutrition\"]',
        'Snack',
        'Apple',
        300
    ),
    (
        36,
        'female',
        '10-10.9',
        'Severely Underweight',
        2800,
        '[\"Hormonal balance\",\"Healthy weight gain\"]',
        'Breakfast',
        'Smoothie bowl & granola',
        600
    ),
    (
        37,
        'female',
        '10-10.9',
        'Severely Underweight',
        2800,
        '[\"Hormonal balance\",\"Healthy weight gain\"]',
        'Lunch',
        'Rice, lentils & egg',
        750
    ),
    (
        38,
        'female',
        '10-10.9',
        'Severely Underweight',
        2800,
        '[\"Hormonal balance\",\"Healthy weight gain\"]',
        'Snack',
        'Nuts & dates',
        450
    ),
    (
        39,
        'female',
        '10-10.9',
        'Severely Underweight',
        2800,
        '[\"Hormonal balance\",\"Healthy weight gain\"]',
        'Dinner',
        'Chicken pasta',
        700
    ),
    (
        40,
        'female',
        '10-10.9',
        'Severely Underweight',
        2800,
        '[\"Hormonal balance\",\"Healthy weight gain\"]',
        'Snack',
        'Milk',
        300
    ),
    (
        41,
        'female',
        '22-22.9',
        'Normal',
        2000,
        '[\"Maintenance\"]',
        'Breakfast',
        'Avocado toast & egg',
        400
    ),
    (
        42,
        'female',
        '22-22.9',
        'Normal',
        2000,
        '[\"Maintenance\"]',
        'Lunch',
        'Fish salad',
        500
    ),
    (
        43,
        'female',
        '22-22.9',
        'Normal',
        2000,
        '[\"Maintenance\"]',
        'Snack',
        'Fruit bowl',
        250
    ),
    (
        44,
        'female',
        '22-22.9',
        'Normal',
        2000,
        '[\"Maintenance\"]',
        'Dinner',
        'Rice, veggies & chicken',
        550
    ),
    (
        45,
        'female',
        '22-22.9',
        'Normal',
        2000,
        '[\"Maintenance\"]',
        'Snack',
        'Yogurt',
        300
    ),
    (
        46,
        'female',
        '30-30.9',
        'Obese Class I',
        1500,
        '[\"Fat loss\",\"Blood sugar control\"]',
        'Breakfast',
        'Boiled eggs & fruit',
        250
    ),
    (
        47,
        'female',
        '30-30.9',
        'Obese Class I',
        1500,
        '[\"Fat loss\",\"Blood sugar control\"]',
        'Lunch',
        'Vegetable stir fry',
        400
    ),
    (
        48,
        'female',
        '30-30.9',
        'Obese Class I',
        1500,
        '[\"Fat loss\",\"Blood sugar control\"]',
        'Snack',
        'Apple',
        200
    ),
    (
        49,
        'female',
        '30-30.9',
        'Obese Class I',
        1500,
        '[\"Fat loss\",\"Blood sugar control\"]',
        'Dinner',
        'Steamed fish & salad',
        450
    ),
    (
        50,
        'female',
        '30-30.9',
        'Obese Class I',
        1500,
        '[\"Fat loss\",\"Blood sugar control\"]',
        'Snack',
        'Green tea',
        100
    ),
    (
        51,
        'female',
        '23.0-29.9',
        'Slightly Overweight',
        1800,
        '[\"Weight management\",\"Balanced nutrition\"]',
        'Breakfast',
        'Oatmeal & banana',
        350
    ),
    (
        52,
        'female',
        '23.0-29.9',
        'Slightly Overweight',
        1800,
        '[\"Weight management\",\"Balanced nutrition\"]',
        'Lunch',
        'Grilled chicken salad',
        500
    ),
    (
        53,
        'female',
        '23.0-29.9',
        'Slightly Overweight',
        1800,
        '[\"Weight management\",\"Balanced nutrition\"]',
        'Snack',
        'Yogurt & nuts',
        250
    ),
    (
        54,
        'female',
        '23.0-29.9',
        'Slightly Overweight',
        1800,
        '[\"Weight management\",\"Balanced nutrition\"]',
        'Dinner',
        'Baked salmon & veggies',
        500
    ),
    (
        55,
        'female',
        '23.0-29.9',
        'Slightly Overweight',
        1800,
        '[\"Weight management\",\"Balanced nutrition\"]',
        'Snack',
        'Orange',
        200
    );

--
-- Indexes for table `doctor_bmi_mealplans`
--
ALTER TABLE `doctor_bmi_mealplans` ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `doctor_bmi_mealplans`
--
ALTER TABLE `doctor_bmi_mealplans`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 56;
DROP TABLE IF EXISTS profileUser;

CREATE TABLE profileUser (
    user_id CHAR(36) PRIMARY KEY,

    age INT DEFAULT 0,
    avatar VARCHAR(255),

    height_cm INT DEFAULT 0,

    start_weight_kg DECIMAL(5,2) DEFAULT 0.00,
    current_weight_kg DECIMAL(5,2) DEFAULT 0.00,
    target_weight_kg DECIMAL(5,2) DEFAULT 0.00,

    goal VARCHAR(30) DEFAULT 'Maintain Weight',

    diet TEXT DEFAULT NULL,
    activity TEXT DEFAULT NULL,

    CONSTRAINT fk_profile_user
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
);
DESCRIBE profileUser;
