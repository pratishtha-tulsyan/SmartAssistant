# Disaster Preparedness and Response Education System (DPRES)

A full-stack web platform for schools and colleges to educate students, teachers, and administrators on life-saving disaster response protocols — featuring learning modules, quizzes, leaderboards, emergency alerts, incident reporting, and emergency contacts.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/disaster-prep run dev` — run the frontend (dynamic port via $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Auth: Clerk (whitelabel, Replit-managed)
- Frontend: React 19 + Vite + Tailwind v4 + shadcn/ui + Wouter + TanStack Query
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all endpoints)
- `lib/db/src/schema/` — Drizzle DB schema (users, modules, quizzes, alerts, incidents, emergency_contacts)
- `lib/api-client-react/src/generated/api.ts` — Generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — Generated Zod schemas for server validation
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/auth.ts` — requireAuth, requireRole, getOrCreateUser helpers
- `artifacts/disaster-prep/src/` — React frontend
- `artifacts/disaster-prep/src/pages/` — All page components
- `artifacts/disaster-prep/src/components/layout.tsx` — Sidebar layout with role-aware nav

## Architecture decisions

- Contract-first API: OpenAPI spec drives both Zod server validation and React Query client hooks via Orval codegen
- Clerk auth proxied through the API server via `clerkProxyMiddleware` so the frontend uses a single origin
- User roles (student/teacher/admin) stored in PostgreSQL alongside Clerk user IDs — Clerk handles identity, DB handles authorization
- All routes are protected via `requireAuth` middleware; role-gating done with `requireRole(...roles)`
- Wouter used instead of React Router for lightweight routing; base path support for monorepo proxy

## Product

- **Landing page** — public home with platform overview and CTAs
- **Auth** — Clerk-powered sign-in/sign-up with custom "System Access" branding
- **Dashboard** — role-aware metrics (student progress vs admin overview)
- **Learning Modules** — browse and read disaster preparedness content (earthquake, flood, fire, cyclone, etc.)
- **Quizzes** — take interactive quizzes with scored results
- **Leaderboard** — ranked quiz scores across all students
- **Alerts** — active emergency alerts (admins can broadcast, students can view)
- **Incident Reporting** — report emergencies with status tracking
- **Emergency Contacts** — nationwide and city-level emergency contact directory
- **Admin Panel** — CRUD management for users, modules, and quizzes

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do not run `pnpm dev` at workspace root — use workflow restart or `pnpm --filter` instead
- After changing OpenAPI spec, always run `pnpm --filter @workspace/api-spec run codegen`
- After changing DB schema, run `pnpm --filter @workspace/db run push`
- Clerk proxy middleware must remain in `app.ts` before all other routes
- `VITE_CLERK_PROXY_URL` is intentionally empty in dev (proxy handled server-side)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk configuration details
