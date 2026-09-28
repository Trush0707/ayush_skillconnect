'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ClipboardList,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Briefcase,
  Award,
  ExternalLink,
  ChevronRight,
  Check,
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

interface OpportunityInfo {
  id: string
  title: string
  type: 'internship' | 'job'
  organization: string
  description: string | null
  location: string | null
  status: 'open' | 'closed'
  posted_at?: string
  opportunity_required_skills?: RequiredSkill[]
}

interface StudentApplication {
  id: string
  opportunity_id: string
  match_score: number | null
  match_reasons: string[] | null
  status: 'applied' | 'shortlisted' | 'rejected' | 'selected'
  applied_at: string
  opportunities: OpportunityInfo | null
}

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'applied' | 'shortlisted' | 'selected' | 'rejected'>('all')

  async function loadApplications(isManual = false) {
    if (isManual) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      // 1. Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('Please sign in as a student to view your applications.')
      }

      // 2. Fetch student profile
      const { data: profile, error: profileError } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (profileError || !profile) {
        throw new Error('Student profile not found. Please complete your registration.')
      }

      // 3. Fetch applications submitted by this student
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select(`
          id,
          opportunity_id,
          match_score,
          match_reasons,
          status,
          applied_at,
          opportunities (
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
          )
        `)
        .eq('student_id', profile.id)
        .order('applied_at', { ascending: false })

      if (appsError) {
        throw new Error(appsError.message || 'Failed to load applications.')
      }

      setApplications((appsData as unknown as StudentApplication[]) || [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while loading your applications.'
      setError(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const opp = app.opportunities
      const title = opp?.title?.toLowerCase() || ''
      const org = opp?.organization?.toLowerCase() || ''
      const loc = opp?.location?.toLowerCase() || ''
      const reasons = (app.match_reasons || []).join(' ').toLowerCase()
      const query = searchQuery.toLowerCase().trim()

      const matchesSearch =
        query === '' ||
        title.includes(query) ||
        org.includes(query) ||
        loc.includes(query) ||
        reasons.includes(query)

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [applications, searchQuery, statusFilter])

  // Count summaries
  const totalCount = applications.length
  const appliedCount = applications.filter((a) => a.status === 'applied').length
  const shortlistedCount = applications.filter((a) => a.status === 'shortlisted').length
  const selectedCount = applications.filter((a) => a.status === 'selected').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Check className="w-3 h-3" />
            Shortlisted
          </span>
        )
      case 'selected':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-sky-100 text-[#1B365D] border border-sky-300">
            <Award className="w-3 h-3 text-[#1B365D]" />
            Selected / Offered
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
            Not Selected
          </span>
        )
      case 'applied':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 text-[#1B365D] border border-sky-200">
            <Clock className="w-3 h-3" />
            Application Submitted
          </span>
        )
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-100 text-[#1B365D] px-2.5 py-0.5 rounded-full border border-sky-200">
              Student Portal
            </span>
            <span className="text-[11px] font-semibold text-stone-500">
              Application Tracker
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B365D] tracking-tight">
            My Opportunity Applications
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Monitor real-time recruitment statuses, review algorithm-matched competencies, and explore clinical openings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/student/opportunities"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#1B365D] text-white text-xs font-bold hover:bg-[#152a48] transition-colors shadow-2xs"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => loadApplications(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#1B365D] hover:bg-stone-50 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Refresh applications"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
            <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
          <span className="text-[11px] text-stone-500 font-semibold block">Total Submitted</span>
          <span className="text-2xl font-black text-[#1B365D]">{totalCount}</span>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
          <span className="text-[11px] text-sky-800 font-semibold block">Under Review</span>
          <span className="text-2xl font-black text-[#1B365D]">{appliedCount}</span>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
          <span className="text-[11px] text-indigo-800 font-semibold block">Shortlisted</span>
          <span className="text-2xl font-black text-[#1B365D]">{shortlistedCount}</span>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
          <span className="text-[11px] text-stone-600 font-semibold block">Offers / Selected</span>
          <span className="text-2xl font-black text-[#1B365D]">{selectedCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by opportunity title, employer, or match criteria…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D]"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'applied', 'shortlisted', 'selected', 'rejected'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-[#1B365D] text-white shadow-2xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {st} {st !== 'all' ? `(${applications.filter((a) => a.status === st).length})` : `(${totalCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Main List Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
          <Loader2 className="w-7 h-7 text-sky-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-500 font-medium">Loading your applications…</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-xs space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-sm font-bold text-stone-900">Failed to Load Applications</h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={() => loadApplications(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B365D] text-white text-xs font-bold hover:bg-[#152a48] transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs space-y-4">
          <ClipboardList className="w-12 h-12 text-stone-300 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#1B365D]">No Applications Found</h2>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'No submitted applications match your search or filter criteria.'
                : 'You have not applied to any opportunities yet. Browse clinical and research postings matched to your NCISM skill taxonomy profile.'}
            </p>
          </div>
          <Link
            href="/student/opportunities"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B365D] text-white text-xs font-bold hover:bg-[#152a48] transition shadow-xs"
          >
            <span>Explore Matched Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const opp = app.opportunities
            const score = typeof app.match_score === 'number' ? Math.round(app.match_score) : null
            const reqSkills = opp?.opportunity_required_skills || []

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs hover:border-stone-300 transition space-y-4"
              >
                {/* Header row: Opp info + Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-bold text-[#1B365D]">
                        {opp ? opp.title : 'Opportunity'}
                      </span>
                      {opp && (
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                          {opp.type}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                      {opp?.organization && (
                        <span className="flex items-center gap-1 font-semibold text-stone-700">
                          <Building2 className="w-3.5 h-3.5 text-stone-400" />
                          {opp.organization}
                        </span>
                      )}
                      {opp?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          {opp.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        Applied {new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Status & Match Score badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    {score !== null && (
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          Match Score
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50 border border-sky-200">
                          <Sparkles className="w-3.5 h-3.5 text-[#1B365D]" />
                          <span className="text-sm font-black text-[#1B365D]">{score}%</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1 text-right">
                        Review Status
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                </div>

                {/* Description snippet */}
                {opp?.description && (
                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>
                )}

                {/* Match Reasons */}
                {app.match_reasons && app.match_reasons.length > 0 && (
                  <div className="border-t border-stone-100 pt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                      Match Compatibility Reasoning:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {app.match_reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 font-medium"
                        >
                          <CheckCircle2 className="w-3 h-3 text-sky-600 shrink-0" />
                          <span>{reason}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required Skills breakdown */}
                {reqSkills.length > 0 && (
                  <div className="border-t border-stone-100 pt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mr-1">
                      Required Taxonomy Domains:
                    </span>
                    {reqSkills.map((sk) => (
                      <span
                        key={sk.id}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#FFFCF6] border border-stone-200 font-medium text-stone-800"
                      >
                        <span>{sk.skill_taxonomy?.name || sk.domain_id}</span>
                        <span className="font-mono font-bold text-[#1B365D] bg-sky-50 px-1 rounded text-[10px]">
                          ≥{sk.min_level}%
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
