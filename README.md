# CBSE Mastery Platform

An adaptive learning platform for CBSE students (classes 6–12) with progress tracking,
topic-level mastery scoring, and a parent portal for monitoring a child's study activity.

## Sprint 1 scope

- **Auth**: email/password registration and login for `student` and `parent` roles, JWT-based sessions.
- **Student profile**: onboarding flow that captures grade, school, and board details, and a
  dashboard that shows per-subject mastery progress.
- **Parent portal**: parents link to a student account by email and view that student's
  progress summary.
- **Database**: normalized PostgreSQL schema (13 tables) covering users, academic structure
  (subjects → chapters → topics), quizzes, and progress/session tracking.

## Repository layout

```
backend/    Express API (JWT auth, student + parent routes)
frontend/   React 18 app (Vite) — onboarding, dashboard, parent portal
database/   PostgreSQL schema
docs/       Setup guide
```

## Quick start

See [docs/SETUP.md](docs/SETUP.md) for full setup instructions, including database
provisioning and environment variables.

```bash
# 1. database
psql -U postgres -f database/schema.sql

# 2. backend
cd backend && npm install && cp .env.example .env && npm run dev

# 3. frontend
cd frontend && npm install && npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend on
`http://localhost:5000`.

## Tech stack

- **Backend**: Node.js, Express, `pg`, `jsonwebtoken`, `bcryptjs`
- **Frontend**: React 18, React Router, Vite
- **Database**: PostgreSQL

## Roadmap (post-Sprint 1)

- Adaptive quiz engine and question bank authoring tools
- Notifications (email/push) for parents and students
- Teacher/school-admin role and classroom-level analytics
