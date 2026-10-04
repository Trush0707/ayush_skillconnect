'use client'

import { use, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Users,
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface StudentProfile {
  id: string
  full_name: string | null
  discipline: string
  institution: string | null
  semester: number | null
  interests: string[] | null
}

interface ApplicationItem {
  id: string
  student_id: string
  opportunity_id: string
  match_score: number | null
  match_reasons: string[] | null
  status: 'applied' | 'shortlisted' | 'rejected' | 'selected'
  applied_at: string
  student_profiles: StudentProfile | null
}

interface OpportunityDetail {
  id: string
  title: string
  type: 'internship' | 'job'
  organization: string
  description: string | null
  location: string | null
  status: 'open' | 'closed'
  posted_at?: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EmployerApplicantsPage(props: PageProps) {
  const unwrappedParams = use(props.params)
  const routeParams = useParams()
  const opportunityId = unwrappedParams?.id || (routeParams?.id as string)

  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null)
  const [applicants, setApplicants] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'applied' | 'shortlisted' | 'selected' | 'rejected'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function loadData(isManual = false) {
    if (!opportunityId) return
    if (isManual) {
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
        throw new Error('Please sign in as an employer to view applicants.')
      }

      // 1. Fetch opportunity details
      const { data: oppData, error: oppErr } = await supabase
        .from('opportunities')
        .select('id, title, type, organization, description, location, status, posted_at')
        .eq('id', opportunityId)
        .single()

      if (oppErr || !oppData) {
        throw new Error(oppErr?.message || 'Opportunity details could not be found.')
      }

      setOpportunity(oppData as OpportunityDetail)

      // 2. Fetch applicants for this opportunity
      const { data: appsData, error: appsErr } = await supabase
        .from('applications')
        .select(`
          id,
          student_id,
          opportunity_id,
          match_score,
          match_reasons,
          status,
          applied_at,
          student_profiles (
            id,
            full_name,
            discipline,
            institution,
            semester,
            interests
          )
        `)
        .eq('opportunity_id', opportunityId)
        .order('match_score', { ascending: false })

      if (appsErr) {
        throw new Error(appsErr.message || 'Failed to fetch applicants list.')
      }

      setApplicants((appsData as unknown as ApplicationItem[]) || [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred while loading applicants.'
      setError(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [opportunityId])

  async function handleUpdateStatus(
    applicationId: string,
    newStatus: 'applied' | 'shortlisted' | 'rejected' | 'selected'
  ) {
    setUpdatingId(applicationId)
    try {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId)

      if (updateError) {
        alert(`Failed to update application status: ${updateError.message}`)
      } else {
        setApplicants((prev) =>
          prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
        )
      }
    } catch {
      alert('An unexpected error occurred while updating applicant status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => {
      const profile = app.student_profiles
      const fullName = (profile?.full_name || '').toLowerCase()
      const discipline = profile?.discipline?.toLowerCase() || ''
      const institution = profile?.institution?.toLowerCase() || ''
      const reasons = (app.match_reasons || []).join(' ').toLowerCase()
      const query = searchQuery.toLowerCase().trim()

      const matchesSearch =
        query === '' ||
        fullName.includes(query) ||
        discipline.includes(query) ||
        institution.includes(query) ||
        reasons.includes(query)

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [applicants, searchQuery, statusFilter])

  // Count summaries
  const totalCount = applicants.length
  const shortlistedCount = applicants.filter((a) => a.status === 'shortlisted').length
  const selectedCount = applicants.filter((a) => a.status === 'selected').length
  const appliedCount = applicants.filter((a) => a.status === 'applied').length

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/employer/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B365D] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Opportunities</span>
        </Link>
        <span className="text-stone-300">/</span>
        <span className="text-xs text-stone-500 font-medium">Applicant Roster</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-100 text-[#1B365D] px-2.5 py-0.5 rounded-full border border-sky-200">
              Candidate Evaluation
            </span>
            <span className="text-[11px] font-semibold text-stone-500">
              NCISM Benchmark Review
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B365D] tracking-tight">
            {opportunity ? opportunity.title : 'Applicants Roster'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Review applicant match scores, explainable NCISM competency reasoning, and manage recruitment stages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#1B365D] hover:bg-stone-50 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Refresh applicants list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
            <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Opportunity Overview Card */}
      {opportunity && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                  {opportunity.type}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                    opportunity.status === 'open'
                      ? 'bg-sky-50 text-[#1B365D] border-sky-200'
                      : 'bg-stone-50 text-stone-600 border-stone-200'
                  }`}
                >
                  {opportunity.status === 'open' ? 'Active Posting' : 'Closed'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 pt-1">
                <span className="flex items-center gap-1 font-semibold text-stone-800">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  {opportunity.organization}
                </span>
                {opportunity.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {opportunity.location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>RLS Protected Evaluation</span>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
              <span className="text-[11px] text-stone-500 font-medium block">Total Applicants</span>
              <span className="text-xl font-black text-[#1B365D]">{totalCount}</span>
            </div>
            <div className="bg-sky-50 rounded-xl p-3 border border-sky-100">
              <span className="text-[11px] text-sky-800 font-medium block">In Review</span>
              <span className="text-xl font-black text-[#1B365D]">{appliedCount}</span>
            </div>
            <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
              <span className="text-[11px] text-indigo-800 font-medium block">Shortlisted</span>
              <span className="text-xl font-black text-[#1B365D]">{shortlistedCount}</span>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
              <span className="text-[11px] text-stone-600 font-medium block">Selected / Offered</span>
              <span className="text-xl font-black text-[#1B365D]">{selectedCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search candidates by name, discipline, institution, or competency reasoning…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D]"
          />
        </div>

        {/* Status Filter Buttons */}
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
              {st} {st !== 'all' ? `(${applicants.filter((a) => a.status === st).length})` : `(${totalCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
          <Loader2 className="w-7 h-7 text-sky-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-500 font-medium">Loading candidate applications…</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-xs space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-sm font-bold text-stone-900">Failed to Load Applicants</h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={() => loadData(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B365D] text-white text-xs font-bold hover:bg-[#152a48] transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : filteredApplicants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs space-y-3">
          <Users className="w-10 h-10 text-stone-300 mx-auto" />
          <h2 className="text-base font-bold text-[#1B365D]">No Applicants Found</h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'No candidate applications match the selected filter criteria.'
              : 'No students have applied to this posting yet. Matched scholars will appear here once applications are submitted.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplicants.map((app) => {
            const profile = app.student_profiles
            const score = typeof app.match_score === 'number' ? Math.round(app.match_score) : null
            const isUpdating = updatingId === app.id

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs hover:border-stone-300 transition space-y-4"
              >
                {/* Candidate & Match Score Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-[#1B365D]">
                        {profile?.full_name?.trim() ? profile.full_name.trim() : 'Name not provided'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 font-medium">
                        {profile?.discipline || 'AYUSH Scholar'}
                      </span>
                      {profile?.institution && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 font-medium">
                          {profile.institution}
                        </span>
                      )}
                      {profile?.semester && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-sky-50 text-[#1B365D] border border-sky-100 font-medium">
                          Semester {profile.semester}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        Applied {new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    {score !== null && (
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          Match Score
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50 border border-sky-200">
                          <Target className="w-3.5 h-3.5 text-[#1B365D]" />
                          <span className="text-sm font-black text-[#1B365D]">{score}%</span>
                        </div>
                      </div>
                    )}

                    {/* Status Dropdown */}
                    <div className="flex flex-col items-end">
                      <label htmlFor={`status-${app.id}`} className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                        Status
                      </label>
                      <div className="relative">
                        <select
                          id={`status-${app.id}`}
                          aria-label={`Status for candidate ${profile?.full_name || profile?.discipline || 'AYUSH Scholar'}`}
                          value={app.status}
                          disabled={isUpdating}
                          onChange={(e) =>
                            handleUpdateStatus(
                              app.id,
                              e.target.value as 'applied' | 'shortlisted' | 'rejected' | 'selected'
                            )
                          }
                          className="text-xs font-bold rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 pr-7 focus:outline-hidden focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D] cursor-pointer disabled:opacity-50"
                        >
                          <option value="applied">Applied</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="selected">Selected</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        {isUpdating && (
                          <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Reasons & Competencies */}
                {app.match_reasons && app.match_reasons.length > 0 && (
                  <div className="border-t border-stone-100 pt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                      Deterministic Match Reasoning:
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
