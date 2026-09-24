# Prd.md — AYUSH SkillConnect

## One-line
An evidence-backed, closed-loop skill-mapping and placement platform for AYUSH academic institutions (pilot: AIIA), for SIH26044 (Ministry of AYUSH).

## Problem
- Students self-report skills with no verification.
- AIIA's placement process is manual and relationship-driven.
- Employers cannot efficiently find candidates with real, checkable AYUSH competencies.
- The institution has no visibility into cohort-wide skill gaps.

## Users (3 roles, auth-gated)
1. **Student** — takes assessment, views skill profile + gap report, applies to matched opportunities, tracks application status.
2. **Employer** — posts opportunities with required skills, reviews applicants with explainable match scores.
3. **Institution Admin** — views cohort skill-gap analytics.

## Core Loop
```
Industry Demand → Skill Taxonomy → Assessment + Evidence → Skill Gap
   → Matching Engine → Opportunities + Tracking → Institutional Insight
   (loops back to Demand)
```

## The Differentiator (do not weaken this in implementation)
Every skill value stored for a student must carry:
1. A link to a specific taxonomy domain (see Schema.md `skill_taxonomy`)
2. An evidence tier (0–3, see Schema.md `student_skill_levels.evidence_tier`)

Matching must be deterministic and explainable (see Techspec.md formula) — **never implement matching as a trained ML model or an opaque score with no stored reasoning.**

## MVP Feature List (Must-Have — build all of these)
1. Auth + role selection (Student / Employer / Institution Admin) — via Supabase Auth
2. Skill taxonomy seed data (12 domains — see Schema.md)
3. Adaptive skill assessment with real branching logic (not a flat form)
4. Skill profile + gap report (visual, per domain, shows evidence tier)
5. Opportunity posting (employer side)
6. Explainable matching + application list with visible match reasons
7. Application status tracking (Applied / Shortlisted / Rejected / Selected)
8. Institution cohort skill-gap dashboard (aggregate query, not hardcoded)

## Explicitly Out of Scope — do not build these
- Faculty / FDP / research-collaboration workflows
- Digital portfolios beyond a basic profile
- Any trained ML model or embeddings-based matching
- Any real integration with Ayush Grid, ABHA, or external government systems (mock/stub only if ever needed, clearly labeled)
- Mobile app (web only)
- Multi-institution support (AIIA only)
- Real-time faculty verification workflow (evidence tier can be set via a simple admin toggle, not a full review pipeline)
- Curriculum Gap Analysis with invented data — only implement if real research data is supplied; otherwise omit the feature rather than fabricate numbers

## Success Criteria
A working demo where: a student completes the adaptive assessment → sees a real skill profile with evidence tiers → sees matched opportunities with visible, correct match-score reasoning → applies → an employer sees the same application with the same explainable score → an institution admin sees a real aggregate dashboard reflecting actual seeded student data.
