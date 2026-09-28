import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { computeMatch } from '@/lib/match'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'

/**
 * Module-scoped in-memory rate limiter (~100 req / 15 min / IP).
 *
 * NOTE ON SERVERLESS HOSTING:
 * This in-memory limiter operates on a per-instance basis. On serverless environments
 * (e.g. Vercel), instances scale horizontally and state is not synchronized across
 * isolated container instances or after cold starts. This is a best-effort rate
 * limiting mechanism specifically suited for hackathon evaluation and demonstration
 * per Rules.md #17, rather than an enterprise-distributed guarantee.
 */
const rateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
})

interface RouteParams {
  params: Promise<{
    opportunityId: string
    studentId: string
  }>
}

export async function POST(request: NextRequest, context: RouteParams) {
  // 1. Enforce rate limiting
  const ip = getClientIp(request.headers)
  const limitCheck = rateLimiter.check(ip)

  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': '900',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': limitCheck.resetTime.toString(),
        },
      }
    )
  }

  try {
    const { opportunityId, studentId } = await context.params

    if (!opportunityId || !studentId) {
      return NextResponse.json(
        { error: 'Both opportunityId and studentId route parameters are required.' },
        { status: 400 }
      )
    }

    // 2. Instantiate service-role Supabase client (server-side only)
    const supabase = createAdminClient()

    // 3. Fetch opportunity and required skills
    const { data: opp, error: oppError } = await supabase
      .from('opportunities')
      .select(`
        id,
        title,
        type,
        organization,
        description,
        location,
        status,
        opportunity_required_skills (
          id,
          domain_id,
          min_level,
          skill_taxonomy ( name )
        )
      `)
      .eq('id', opportunityId)
      .single()

    if (oppError || !opp) {
      return NextResponse.json(
        { error: `Opportunity not found: ${oppError?.message || opportunityId}` },
        { status: 404 }
      )
    }

    // 4. Fetch student profile
    const { data: student, error: studentError } = await supabase
      .from('student_profiles')
      .select('id, auth_user_id, discipline, institution, semester, interests')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: `Student profile not found: ${studentError?.message || studentId}` },
        { status: 404 }
      )
    }

    // 5. Fetch student's skill levels
    const { data: skillLevels, error: skillLevelsError } = await supabase
      .from('student_skill_levels')
      .select('domain_id, raw_score, evidence_tier, evidence_notes')
      .eq('student_id', studentId)

    if (skillLevelsError) {
      return NextResponse.json(
        { error: `Failed to load student skill levels: ${skillLevelsError.message}` },
        { status: 500 }
      )
    }

    // 6. Compute deterministic match score & explainable reasoning
    const matchResult = computeMatch(
      {
        id: student.id,
        discipline: student.discipline,
        institution: student.institution,
        semester: student.semester,
        interests: student.interests,
        skill_levels: skillLevels ?? [],
      },
      {
        id: opp.id,
        title: opp.title,
        type: opp.type,
        organization: opp.organization,
        description: opp.description,
        location: opp.location,
        status: opp.status,
        opportunity_required_skills: (opp.opportunity_required_skills as any) ?? [],
      }
    )

    // Return { score, reasons } and component breakdown for transparency
    return NextResponse.json(
      {
        score: matchResult.score,
        reasons: matchResult.reasons,
        skillCompatibility: matchResult.skillCompatibility,
        eligibilityScore: matchResult.eligibilityScore,
        interestAlignment: matchResult.interestAlignment,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': limitCheck.remaining.toString(),
          'X-RateLimit-Reset': limitCheck.resetTime.toString(),
        },
      }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
