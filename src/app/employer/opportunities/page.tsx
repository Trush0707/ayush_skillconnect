'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ArrowRight,
  Filter,
  RefreshCw,
  Power,
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

interface OpportunityItem {
  id: string
  title: string
  type: 'internship' | 'job'
  organization: string
  description: string | null
  location: string | null
  status: 'open' | 'closed'
  posted_at: string
  opportunity_required_skills?: RequiredSkill[]
  applicant_count?: number
}

export default function EmployerOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function loadOpportunities(isManualRefresh = false) {
    if (isManualRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('Please sign in as an employer to view your opportunities.')
      }

      // Fetch employer's opportunities with required skills
      const { data: oppsData, error: oppsError } = await supabase
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
        .eq('employer_auth_id', user.id)
        .order('posted_at', { ascending: false })

      if (oppsError) {
        throw new Error(oppsError.message || 'Failed to fetch opportunities.')
      }

      const oppList = (oppsData as unknown as OpportunityItem[]) || []

      // If we have opportunities, fetch application counts
      if (oppList.length > 0) {
        const oppIds = oppList.map((o) => o.id)
        const { data: appsData, error: appsError } = await supabase
          .from('applications')
          .select('opportunity_id')
          .in('opportunity_id', oppIds)

        if (!appsError && appsData) {
          const counts: Record<string, number> = {}
          appsData.forEach((app: { opportunity_id: string }) => {
            counts[app.opportunity_id] = (counts[app.opportunity_id] || 0) + 1
          })
          oppList.forEach((opp) => {
            opp.applicant_count = counts[opp.id] || 0
          })
        }
      }

      setOpportunities(oppList)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while loading opportunities.'
      setError(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadOpportunities()

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        loadOpportunities()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  async function toggleStatus(oppId: string, currentStatus: 'open' | 'closed') {
    setTogglingId(oppId)
    const nextStatus = currentStatus === 'open' ? 'closed' : 'open'
    try {
      const { error: updateError } = await supabase
        .from('opportunities')
        .update({ status: nextStatus })
        .eq('id', oppId)

      if (updateError) {
        alert(`Failed to update status: ${updateError.message}`)
      } else {
        setOpportunities((prev) =>
          prev.map((o) => (o.id === oppId ? { ...o, status: nextStatus } : o))
        )
      }
    } catch {
      alert('An unexpected error occurred.')
    } finally {
      setTogglingId(null)
    }
  }

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesSearch =
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opp.location && opp.location.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus =
        statusFilter === 'all' ? true : opp.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [opportunities, searchQuery, statusFilter])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-100 text-[#1B365D] px-2.5 py-0.5 rounded-full border border-sky-200">
              Employer Portal
            </span>
            <span className="text-[11px] font-semibold text-stone-500">
              Opportunity Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B365D] tracking-tight">
            My Posted Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Manage your clinical and research postings, track required NCISM domains, and evaluate matched applicants.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => loadOpportunities(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#1B365D] hover:bg-stone-50 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Refresh opportunities list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
            <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
          </button>

          <Link
            href="/employer/opportunities/new"
            id="post-opportunity-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B365D] text-white text-xs font-bold hover:bg-[#152a48] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Post Opportunity</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, organization, or location..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 bg-[#FFFCF6] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-transparent transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#1B365D] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({opportunities.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('open')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'open'
                  ? 'bg-[#1B365D] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Open ({opportunities.filter((o) => o.status === 'open').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('closed')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'closed'
                  ? 'bg-[#1B365D] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Closed ({opportunities.filter((o) => o.status === 'closed').length})
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B365D] mx-auto mb-3" />
          <h2 className="text-base font-bold text-[#1B365D]">Loading Your Postings…</h2>
          <p className="text-xs text-stone-500 mt-1">Retrieving opportunities and applicant statistics from Supabase</p>
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
                onClick={() => loadOpportunities(true)}
                className="mt-3 text-xs font-bold text-[#1B365D] hover:underline"
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
            <Briefcase className="w-7 h-7 text-[#1B365D]" />
          </div>
          <h2 className="text-lg font-bold text-[#1B365D]">No Opportunities Posted Yet</h2>
          <p className="max-w-md mx-auto text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
            Create your first clinical internship or job posting with specific NCISM taxonomy requirements to begin receiving verified candidate matches.
          </p>
          <div className="mt-6">
            <Link
              href="/employer/opportunities/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B365D] text-white text-xs font-bold hover:bg-[#152a48] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Post Your First Opportunity</span>
            </Link>
          </div>
        </div>
      )}

      {/* Filtered Empty State */}
      {!loading && !error && opportunities.length > 0 && filteredOpportunities.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500 text-xs shadow-xs">
          No opportunities match your search or filter criteria.
        </div>
      )}

      {/* Opportunities List */}
      {!loading && !error && filteredOpportunities.length > 0 && (
        <div className="space-y-4">
          {filteredOpportunities.map((opp) => {
            const isOpen = opp.status === 'open'
            const requiredSkills = opp.opportunity_required_skills || []

            return (
              <div
                key={opp.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs hover:border-[#1B365D] transition-all flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-[#1B365D]">{opp.title}</h2>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-[#1B365D] border border-sky-200">
                          {opp.type === 'internship' ? 'Clinical Internship' : 'Full-Time Job'}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            isOpen
                              ? 'bg-sky-100 text-[#1B365D] border-sky-300'
                              : 'bg-stone-100 text-stone-600 border-stone-300'
                          }`}
                        >
                          {isOpen ? '● Active' : '○ Closed'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                        <span className="flex items-center gap-1 font-medium text-stone-700">
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

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleStatus(opp.id, opp.status)}
                        disabled={togglingId === opp.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer disabled:opacity-50"
                        title={isOpen ? 'Close this opportunity' : 'Re-open this opportunity'}
                      >
                        <Power className="w-3 h-3" />
                        <span>{isOpen ? 'Close' : 'Re-open'}</span>
                      </button>

                      <Link
                        href={`/employer/opportunities/${opp.id}/applicants`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1B365D] text-white text-xs font-bold hover:bg-[#152a48] transition shadow-xs"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Applicants ({opp.applicant_count ?? 0})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {opp.description && (
                    <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 mt-2 leading-relaxed">
                      {opp.description}
                    </p>
                  )}
                </div>

                {/* Required Skill Thresholds */}
                <div className="border-t border-stone-100 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mr-1">
                      Required Taxonomy Domains:
                    </span>
                    {requiredSkills.length > 0 ? (
                      requiredSkills.map((sk) => (
                        <span
                          key={sk.id}
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-[#FFFCF6] border border-stone-200 font-medium text-stone-800"
                        >
                          <span>{sk.skill_taxonomy?.name || sk.domain_id}</span>
                          <span className="font-mono font-bold text-[#1B365D] bg-sky-50 px-1 rounded text-[10px]">
                            ≥{sk.min_level}%
                          </span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-stone-400 italic">None specified</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-stone-500 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>RLS Protected</span>
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
