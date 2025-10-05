# Blog Management System

Tech Stack: React (Vite) + Node.js (Express) + PostgreSQL

## Features
- Register/Login with validation (username length, unique email, password length)
- JWT authentication
- Blog CRUD (owner-only update/delete)
- List posts with search and pagination
- Show author and created date on list and detail
- Comments on post detail (authenticated users)

## Project Structure
- `backend/` Express API server with PostgreSQL
- `frontend/` React app (Vite)

## Prerequisites
- Node.js 18+
- PostgreSQL 13+

## 1) Backend Setup
1. Create `.env` from example

```bash
cp backend/.env.example backend/.env
```

2. Create database (example using psql)

```sql
CREATE DATABASE blog_db;
```

3. Initialize schema (choose one)
- Option A (script):

```bash
cd backend
npm install
npm run db:init
```

- Option B (manual): run SQL in `backend/src/migrations/init.sql` using your SQL client

4. Start the API

```bash
npm run dev
```

API runs at `http://localhost:4000` with base path `/api`.

## 2) Frontend Setup
1. Install deps and start dev server

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

Optional: create `frontend/.env` to override API base

```
VITE_API_URL=http://localhost:4000/api
```

## API Summary
- Auth
  - POST `/api/auth/register` { username, email, password }
  - POST `/api/auth/login` { email, password }
- Posts
  - GET `/api/posts?search=&page=&limit=`
  - GET `/api/posts/:id`
  - POST `/api/posts` (Bearer) { title, content }
  - PUT `/api/posts/:id` (owner) { title?, content? }
  - DELETE `/api/posts/:id` (owner)
- Comments
  - GET `/api/posts/:id/comments`
  - POST `/api/posts/:id/comments` (Bearer) { content }

## Run with Docker (recommended)

You can run Postgres, Backend, and Frontend with Docker using the provided `docker-compose.yml` and `Makefile`.

Prerequisites:
- Docker Desktop

Common commands:
- Build all images
  - `make build`
- Start services in background
  - `make up`
- Check status
  - `make ps`
- Tail logs
  - `make logs` (Ctrl+C to stop tailing)
- Initialize DB schema (runs `backend/src/migrations/init.sql`)
  - `make db-init`
- Seed sample data (clears users/posts/comments then inserts samples)
  - `make db-seed`
- Stop services
  - `make down`
- Danger: remove containers and volumes (deletes DB data)
  - `make clean`

Service URLs:
- Backend API: http://localhost:4000/api (health: `/health`)
- Frontend: http://localhost:5173

Notes:
- Compose defines Postgres credentials (user: `postgres`, pass: `postgres`, db: `blog_db`) and maps port 5432.
- Backend container uses `DATABASE_URL=postgres://postgres:postgres@db:5432/blog_db` and `CORS_ORIGIN=http://localhost:5173`.
- Frontend image is built with `VITE_API_URL=http://localhost:4000/api`.

## Environment variables

Backend `.env` (copy from `backend/.env.example`):
- `PORT` (default 4000)
- `DATABASE_URL` (e.g., local Postgres or managed provider URI)
- `JWT_SECRET` (use a strong random string in production)
- `CORS_ORIGIN` (frontend origin, e.g., http://localhost:5173 or your Netlify domain)
- Optional for hosted Postgres providers: `DATABASE_SSL=true` (if you re-enable SSL handling in `src/db/pool.js`)

Frontend `.env` (optional):
- `VITE_API_URL` (defaults to `http://localhost:4000/api` in local dev). In production set to your deployed backend, e.g., `https://your-backend.onrender.com/api`.

## Notes
- Set `CORS_ORIGIN` in backend `.env` if your frontend runs on a different origin.
- Update `DATABASE_URL` and `JWT_SECRET` in backend `.env` for your environment.
