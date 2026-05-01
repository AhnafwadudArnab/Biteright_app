# Design Document: Supabase Migration

## Overview

BiteRight currently runs a Node.js/Express backend that connects to a free-tier MySQL instance via Sequelize ORM, with credentials hardcoded in `Backend_Server/src/models/db.ts`. This migration replaces that entire data layer with Supabase — a managed PostgreSQL BaaS — while keeping the Express server as the API layer. The frontend (React Native / Expo) gains a configured Supabase JS client, JWT-based auth stored in SecureStore, and an `AuthContext` that eliminates the hardcoded `USER_ID = "demo-user-id"` constant.

The migration is purely a backend infrastructure and auth change. All existing HTTP route paths and response shapes are preserved so the frontend requires no API contract changes beyond adding the `Authorization` header.

### Key Design Decisions

- **Express is retained** as the API layer rather than calling Supabase directly from the app. This keeps business logic server-side, allows the service-role key to stay off the device, and makes future middleware additions (rate limiting, logging) straightforward.
- **Supabase service-role key on the backend** bypasses RLS so the Express server can act on behalf of any user. RLS still protects direct client access.
- **Supabase anon key on the frontend** is used only for the Supabase JS client (session persistence, optional direct queries). All sensitive operations go through Express.
- **bcrypt + custom JWT** rather than Supabase Auth. The existing `/users/register` and `/users/login` routes are preserved; Supabase Auth would require migrating the auth flow to the client, which is a larger change outside the migration scope.
- **`gen_random_uuid()`** replaces application-level `uuidv4()` calls for new rows, keeping UUID generation in the database.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App (Expo)                   │
│                                                             │
│  AuthContext ──► SecureStore (JWT + userId)                 │
│  lib/supabase.ts (anon key, ExpoSecureStoreAdapter)         │
│  serverhost.tsx  (reads EXPO_PUBLIC_SERVER_URL from .env)   │
│                                                             │
│  All API calls ──► Bearer JWT in Authorization header       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (REST)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express Server (Node.js / TS)               │
│                                                             │
│  app.ts                                                     │
│  ├── /users/register  (public)                              │
│  ├── /users/login     (public)                              │
│  ├── /users/mealplan  (public)                              │
│  ├── /api/profile     (authMiddleware)                      │
│  ├── /api/meals       (authMiddleware)                      │
│  └── /api/water       (authMiddleware)  [future]            │
│                                                             │
│  lib/supabase.ts  ──► createClient(URL, SERVICE_ROLE_KEY)   │
│  middleware/auth.ts ──► verifyJWT → req.user.id             │
└──────────────────────────┬──────────────────────────────────┘
                           │ @supabase/supabase-js (service-role)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Project                          │
│                                                             │
│  PostgreSQL database                                        │
│  ├── users, profileUser, foods, meals, meal_items           │
│  ├── water_intake, daily_nutrition_summary                  │
│  ├── diet_plans, user_diet_plans, motivation_logs           │
│  ├── bmi_records, doctor_bmi_mealplans                      │
│  └── RLS policies on user-owned tables                      │
└─────────────────────────────────────────────────────────────┘
```

### Request Lifecycle (authenticated)

1. App reads JWT from SecureStore, attaches `Authorization: Bearer <token>`.
2. Express `authMiddleware` verifies the JWT signature and expiry using `JWT_SECRET`.
3. Decoded `{ id, email }` is attached to `req.user`.
4. Route handler calls `supabase.from('table').select(...)` using the service-role client.
5. Supabase returns data; handler shapes the response and sends it.

---

## Components and Interfaces

### Backend: `Backend_Server/src/lib/supabase.ts`

Single shared Supabase client using the service-role key. Instantiated once at module load; all controllers import from here.

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Backend: `Backend_Server/src/middleware/auth.ts`

JWT verification middleware. Reads `JWT_SECRET` from environment. Attaches `req.user` on success; returns 401 on failure.

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };
    req.user = { id: payload.id };
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
```

### Backend: `Backend_Server/src/Registrations/userController.ts` (refactored)

- `registerUser`: hash password with `bcrypt.hash(password, 12)`, insert into `users` via Supabase client, create `profileUser` row.
- `loginUser`: fetch user by email, `bcrypt.compare(password, hash)`, sign JWT with `{ id, email }` and 7-day expiry.

### Backend: Controllers (refactored)

All Sequelize `Model.*` calls and raw `db.query(...)` calls are replaced with the Supabase client pattern:

```typescript
// Before (Sequelize)
const meals = await db.query('SELECT * FROM meals WHERE user_id = ?', { replacements: [user_id], type: QueryTypes.SELECT });

// After (Supabase)
const { data: meals, error } = await supabase.from('meals').select('*').eq('user_id', user_id).order('eaten_at', { ascending: false });
if (error) return next(error);
```

Error propagation: when `error` is non-null, pass it to `next(error)` so the Express error handler returns a 500.

### Frontend: `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { storage: ExpoSecureStoreAdapter, autoRefreshToken: true, persistSession: true } }
);
```

### Frontend: `app/AuthContext.tsx`

```typescript
interface AuthState {
  user: { id: string; email: string; name?: string } | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
```

- On mount, reads JWT from SecureStore; if present and not expired, restores session.
- `login()`: calls `/users/login`, stores JWT + user object in SecureStore, updates context state.
- `logout()`: deletes JWT from SecureStore, resets state to unauthenticated.
- Wraps the root layout so all screens can call `useAuth()`.

### Frontend: `app/serverhost.tsx` (refactored)

```typescript
import Constants from 'expo-constants';
export const SERVER_URL = Constants.expoConfig?.extra?.serverUrl ?? process.env.EXPO_PUBLIC_SERVER_URL ?? 'http://localhost:3000';
```

The hardcoded IP is removed. The URL is read from `EXPO_PUBLIC_SERVER_URL` in `.env`.

---

## Data Models

### PostgreSQL Schema (Supabase)

The MySQL schema is recreated with these PostgreSQL-specific changes:

| MySQL construct | PostgreSQL equivalent |
|---|---|
| `CHAR(36)` UUID PK | `uuid DEFAULT gen_random_uuid()` |
| `ENUM(...)` | `TEXT CHECK (col IN (...))` |
| `AUTO_INCREMENT INT` | `SERIAL` |
| `DATETIME` | `TIMESTAMPTZ` |
| `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | `TIMESTAMPTZ DEFAULT now()` |
| `UNIQUE KEY name (a, b)` | `UNIQUE (a, b)` |

#### Core tables

```sql
-- users
CREATE TABLE users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    TEXT NOT NULL,           -- bcrypt hash
  name        VARCHAR(100),
  age         INT,
  gender      VARCHAR(20),
  height_cm   INT,
  weight_kg   DECIMAL(5,2),
  activity_level VARCHAR(50),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- profileUser
CREATE TABLE "profileUser" (
  user_id         uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  gender          TEXT CHECK (gender IN ('male','female','other')),
  age             INT,
  avatar          VARCHAR(255),
  height_cm       DECIMAL(5,2) DEFAULT 0,
  start_weight_kg DECIMAL(5,2) DEFAULT 0,
  current_weight_kg DECIMAL(5,2) DEFAULT 0,
  target_weight_kg  DECIMAL(5,2) DEFAULT 0,
  goal            TEXT CHECK (goal IN ('Weight Loss','Weight Gain','Maintain Weight'))
                  DEFAULT 'Maintain Weight',
  diet            TEXT,   -- JSON string
  activity        TEXT    -- JSON string
);

-- foods (public read, no user_id)
CREATE TABLE foods (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(255) NOT NULL,
  calories     INT NOT NULL,
  protein_g    DECIMAL(5,2),
  carbs_g      DECIMAL(5,2),
  fats_g       DECIMAL(5,2),
  serving_size VARCHAR(100)
);

-- meals
CREATE TABLE meals (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES users(id) ON DELETE CASCADE,
  meal_type  VARCHAR(50),
  eaten_at   TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- meal_items
CREATE TABLE meal_items (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id  uuid REFERENCES meals(id) ON DELETE CASCADE,
  food_id  uuid REFERENCES foods(id),
  quantity DECIMAL(5,2),
  calories INT
);

-- water_intake
CREATE TABLE water_intake (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid REFERENCES users(id) ON DELETE CASCADE,
  amount_ml INT NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- daily_nutrition_summary
CREATE TABLE daily_nutrition_summary (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES users(id) ON DELETE CASCADE,
  date           DATE NOT NULL,
  total_calories INT,
  protein_g      DECIMAL(6,2),
  carbs_g        DECIMAL(6,2),
  fats_g         DECIMAL(6,2),
  UNIQUE (user_id, date)
);

-- diet_plans (public read)
CREATE TABLE diet_plans (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(100),
  description    TEXT,
  calorie_target INT,
  duration_days  INT
);

-- user_diet_plans
CREATE TABLE user_diet_plans (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES users(id) ON DELETE CASCADE,
  diet_plan_id uuid REFERENCES diet_plans(id),
  start_date   DATE,
  end_date     DATE
);

-- motivation_logs
CREATE TABLE motivation_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES users(id) ON DELETE CASCADE,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- bmi_records
CREATE TABLE bmi_records (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bmi_value   DECIMAL(4,2) NOT NULL,
  category    TEXT NOT NULL CHECK (category IN (
                'severely_underweight','underweight','normal','overweight','obese')),
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- doctor_bmi_mealplans (public read, seeded reference data)
CREATE TABLE doctor_bmi_mealplans (
  id             SERIAL PRIMARY KEY,
  gender         VARCHAR(10) NOT NULL,
  bmi_range      VARCHAR(20) NOT NULL,
  category       VARCHAR(50),
  daily_calories INT,
  doctor_focus   TEXT,   -- JSON array string
  meal_type      VARCHAR(20),
  meal_name      VARCHAR(255),
  meal_kcal      INT
);
```

#### Seed data note

The `doctor_bmi_mealplans` table is seeded with all 55 rows from `Database/All_database_Schemas.sql`. The `diet_plans`, `foods`, `meals`, and `meal_items` seed rows from the SQL file are also migrated. Because `diet_plans` uses string IDs like `'male-10-10.9'` in the MySQL seed, those rows are inserted with explicit `id` values cast to `uuid` — or, since they are non-UUID strings, the `diet_plans.id` column is kept as `TEXT PRIMARY KEY` for the seeded reference rows. A cleaner approach is to re-seed `diet_plans` with proper UUIDs and update the foreign keys accordingly; this is handled in the migration script.

### Environment Variables

#### `Backend_Server/.env` (never committed)

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
JWT_SECRET=<random-256-bit-secret>
PORT=3000
```

#### `Backend_Server/.env.example` (committed)

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=your-jwt-secret-here
PORT=3000
```

#### `.env` (root, Expo — never committed)

```
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
EXPO_PUBLIC_SERVER_URL=http://<your-lan-ip>:3000
```

#### `.env.example` (root, committed)

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_SERVER_URL=http://192.168.x.x:3000
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Password hashing is irreversible and verifiable

*For any* plaintext password string, the bcrypt hash produced during registration SHALL NOT equal the original plaintext, and `bcrypt.compare(plaintext, hash)` SHALL return `true`.

**Validates: Requirements 6.1, 6.2**

### Property 2: Wrong password is always rejected

*For any* registered user and *any* string that differs from their registered password, `bcrypt.compare(candidate, storedHash)` SHALL return `false`, and the login endpoint SHALL return HTTP 401.

**Validates: Requirements 6.4**

### Property 3: JWT round-trip preserves user identity

*For any* user `{ id, email }`, signing a JWT with `JWT_SECRET` and then verifying it SHALL produce a decoded payload where `payload.id === id` and `payload.email === email`.

**Validates: Requirements 7.1, 7.4**

### Property 4: Expired or tampered JWT is always rejected

*For any* JWT that has either (a) an expiry in the past or (b) a signature produced with a different secret, `authMiddleware` SHALL return HTTP 401 and SHALL NOT call `next()`.

**Validates: Requirements 7.2, 7.3**

### Property 5: Meal ownership is preserved through add-then-fetch

*For any* authenticated user and *any* valid meal payload, adding a meal and then fetching meals for that user SHALL include the newly added meal in the response, and the returned meal SHALL have `user_id` equal to the authenticated user's `id`.

**Validates: Requirements 5.1, 8.2**

### Property 6: Profile upsert is idempotent

*For any* user and *any* valid profile payload, calling the upsert endpoint twice with the same payload SHALL result in exactly one `profileUser` row for that user, and the row's fields SHALL match the payload.

**Validates: Requirements 5.2**

### Property 7: BMI meal plan lookup returns consistent structure

*For any* `(gender, bmi)` pair that falls within a defined range in `doctor_bmi_mealplans`, the `/users/mealplan` endpoint SHALL return a response containing `bmi_range`, `category`, `dailyCalories`, `doctorFocus` (a non-empty array), and `meals` (a non-empty array of `{ type, name, kcal }`).

**Validates: Requirements 5.3, 3.5**

---

## Error Handling

### Backend

| Scenario | HTTP status | Response body |
|---|---|---|
| Missing `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` at startup | — | Process exits with code 1 after logging error |
| Supabase client returns `error` object | 500 | `{ error: error.message }` via `next(error)` |
| JWT absent or malformed | 401 | `{ message: "Unauthorized" }` |
| JWT expired | 401 | `{ message: "Unauthorized" }` |
| bcrypt comparison fails | 401 | `{ message: "Invalid credentials" }` |
| Email already registered | 409 | `{ message: "Email already registered" }` |
| Required fields missing | 400 | `{ message: "All fields are required" }` |
| Row not found | 404 | `{ message: "<entity> not found" }` |

The global Express error handler in `app.ts` catches anything passed to `next(error)` and returns `{ error: "Something went wrong!" }` with status 500, preventing stack traces from leaking to clients.

### Frontend

- Network errors during login/register surface as user-visible error messages (already implemented in `login.tsx` and `signup.tsx`).
- If SecureStore read fails on app launch, `AuthContext` treats the user as unauthenticated and redirects to login.
- All authenticated API calls check `response.ok`; a 401 triggers `logout()` to clear stale tokens and redirect to login.

---

## Testing Strategy

### Unit Tests

Focus on pure logic that can be tested without a live Supabase instance:

- `authMiddleware`: valid token → `req.user` set; missing/expired/tampered token → 401.
- `userController.registerUser`: duplicate email → 409; missing fields → 400; successful registration → 201 with no password in response.
- `userController.loginUser`: wrong password → 401; correct password → 200 with JWT.
- `AuthContext`: login stores token; logout clears token; unauthenticated state redirects.

Use `jest` with `ts-jest` for the backend. Mock `@supabase/supabase-js` and `bcrypt` where needed to keep tests fast and deterministic.

### Property-Based Tests

Use `fast-check` (TypeScript-compatible) for the backend. Each property test runs a minimum of 100 iterations.

- **Property 1 & 2** — bcrypt correctness: generate arbitrary non-empty strings as passwords, verify hash/compare round-trip and rejection of wrong passwords.
  - Tag: `Feature: supabase-migration, Property 1: Password hashing is irreversible and verifiable`
  - Tag: `Feature: supabase-migration, Property 2: Wrong password is always rejected`

- **Property 3 & 4** — JWT round-trip and rejection: generate arbitrary `{ id: uuid, email: string }` payloads, sign and verify; also generate expired tokens and tokens signed with wrong secrets.
  - Tag: `Feature: supabase-migration, Property 3: JWT round-trip preserves user identity`
  - Tag: `Feature: supabase-migration, Property 4: Expired or tampered JWT is always rejected`

- **Property 5** — Meal ownership: mock the Supabase client; generate arbitrary user IDs and meal payloads; verify the returned meals all carry the correct `user_id`.
  - Tag: `Feature: supabase-migration, Property 5: Meal ownership is preserved through add-then-fetch`

- **Property 6** — Profile upsert idempotence: mock Supabase; call upsert twice with the same payload; assert single row and correct field values.
  - Tag: `Feature: supabase-migration, Property 6: Profile upsert is idempotent`

- **Property 7** — BMI plan structure: generate `(gender, bmi)` pairs within defined ranges; assert response shape invariants.
  - Tag: `Feature: supabase-migration, Property 7: BMI meal plan lookup returns consistent structure`

### Integration Tests

Run against a real Supabase project (or a local Supabase instance via `supabase start`):

- Schema migration script completes without errors on a fresh project.
- Row counts in Supabase match exported MySQL counts after data migration.
- RLS policies: anon key cannot read `meals` rows belonging to another user.
- Full register → login → add meal → fetch meals flow.

### Migration Verification

After running the migration script:

1. Count rows in each table in MySQL.
2. Count rows in each corresponding Supabase table.
3. Assert counts match (automated in the migration script's verification step).
4. Spot-check 5 random rows per table for field-level correctness.
