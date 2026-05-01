# BiteRight — Known Issues & Fixes List

> Last updated: 2025  
> Status key: 🔴 Critical · 🟠 Major · 🟡 Moderate · 🔵 Minor

---

## 🔴 Critical

These issues represent security vulnerabilities or data-integrity failures that must be resolved before any production deployment.

---

### C-1 · Plain-text password storage

**File:** `Backend_Server/src/Registrations/userController.ts`  
**Lines:** `registerUser` and `loginUser` functions

**Problem:**  
Passwords are stored in the database as plain text and compared with a direct string equality check (`user.password !== password`). Any database breach immediately exposes every user's password.

**Fix:**  
- Install `bcrypt` (or `argon2`).  
- Hash the password with a cost factor ≥ 12 before `User.create(...)`.  
- Replace the equality check in `loginUser` with `bcrypt.compare(submitted, stored)`.

---

### C-2 · Hardcoded database credentials in source code

**File:** `Backend_Server/src/models/db.ts`

**Problem:**  
The MySQL hostname, database name, username, and password are hardcoded as string literals and committed to the repository. Anyone with read access to the repo has full database access.

```ts
// Current — DO NOT leave like this
const sequelize = new Sequelize('sql12815086', 'sql12815086', 'isb7WZJZ8d', {
    host: "sql12.freesqldatabase.com",
    ...
});
```

**Fix:**  
- Move all credentials to a `.env` file (never committed).  
- Read them via `process.env.DB_HOST`, etc.  
- Add `.env` to `.gitignore`.  
- Provide a `.env.example` with placeholder values.  
- Rotate the exposed credentials immediately.

---

### C-3 · Hardcoded server IP address in frontend

**File:** `app/serverhost.tsx`

**Problem:**  
The backend server's IP address is hardcoded as a string literal. The app will fail for any user not on the same local network, and changing the server requires a code change and rebuild.

```ts
// Current
export const SERVER_IP = "10.15.40.214";
```

**Fix:**  
- Replace with an Expo environment variable: `process.env.EXPO_PUBLIC_API_URL`.  
- Set the value in `.env` / `app.config.js` `extra` field.  
- Remove the hardcoded IP entirely.

---

### C-4 · No authentication middleware on backend routes

**Files:** `Backend_Server/src/Controllers/ProfileRoutes.ts`, `Backend_Server/src/Controllers/MealTrackerRoutes.ts`, `Backend_Server/src/Registrations/userRoutes.ts`

**Problem:**  
All API routes (profile, meals, diet plans) are publicly accessible without any token or session validation. Any caller can read or modify any user's data by supplying an arbitrary `user_id`.

**Fix:**  
- Implement an `authMiddleware` that validates a JWT from the `Authorization: Bearer <token>` header.  
- Apply the middleware to all routes except `POST /users/register` and `POST /users/login`.  
- Derive `user_id` from the verified token payload instead of accepting it from the request body or query string.

---

## 🟠 Major

These issues cause functional bugs or significant UX degradation.

---

### M-1 · No JWT / session after login — user not persisted

**Files:** `Backend_Server/src/Registrations/userController.ts`, `app/login_signup/login.tsx`

**Problem:**  
`loginUser` returns the user object but no token. The frontend has no way to prove identity on subsequent requests, so every protected action either fails or falls back to the hardcoded demo ID.

**Fix:**  
- Issue a signed JWT (e.g., `jsonwebtoken`) on successful login containing `{ id, email }` with a 7-day expiry.  
- Store the token in `expo-secure-store` on the frontend.  
- Attach it as `Authorization: Bearer <token>` on every API call.

---

### M-2 · USER_ID hardcoded as `"demo-user-id"`

**File:** `app/Meal_trackers/Gen_meals.tsx` — line ~18

**Problem:**  
All meal API calls use a static placeholder ID. Every user's meals are written to and read from the same fake account, making the feature non-functional for real users.

```ts
// Current
const USER_ID = "demo-user-id";
```

**Fix:**  
- Create an `AuthContext` that stores the authenticated user object after login.  
- Replace `USER_ID` with `useContext(AuthContext).user.id`.  
- Guard the screen so unauthenticated users are redirected to login.

---

### M-3 · Missing error handling in many places

**Files:** Multiple controllers and frontend screens

**Problem:**  
Many `catch` blocks are empty, log to console only, or swallow errors silently. Network failures and database errors produce no user-facing feedback.

**Examples:**
- `MealTrackerController.ts` — `details: error` leaks internal stack traces to the client.  
- `Gen_meals.tsx` — `catch (err)` falls back to mock data without notifying the user.  
- `ProfileControllers.ts` — returns generic `"Failed to fetch profile"` with no logging.

**Fix:**  
- Standardise error responses: `{ error: string, code?: string }`.  
- Never send raw `error` objects or stack traces to the client.  
- Show user-friendly `Alert` or toast messages in the frontend on failure.  
- Log errors server-side with a structured logger (e.g., `pino`).

---

### M-4 · Incomplete meal plan controller

**File:** `Backend_Server/src/Registrations/mealPlanController.ts`

**Problem:**  
The `getMealPlanByBmi` controller is either a stub or missing key logic, making the `/users/mealplan` endpoint non-functional.

**Fix:**  
- Implement the full query against `doctor_bmi_mealplans` filtered by `gender` and `bmi_range`.  
- Return a structured response with meal type, name, and kcal grouped by meal type.  
- Add input validation for the `gender` and `bmi` query parameters.

---

### M-5 · No input validation on backend

**Files:** All controllers in `Backend_Server/src/`

**Problem:**  
Request bodies and query parameters are used directly without validation or sanitisation. This allows malformed data into the database and opens the door to injection-style attacks.

**Fix:**  
- Add a validation library such as `zod` or `express-validator`.  
- Validate and sanitise all inputs at the route level before they reach controllers.  
- Return HTTP 400 with descriptive field-level error messages on validation failure.

---

## 🟡 Moderate

These issues degrade code quality, maintainability, or user experience but do not block core functionality.

---

### MOD-1 · Calorie goal and water target hardcoded

**Files:** `app/Meal_trackers/Gen_meals.tsx` (line ~13), `app/WaterFiles/waterintake.tsx`

**Problem:**  
`const DAILY_GOAL = 2000` and the water target are magic numbers baked into the UI. They ignore the user's actual goals stored in `user_goals`.

**Fix:**  
- Fetch the user's `daily_calorie_goal` and `daily_water_ml` from the `user_goals` table after login.  
- Store them in a `UserGoalsContext` or alongside the auth context.  
- Replace all magic-number constants with context values.

---

### MOD-2 · Profile model type mismatch

**File:** `Backend_Server/src/models/Profileuser.ts`

**Problem:**  
`height_cm` is declared as `DataTypes.INTEGER` in the Sequelize model but as `DECIMAL(5,2)` in the SQL schema. This causes silent truncation of decimal height values.

**Fix:**  
- Change the Sequelize definition to `DataTypes.DECIMAL(5, 2)` to match the schema.  
- After migrating to Supabase, ensure the PostgreSQL column is `NUMERIC(5,2)`.

---

### MOD-3 · No pagination on meal logs

**File:** `Backend_Server/src/Controllers/MealTrackerController.ts` — `getMealsByUser`

**Problem:**  
The query `SELECT * FROM meals WHERE user_id = ?` returns all meals ever logged with no limit. For active users this will grow unbounded, causing slow responses and excessive data transfer.

**Fix:**  
- Add `limit` and `offset` (or cursor-based) query parameters.  
- Default to returning the most recent 20 meals.  
- Return pagination metadata (`total`, `page`, `pageSize`) in the response envelope.

---

### MOD-4 · Navigation inconsistencies

**Files:** Various screens under `app/`

**Problem:**  
Some screens use `router.push(...)` while others use `router.replace(...)` or `router.back()` inconsistently. The back-stack behaviour is unpredictable, and some navigation targets are hardcoded strings that don't match the actual route structure.

**Fix:**  
- Audit all navigation calls and standardise on Expo Router's typed routes.  
- Use `router.replace` for auth transitions (login → home) to prevent back-navigation to the login screen.  
- Define route constants in a single `constants/routes.ts` file.

---

## 🔵 Minor

These issues affect code quality and developer experience but have no immediate user impact.

---

### MIN-1 · Overuse of `any` TypeScript type

**Files:** `Backend_Server/src/app.ts`, multiple controllers and frontend screens

**Problem:**  
`any` is used in error handlers, request parameters, and component props, defeating the purpose of TypeScript and hiding potential type errors.

**Fix:**  
- Enable `"strict": true` and `"noImplicitAny": true` in `tsconfig.json`.  
- Replace `any` with proper types: `unknown` for caught errors, typed interfaces for request bodies.

---

### MIN-2 · Hardcoded colors instead of theme constants

**Files:** Multiple screens under `app/`

**Problem:**  
Color values like `"#38B36A"`, `"#F4F6F8"`, `"#1C1C1E"` are repeated inline across many style sheets. A theme change requires a global find-and-replace.

**Fix:**  
- A `constants/theme.ts` file already exists — extend it with a full color palette.  
- Replace all inline hex values with references to `theme.colors.*`.

---

### MIN-3 · Missing loading states

**Files:** Several screens including `app/Others/UserProfile.tsx`, `app/WaterFiles/waterintake.tsx`

**Problem:**  
Some screens fetch data on mount but show no loading indicator, leaving the user staring at an empty screen until the request completes (or fails).

**Fix:**  
- Add an `isLoading` state to each data-fetching screen.  
- Show an `<ActivityIndicator>` while loading and an error state if the fetch fails.

---

### MIN-4 · No tests

**Files:** Entire codebase

**Problem:**  
There are no unit, integration, or end-to-end tests. Regressions from the Supabase migration or future changes cannot be caught automatically.

**Fix:**  
- Add `jest` + `ts-jest` for backend unit tests.  
- Add `jest` + `@testing-library/react-native` for frontend component tests.  
- Write at minimum: auth flow tests, meal CRUD tests, and profile upsert tests.  
- Add a CI step (GitHub Actions) that runs tests on every pull request.

---

### MIN-5 · Empty / placeholder README

**File:** `README.md` (root), `Backend_Server/README.md`

**Problem:**  
The root README contains only the default Expo template content. There is no setup guide, environment variable documentation, or architecture overview.

**Fix:**  
- Document: project overview, prerequisites, environment variable setup, how to run the backend, how to run the Expo app, and how to run tests.  
- Reference `.env.example` for required variables.

---

*End of fixes list.*
