import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { computeMatch } from '@/lib/match'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'

/**
 * Module-scoped in-memory rate limiter (~100 req / 15 min / IP).
 *
 * NOTE ON SERVERLESS HOSTING:
 * An in-memory rate limiter on serverless infrastructure (e.g. Vercel) is best-effort.
 * Runtime state is maintained per serverless worker instance and is not shared across
 * concurrent horizontal instances or cold-starts. This meets Rules.md #17 hackathon
 * requirements while protecting against unbounded client loops.
 */
const rateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteParams) {
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
    const { id: studentId } = await context.params

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID route parameter is required.' },
        { status: 400 }
      )
    }

    // 2. Instantiate service-role Supabase client (server-side only)
    const supabase = createAdminClient()

    // 3. Fetch student profile
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

    // 4. Fetch student's verified and theory skill levels
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

    // 5. Fetch all open opportunities with required skills
    const { data: opportunities, error: oppsError } = await supabase
      .from('opportunities')
      .select(`
        id,
        title,
        type,
        organization,
        description,
        location,
        status,
        posted_at,
        opportunity_required_skills (
          id,
          domain_id,
          min_level,
          skill_taxonomy ( name )
        )
      `)
      .eq('status', 'open')
      .order('posted_at', { ascending: false })

    if (oppsError) {
      return NextResponse.json(
        { error: `Failed to load opportunities: ${oppsError.message}` },
        { status: 500 }
      )
    }

    const studentData = {
      id: student.id,
      discipline: student.discipline,
      institution: student.institution,
      semester: student.semester,
      interests: student.interests,
      skill_levels: skillLevels ?? [],
    }

    // 6. Iterate and compute match score + reasons for each open opportunity
    const matchedOpportunities = (opportunities || []).map((opp) => {
      const matchResult = computeMatch(studentData, {
        id: opp.id,
        title: opp.title,
        type: opp.type,
        organization: opp.organization,
        description: opp.description,
        location: opp.location,
        status: opp.status,
        opportunity_required_skills: (opp.opportunity_required_skills as any) ?? [],
      })

      return {
        id: opp.id,
        title: opp.title,
        type: opp.type,
        organization: opp.organization,
        description: opp.description,
        location: opp.location,
        status: opp.status,
        posted_at: opp.posted_at,
        opportunity_required_skills: opp.opportunity_required_skills ?? [],
        score: matchResult.score,
        reasons: matchResult.reasons,
        match_score: matchResult.score,
        match_reasons: matchResult.reasons,
        skillCompatibility: matchResult.skillCompatibility,
        eligibilityScore: matchResult.eligibilityScore,
        interestAlignment: matchResult.interestAlignment,
      }
    })

    // 7. Sort by score descending (highest match first)
    matchedOpportunities.sort((a, b) => b.score - a.score)

    return NextResponse.json(matchedOpportunities, {
      status: 200,
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': limitCheck.remaining.toString(),
        'X-RateLimit-Reset': limitCheck.resetTime.toString(),
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
