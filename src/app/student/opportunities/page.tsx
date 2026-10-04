'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  BadgeCheck,
  Search,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Filter,
  RefreshCw,
  Target,
  Send,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface RequiredSkill {
  id: string
  domain_id: string
  min_level: number
  skill_taxonomy?: {
    name: string
  } | null
}

interface MatchedOpportunity {
  id: string
  title: string
  type: 'internship' | 'job'
  organization: string
  description: string | null
  location: string | null
  status: 'open' | 'closed'
  posted_at: string
  opportunity_required_skills: RequiredSkill[]
  score: number
  reasons: string[]
  match_score: number
  match_reasons: string[]
  skillCompatibility?: number
  eligibilityScore?: number
  interestAlignment?: number
}

interface ExistingApplication {
  id: string
  opportunity_id: string
  status: 'applied' | 'shortlisted' | 'rejected' | 'selected'
  applied_at: string
}

export default function StudentOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<MatchedOpportunity[]>([])
  const [appliedMap, setAppliedMap] = useState<Record<string, ExistingApplication>>({})
  const [studentProfileId, setStudentProfileId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'internship' | 'job'>('all')
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0)

  async function loadOpportunitiesAndApplications(isManual = false) {
    if (isManual) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      // 1. Get logged-in user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('Please sign in as a student to view matched opportunities.')
      }

      // 2. Fetch student profile to get profile ID
      const { data: profile, error: profileError } = await supabase
        .from('student_profiles')
        .select('id, discipline, institution, semester')
        .eq('auth_user_id', user.id)
        .single()

      if (profileError || !profile) {
        throw new Error('Student profile not found. Please complete your registration.')
      }

      setStudentProfileId(profile.id)

      // 3. Fetch matched opportunities via the deterministic matching route handler
      const res = await fetch(`/api/students/${profile.id}/matches`, {
        cache: 'no-store',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to compute matches.`)
      }

      const matchData: MatchedOpportunity[] = await res.json()
      setOpportunities(Array.isArray(matchData) ? matchData : [])

      // 4. Fetch existing applications for this student
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('id, opportunity_id, status, applied_at')
        .eq('student_id', profile.id)

      if (!appsError && appsData) {
        const map: Record<string, ExistingApplication> = {}
        appsData.forEach((app: ExistingApplication) => {
          map[app.opportunity_id] = app
        })
        setAppliedMap(map)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while loading opportunities.'
      setError(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadOpportunitiesAndApplications()
  }, [])

  async function handleApply(opp: MatchedOpportunity) {
    if (!studentProfileId) return
    setApplyingId(opp.id)

    try {
      const { data: newApp, error: appError } = await supabase
        .from('applications')
        .insert({
          student_id: studentProfileId,
          opportunity_id: opp.id,
          match_score: opp.score,
          match_reasons: opp.reasons,
          status: 'applied',
        })
        .select('id, opportunity_id, status, applied_at')
        .single()

      if (appError) {
        alert(`Failed to submit application: ${appError.message}`)
      } else if (newApp) {
        setAppliedMap((prev) => ({
          ...prev,
          [opp.id]: newApp as ExistingApplication,
        }))
      }
    } catch {
      alert('An unexpected error occurred while applying.')
    } finally {
      setApplyingId(null)
    }
  }

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesSearch =
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opp.location && opp.location.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesType = typeFilter === 'all' ? true : opp.type === typeFilter
      const matchesScore = opp.score >= minScoreFilter

      return matchesSearch && matchesType && matchesScore
    })
  }, [opportunities, searchQuery, typeFilter, minScoreFilter])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-100 text-[#1B365D] px-2.5 py-0.5 rounded-full border border-sky-200">
              Student Career Hub
            </span>
            <span className="text-[11px] font-semibold text-stone-500">
              SIH26044 Deterministic Matching Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B365D] tracking-tight">
            Matched AYUSH Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Every score is deterministically calculated using 60% Skill Compatibility + 30% Eligibility + 10% Interest Alignment.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => loadOpportunitiesAndApplications(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#1B365D] hover:bg-stone-50 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Recalculate matches"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
            <span>{refreshing ? 'Recomputing…' : 'Refresh Matches'}</span>
          </button>

          <Link
            href="/student/assessment"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B365D] text-white text-xs font-bold hover:bg-[#152a48] transition-colors shadow-sm"
          >
            <BadgeCheck className="w-4 h-4 text-sky-200" />
            <span>Take Assessment</span>
          </Link>
        </div>
      </div>

      {/* Info Callout Banner */}
      <div className="rounded-xl bg-sky-50/80 border border-sky-200 p-4 text-xs text-[#1B365D] flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-[#1B365D] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold">
            Transparent Matching Rationale (Zero Black-Box Scoring)
          </div>
          <p className="text-stone-600 leading-relaxed">
            Scores reflect verified evidence tiers (Level 1 theory quiz: 0.4×, Level 2 observed: 0.7×, Level 3 institution verified: 1.0×). Inspect each opportunity&apos;s reason tags to identify curriculum strengths and competency gaps.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, hospital, or city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 bg-[#FFFCF6] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-transparent transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-stone-500">Type:</span>
            <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-[#1B365D] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('internship')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  typeFilter === 'internship'
                    ? 'bg-[#1B365D] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Internship
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('job')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  typeFilter === 'job'
                    ? 'bg-[#1B365D] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Job
              </button>
            </div>
          </div>

          {/* Min Score Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-stone-500">Min Match:</span>
            <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 text-xs font-semibold">
              {[0, 50, 70].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setMinScoreFilter(score)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    minScoreFilter === score
                      ? 'bg-[#1B365D] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {score === 0 ? 'Any' : `${score}%+`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B365D] mx-auto mb-3" />
          <h2 className="text-base font-bold text-[#1B365D]">Computing Deterministic Opportunity Matches…</h2>
          <p className="text-xs text-stone-500 mt-1">Cross-referencing your verified skill dossier with employer requirements</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-rose-900">Failed to load opportunities</h2>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
              <button
                type="button"
                onClick={() => loadOpportunitiesAndApplications(true)}
                className="mt-3 text-xs font-bold text-[#1B365D] hover:underline cursor-pointer"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && opportunities.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#1B365D] flex items-center justify-center mx-auto mb-4">
            <Target className="w-7 h-7 text-[#1B365D]" />
          </div>
          <h2 className="text-lg font-bold text-[#1B365D]">No Open Opportunities in Catalog Yet</h2>
          <p className="max-w-md mx-auto text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
            Healthcare employers post clinical internships and research roles mapped to NCISM taxonomy domains. When postings are published, deterministic match scores will appear here.
          </p>
          <div className="mt-6">
            <Link
              href="/student/assessment"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B365D] text-white text-xs font-bold hover:bg-[#152a48] transition-colors shadow-sm"
            >
              <BadgeCheck className="w-4 h-4 text-sky-200" />
              <span>Complete Adaptive Assessment Now</span>
            </Link>
          </div>
        </div>
      )}

      {/* Filtered Empty State */}
      {!loading && !error && opportunities.length > 0 && filteredOpportunities.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500 text-xs shadow-xs">
          No opportunities match your filter criteria. Try lowering the match score or searching another term.
        </div>
      )}

      {/* Matched Opportunities Cards */}
      {!loading && !error && filteredOpportunities.length > 0 && (
        <div className="space-y-5">
          {filteredOpportunities.map((opp) => {
            const isApplied = !!appliedMap[opp.id]
            const application = appliedMap[opp.id]
            const requiredSkills = opp.opportunity_required_skills || []

            // Match score color classes (Navy / Sky / Indigo / Stone)
            let scoreBg = 'bg-sky-50 border-sky-300 text-[#1B365D]'
            if (opp.score >= 75) {
              scoreBg = 'bg-[#1B365D] border-[#1B365D] text-white'
            } else if (opp.score >= 50) {
              scoreBg = 'bg-sky-100 border-sky-300 text-[#1B365D]'
            } else {
              scoreBg = 'bg-stone-100 border-stone-300 text-stone-700'
            }

            return (
              <div
                key={opp.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs hover:border-[#1B365D] transition-all flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold text-[#1B365D]">{opp.title}</h2>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-[#1B365D] border border-sky-200">
                          {opp.type === 'internship' ? 'Clinical Internship' : 'Full-Time Job'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                        <span className="flex items-center gap-1 font-semibold text-stone-700">
                          <Building2 className="w-3.5 h-3.5 text-stone-400" />
                          {opp.organization}
                        </span>
                        {opp.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            {opp.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          Posted {new Date(opp.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className={`shrink-0 rounded-2xl border px-4 py-2 text-center ${scoreBg} shadow-2xs`}>
                      <span className="text-[10px] uppercase font-bold tracking-wider block opacity-85">
                        Deterministic Fit
                      </span>
                      <span className="text-2xl font-black font-mono tracking-tight leading-none block mt-0.5">
                        {Math.round(opp.score)}%
                      </span>
                    </div>
                  </div>

                  {opp.description && (
                    <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed mb-4">
                      {opp.description}
                    </p>
                  )}

                  {/* Required Domain Thresholds */}
                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                      Required Taxonomy Competencies:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {requiredSkills.map((sk) => (
                        <div
                          key={sk.id}
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[#FFFCF6] border border-stone-200 text-stone-700 font-medium"
                        >
                          <span>{sk.skill_taxonomy?.name || sk.domain_id}</span>
                          <span className="font-mono font-bold text-[#1B365D] bg-sky-100/60 px-1.5 py-0.5 rounded text-[11px]">
                            Min {sk.min_level}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explainable Rationale Strings (Product Requirement per Techspec.md) */}
                  {opp.reasons && opp.reasons.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#1B365D] block">
                        Matching Reasoning (Explainable Analysis):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {opp.reasons.map((reason, idx) => {
                          const isStrong = reason.startsWith('Strong:') || reason.startsWith('Pass:')
                          const isGap = reason.startsWith('Gap:')
                          const isBonus = reason.startsWith('Bonus:')

                          let badgeClass = 'bg-stone-100 text-stone-700 border-stone-200'
                          if (isStrong) badgeClass = 'bg-sky-50 text-[#1B365D] border-sky-200'
                          if (isGap) badgeClass = 'bg-amber-50 text-amber-900 border-amber-200'
                          if (isBonus) badgeClass = 'bg-indigo-50 text-indigo-900 border-indigo-200'

                          return (
                            <span
                              key={idx}
                              className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${badgeClass}`}
                            >
                              {reason}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with Apply Action */}
                <div className="border-t border-stone-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    <span>60% Skill + 30% Eligibility + 10% Interest weighting</span>
                  </div>

                  <div>
                    {isApplied ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 text-[#1B365D] border border-sky-200 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-[#1B365D]" />
                        <span>Applied ({application?.status.toUpperCase()})</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApply(opp)}
                        disabled={applyingId === opp.id}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B365D] text-white text-xs font-bold hover:bg-[#152a48] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        {applyingId === opp.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting…</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Apply with Verified Dossier</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
