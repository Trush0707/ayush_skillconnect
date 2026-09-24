# Schema.md — AYUSH SkillConnect (PostgreSQL via Supabase)

**Critical rule: every table below must have Row-Level Security enabled with an explicit policy before it is considered done. A table with RLS disabled, or enabled with no real policy (default-open), is not acceptable — verify each policy denies access it should deny, not just that it exists.**

Auth: Supabase Auth handles identity. Every table referencing a user stores `auth_user_id UUID REFERENCES auth.users(id)` — no custom users table needed.

---

## skill_taxonomy
```sql
CREATE TABLE skill_taxonomy (
  domain_id TEXT PRIMARY KEY,              -- e.g. 'ashtavidha-pariksha'
  name TEXT NOT NULL,                      -- 'Ashtavidha Pariksha & Case-Taking'
  description TEXT,
  ncism_pos TEXT[],                        -- e.g. ARRAY['PO1','PO3','PO5']
  evidence_types TEXT[]                    -- e.g. ARRAY['OSCE','Faculty case-log signoff']
);
ALTER TABLE skill_taxonomy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "taxonomy readable by any authenticated user"
  ON skill_taxonomy FOR SELECT TO authenticated USING (true);
-- No insert/update/delete policy for regular users; seed via migration only.
```
Seed with all 12 domains before building anything else.

---

## student_profiles
```sql
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  discipline TEXT NOT NULL CHECK (discipline IN ('Ayurveda','Yoga & Naturopathy','Unani','Siddha','Homoeopathy')),
  institution TEXT DEFAULT 'AIIA',
  semester INT,
  interests TEXT[]
);
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "students read/write only their own profile"
  ON student_profiles FOR ALL TO authenticated
  USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());
CREATE POLICY "employers and institution admins can read student profiles"
  ON student_profiles FOR SELECT TO authenticated
  USING (true); -- refine later if needed; acceptable for MVP since no sensitive PII beyond academic data
```

## student_skill_levels
```sql
CREATE TABLE student_skill_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  domain_id TEXT NOT NULL REFERENCES skill_taxonomy(domain_id),
  raw_score NUMERIC CHECK (raw_score >= 0 AND raw_score <= 100),
  evidence_tier INT NOT NULL DEFAULT 0 CHECK (evidence_tier BETWEEN 0 AND 3),
  evidence_notes TEXT,
  UNIQUE (student_id, domain_id)
);
ALTER TABLE student_skill_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "students manage only their own skill levels"
  ON student_skill_levels FOR ALL TO authenticated
  USING (student_id IN (SELECT id FROM student_profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY "authenticated users can read skill levels"
  ON student_skill_levels FOR SELECT TO authenticated USING (true);
```

---

## assessment_questions
```sql
CREATE TABLE assessment_questions (
  question_id TEXT PRIMARY KEY,
  domain_id TEXT NOT NULL REFERENCES skill_taxonomy(domain_id),
  text TEXT NOT NULL,
  discipline_filter TEXT[]   -- empty/null = shown to all disciplines
);
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions readable by authenticated users"
  ON assessment_questions FOR SELECT TO authenticated USING (true);
```

## assessment_options
```sql
CREATE TABLE assessment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT NOT NULL REFERENCES assessment_questions(question_id),
  label TEXT NOT NULL,
  value NUMERIC NOT NULL,             -- contributes to raw_score for the question's domain
  next_question_id TEXT REFERENCES assessment_questions(question_id)  -- NULL = end of branch
);
ALTER TABLE assessment_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "options readable by authenticated users"
  ON assessment_options FOR SELECT TO authenticated USING (true);
```

---

## opportunities
```sql
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_auth_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('internship','job')),
  organization TEXT NOT NULL,
  description TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  posted_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opportunities readable by all authenticated users"
  ON opportunities FOR SELECT TO authenticated USING (true);
CREATE POLICY "employers manage only their own opportunities"
  ON opportunities FOR INSERT TO authenticated WITH CHECK (employer_auth_id = auth.uid());
CREATE POLICY "employers update/delete only their own opportunities"
  ON opportunities FOR UPDATE TO authenticated USING (employer_auth_id = auth.uid());
```

## opportunity_required_skills
```sql
CREATE TABLE opportunity_required_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  domain_id TEXT NOT NULL REFERENCES skill_taxonomy(domain_id),
  min_level NUMERIC NOT NULL CHECK (min_level >= 0 AND min_level <= 100)
);
ALTER TABLE opportunity_required_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "required skills readable by authenticated users"
  ON opportunity_required_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "employers manage required skills for their own opportunities"
  ON opportunity_required_skills FOR ALL TO authenticated
  USING (opportunity_id IN (SELECT id FROM opportunities WHERE employer_auth_id = auth.uid()));
```

---

## applications
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id),
  match_score NUMERIC CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons TEXT[],
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied','shortlisted','rejected','selected')),
  applied_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (student_id, opportunity_id)
);
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "students see/create only their own applications"
  ON applications FOR ALL TO authenticated
  USING (student_id IN (SELECT id FROM student_profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY "employers see applications to their own opportunities"
  ON applications FOR SELECT TO authenticated
  USING (opportunity_id IN (SELECT id FROM opportunities WHERE employer_auth_id = auth.uid()));
CREATE POLICY "employers update status on applications to their own opportunities"
  ON applications FOR UPDATE TO authenticated
  USING (opportunity_id IN (SELECT id FROM opportunities WHERE employer_auth_id = auth.uid()));
```

---

## Build Order (matches AppFlow.md dependency order)
1. `skill_taxonomy` (seed immediately)
2. `student_profiles`, `assessment_questions`, `assessment_options`
3. `student_skill_levels` (populated by completing assessment)
4. `opportunities`, `opportunity_required_skills`
5. `applications` (needs 3 and 4 to compute real match scores)
