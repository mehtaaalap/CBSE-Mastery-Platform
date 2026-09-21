# Setup guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- `psql` CLI (or any Postgres client)

## 1. Database

Create a database and user, then load the schema:

```bash
psql -U postgres -c "CREATE DATABASE cbse_platform;"
psql -U postgres -c "CREATE USER cbse_user WITH PASSWORD 'cbse_pass';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE cbse_platform TO cbse_user;"
psql -U postgres -d cbse_platform -f database/schema.sql
```

This creates the 13 core tables: `users`, `schools`, `students`, `parents`,
`parent_student_links`, `subjects`, `chapters`, `topics`, `student_progress`,
`quiz_questions`, `quiz_attempts`, `quiz_attempt_answers`, `study_sessions`.

> Sprint 1 ships the schema without seed data for subjects/chapters/topics — the
> dashboard will show an empty state until curriculum content is loaded for a grade.

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
| --- | --- |
| `PORT` | Port the API listens on (default `5000`) |
| `DATABASE_URL` | Postgres connection string, e.g. `postgres://cbse_user:cbse_pass@localhost:5432/cbse_platform` |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_ORIGIN` | Frontend origin for CORS, e.g. `http://localhost:5173` |

Run it:

```bash
npm run dev
```

The API is now available at `http://localhost:5000/api`. Check `GET /api/health`
to confirm it's running.

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api/*` requests to the
backend (see `frontend/vite.config.js`).

## API overview

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | none | Create a `student` or `parent` account |
| POST | `/api/auth/login` | none | Log in, returns a JWT |
| GET | `/api/auth/me` | any | Current user's basic info |
| GET | `/api/students/me` | student | Student profile |
| PUT | `/api/students/me` | student | Update grade/school/DOB (onboarding) |
| GET | `/api/students/me/progress` | student | Per-subject mastery summary |
| GET | `/api/parents/me` | parent | Parent profile |
| PUT | `/api/parents/me` | parent | Update parent profile |
| POST | `/api/parents/students/link` | parent | Link a student by email |
| GET | `/api/parents/students` | parent | Linked students + progress summary |

All authenticated routes expect `Authorization: Bearer <token>`.
