<!--
Guidance file for AI coding agents working on the Piggy-Bank-AI repository.
Keep this concise (~20-50 lines). Include pointers to architecture, key files,
conventions, scripts, and integration points discovered in the codebase.
-->

# Copilot / AI Agent Instructions — Piggy-Bank-AI

Goal: Help a coding agent be immediately productive in this repository. Follow these
project-specific notes, patterns and examples — avoid making non-discoverable
assumptions.

- Big picture
  - Monorepo-like layout: a Vite + React frontend at the repo root and an
    Express + TypeScript backend under `backend/` using Prisma for DB access.
  - Frontend (client) serves UI at `src/` (Vite dev server on port 5173). Backend
    API serves REST endpoints on `backend/src` (default port 3001).
  - AI integration is implemented server-side in `backend/src/services/aiService.ts`.

- Important files & entry points
  - Frontend: `src/main.tsx`, `src/App.tsx`, components in `src/components/`.
  - Backend entry: `backend/src/index.ts` (Express app wiring, middleware, routes).
  - AI integration: `backend/src/services/aiService.ts` — contains Gemini client
    usage, model discovery logic, and two primary methods: `chat()` and
    `generateFinancialInsights()`.
  - DB layer: `backend/prisma/schema.prisma` + Prisma client used in
    `backend/src/config/database.ts` and throughout controllers.
  - Routes & controllers: `backend/src/routes/*.ts` -> `backend/src/controllers/*.ts`.

- Environment & secrets (do not hardcode)
  - Backend expects `.env` values (see `backend/env.example`). The most
    important for AI features: `GEMINI_API_KEY` and optionally `GEMINI_MODEL`.
  - Other env vars: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`.

- Developer workflows & scripts (explicit)
  - Frontend
    - Install & dev: `npm install` then `npm run dev` (Vite). Files: `package.json` (root).
  - Backend
    - Install & dev: `cd backend && npm install && npm run dev` (nodemon + tsx).
    - DB tasks: `npm run db:generate`, `npm run db:push`, `npm run db:migrate`, `npm run db:seed`.
    - AI debugging: `npm run test:ai` runs `backend/src/scripts/testAI.ts` to exercise AI calls.

- Project-specific conventions & patterns
  - Validation: Zod is used in route validation middleware (`backend/src/middleware/validation.ts`).
  - Auth: JWT is used; controllers expect `Authorization: Bearer <token>` for protected routes.
  - Prisma usage: controllers and services use `prisma.<model>` helpers directly (no repository layer).
  - AI responses: `aiService.generateInsightsWithGemini()` attempts to parse JSON from model text
    — the model prompt requests a JSON array. Be conservative when modifying parsing logic.

- Editing & testing AI features
  - When changing prompts or model logic, update `backend/src/services/aiService.ts` and
    run `npm run test:ai` to validate the call flow. Watch for errors about missing API keys,
    rate limits, or model-not-found which are explicitly handled in the file.
  - Model discovery: the code falls back to dynamic discovery via Google Generative API
    if configured models fail; don't remove this recovery path without providing an
    alternate discovery strategy.

- Examples to reference when making changes
  - To find where AI results are shown in the UI: `src/components/AIInsights.tsx`.
  - To see how the backend endpoint is exposed: `backend/src/routes/insights.ts` -> `backend/src/controllers/insightsController.ts`.

- Safety & integration notes
  - Do not commit real secrets (`GEMINI_API_KEY`, `DATABASE_URL`) into the repo.
  - Keep prompt changes minimal and test locally with `npm run dev` (backend) and
    `npm run dev` (root) running simultaneously. CORS is configured; default
    `CORS_ORIGIN` is `http://localhost:5173`.

- When you are unsure
  - Prefer reading the controller + route pair before changing API shape.
  - If a change affects database models, update `prisma/schema.prisma`, run
    `npm run db:generate`, and either `db:push` or `migrate` depending on the change.
  - If modifying the AI prompt or JSON parsing, include a unit-like script under
    `backend/src/scripts/` to exercise the change and update `test:ai` if helpful.

If anything here is unclear or you need more examples (route signatures, sample payloads,
or typical responses), say which area you'd like expanded and I will update this file.
