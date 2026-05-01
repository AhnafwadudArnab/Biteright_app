# BiteRight App — Features

A React Native (Expo) nutrition and health tracking app powered by Node.js/Express backend, Supabase (PostgreSQL), and Google Gemini AI.

---

## Authentication & User Management

- User registration with full health profile (age, gender, height, weight, activity level)
- Secure login with JWT tokens (7-day expiry)
- Session restoration from SecureStore (native) / localStorage (web)
- Password hashing with bcrypt
- Editable user profile with health metrics

---

## Meal Tracking & Logging

- Add, edit, and delete meals with type categorization (Breakfast, Lunch, Snack, Dinner)
- Track meal items with full nutrition details (calories, protein, carbs, fat)
- Daily meal log view with timestamps
- Meal history retrieval per user
- Nutrition breakdown per meal (macros)
- Daily calorie consumption tracked against personal goal

---

## Personalized Diet Plans

- AI-powered meal plan generation using **Google Gemini API**
- BMI-based meal plan recommendations (gender + BMI-specific)
- Static fallback meal plans from database (doctor-suggested)
- Daily calorie targets based on BMI category
- Doctor focus points per BMI category
- Meal plan customization and regeneration
- Weekly meal plan view
- Plan persistence to database

---

## Water Intake Tracking

- Glass-based water logging (250ml per glass)
- Daily water goal setting (default: 8 glasses)
- Visual progress tracking with animated fill
- Water intake log with timestamps
- Reset daily water tracking
- Hydration status display (goal achieved / remaining)

---

## Health Insights & Analytics

- Calorie intake trend visualization
- Macro breakdown (carbs, protein, fat) with pie charts
- Weight progress tracking with line charts
- Weekly challenge tracking (meal logging, water intake, calorie goals)
- Report generation and history
- Report deletion capability
- Average daily calorie calculation
- BMI category tracking

---

## User Profile & Settings

- User profile display with avatar
- Editable health measurements (age, height, current weight, target weight)
- Goal selection: Weight Loss / Weight Gain / Maintain Weight
- Diet preferences: Vegetarian, Non-Vegetarian, Vegan, Other
- Activity level selection: Sedentary, Light Exercise, Moderate Exercise, Active
- BMI and BMR (Basal Metabolic Rate) calculation
- Progress tracking toward weight goals

### Settings Screens

- Account settings
- Health & Goals configuration
- Notifications settings
- App preferences / theme
- Privacy & Security policy
- About screen
- Logout

---

## Motivation & Gamification

- Streak tracking (current streak counter)
- Points / rewards system
- Achievement badges:
  - 7-Day Streak
  - Water Champion
  - Macro Master
  - 30-Day Hero
  - Early Bird
  - Consistency King
- Weekly challenges with progress tracking
- Milestone tracking (next milestone display)
- Locked / unlocked badge system

---

## Navigation & UI

- Tab-based navigation (Landing Page, Main Home Page)
- Bottom navigation bar (Home, Add, Stats, Profile)
- Expo Router for screen navigation
- Animated transitions and entrance effects
- Glassmorphism effects (BlurView)
- Linear gradients for visual depth
- Green color scheme (`#3BB273`) as primary
- Responsive design for mobile / tablet / web
- Dark mode support (automatic)
- Custom themed components

---

## Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | User registration |
| POST | `/users/login` | Login with JWT |
| GET | `/users/mealplan` | Fetch meal plan by BMI |
| POST | `/api/meals` | Add meal |
| GET | `/api/meals/:user_id` | Get user's meals |
| DELETE | `/api/meals/:meal_id` | Delete meal |
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Create / update profile |
| POST | `/dietmeal` | Add diet meal |
| PUT | `/dietmeal/:id` | Update diet meal |
| POST | `/mealitem` | Add meal item |
| PUT | `/mealitem/:id` | Update meal item |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts with auth info |
| `user_goals` | Daily calorie, water, and weight targets |
| `foods` | Master food list with nutrition data |
| `meals` | User meal logs with timestamps |
| `meal_items` | Individual food items within a meal |
| `daily_nutrition_summary` | Aggregated daily nutrition data |
| `water_intake` | Water intake logs |
| `diet_plans` | Master diet plan definitions |
| `user_diet_plans` | User-selected diet plans |
| `bmi_records` | BMI history per user |
| `motivation_logs` | Streak and motivation data |

---

## Technical Highlights

- **JWT authentication** with 7-day expiry
- **Row-Level Security (RLS)** in Supabase
- **Google Gemini AI** integration for meal plan generation
- **Fallback static meal plans** when AI is unavailable
- **Platform-safe storage** (SecureStore for native, localStorage for web)
- **Animated UI** with React Native Animated API
- **Context API** for global state (Auth, Calories)
- **TypeScript** throughout frontend and backend
- **Jest** testing framework with property-based tests
- Responsive design with Expo

---

## Key Screens

| Screen | Description |
|--------|-------------|
| Landing Page | Feature showcase and onboarding |
| Login / Signup | Authentication screens |
| Main Home Page | Dashboard with quick actions |
| Daily Meal Log | Meal tracking interface |
| Diet Plan Generator | AI meal plan creation |
| Daily Diet Plan View | Personalized meal plan display |
| Weekly Plans | Multi-day meal planning |
| Water Intake | Hydration tracking |
| Health Insights | Analytics and reports |
| User Profile | Profile management and metrics |
| Settings | App configuration |
| Progress | Weight and goal tracking |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile App | Expo / React Native (Expo Router) |
| Backend API | Node.js + Express + TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | JWT + SecureStore |
| AI | Google Gemini API |
| Testing | Jest (property-based tests) |
