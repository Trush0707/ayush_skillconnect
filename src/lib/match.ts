/**
 * src/lib/match.ts — AYUSH SkillConnect Deterministic Matching Algorithm
 *
 * Implements the formula specified in Techspec.md and Rules.md:
 *   Match Score = w1 * SkillCompatibility + w2 * Eligibility + w3 * InterestAlignment
 *
 * All weights and multipliers are exposed as named constants.
 * The output includes both a numeric score (0–100) and an explainable array
 * of plain-language reasoning strings.
 */

// ---------------------------------------------------------------------------
// Configurable Business Rule Weights (Techspec.md line 28)
// ---------------------------------------------------------------------------
export const W1_SKILL_COMPATIBILITY = 0.6
export const W2_ELIGIBILITY = 0.3
export const W3_INTEREST_ALIGNMENT = 0.1

// Shorthand aliases matching Techspec.md notation
export const W1 = W1_SKILL_COMPATIBILITY
export const W2 = W2_ELIGIBILITY
export const W3 = W3_INTEREST_ALIGNMENT

// ---------------------------------------------------------------------------
// Evidence Tier Multipliers (Techspec.md lines 33–37)
// Level 0 — Unassessed / Unverified      → 0.0
// Level 1 — Theory-verified / Quiz       → 0.4
// Level 2 — Observed / Peer / Clinical   → 0.7
// Level 3 — Institution-verified         → 1.0
// ---------------------------------------------------------------------------
export const TIER_MULTIPLIERS: Record<number, number> = {
  0: 0.0,
  1: 0.4,
  2: 0.7,
  3: 1.0,
}

// ---------------------------------------------------------------------------
// Data Types for Matching Input
// ---------------------------------------------------------------------------
export interface StudentSkillRecord {
  domain_id: string
  raw_score?: number | null
  evidence_tier?: number | null
  evidence_notes?: string | null
}

export interface StudentProfileForMatch {
  id: string
  discipline: string
  institution?: string | null
  semester?: number | null
  interests?: string[] | null
  skill_levels?: StudentSkillRecord[] | null
}

export interface RequiredSkillForMatch {
  id?: string
  domain_id: string
  min_level: number
  min_evidence_tier?: number | null
  skill_taxonomy?: {
    name: string
  } | null
  domain_name?: string
}

export interface OpportunityForMatch {
  id: string
  title: string
  type: string // 'internship' | 'job'
  organization: string
  description?: string | null
  location?: string | null
  status?: string
  discipline?: string | null
  discipline_filter?: string[] | null
  min_evidence_tier?: number | null
  opportunity_required_skills?: RequiredSkillForMatch[] | null
  required_skills?: RequiredSkillForMatch[] | null
}

export interface MatchResult {
  score: number
  reasons: string[]
  skillCompatibility?: number
  eligibilityScore?: number
  interestAlignment?: number
}

// ---------------------------------------------------------------------------
// Deterministic Matching Function
// ---------------------------------------------------------------------------
export function computeMatch(
  student: StudentProfileForMatch,
  opportunity: OpportunityForMatch,
  taxonomyNameMap?: Map<string, string>
): MatchResult {
  // -------------------------------------------------------------------------
  // 1. Eligibility (Pass/Fail Gate)
  // Check discipline match and evidence tier requirement.
  // If failed, immediately return { score: 0, reasons: ["Fail: Discipline or evidence tier requirement not met"] }
  // -------------------------------------------------------------------------
  const studentDiscipline = (student.discipline || '').trim().toLowerCase()

  // 1a. Discipline check
  // If opportunity specifies a discipline requirement:
  if (opportunity.discipline && opportunity.discipline.trim() !== '') {
    const oppDiscipline = opportunity.discipline.trim().toLowerCase()
    if (oppDiscipline !== 'all' && oppDiscipline !== 'any' && oppDiscipline !== studentDiscipline) {
      return {
        score: 0,
        reasons: ['Fail: Discipline or evidence tier requirement not met'],
      }
    }
  }

  // If opportunity specifies discipline_filter array:
  if (Array.isArray(opportunity.discipline_filter) && opportunity.discipline_filter.length > 0) {
    const allowed = opportunity.discipline_filter.map((d) => d.trim().toLowerCase())
    if (!allowed.includes(studentDiscipline) && !allowed.includes('all')) {
      return {
        score: 0,
        reasons: ['Fail: Discipline or evidence tier requirement not met'],
      }
    }
  }

  // Build a lookup map of student's skill levels by domain_id
  const studentSkillMap = new Map<string, StudentSkillRecord>()
  if (Array.isArray(student.skill_levels)) {
    for (const sk of student.skill_levels) {
      if (sk && sk.domain_id) {
        studentSkillMap.set(sk.domain_id, sk)
      }
    }
  }

  const requiredSkills =
    opportunity.opportunity_required_skills ||
    opportunity.required_skills ||
    []

  // 1b. Evidence tier requirement check
  // Check if opportunity has an overall min_evidence_tier
  if (
    typeof opportunity.min_evidence_tier === 'number' &&
    opportunity.min_evidence_tier > 0
  ) {
    for (const req of requiredSkills) {
      const studentSkill = studentSkillMap.get(req.domain_id)
      const studentTier = studentSkill?.evidence_tier ?? 0
      if (studentTier < opportunity.min_evidence_tier) {
        return {
          score: 0,
          reasons: ['Fail: Discipline or evidence tier requirement not met'],
        }
      }
    }
  }

  // Check if any individual required skill specifies min_evidence_tier
  for (const req of requiredSkills) {
    if (
      typeof req.min_evidence_tier === 'number' &&
      req.min_evidence_tier > 0
    ) {
      const studentSkill = studentSkillMap.get(req.domain_id)
      const studentTier = studentSkill?.evidence_tier ?? 0
      if (studentTier < req.min_evidence_tier) {
        return {
          score: 0,
          reasons: ['Fail: Discipline or evidence tier requirement not met'],
        }
      }
    }
  }

  // Passed eligibility gate!
  const eligibilityScore = 1.0

  // -------------------------------------------------------------------------
  // 2. Skill Compatibility (w1 = 0.6)
  // For each required skill row, compute effective level = raw_score * tier_multiplier.
  // Normalize against min_level, average across required domains to 0–1.
  // Build plain-language reasons array:
  // "Strong: <domain> (<pct>%)" for domains above requirement
  // "Gap: <domain> (<pct>% vs <required>%)" for domains below
  // -------------------------------------------------------------------------
  const reasons: string[] = []
  let skillCompatibility = 0

  if (requiredSkills.length === 0) {
    // If no required skills are defined, full compatibility
    skillCompatibility = 1.0
    reasons.push('Eligible: General opportunity with no prerequisite skill gates')
  } else {
    let normalizedSum = 0

    for (const req of requiredSkills) {
      const studentSkill = studentSkillMap.get(req.domain_id)
      const rawScore = studentSkill?.raw_score ?? 0
      const tier = studentSkill?.evidence_tier ?? 0
      const tierMultiplier = TIER_MULTIPLIERS[tier] ?? 0.0

      // Effective skill level incorporates evidence tier weighting
      const effectiveLevel = rawScore * tierMultiplier
      const minLevel = req.min_level > 0 ? req.min_level : 1

      // Normalize effective level against min_level (0 to 1)
      const domainRatio = Math.min(1.0, Math.max(0.0, effectiveLevel / minLevel))
      normalizedSum += domainRatio

      // Resolve human-readable domain name
      const domainName =
        req.domain_name ||
        req.skill_taxonomy?.name ||
        taxonomyNameMap?.get(req.domain_id) ||
        req.domain_id

      const effectivePct = Math.round(effectiveLevel)
      const requiredPct = Math.round(req.min_level)

      // Add explainable reason string per Techspec.md
      if (effectiveLevel >= req.min_level) {
        reasons.push(`Strong: ${domainName} (${effectivePct}%)`)
      } else {
        reasons.push(`Gap: ${domainName} (${effectivePct}% vs ${requiredPct}% required)`)
      }
    }

    skillCompatibility = normalizedSum / requiredSkills.length
  }

  // -------------------------------------------------------------------------
  // 3. Interest Alignment (w3 = 0.1)
  // Calculate bonus (0–1) if student interests contain the domain or opportunity type.
  // -------------------------------------------------------------------------
  let interestAlignment = 0

  if (Array.isArray(student.interests) && student.interests.length > 0) {
    const studentInterests = student.interests
      .map((i) => (i || '').trim().toLowerCase())
      .filter(Boolean)

    if (studentInterests.length > 0) {
      const oppType = (opportunity.type || '').trim().toLowerCase()

      // Check if student interests contain opportunity type ('internship' | 'job')
      const matchesType = studentInterests.some(
        (i) => i.includes(oppType) || (oppType && oppType.includes(i))
      )

      // Check if student interests contain any required domain or domain name
      const matchesDomain = requiredSkills.some((req) => {
        const dId = req.domain_id.toLowerCase()
        const dName = (
          req.domain_name ||
          req.skill_taxonomy?.name ||
          taxonomyNameMap?.get(req.domain_id) ||
          ''
        ).toLowerCase()

        return studentInterests.some(
          (interest) =>
            interest.includes(dId) ||
            dId.includes(interest) ||
            (dName && (interest.includes(dName) || dName.includes(interest)))
        )
      })

      // Check opportunity title / organization keywords
      const matchesKeywords = studentInterests.some((interest) => {
        const titleLower = (opportunity.title || '').toLowerCase()
        const orgLower = (opportunity.organization || '').toLowerCase()
        return titleLower.includes(interest) || orgLower.includes(interest)
      })

      if (matchesType && matchesDomain) {
        interestAlignment = 1.0
      } else if (matchesType || matchesDomain || matchesKeywords) {
        interestAlignment = 0.8
      } else {
        interestAlignment = 0.0
      }
    }
  }

  // -------------------------------------------------------------------------
  // 4. Final Deterministic Score Calculation
  // Match Score = w1 * SkillCompatibility + w2 * Eligibility + w3 * InterestAlignment
  // Expose as 0–100 integer score clamped to bounds
  // -------------------------------------------------------------------------
  const rawComposite =
    W1_SKILL_COMPATIBILITY * skillCompatibility +
    W2_ELIGIBILITY * eligibilityScore +
    W3_INTEREST_ALIGNMENT * interestAlignment

  const finalScore = Math.max(0, Math.min(100, Math.round(rawComposite * 100)))

  return {
    score: finalScore,
    reasons,
    skillCompatibility,
    eligibilityScore,
    interestAlignment,
  }
}
