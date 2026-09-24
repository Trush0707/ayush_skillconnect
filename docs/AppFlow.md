# AppFlow.md — AYUSH SkillConnect

## Routing note (Next.js App Router)
Every path below is a folder under `app/` (e.g. `/opportunities/:id` → `app/opportunities/[id]/page.tsx`). Role-specific routes can sit under a route group — e.g. `app/(employer)/employer/opportunities/page.tsx` — purely for organization; route groups don't appear in the URL. Data mutations that must run server-side (writing `student_skill_levels` from the assessment, computing match scores) go through the Route Handlers in Techspec.md's API Surface, called from the page via `fetch('/api/...')` or a Server Action — everything else (reads, simple CRUD gated by RLS) can call Supabase directly from the client, per Techspec.md's note on the backend layer.

## Global
- Landing page → role-based sign-in (Student / Employer / Institution Admin), per Design.md
- All authenticated routes gated by Supabase session; redirect to landing if no session

## Student Flow
```
/login → /signup (role=student, pick discipline)
   → /assessment (adaptive, branching — see Techspec.md state machine)
      → completes → skill_level records written per domain
   → /profile (skill profile + gap report, shows domain, level, evidence tier)
   → /opportunities (list, sorted by computed match score, each card shows score + reasons)
      → /opportunities/:id → apply button → creates application record
   → /applications (student's own applications + status)
```

## Employer Flow
```
/login → /signup (role=employer, org name + type)
   → /employer/opportunities → /employer/opportunities/new (post form: title, type, required skills per domain + min level, description, location)
   → /employer/opportunities/:id/applicants (list of applicants, each with match score + reasons, status dropdown: Applied/Shortlisted/Rejected/Selected)
```

## Institution Admin Flow
```
/login → /admin/dashboard
   → cohort skill-gap chart (aggregate avg level per domain, real query over seeded students)
   → (optional, only if real data supplied) curriculum gap comparison table
```

## Assessment State Machine (detail)
```
State: { currentQuestionId, answers[], skillTally{domainId: runningScore} }

On mount: currentQuestionId = first question for student's selected discipline
On answer selected:
   - push answer to answers[]
   - update skillTally[option.domainId] += option.value
   - if option.nextQuestionId exists: currentQuestionId = option.nextQuestionId
   - else: assessment complete → write skillTally to student_skill_levels table, tier = 1 (theory-verified) → redirect to /profile
```

## Notes for Implementation Order
Build in this sequence (matches dependency order, not UI order):
1. Auth + role routing
2. Skill taxonomy seed (must exist before anything else references it)
3. Student profile + assessment (produces the data everything downstream needs)
4. Opportunity posting (employer)
5. Matching endpoint + opportunities list (needs both 3 and 4 to have data)
6. Application tracking
7. Institution dashboard (needs 3–6 to have real data to aggregate)
