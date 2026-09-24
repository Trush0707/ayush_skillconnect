# Rules.md — Standing Rules for This Workspace

These apply to every task in this project. Read Prd.md, Techspec.md, AppFlow.md, Schema.md, and Design.md before generating any code — do not invent structure that isn't specified in these files.

## Hard Constraints
1. **Stack is locked**: Next.js (App Router) as a single full-stack app — React for the frontend, Next.js Route Handlers (`app/api/...`) for the backend logic that needs to run server-side (see Techspec.md). There is no separate Express server or second backend service. PostgreSQL via Supabase, Supabase Auth. Do not introduce a different database, a different auth provider, a standalone Express/Node server, the Pages Router, or React Native.
2. **Zero budget**: free-tier services only. No paid infrastructure, no Docker/Kubernetes, no enterprise cloud. One Vercel deployment covers both frontend and API — do not stand up a second hosting service for a backend.
3. **Matching must be deterministic and explainable** — implement exactly the formula in Techspec.md. Never use a trained ML model, embeddings, or any approach that can't have its reasoning printed as text.
4. **Row-Level Security is mandatory on every table.** A table created without RLS enabled and a real, tested policy is an incomplete task, not a shortcut. Default-open or missing RLS is a critical error — verify each policy actually restricts access, don't just check that a policy exists.
5. **Follow Schema.md exactly** for table/column names. Do not rename fields or restructure tables without updating Schema.md first — the schema doc is the source of truth, not whatever's fastest to generate.

## Security & Secrets (non-negotiable)
14. **Zero-secret exposure**: no database passwords, `SUPABASE_SERVICE_ROLE_KEY`, or direct Postgres connection strings in client-side code, any file shipped to the browser, or committed assets. `SUPABASE_SERVICE_ROLE_KEY` is used only inside `app/api` Route Handlers (see `server.ts`).
15. **Env file isolation**: all secrets live in `.env.local`. Verify `.env*` is present in `.gitignore` (Next.js includes this by default via `create-next-app`) before the first commit — don't assume, check the actual file.
16. **Public client keys only**: client components may reference only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Next.js requires the `NEXT_PUBLIC_` prefix to expose a variable to the browser bundle; a bare `SUPABASE_URL` will be `undefined` in client code, not just insecure. Security comes from RLS policies, never from hiding the anon key.

## Rate Limiting
17. Apply basic rate limiting only to the three Route Handlers defined in Techspec.md's API Surface (`/api/match/...`, `/api/students/:id/matches`, `/api/institution/dashboard`). Assessment submission and application creation are direct RLS-gated Supabase calls, not custom endpoints — do not add endpoints or rate limiting for them without updating Techspec.md first. There is no Express layer, so use a small in-memory per-IP limiter inside each Route Handler (a module-scoped counter with a rolling time window) rather than `express-rate-limit`. Keep limits generous (e.g. 100 requests / 15 min / IP) so judge testing isn't interrupted. Note: an in-memory limiter is best-effort on serverless hosting (Vercel) since state isn't shared across cold instances — acceptable for a hackathon demo, not a production guarantee.

## Scope Discipline
6. Only build what's listed as in-scope in Prd.md. If a feature seems useful but isn't in Prd.md's MVP list, flag it and ask rather than building it.
7. Do not fabricate data to make a feature look complete. If a feature (e.g., Curriculum Gap Analysis) needs real data that hasn't been supplied, leave it unbuilt or clearly stubbed — do not generate plausible-looking fake numbers and present them as real.
8. Do not claim integration with external systems (Ayush Grid, ABHA, government portals) that don't actually exist in the code. If a stub is needed for demo purposes, label it visibly as a stub in the UI.

## Code Conventions
9. Database: snake_case for tables/columns. Frontend/JS: camelCase for variables, PascalCase for components.
10. No hardcoded secrets or API keys anywhere in source — use environment variables per Techspec.md.
11. Keep components small and single-purpose. Avoid premature abstraction — this is a hackathon MVP, not a library.
12. Every API response involving a match score must include the reasoning array, not just the number — this is a product requirement (Prd.md), not optional.

## When Uncertain
13. If a requirement in Prd.md/AppFlow.md/Schema.md is ambiguous or conflicting, stop and ask rather than guessing — a wrong guess here previously cost this project a full disconnected prototype rebuild. Precision over speed.
14. If asked to add a statistic, citation, or claim about external regulations/standards into UI copy, do not invent one — flag it for the human to supply a verified source.
