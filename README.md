# Nested Comments MERN Starter

This workspace contains a minimal MERN-like starter for a nested comments UI demo.

Folders:
- backend: Express server with in-memory data, auth, comments API
- frontend: React (Vite) app with Login and nested comments UI

Run locally:
1. Start backend
   cd backend
   npm install
   npm run dev

2. Start frontend
   cd frontend
   npm install
   npm run dev

Login with provided users:
- alice@example.com / password
- bob@example.com / password

Notes:
- Backend uses a simple JWT with a hardcoded secret for demo only.
- Data is in-memory; restart server to reset comments.
