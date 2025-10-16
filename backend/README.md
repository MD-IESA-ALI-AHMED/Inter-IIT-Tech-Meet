# Backend - Nested Comments (MERN-style)

This backend is a small Express + MongoDB API for a nested comments demo.

Quick start

1. Copy environment variables:

   cp .env.example .env

2. Install dependencies

   npm install

3. Start a local MongoDB (or use a hosted URI) and update `.env`.

4. Seed sample users/comments (optional):

   npm run seed

5. Start server in dev mode:

   npm run dev

API endpoints

- POST /api/register { name, email, password }
- POST /api/login { email, password } -> { token, user }
- GET /api/comments -> nested comments
- POST /api/comments { text, parent_id } (auth required)
- POST /api/comments/:id/vote { value: 1|-1 } (auth required) - toggles/switches user vote

Notes

- JWT secret: set `JWT_SECRET` in .env for production.
- Data is persisted to MongoDB via Mongoose models in `models/`.
