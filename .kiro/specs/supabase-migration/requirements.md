# Requirements Document

## Introduction

BiteRight is a React Native (Expo) mobile app paired with a Node.js/Express (TypeScript) backend. The backend currently uses a free-tier MySQL instance hosted at freesqldatabase.com, accessed through Sequelize ORM with credentials hardcoded directly in source code. This migration replaces MySQL and Sequelize with Supabase — a PostgreSQL-based Backend-as-a-Service — to gain a managed database, built-in authentication, row-level security, and a JavaScript client SDK. The Express backend is retained but refactored to use the Supabase client instead of Sequelize. The React Native frontend is updated to use environment-based server configuration and, where appropriate, the Supabase JS client directly.

---

## Glossary

- **BiteRight_App**: The React Native (Expo) mobile application.
- **Backend_Server**: The Node.js/Express TypeScript server located in `Backend_Server/`.
- **Supabase_Client**: The `@supabase/supabase-js` SDK used to interact with the Supabase project.
- **Supabase_Auth**: The Supabase built-in authentication service that issues JWTs.
- **Migration_Script**: A SQL or TypeScript script that recreates the existing schema in Supabase and seeds reference data.
- **Environment_Config**: `.env` files (never committed) that hold secrets such as Supabase URL and anon/service-role keys.
- **RLS**: Row-Level Security — PostgreSQL policies enforced by Supabase to restrict data access per authenticated user.
- **JWT**: JSON Web Token issued by Supabase_Auth after a successful login or registration.
- **Auth_Middleware**: Express middleware that validates a JWT on every protected route.
- **ProfileUser**: The user profile record stored in the `profileUser` table, linked 1-to-1 with the `users` table.
- **Meal_Tracker**: The set of backend endpoints and frontend screens that manage meal logging (`meals`, `meal_items`, `foods` tables).
- **Doctor_BMI_Mealplans**: The reference table `doctor_bmi_mealplans` containing pre-seeded meal suggestions keyed by gender and BMI range.

---

## Requirements

### Requirement 1: Remove Sequelize and MySQL Dependencies

**User Story:** As a developer, I want to remove Sequelize ORM and the mysql2 driver from the backend, so that the codebase no longer depends on a MySQL-specific data layer.

#### Acceptance Criteria

1. THE Backend_Server SHALL remove `sequelize`, `mysql`, and `mysql2` from `package.json` dependencies.
2. THE Backend_Server SHALL remove all Sequelize `Model` class definitions from `Backend_Server/src/models/`.
3. THE Backend_Server SHALL remove the `db.ts` file that contains hardcoded MySQL credentials.
4. WHEN the Backend_Server starts, THE Backend_Server SHALL not attempt any MySQL connection.

---

### Requirement 2: Provision and Configure Supabase Project

**User Story:** As a developer, I want the backend to connect to a Supabase project, so that all data is stored in a managed PostgreSQL database.

#### Acceptance Criteria

1. THE Backend_Server SHALL read the Supabase project URL and service-role key exclusively from environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
2. THE BiteRight_App SHALL read the Supabase project URL and anon key exclusively from environment variables (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
3. THE Environment_Config SHALL never be committed to version control; `.env` files SHALL be listed in `.gitignore`.
4. WHEN the Backend_Server initialises, THE Supabase_Client SHALL be instantiated once using the service-role key and reused across all request handlers.
5. IF the `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` environment variable is absent at startup, THEN THE Backend_Server SHALL log a descriptive error message and exit with a non-zero status code.

---

### Requirement 3: Schema Migration to PostgreSQL

**User Story:** As a developer, I want the existing MySQL schema recreated in Supabase, so that all application data models are preserved without data loss.

#### Acceptance Criteria

1. THE Migration_Script SHALL create all tables present in `Database/All_database_Schemas.sql` as equivalent PostgreSQL tables in the Supabase project: `users`, `profileUser`, `foods`, `meals`, `meal_items`, `daily_nutrition_summary`, `water_intake`, `diet_plans`, `user_diet_plans`, `motivation_logs`, `bmi_records`, and `doctor_bmi_mealplans`.
2. THE Migration_Script SHALL replace MySQL `CHAR(36)` UUID primary keys with PostgreSQL `uuid` type using `gen_random_uuid()` as the default.
3. THE Migration_Script SHALL replace MySQL `ENUM` columns with PostgreSQL `TEXT` columns constrained by `CHECK` clauses.
4. THE Migration_Script SHALL replace the MySQL `AUTO_INCREMENT` integer primary key on `doctor_bmi_mealplans` with a `SERIAL` or `BIGSERIAL` column.
5. THE Migration_Script SHALL re-seed the `doctor_bmi_mealplans` table with all 55 rows present in the existing SQL file.
6. WHEN the Migration_Script is executed against a fresh Supabase project, THE Migration_Script SHALL complete without errors.

---

### Requirement 4: Replace Hardcoded Database Credentials

**User Story:** As a developer, I want all database credentials removed from source code, so that secrets are never exposed in the repository.

#### Acceptance Criteria

1. THE Backend_Server SHALL contain no hardcoded database hostnames, usernames, passwords, or connection strings in any committed file.
2. THE Backend_Server SHALL contain no hardcoded Supabase keys in any committed file.
3. THE BiteRight_App SHALL contain no hardcoded server IP addresses in any committed file; `app/serverhost.tsx` SHALL read the server URL from an environment variable or Expo constant.
4. THE Environment_Config SHALL provide a `.env.example` file listing all required variable names with placeholder values, committed to the repository as documentation.

---

### Requirement 5: Replace Sequelize Query Layer with Supabase Client

**User Story:** As a developer, I want all database queries rewritten to use the Supabase client, so that the backend communicates with PostgreSQL through a consistent, type-safe interface.

#### Acceptance Criteria

1. THE Backend_Server SHALL replace all raw `db.query(...)` Sequelize calls in `MealTrackerController.ts` with equivalent Supabase_Client queries.
2. THE Backend_Server SHALL replace all Sequelize `Model.findOne`, `Model.create`, and `Model.upsert` calls in `ProfileControllers.ts` and `userController.ts` with equivalent Supabase_Client queries.
3. THE Backend_Server SHALL replace all Sequelize `Model.findOne` and `Model.create` calls in `dietMealController.ts`, `mealItemController.ts`, and `mealPlanController.ts` with equivalent Supabase_Client queries.
4. WHEN a Supabase_Client query returns an error object, THE Backend_Server SHALL propagate the error to the Express error-handling middleware rather than silently swallowing it.
5. THE Backend_Server SHALL preserve all existing HTTP route paths and response shapes so that the BiteRight_App requires no API contract changes.

---

### Requirement 6: Implement Password Hashing

**User Story:** As a developer, I want user passwords hashed before storage, so that plain-text credentials are never written to the database.

#### Acceptance Criteria

1. WHEN a user registers, THE Backend_Server SHALL hash the password using bcrypt with a minimum cost factor of 12 before inserting it into the `users` table.
2. WHEN a user logs in, THE Backend_Server SHALL compare the submitted password against the stored bcrypt hash using a constant-time comparison function.
3. THE Backend_Server SHALL never return or log a user's password or password hash in any API response.
4. IF the bcrypt comparison fails, THEN THE Backend_Server SHALL return HTTP 401 with the message `"Invalid credentials"`.

---

### Requirement 7: Implement JWT Authentication

**User Story:** As a developer, I want the backend to issue and validate JWTs, so that authenticated users can access protected resources without re-sending credentials on every request.

#### Acceptance Criteria

1. WHEN a user successfully logs in, THE Backend_Server SHALL return a signed JWT containing the user's `id` and `email` with an expiry of 7 days.
2. THE Auth_Middleware SHALL validate the JWT signature and expiry on every request to protected routes before the route handler executes.
3. IF the JWT is absent, malformed, or expired, THEN THE Auth_Middleware SHALL return HTTP 401 with the message `"Unauthorized"`.
4. WHEN the JWT is valid, THE Auth_Middleware SHALL attach the decoded user payload to `req.user` so that route handlers can access the authenticated user's `id`.
5. THE Backend_Server SHALL protect all routes under `/api/profile`, `/api/meals`, and `/api/water` with Auth_Middleware.
6. THE BiteRight_App SHALL store the JWT in secure storage (Expo SecureStore) after login and attach it as a `Bearer` token in the `Authorization` header of every authenticated request.

---

### Requirement 8: Replace Hardcoded USER_ID in Frontend

**User Story:** As a developer, I want the frontend to use the authenticated user's real ID, so that meal and profile data is correctly scoped per user.

#### Acceptance Criteria

1. THE BiteRight_App SHALL remove the `const USER_ID = "demo-user-id"` constant from `Gen_meals.tsx`.
2. THE BiteRight_App SHALL provide the authenticated user's `id` through a React context (e.g., `AuthContext`) accessible to all screens.
3. WHEN a user logs in successfully, THE BiteRight_App SHALL store the user object (including `id`) in `AuthContext`.
4. WHEN a user logs out, THE BiteRight_App SHALL clear the JWT from SecureStore and reset `AuthContext` to an unauthenticated state.
5. WHILE the user is unauthenticated, THE BiteRight_App SHALL redirect to the login screen for any route that requires authentication.

---

### Requirement 9: Enable Row-Level Security

**User Story:** As a developer, I want Supabase RLS policies applied to user-owned tables, so that users can only read and write their own data even if the anon key is used directly.

#### Acceptance Criteria

1. THE Migration_Script SHALL enable RLS on the following tables: `meals`, `meal_items`, `water_intake`, `daily_nutrition_summary`, `motivation_logs`, `bmi_records`, `profileUser`, `user_diet_plans`.
2. THE Migration_Script SHALL create a SELECT policy on each RLS-enabled table that permits access only when `auth.uid() = user_id`.
3. THE Migration_Script SHALL create INSERT and UPDATE policies on each RLS-enabled table that permit writes only when `auth.uid() = user_id`.
4. THE Migration_Script SHALL leave `foods`, `diet_plans`, and `doctor_bmi_mealplans` as publicly readable (SELECT) with no write access for the anon role.

---

### Requirement 10: Data Migration from MySQL to Supabase

**User Story:** As a developer, I want existing production data migrated from the MySQL instance to Supabase, so that no user data is lost during the transition.

#### Acceptance Criteria

1. THE Migration_Script SHALL export all rows from the MySQL `users`, `profileUser`, `meals`, `meal_items`, `water_intake`, `bmi_records`, and `motivation_logs` tables.
2. THE Migration_Script SHALL import the exported rows into the corresponding Supabase tables while preserving all existing UUID primary keys.
3. WHEN the migration is complete, THE Migration_Script SHALL verify that the row count in each Supabase table matches the row count exported from MySQL.
4. IF a row fails to import due to a constraint violation, THEN THE Migration_Script SHALL log the failing row and continue processing remaining rows rather than aborting.

---

### Requirement 11: Update Backend Dependencies and Build

**User Story:** As a developer, I want the backend `package.json` updated to reflect the new dependency set, so that the project builds cleanly after the migration.

#### Acceptance Criteria

1. THE Backend_Server SHALL add `@supabase/supabase-js`, `bcrypt`, `jsonwebtoken`, and `dotenv` to `package.json` dependencies with pinned versions.
2. THE Backend_Server SHALL add `@types/bcrypt` and `@types/jsonwebtoken` to `devDependencies`.
3. WHEN `npm install` is run in `Backend_Server/`, THE Backend_Server SHALL install all dependencies without errors.
4. WHEN `npm run build` is run in `Backend_Server/`, THE Backend_Server SHALL compile TypeScript to JavaScript without type errors.

---

### Requirement 12: Update Frontend Supabase Client

**User Story:** As a developer, I want the React Native app to have a configured Supabase client available, so that it can use Supabase Auth and optionally query the database directly.

#### Acceptance Criteria

1. THE BiteRight_App SHALL add `@supabase/supabase-js` and `expo-secure-store` to `package.json` dependencies with pinned versions.
2. THE BiteRight_App SHALL initialise a single Supabase_Client instance in a shared module (e.g., `lib/supabase.ts`) using `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. THE BiteRight_App SHALL configure the Supabase_Client to use `ExpoSecureStoreAdapter` for session persistence.
4. WHEN `npx expo start` is run, THE BiteRight_App SHALL start without import or initialisation errors related to the Supabase client.
