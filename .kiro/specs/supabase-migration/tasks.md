# Implementation Plan: Supabase Migration

## Overview

Migrate BiteRight from MySQL/Sequelize to Supabase (PostgreSQL). The backend Express server is retained but its entire data layer is replaced with `@supabase/supabase-js`. The frontend gains a configured Supabase client, JWT-based auth stored in SecureStore, and an `AuthContext` that eliminates the hardcoded `USER_ID`. All existing HTTP route paths and response shapes are preserved.

## Tasks

- [x] 1. Update backend dependencies and remove Sequelize
  - [x] 1.1 Update `Backend_Server/package.json` — remove `sequelize`, `mysql`, `mysql2`; add `@supabase/supabase-js`, `bcrypt`, `jsonwebtoken`, `dotenv` with pinned versions; add `@types/bcrypt`, `@types/jsonwebtoken` to `devDependencies`
    - Remove: `"sequelize"`, `"mysql"`, `"mysql2"` from `dependencies`
    - Add: `"@supabase/supabase-js": "^2.49.4"`, `"bcrypt": "^5.1.1"`, `"jsonwebtoken": "^9.0.2"`, `"dotenv": "^16.4.7"`
    - Add to `devDependencies`: `"@types/bcrypt": "^5.0.2"`, `"@types/jsonwebtoken": "^9.0.9"`
    - Run `npm install` in `Backend_Server/` to verify no errors
    - _Requirements: 1.1, 11.1, 11.2, 11.3_

  - [x] 1.2 Delete all Sequelize model files and the MySQL connection module
    - Delete `Backend_Server/src/models/db.ts` (hardcoded MySQL credentials)
    - Delete `Backend_Server/src/models/userModel.ts`
    - Delete `Backend_Server/src/models/Profileuser.ts`
    - Delete `Backend_Server/src/models/ProfileUsers.ts`
    - Delete `Backend_Server/src/models/dietMealModel.ts`
    - Delete `Backend_Server/src/models/mealItemModel.ts`
    - _Requirements: 1.2, 1.3, 4.1_

- [x] 2. Set up environment variable files
  - [x] 2.1 Create `Backend_Server/.env.example` with all required backend variable names and placeholder values
    - Include: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `PORT`
    - _Requirements: 2.1, 4.4_

  - [x] 2.2 Create root `.env.example` with all required frontend variable names and placeholder values
    - Include: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_SERVER_URL`
    - _Requirements: 2.2, 4.3, 4.4_

  - [x] 2.3 Update `.gitignore` to exclude `.env` files from version control
    - Replace the existing `.env*.local` rule with broader rules: `.env`, `.env.*`, `!.env.example`, `!.env.*.example`
    - Also add `Backend_Server/.env` and `Backend_Server/.env.*` exclusions
    - _Requirements: 2.3_

- [x] 3. Write PostgreSQL schema migration script for Supabase
  - [x] 3.1 Create `Database/supabase_migration.sql` — DDL for all tables with PostgreSQL-specific types
    - Translate all tables from `Database/All_database_Schemas.sql`: `users`, `profileUser`, `foods`, `meals`, `meal_items`, `daily_nutrition_summary`, `water_intake`, `diet_plans`, `user_diet_plans`, `motivation_logs`, `bmi_records`, `doctor_bmi_mealplans`
    - Replace `CHAR(36)` UUID PKs with `uuid DEFAULT gen_random_uuid()`
    - Replace `ENUM(...)` columns with `TEXT CHECK (col IN (...))`
    - Replace `AUTO_INCREMENT INT` on `doctor_bmi_mealplans` with `SERIAL PRIMARY KEY`
    - Replace `DATETIME` / `TIMESTAMP` with `TIMESTAMPTZ`
    - Replace `UNIQUE KEY name (a, b)` with `UNIQUE (a, b)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 3.2 Add all 55 `doctor_bmi_mealplans` seed rows to `Database/supabase_migration.sql`
    - Copy the INSERT block from `Database/All_database_Schemas.sql` and adapt syntax for PostgreSQL (remove backtick quoting, use standard double-quotes or no quotes)
    - _Requirements: 3.5_

  - [x] 3.3 Add RLS enablement and policies to `Database/supabase_migration.sql`
    - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` for: `meals`, `meal_items`, `water_intake`, `daily_nutrition_summary`, `motivation_logs`, `bmi_records`, `"profileUser"`, `user_diet_plans`
    - SELECT policy: `auth.uid() = user_id` on each RLS-enabled table
    - INSERT and UPDATE policies: `auth.uid() = user_id` on each RLS-enabled table
    - Leave `foods`, `diet_plans`, `doctor_bmi_mealplans` publicly readable (no RLS)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 4. Create backend Supabase client module
  - [x] 4.1 Create `Backend_Server/src/lib/supabase.ts` — single shared service-role Supabase client
    - Import `createClient` from `@supabase/supabase-js`
    - Read `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `process.env`
    - If either variable is absent, log a descriptive error and call `process.exit(1)`
    - Export `supabase` as a named export
    - _Requirements: 2.1, 2.4, 2.5_

- [x] 5. Create JWT auth middleware
  - [x] 5.1 Create `Backend_Server/src/middleware/auth.ts` — JWT verification middleware
    - Import `Request`, `Response`, `NextFunction` from `express`; import `jwt` from `jsonwebtoken`
    - Read `Authorization` header; return 401 `{ message: "Unauthorized" }` if absent or not `Bearer`-prefixed
    - Call `jwt.verify(token, process.env.JWT_SECRET!)` inside try/catch; return 401 on any error
    - On success, attach `{ id: payload.id }` to `req.user` and call `next()`
    - _Requirements: 7.2, 7.3, 7.4_

  - [x] 5.2 Write property test for auth middleware — Property 4: Expired or tampered JWT is always rejected
    - **Property 4: Expired or tampered JWT is always rejected**
    - Use `fast-check` to generate arbitrary `{ id, email }` payloads; sign with a different secret or set `exp` in the past; assert middleware returns 401 and does NOT call `next()`
    - **Validates: Requirements 7.2, 7.3**

- [x] 6. Refactor `userController.ts` — bcrypt hashing and JWT issuance
  - [x] 6.1 Rewrite `registerUser` in `Backend_Server/src/Registrations/userController.ts`
    - Remove all Sequelize `User.findOne`, `User.create`, `ProfileUser.create` calls
    - Check for existing email via `supabase.from('users').select('id').eq('email', email).maybeSingle()`; return 409 if found
    - Hash password with `bcrypt.hash(password, 12)` before insert
    - Insert into `users` via `supabase.from('users').insert({...}).select().single()`; propagate error to `next(error)` if non-null
    - Insert into `"profileUser"` via `supabase.from('profileUser').insert({ user_id: newUser.id, ... })`
    - Return 201 with user object excluding `password`
    - _Requirements: 1.2, 5.2, 6.1, 6.3_

  - [x] 6.2 Rewrite `loginUser` in `Backend_Server/src/Registrations/userController.ts`
    - Remove all Sequelize calls
    - Fetch user by email via `supabase.from('users').select('*').eq('email', email).maybeSingle()`; return 404 if not found
    - Compare password with `bcrypt.compare(password, user.password)`; return 401 `{ message: "Invalid credentials" }` if false
    - Sign JWT with `jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' })`
    - Return 200 with `{ message, token, user: { id, email, name } }`
    - _Requirements: 6.2, 6.4, 7.1_

  - [x] 6.3 Write property test for password hashing — Property 1: Password hashing is irreversible and verifiable
    - **Property 1: Password hashing is irreversible and verifiable**
    - Use `fast-check` to generate arbitrary non-empty strings; assert `bcrypt.hash(pw, 12) !== pw` and `bcrypt.compare(pw, hash)` returns `true`
    - **Validates: Requirements 6.1, 6.2**

  - [x] 6.4 Write property test for wrong password rejection — Property 2: Wrong password is always rejected
    - **Property 2: Wrong password is always rejected**
    - Use `fast-check` to generate two distinct strings (password and wrong candidate); assert `bcrypt.compare(wrong, hash)` returns `false`
    - **Validates: Requirements 6.4**

  - [x] 6.5 Write property test for JWT round-trip — Property 3: JWT round-trip preserves user identity
    - **Property 3: JWT round-trip preserves user identity**
    - Use `fast-check` to generate arbitrary `{ id: uuid-string, email: string }` pairs; sign and verify; assert `payload.id === id` and `payload.email === email`
    - **Validates: Requirements 7.1, 7.4**

- [x] 7. Refactor `MealTrackerController.ts` — replace Sequelize with Supabase client
  - [x] 7.1 Rewrite `addMeal` in `Backend_Server/src/Controllers/MealTrackerController.ts`
    - Remove `import db from "../models/db"` and `QueryTypes` from sequelize
    - Import `supabase` from `../lib/supabase`
    - Insert meal row via `supabase.from('meals').insert({ user_id, meal_type, eaten_at }).select().single()`; propagate error to `next(error)`
    - Insert each item in `items` array via `supabase.from('meal_items').insert({ meal_id: meal.id, food_id, quantity, calories })`; propagate errors
    - Remove application-level `uuidv4()` calls — let `gen_random_uuid()` handle IDs in the DB
    - _Requirements: 1.2, 5.1, 5.4_

  - [x] 7.2 Rewrite `getMealsByUser` in `Backend_Server/src/Controllers/MealTrackerController.ts`
    - Replace raw SQL with `supabase.from('meals').select('*, meal_items(*, foods(name))').eq('user_id', user_id).order('eaten_at', { ascending: false })`
    - Propagate error to `next(error)` if non-null
    - _Requirements: 5.1, 5.4, 5.5_

  - [x] 7.3 Rewrite `deleteMeal` in `Backend_Server/src/Controllers/MealTrackerController.ts`
    - Replace raw SQL with `supabase.from('meals').delete().eq('id', meal_id)`
    - Propagate error to `next(error)` if non-null
    - _Requirements: 5.1, 5.4_

  - [x] 7.4 Write property test for meal ownership — Property 5: Meal ownership is preserved through add-then-fetch
    - **Property 5: Meal ownership is preserved through add-then-fetch**
    - Mock the Supabase client; use `fast-check` to generate arbitrary user IDs and meal payloads; call `addMeal` then `getMealsByUser`; assert all returned meals have `user_id` equal to the authenticated user's `id`
    - **Validates: Requirements 5.1, 8.2**

- [x] 8. Refactor `ProfileControllers.ts` — replace Sequelize with Supabase client
  - [x] 8.1 Rewrite `getProfile` in `Backend_Server/src/Controllers/ProfileControllers.ts`
    - Remove `import ProfileUser from "../models/Profileuser"`
    - Import `supabase` from `../lib/supabase`
    - Fetch via `supabase.from('profileUser').select('*').eq('user_id', user_id).maybeSingle()`; return 404 if `data` is null; propagate error to `next(error)`
    - Parse `diet` and `activity` JSON strings before returning response
    - _Requirements: 5.2, 5.4, 5.5_

  - [x] 8.2 Rewrite `upsertProfile` in `Backend_Server/src/Controllers/ProfileControllers.ts`
    - Replace `ProfileUser.upsert(payload)` with `supabase.from('profileUser').upsert(payload, { onConflict: 'user_id' }).select().single()`
    - Propagate error to `next(error)` if non-null
    - _Requirements: 5.2, 5.4_

  - [x] 8.3 Write property test for profile upsert idempotence — Property 6: Profile upsert is idempotent
    - **Property 6: Profile upsert is idempotent**
    - Mock the Supabase client; use `fast-check` to generate arbitrary user IDs and valid profile payloads; call `upsertProfile` twice with the same payload; assert exactly one `profileUser` row exists and its fields match the payload
    - **Validates: Requirements 5.2**

- [x] 9. Refactor `mealPlanController.ts` — replace Sequelize with Supabase client
  - [x] 9.1 Rewrite `getMealPlanByBmi` in `Backend_Server/src/Registrations/mealPlanController.ts`
    - Remove `import db from "../models/db"` and `QueryTypes`
    - Import `supabase` from `../lib/supabase`
    - Fetch rows via `supabase.from('doctor_bmi_mealplans').select('*').eq('gender', gender)`; propagate error to `next(error)`
    - Preserve existing BMI range matching logic (find exact range, fallback to closest midpoint)
    - Return same response shape: `{ bmi_range, category, dailyCalories, doctorFocus, meals }`
    - _Requirements: 5.3, 5.4, 5.5_

  - [x] 9.2 Write property test for BMI meal plan structure — Property 7: BMI meal plan lookup returns consistent structure
    - **Property 7: BMI meal plan lookup returns consistent structure**
    - Mock the Supabase client to return the seeded `doctor_bmi_mealplans` rows; use `fast-check` to generate `(gender, bmi)` pairs within defined ranges; assert response contains `bmi_range`, `category`, `dailyCalories`, `doctorFocus` (non-empty array), and `meals` (non-empty array of `{ type, name, kcal }`)
    - **Validates: Requirements 5.3, 3.5**

- [x] 10. Refactor `dietMealController.ts` and `mealItemController.ts` — replace Sequelize with Supabase client
  - [x] 10.1 Rewrite `addDietMeal` and `updateDietMeal` in `Backend_Server/src/Registrations/dietMealController.ts`
    - Remove `import DietMeal from "../models/dietMealModel"`
    - Import `supabase` from `../lib/supabase`
    - `addDietMeal`: insert via `supabase.from('meals').insert({ user_id, meal_type, eaten_at }).select().single()`
    - `updateDietMeal`: update via `supabase.from('meals').update({ meal_type, eaten_at }).eq('id', id).select().single()`; return 404 if `data` is null
    - Propagate errors to `next(error)`
    - _Requirements: 5.3, 5.4_

  - [x] 10.2 Rewrite `addMealItem` and `updateMealItem` in `Backend_Server/src/Registrations/mealItemController.ts`
    - Remove `import MealItem from "../models/mealItemModel"`
    - Import `supabase` from `../lib/supabase`
    - `addMealItem`: insert via `supabase.from('meal_items').insert({ meal_id, food_id, quantity, calories }).select().single()`
    - `updateMealItem`: update via `supabase.from('meal_items').update({ quantity, calories }).eq('id', id).select().single()`; return 404 if `data` is null
    - Propagate errors to `next(error)`
    - _Requirements: 5.3, 5.4_

- [x] 11. Apply auth middleware to protected routes
  - [x] 11.1 Update `Backend_Server/src/Controllers/MealTrackerRoutes.ts` to protect all meal routes with `authMiddleware`
    - Import `authMiddleware` from `../middleware/auth`
    - Apply `authMiddleware` to `POST /meals`, `GET /meals/:user_id`, `DELETE /meals/:meal_id`
    - _Requirements: 7.5_

  - [x] 11.2 Update `Backend_Server/src/Controllers/ProfileRoutes.ts` to protect all profile routes with `authMiddleware`
    - Import `authMiddleware` from `../middleware/auth`
    - Apply `authMiddleware` to `GET /profile` and `PUT /profile`
    - _Requirements: 7.5_

  - [x] 11.3 Verify `Backend_Server/src/Registrations/userRoutes.ts` — confirm `/register`, `/login`, and `/mealplan` remain public (no `authMiddleware`)
    - No code changes needed if routes are already public; confirm by reading the file
    - _Requirements: 7.5_

- [x] 12. Checkpoint — compile backend and verify no TypeScript errors
  - Run `npm run build` in `Backend_Server/` and fix any type errors before proceeding
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Update frontend dependencies
  - [x] 13.1 Add `@supabase/supabase-js` and `expo-secure-store` to root `package.json` with pinned versions
    - Add `"@supabase/supabase-js": "^2.49.4"` and `"expo-secure-store": "~14.0.1"` to `dependencies`
    - Remove `"sequelize"`, `"mysql2"`, `"pg-hstore"` from root `package.json` if present
    - Run `npm install` at the workspace root to verify no errors
    - _Requirements: 12.1_

- [x] 14. Create frontend Supabase client module
  - [x] 14.1 Create `lib/supabase.ts` — single shared Supabase client with SecureStore session adapter
    - Import `createClient` from `@supabase/supabase-js`; import `* as SecureStore` from `expo-secure-store`
    - Define `ExpoSecureStoreAdapter` with `getItem`, `setItem`, `removeItem` delegating to `SecureStore.*Async`
    - Export `supabase` created with `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and `{ auth: { storage: ExpoSecureStoreAdapter, autoRefreshToken: true, persistSession: true } }`
    - _Requirements: 12.2, 12.3_

- [x] 15. Create `AuthContext` for the frontend
  - [x] 15.1 Create `app/AuthContext.tsx` — React context providing login, logout, and user state
    - Define `AuthState` interface: `{ user: { id: string; email: string; name?: string } | null; token: string | null; isLoading: boolean }`
    - On mount, read JWT from `SecureStore`; if present and not expired (decode with `jwt-decode` or manual base64 parse), restore session into state
    - `login(email, password)`: POST to `SERVER_URL + '/users/login'`; on success store `token` and `user` in SecureStore and update state
    - `logout()`: delete JWT and user from SecureStore; reset state to unauthenticated
    - Export `AuthProvider` component and `useAuth()` hook
    - _Requirements: 7.6, 8.2, 8.3, 8.4_

  - [x] 15.2 Wrap the root layout in `AuthProvider`
    - Edit `app/(tabs)/_layout.tsx` (or the root `app/index.tsx` layout) to wrap children with `<AuthProvider>`
    - _Requirements: 8.2_

- [x] 16. Refactor `app/serverhost.tsx` — remove hardcoded IP
  - [x] 16.1 Replace the hardcoded `SERVER_IP` constant with an environment-variable-driven URL
    - Import `Constants` from `expo-constants`
    - Export `SERVER_URL` as `Constants.expoConfig?.extra?.serverUrl ?? process.env.EXPO_PUBLIC_SERVER_URL ?? 'http://localhost:3000'`
    - Remove `SERVER_IP` and `SERVER_PORT` exports
    - _Requirements: 4.3_

- [x] 17. Refactor `app/login_signup/login.tsx` to use `AuthContext`
  - [x] 17.1 Replace the inline `fetch('/users/login')` call with `useAuth().login(email, password)`
    - Import `useAuth` from `../AuthContext`
    - Call `login(email, password)` inside `handleSubmit`; catch errors and surface them via `setError`
    - On success, navigate to `/(tabs)/MainHomePage`
    - _Requirements: 7.6, 8.3_

- [x] 18. Refactor `app/login_signup/signup.tsx` to use `AuthContext`
  - [x] 18.1 Update `signup.tsx` to POST to `SERVER_URL + '/users/register'` using the environment-driven URL from `serverhost.tsx`
    - Replace `require("../serverhost").SERVER_URL` with a named import: `import { SERVER_URL } from '../serverhost'`
    - After successful registration, call `useAuth().login(email, password)` to auto-login and navigate to `/(tabs)/MainHomePage`
    - _Requirements: 7.6, 8.3_

- [x] 19. Replace hardcoded `USER_ID` in `app/Meal_trackers/Gen_meals.tsx`
  - [x] 19.1 Remove `const USER_ID = "demo-user-id"` and replace all usages with `useAuth().user?.id`
    - Import `useAuth` from `../AuthContext`
    - Replace `USER_ID` in `fetchMeals` (`/api/meals/${USER_ID}`), `handleSaveMeal` (`user_id: USER_ID`), and `handleDelete`
    - If `user?.id` is undefined (unauthenticated), show an error or redirect to login
    - Replace `const API_BASE = "http://localhost:3000/api"` with `import { SERVER_URL } from '../serverhost'` and use `` `${SERVER_URL}/api` ``
    - _Requirements: 8.1, 8.2, 4.3_

- [x] 20. Checkpoint — verify frontend compiles and auth flow works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 21. Set up property-based test infrastructure
  - [x] 21.1 Add `fast-check`, `jest`, `ts-jest`, and `@types/jest` to `Backend_Server/devDependencies` with pinned versions
    - Add `"fast-check": "^3.23.2"`, `"jest": "^29.7.0"`, `"ts-jest": "^29.3.4"`, `"@types/jest": "^29.5.14"`
    - Create `Backend_Server/jest.config.js` with `ts-jest` preset and `testEnvironment: 'node'`
    - Add `"test": "jest --runInBand"` script to `Backend_Server/package.json`
    - _Requirements: (testing infrastructure)_

  - [x] 21.2 Create `Backend_Server/src/__tests__/auth.property.test.ts` — property tests for Properties 1, 2, 3, 4
    - Import `fc` from `fast-check`; import `bcrypt` from `bcrypt`; import `jwt` from `jsonwebtoken`
    - **Property 1**: `fc.asyncProperty(fc.string({ minLength: 1 }), async (pw) => { const hash = await bcrypt.hash(pw, 12); return hash !== pw && await bcrypt.compare(pw, hash); })`
    - **Property 2**: `fc.asyncProperty(fc.string({ minLength: 1 }), fc.string({ minLength: 1 }), async (pw, wrong) => { fc.pre(pw !== wrong); const hash = await bcrypt.hash(pw, 12); return !(await bcrypt.compare(wrong, hash)); })`
    - **Property 3**: `fc.property(fc.uuid(), fc.emailAddress(), (id, email) => { const token = jwt.sign({ id, email }, 'secret', { expiresIn: '1h' }); const payload = jwt.verify(token, 'secret') as any; return payload.id === id && payload.email === email; })`
    - **Property 4**: generate expired tokens (set `exp` to past timestamp) and tokens signed with wrong secret; assert `jwt.verify` throws in both cases
    - _Requirements: 6.1, 6.2, 6.4, 7.1, 7.2, 7.3, 7.4_

  - [x] 21.3 Create `Backend_Server/src/__tests__/mealOwnership.property.test.ts` — property test for Property 5
    - Mock `../lib/supabase` using `jest.mock`; configure mock to store inserted meals in memory and return them on select
    - **Property 5**: `fc.asyncProperty(fc.uuid(), fc.record({ meal_type: fc.string(), eaten_at: fc.date() }), async (userId, mealPayload) => { ... })`; assert all fetched meals have `user_id === userId`
    - _Requirements: 5.1, 8.2_

  - [x] 21.4 Create `Backend_Server/src/__tests__/profileUpsert.property.test.ts` — property test for Property 6
    - Mock `../lib/supabase`; configure mock to simulate upsert (store last write per `user_id`)
    - **Property 6**: `fc.asyncProperty(fc.uuid(), fc.record({ height_cm: fc.float(), goal: fc.constantFrom('Weight Loss','Weight Gain','Maintain Weight') }), async (userId, payload) => { ... })`; call upsert twice; assert single row with correct fields
    - _Requirements: 5.2_

  - [x] 21.5 Create `Backend_Server/src/__tests__/bmiMealPlan.property.test.ts` — property test for Property 7
    - Mock `../lib/supabase` to return the seeded `doctor_bmi_mealplans` rows
    - **Property 7**: `fc.property(fc.constantFrom('male','female'), fc.float({ min: 10, max: 40 }), (gender, bmi) => { ... })`; assert response has `bmi_range`, `category`, `dailyCalories`, `doctorFocus` (array length > 0), `meals` (array length > 0, each with `type`, `name`, `kcal`)
    - _Requirements: 5.3, 3.5_

- [x] 22. Update `README.md` with setup instructions
  - [x] 22.1 Add a "Setup" section to the root `README.md` documenting the full local development setup
    - Step 1: Copy `.env.example` to `.env` and fill in Supabase credentials
    - Step 2: Copy `Backend_Server/.env.example` to `Backend_Server/.env` and fill in credentials
    - Step 3: Run the `Database/supabase_migration.sql` script in the Supabase SQL editor
    - Step 4: `npm install` at workspace root and in `Backend_Server/`
    - Step 5: Start backend with `npm start` in `Backend_Server/`; start Expo with `npx expo start`
    - _Requirements: 4.4_

- [x] 23. Final checkpoint — run all tests and verify build
  - Run `npm run build` in `Backend_Server/` — zero TypeScript errors
  - Run `npm test` in `Backend_Server/` — all property tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints (tasks 12, 20, 23) ensure incremental validation at key milestones
- Property tests validate universal correctness properties using `fast-check`
- The Supabase service-role key must never be committed or exposed to the frontend
- `Backend_Server/.env` and root `.env` must be created manually before starting the server
