import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'
import { TIER_MULTIPLIERS } from '@/lib/match'

/**
 * Module-scoped in-memory rate limiter (~100 req / 15 min / IP).
 * Per Rules.md #17, protects the institution dashboard API route while
 * allowing generous quota for judging and real-time dashboard analytics.
 */
const rateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000,
})

export interface InstitutionDomainMetric {
  domain_id: string
  domain_name: string
  avg_level: number
  student_count: number
}

/**
 * GET handler for /api/institution/dashboard
 * Aggregates real student skill levels and evidence multipliers per NCISM taxonomy domain.
 */
export async function GET(request: Request) {
  // 1. Rate limiting
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
    const supabase = createAdminClient()

    // 2. Fetch all domains from skill_taxonomy
    const { data: domains, error: domainsError } = await supabase
      .from('skill_taxonomy')
      .select('domain_id, name')
      .order('name', { ascending: true })

    if (domainsError) {
      return NextResponse.json(
        { error: `Failed to fetch taxonomy domains: ${domainsError.message}` },
        { status: 500 }
      )
    }

    // 3. Fetch all student skill levels
    const { data: skillLevels, error: levelsError } = await supabase
      .from('student_skill_levels')
      .select('domain_id, raw_score, evidence_tier')

    if (levelsError) {
      return NextResponse.json(
        { error: `Failed to fetch student skill levels: ${levelsError.message}` },
        { status: 500 }
      )
    }

    // 4. Compute aggregate metrics per domain (effective score = raw_score * tier_multiplier)
    const domainScoresMap: Record<string, { totalEffectiveScore: number; count: number }> = {}

    for (const record of skillLevels || []) {
      const dId = record.domain_id
      if (!dId) continue

      if (!domainScoresMap[dId]) {
        domainScoresMap[dId] = { totalEffectiveScore: 0, count: 0 }
      }

      const raw = typeof record.raw_score === 'number' ? record.raw_score : Number(record.raw_score) || 0
      const tier = typeof record.evidence_tier === 'number' ? record.evidence_tier : 0
      const multiplier = TIER_MULTIPLIERS[tier] ?? 1.0
      const effectiveScore = raw * multiplier

      domainScoresMap[dId].totalEffectiveScore += effectiveScore
      domainScoresMap[dId].count += 1
    }

    // 5. Structure payload for Institution Analytics Dashboard
    const metrics: InstitutionDomainMetric[] = (domains || []).map((domain) => {
      const stats = domainScoresMap[domain.domain_id]
      const count = stats?.count ?? 0
      const avg = count > 0 ? Math.round((stats.totalEffectiveScore / count) * 10) / 10 : 0

      return {
        domain_id: domain.domain_id,
        domain_name: domain.name,
        avg_level: avg,
        student_count: count,
      }
    })

    return NextResponse.json(metrics, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
