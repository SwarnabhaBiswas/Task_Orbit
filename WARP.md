# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Monorepo with a React (Vite) frontend and a Node/Express + MongoDB backend.
- Backend uses Mongoose models, JWT-based auth (bearer token), CORS, and a simple tasks/projects data model with a seed script.
- Frontend uses axios with an interceptor for auth, React Router protection, and Tailwind-styled components.

Setup and common commands

Backend (Node/Express)
- Install: cd backend && npm install
- Dev server (with reload): npm run dev
- Start (prod mode): npm start
- Seed database: npm run seed
- Required env (backend/.env)
  - MONGO_URI=mongodb://localhost:27017/task_orbit (example)
  - PORT=3000 (default if unset)
  - JWT_SECRET=change-me
  - CORS_ORIGIN=http://localhost:5173 (comma-separated allowed)

Frontend (Vite React)
- Install: cd frontend && npm install
- Dev server: npm run dev
- Build: npm run build
- Preview built app: npm run preview
- Lint: npm run lint
- Optional env (frontend/.env)
  - VITE_API_URL=http://localhost:3000

Run the full stack locally
1) Ensure MongoDB is running and create backend/.env as above.
2) Start backend: cd backend && npm run dev
3) Start frontend: cd frontend && npm run dev

Notes on tests
- No test scripts or frameworks are configured in either package.json. Single-test/run commands are therefore not applicable at this time.

High-level architecture

Backend
- Entry: backend/server.js
  - Loads env via dotenv, sets up express.json and CORS with credentials enabled.
  - CORS_ORIGIN can be a comma-separated list; falls back to "*" if not set.
  - Connects to MongoDB using MONGO_URI.
  - Attaches authMiddleware that decodes a JWT from Authorization: Bearer <token> and sets req.user if valid; requireAuth middleware enforces authentication.
- Enhanced Routes
  - Auth: signup, login with fullName support
  - Tasks: CRUD operations with team filtering, status updates, timer functionality (isRunning field)
  - Teams: full CRUD, member management (add/remove), team-based task filtering
  - Notifications: create custom posts, fetch team notifications, mark as read
  - User management: profile updates, password changes, account deletion
  - Assignment: get users for dropdowns, assign tasks to users/teams
- Data models (backend/models)
  - User: email, username, fullName, passwordHash, role, isActive.
  - Team: name, slug, description, members, createdBy.
  - Project: name, slug, description, ownerTeam | ownerUser, status, visibility.
  - Task: project, title, description, status, priority, assigneeUser, assigneeTeam, reporter, dueDate, dueText, tags, notification, timeTracked, isRunning.
  - Comment: task, body, author, isDeleted.
  - Notification: type, message, user, targetUser, team, task, isRead, isGlobal.
- Seed script: backend/seed.js
  - Purges collections and inserts sample users, teams, projects, tasks, and comments; demonstrates populate joins.

Frontend
- Vite + React app in frontend/
  - Axios service (src/services/api.js) uses baseURL from VITE_API_URL or http://localhost:3000 and injects Authorization from localStorage token.
  - AuthContext (src/context/AuthContext.jsx) stores token and user in localStorage; provides login/logout; App.jsx shows Auth page first if no token.
  - Enhanced Dashboard (src/pages/Dashboard.jsx) with team dropdown filtering, redesigned layout with calendar + timer sidebar, scrollable task section with status editing, timer controls.
  - Notifications (src/pages/Notifications.jsx) displays activity feed and allows custom posts to teams.
  - Settings (src/pages/Settings.jsx) comprehensive account management: password change, team creation/management, account deletion.
  - Enhanced Navbar (src/components/Navbar.jsx) with functional profile modal (logout, email change), enhanced task creation modal (custom dates, assignments, notifications).
  - Task Management: editable status dropdowns, checkbox completion, timer start/stop, real-time status updates.
  - Team Features: admin/member roles, add/remove members, team-based task filtering, leave team functionality.
  - ESLint configured via eslint.config.js; Tailwind is configured via tailwind.config.js and applied across components.

Integration nuances and gotchas
- Port and CORS: Backend defaults to PORT=3000 and allows CORS from CORS_ORIGIN; set CORS_ORIGIN to your frontend dev URL (e.g., http://localhost:5173) to avoid CORS issues.
- Frontend base URL: Set VITE_API_URL to the backend URL when running locally or in other environments.
- Auth flow: Only POST /api/tasks requires a valid JWT; list endpoints allow anonymous reads. The axios interceptor will add the token automatically if present in localStorage.
- Status values: Frontend Kanban expects different status strings than the backend emits. Normalize if you rely on Kanban columns.
