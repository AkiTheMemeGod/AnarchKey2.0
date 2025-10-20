<!-- .github/copilot-instructions.md - guidance for AI coding agents working on AnarchKey2.0 -->
# AnarchKey2.0 — Copilot / AI agent instructions

This repository is a simple split frontend/backend project (React + Vite frontend, Express + Mongoose backend). The goal of these notes is to give an AI coding agent the minimal, actionable context needed to be productive immediately.

Keep changes small and local by default. If you add new top-level behavior (routes, env vars, scripts), explicitly update README and package.json.

Key things to know
- Project layout
  - `backend/` — Node (ESM) server. Entrypoint: `backend/src/server.js`.
  - `backend/src/utils/db.js` — MongoDB connection helper (expects `process.env.MONGODB_URI`).
  - `backend/src/Models/` — Mongoose models: `User.js`, `Key.js`, `Project.js`.
  - `backend/src/Controllers/` and `backend/src/Routes/` exist but are empty in the current snapshot — route wiring in `server.js` expects controllers to be mounted at `/api/auth`, `/api/v1/key`, `/api/v1/project`.
  - `frontend/` — React + Vite app. Entrypoint: `frontend/src/main.jsx`. Dev via `npm run dev` in `frontend/`.

- Run & dev commands (what actually works today)
  - Backend: cd `backend` && npm run dev  (uses `nodemon src/server.js`). The server listens on port 5001 and allows CORS from `http://localhost:5173`.
  - Frontend: cd `frontend` && npm run dev (Vite dev server on port 5173 by default).
  - No test scripts present.

- Environment & persistence
  - Backend uses `dotenv`. Required env var: `MONGODB_URI`. Without it the backend will exit at startup.
  - Database models are Mongoose schemas in `backend/src/Models/*`. Relations use ObjectId refs (User -> Project -> Key).

Project-specific patterns & examples
- ESM modules throughout: source files use `import`/`export default`. Keep edits ESM-compatible and don't convert to CommonJS.
- Models:
  - `Key.js` shows a flat schema: { userId, project_name, api_key } and is exported as default. When adding fields, keep schema types and refs consistent.
  - `Project.js` stores `api_keys` as an array of objects with `api_key_id` referencing `Key` documents. Example lookup: populate `api_keys.api_key_id` to fetch actual key documents.
- Routes wiring: `server.js` mounts three route prefixes but the actual route files/controllers are not implemented in the snapshot. If you add routes, update `backend/src/Routes` and import them into `server.js` exactly as the three mount points.

Integration points & gotchas
- CORS is explicitly restricted to `http://localhost:5173` in `server.js`. If you run frontend on another host or port, update CORS config.
- `dotenv.config("./")` is used non-standardly (it normally takes no args or an object). Prefer `dotenv.config()` unless you intentionally override. Small safe refactor is acceptable but keep behavior identical.
- `package.json` (backend) exposes only `dev` script. Production/start scripts are absent.

Editing & contribution rules for AI agents
- Make minimal, well-scoped changes. For any API changes, update `backend/package.json` scripts or `frontend/README.md` as appropriate.
- When adding a new endpoint:
  1. Create route file under `backend/src/Routes/` and controller under `backend/src/Controllers/`.
  2. Export an Express Router from the route file and import it in `server.js` where the existing mount points are.
  3. Add/modify tests or at least a short usage note in `backend/README.md` (if added).
- Don't change port numbers or CORS origins silently — call out these changes in your commit message.

Examples (copy-paste ready)
- Wire a new router at `/api/v1/key` (place in `backend/src/Routes/keyRoutes.js`):

  ```js
  import express from 'express';
  import { createKey } from '../Controllers/keyController.js';
  const router = express.Router();
  router.post('/', createKey);
  export default router;
  ```

- In `server.js` import and mount it: `import keyRoutes from './Routes/keyRoutes.js'; app.use('/api/v1/key', keyRoutes);`

Quality gates
- Before finishing a change, run:
  - Backend: `cd backend && npm run dev` to verify server boots and DB connection (set `MONGODB_URI` to a test/local URI).
  - Frontend: `cd frontend && npm run dev` to verify the app compiles.
- Run lint in frontend: `cd frontend && npm run lint`.

When information is missing
- Controllers and Routes are empty. If you need to implement business logic, examine models in `backend/src/Models/` for field names and relationships; prefer to implement minimal, well-tested endpoints that mirror model shapes.

If you modify architecture
- Add a short note to this file describing the change and update README(s) so future agents can discover the new structure.

Questions for the maintainer (ask the user if unclear)
- Preferred MongoDB URI for local development and any seed data to create?
- Are there conventions for logging, error handling, or response shapes (e.g., { success: boolean, data, error })?

— End of instructions
