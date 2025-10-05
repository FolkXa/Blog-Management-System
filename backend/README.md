# Blog Backend (Express + PostgreSQL)

## Requirements
- Node.js 18+
- PostgreSQL 13+

## Setup
1. Copy `.env.example` to `.env` and adjust values.
2. Create database specified in `DATABASE_URL` (e.g., `blog_db`).
3. Run the SQL in `src/migrations/init.sql` to create tables.
4. Install dependencies and start server.

```bash
npm install
npm run dev
```

Server runs on `http://localhost:${PORT}` (default 4000).

## API Summary
- Auth
  - POST `/api/auth/register` { username, email, password }
  - POST `/api/auth/login` { email, password }
- Posts
  - GET `/api/posts?search=&page=&limit=`
  - GET `/api/posts/:id`
  - POST `/api/posts` (Bearer token) { title, content }
  - PUT `/api/posts/:id` (owner) { title?, content? }
  - DELETE `/api/posts/:id` (owner)
- Comments
  - GET `/api/posts/:id/comments`
  - POST `/api/posts/:id/comments` (Bearer token) { content }

## Notes
- Passwords are hashed with bcrypt.
- JWT is used for authentication (7d expiry).
- Search uses PostgreSQL full-text search over title+content.
- Validation is handled with `zod` schemas.
