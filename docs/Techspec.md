# Techspec.md — AYUSH SkillConnect

## Stack (locked — do not substitute)
| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router, React) — web only, no React Native |
| Backend | Next.js Route Handlers (`app/api/**/route.ts`), same app as the frontend — no separate Express/Node server (or direct Supabase client calls from frontend for simple CRUD — see note below) |
| Database | PostgreSQL, hosted via Supabase |
| Auth | Supabase Auth (email/password, 3 roles) |
| Hosting | Vercel free tier — one deployment for frontend + API. Database/Auth on Supabase free tier. Zero budget: no second hosting service for a backend. |

**Note on backend layer:** for simple CRUD (reading taxonomy, reading/writing a student's own profile, posting an opportunity), prefer calling Supabase's auto-generated REST API directly from client components with Row-Level Security enforcing access control — this reduces custom backend code for a small team. Reserve Next.js Route Handlers for logic that can't live in RLS policies: the matching-score calculation and any multi-table aggregation for the institution dashboard. Route Handlers run server-side, so they're the only place allowed to use `SUPABASE_SERVICE_ROLE_KEY`.

## Environment Variables (never hardcode)
```
NEXT_PUBLIC_SUPABASE_URL=       # public — safe in client components (Next.js exposes NEXT_PUBLIC_* to the browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # public — safe in client components
SUPABASE_SERVICE_ROLE_KEY=      # server-side only — used only inside app/api Route Handlers, never in a client component, never prefixed with NEXT_PUBLIC_
```

## Matching Formula (implement exactly this — deterministic, explainable)
```
Match Score = w1 × Skill Compatibility + w2 × Eligibility + w3 × Interest Alignment
```
- **Skill Compatibility**: for each required skill on the opportunity, compare against the student's stored level for that domain. Normalize to 0–1.
- **Eligibility**: binary/threshold check (e.g., discipline matches, minimum evidence tier met). 0 or 1, or a simple pass/fail gate before scoring even runs.
- **Interest Alignment**: optional — if student has tagged interest in a domain/opportunity type, add a small weighted bonus. Can default to 0 if not implemented in MVP.
- Default weights: `w1 = 0.6, w2 = 0.3, w3 = 0.1` — expose as named constants, not magic numbers, so they're visibly "configurable business rules" per the product's own claim.
- **Every computed match must store its reasoning** (e.g., an array of strings: `["Strong: Panchakarma Procedure Competence (82%)", "Gap: Digital & IT Hygiene (30% vs 65% required)"]`) alongside the numeric score — this is a product requirement, not optional logging.

## Evidence Tier Logic
```
Level 0 — Unassessed       → weight multiplier 0.0
Level 1 — Theory-verified  → weight multiplier 0.4   (set automatically from assessment quiz score)
Level 2 — Observed         → weight multiplier 0.7   (set manually via admin/demo toggle in MVP)
Level 3 — Institution-verified → weight multiplier 1.0 (set manually via admin/demo toggle in MVP)
```
A student's effective skill level for matching purposes = `raw_assessment_score × tier_multiplier`. Do not build a real faculty-review workflow for Level 2/3 in this MVP — a simple settable field is sufficient (see Schema.md).

## API Surface (Next.js Route Handlers — only for logic that needs them)
```
app/api/match/[opportunityId]/[studentId]/route.ts   POST  → compute + return { score, reasons[] }
app/api/students/[id]/matches/route.ts                GET  → list all opportunities with computed scores, sorted desc
app/api/institution/dashboard/route.ts                GET  → aggregate skill levels per domain across all students
```
Everything else (reading taxonomy, CRUD on own profile/opportunities, reading applications) should go through Supabase's auto-generated REST API directly from client components, gated by RLS policies (see Schema.md).

## Adaptive Assessment — Branching Logic
Each question has options; each option stores `next_question_id`. The frontend assessment flow is a simple state machine:
```
currentQuestionId → render question → user selects option
   → record answer, update running skill_level tally for that option's domain
   → move to option.next_question_id (or end if null)
```
This must be real branching — different answers must lead to genuinely different question paths. Do not implement as a flat sequential form and call it adaptive.

## Deployment
Next.js app (frontend + Route Handlers, one codebase) → Vercel (free tier). Database/Auth → Supabase free tier. No separate backend deployment, no Docker, no Kubernetes, no paid infrastructure of any kind.
