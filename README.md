# BiteRight App

A React Native (Expo) nutrition and meal tracking app backed by a Node.js/Express API and Supabase (PostgreSQL).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile app | Expo / React Native (Expo Router) |
| Backend API | Node.js + Express + TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (issued by backend) + SecureStore (mobile) |

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/AhnafwadudArnab/Biteright_app.git
cd Biteright_app
```

### 2. Configure frontend environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
EXPO_PUBLIC_SERVER_URL=http://<your-local-ip>:3000
```

### 3. Configure backend environment

```bash
cp Backend_Server/.env.example Backend_Server/.env
```

Edit `Backend_Server/.env` and fill in your values:

```env
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
JWT_SECRET=<a-long-random-secret>
PORT=3000
```

> **Never commit `.env` files.** The `.gitignore` already excludes them.

### 4. Run the database migration

1. Open your [Supabase project](https://supabase.com/dashboard) → SQL Editor
2. Paste and run the contents of `Database/supabase_migration.sql`

This creates all tables, enables Row Level Security, and seeds the `doctor_bmi_mealplans` reference data.

### 5. Install dependencies

```bash
# Frontend (workspace root)
npm install

# Backend
cd Backend_Server && npm install
```

### 6. Start the backend

```bash
# In Backend_Server/
npm start
```

The API will be available at `http://localhost:3000`.

### 7. Start the Expo app

```bash
# In workspace root
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

---

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab navigator screens
│   ├── AuthContext.tsx     # JWT auth state (login / logout / session restore)
│   ├── login_signup/       # Login & signup screens
│   ├── Meal_trackers/      # Meal logging screens
│   ├── Dietplans/          # Diet plan screens
│   ├── WaterFiles/         # Water intake screen
│   └── serverhost.tsx      # Environment-driven API base URL
├── lib/
│   └── supabase.ts         # Frontend Supabase client (anon key + SecureStore)
├── Backend_Server/
│   └── src/
│       ├── app.ts          # Express app entry point
│       ├── lib/supabase.ts # Backend Supabase client (service-role key)
│       ├── middleware/auth.ts  # JWT verification middleware
│       ├── Controllers/    # Meal tracker & profile routes/controllers
│       └── Registrations/  # User auth, diet meal, meal item, meal plan controllers
├── Database/
│   ├── supabase_migration.sql  # Full schema + RLS + seed data
│   └── All_database_Schemas.sql
└── .env.example            # Frontend env template
```

---

## Authentication Flow

1. User registers → backend hashes password with bcrypt, inserts into `users` + `profileUser`
2. User logs in → backend verifies password, issues a 7-day JWT
3. Mobile app stores JWT in `expo-secure-store`; `AuthContext` restores it on app launch
4. All protected API routes require `Authorization: Bearer <token>`

---

## Environment Variables Reference

### Frontend (`.env.local`)

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `EXPO_PUBLIC_SERVER_URL` | Base URL of the backend API |

### Backend (`Backend_Server/.env`)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (keep secret!) |
| `JWT_SECRET` | Secret used to sign/verify JWTs |
| `PORT` | Port the Express server listens on (default: 3000) |
