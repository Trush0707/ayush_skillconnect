'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Building2,
  BarChart3,
  RefreshCw,
  Loader2,
  AlertCircle,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Users,
  TrendingUp,
  Info,
} from 'lucide-react'


// ---------------------------------------------------------------------------
// Type matching the Route Handler payload:
// array of { domain_id, domain_name, avg_level, student_count }
// ---------------------------------------------------------------------------
export interface InstitutionDomainMetric {
  domain_id: string
  domain_name: string
  avg_level: number
  student_count: number
}

// ---------------------------------------------------------------------------
// Visual SVG Bar Chart Component — identical pure SVG paradigm as Phase 4
// Visual consistency: Institutional Navy #1B365D, Sky #38bdf8, Indigo #6366f1
// Strictly ZERO green colors per design.md
// ---------------------------------------------------------------------------
interface DomainBreakdownChartProps {
  metrics: InstitutionDomainMetric[]
}

function DomainBreakdownChart({ metrics }: DomainBreakdownChartProps) {
  const BAR_HEIGHT = 28
  const BAR_GAP = 14
  const LABEL_WIDTH = 240
  const SCORE_WIDTH = 110
  const CHART_WIDTH = 360
  const CHART_PADDING_TOP = 36
  const CHART_PADDING_BOTTOM = 24

  const totalHeight =
    CHART_PADDING_TOP +
    metrics.length * (BAR_HEIGHT + BAR_GAP) -
    BAR_GAP +
    CHART_PADDING_BOTTOM

  const refLines = [25, 50, 75, 100]

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[720px]">
        <svg
          viewBox={`0 0 ${LABEL_WIDTH + CHART_WIDTH + SCORE_WIDTH} ${totalHeight}`}
          width="100%"
          aria-label="Institutional AYUSH Domain Competency Bar Chart displaying average effective skill level per domain"
          role="img"
          className="select-none"
        >
          {/* Grid lines and tick markers */}
          {refLines.map((val) => {
            const x = LABEL_WIDTH + (val / 100) * CHART_WIDTH
            return (
              <g key={val}>
                <line
                  x1={x}
                  y1={CHART_PADDING_TOP - 12}
                  x2={x}
                  y2={totalHeight - CHART_PADDING_BOTTOM + 8}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={val === 100 ? 'none' : '4,3'}
                />
                <text
                  x={x}
                  y={CHART_PADDING_TOP - 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="500"
                >
                  {val}%
                </text>
              </g>
            )
          })}

          {/* Left Y-axis boundary line */}
          <line
            x1={LABEL_WIDTH}
            y1={CHART_PADDING_TOP - 12}
            x2={LABEL_WIDTH}
            y2={totalHeight - CHART_PADDING_BOTTOM + 8}
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* Domain Bars */}
          {metrics.map((item, idx) => {
            const y = CHART_PADDING_TOP + idx * (BAR_HEIGHT + BAR_GAP)
            const barW = (Math.min(item.avg_level, 100) / 100) * CHART_WIDTH
            const isAssessed = item.student_count > 0 && item.avg_level > 0

            return (
              <g key={item.domain_id} className="group">
                {/* Domain name label */}
                <text
                  x={LABEL_WIDTH - 10}
                  y={y + BAR_HEIGHT / 2 + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill={isAssessed ? '#1B365D' : '#64748b'}
                  fontWeight={isAssessed ? '600' : '400'}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {item.domain_name.length > 30
                    ? item.domain_name.substring(0, 28) + '…'
                    : item.domain_name}
                </text>

                {/* Bar slot track */}
                <rect
                  x={LABEL_WIDTH}
                  y={y}
                  width={CHART_WIDTH}
                  height={BAR_HEIGHT}
                  rx="6"
                  fill="#f1f5f9"
                />

                {/* Active Level Bar fill (Navy / Sky accents, no green) */}
                {isAssessed && (
                  <rect
                    x={LABEL_WIDTH}
                    y={y}
                    width={Math.max(barW, 6)}
                    height={BAR_HEIGHT}
                    rx="6"
                    fill="#1B365D"
                    className="transition-all duration-300"
                  />
                )}

                {/* Bar value label & student count */}
                <text
                  x={LABEL_WIDTH + CHART_WIDTH + 12}
                  y={y + BAR_HEIGHT / 2 + 4}
                  fontSize="11"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="700"
                  fill={isAssessed ? '#1B365D' : '#94a3b8'}
                >
                  {item.avg_level.toFixed(1)}%
                </text>

                <text
                  x={LABEL_WIDTH + CHART_WIDTH + 62}
                  y={y + BAR_HEIGHT / 2 + 4}
                  fontSize="10"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fill="#64748b"
                >
                  ({item.student_count} {item.student_count === 1 ? 'student' : 'students'})
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Admin Dashboard Page Component
// ---------------------------------------------------------------------------
export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<InstitutionDomainMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filters & sorting state
  const [filterMode, setFilterMode] = useState<'all' | 'assessed' | 'gap'>('all')
  const [sortOrder, setSortOrder] = useState<'alpha' | 'scoreDesc' | 'scoreAsc'>('alpha')

  // Real-time fetch from /api/institution/dashboard
  async function fetchDashboardMetrics(showSpinner = true) {
    if (showSpinner) {
      setIsRefreshing(true)
    }
    setError(null)

    try {
      const response = await fetch('/api/institution/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `HTTP error ${response.status}: Failed to fetch institutional metrics`
        )
      }

      const data: InstitutionDomainMetric[] = await response.json()
      setMetrics(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred while loading metrics.'
      setError(message)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardMetrics(false)
  }, [])

  // Derived Real Calculations (Strictly 100% real database records per Rules.md #7)
  const totalMonitoredDomains = metrics.length
  const assessedDomains = metrics.filter((m) => m.student_count > 0)
  const totalStudentCompetencies = metrics.reduce((sum, m) => sum + m.student_count, 0)

  // Real cohort effective mean score
  const cohortMeanScore = useMemo(() => {
    if (assessedDomains.length === 0) return 0
    const totalEffective = assessedDomains.reduce((sum, m) => sum + m.avg_level, 0)
    return Math.round((totalEffective / assessedDomains.length) * 10) / 10
  }, [assessedDomains])

  // Filtered & Sorted list for the breakdown chart and table
  const displayedMetrics = useMemo(() => {
    let list = [...metrics]

    if (filterMode === 'assessed') {
      list = list.filter((m) => m.student_count > 0)
    } else if (filterMode === 'gap') {
      // Domains with scores < 50% or unassessed
      list = list.filter((m) => m.avg_level < 50)
    }

    if (sortOrder === 'scoreDesc') {
      list.sort((a, b) => b.avg_level - a.avg_level)
    } else if (sortOrder === 'scoreAsc') {
      list.sort((a, b) => a.avg_level - b.avg_level)
    } else {
      list.sort((a, b) => a.domain_name.localeCompare(b.domain_name))
    }

    return list
  }, [metrics, filterMode, sortOrder])

  // Honest Empty State Check (Rules.md Rule #7):
  // True if metrics array is empty or every single domain has 0 assessed students.
  const isEmptyState =
    !loading &&
    !error &&
    (metrics.length === 0 || metrics.every((m) => m.student_count === 0))

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Institutional Trust Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-100 text-[#1B365D] px-2.5 py-0.5 rounded-full border border-sky-200">
              Institutional Admin Analytics
            </span>
            <span className="text-[11px] font-semibold text-stone-500">
              NCISM-Aligned Taxonomy
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B365D] tracking-tight">
            Cohort Competency & Curriculum Gap Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Real-time multi-table aggregation across verified student assessment tiers and evidence multipliers
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="admin-refresh-metrics-btn"
            type="button"
            onClick={() => fetchDashboardMetrics(true)}
            disabled={isRefreshing || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#1B365D] hover:bg-stone-50 hover:border-[#1B365D] transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Refresh analytics from live database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
            <span>{isRefreshing ? 'Refreshing…' : 'Refresh Real Data'}</span>
          </button>
        </div>
      </div>

      {/* Database Verification Banner per Rules.md #7 */}
      <div className="rounded-xl bg-sky-50/80 border border-sky-200 p-4 text-xs text-[#1B365D] flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-[#1B365D] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold">
            Live data — calculated in real time from actual student assessment records
          </div>
          <p className="text-stone-600 leading-relaxed">
            All metrics rendered below are calculated dynamically via server-side service-role client at{' '}
            <code className="bg-white/80 px-1.5 py-0.5 rounded border border-sky-300 font-mono text-[11px]">
              /api/institution/dashboard
            </code>
            . Effective skill scores reflect the formula{' '}
            <span className="font-semibold text-[#1B365D]">
              raw_score × tier_multiplier
            </span>{' '}
            (Unassessed: 0.0×, Theory-verified: 0.4×, Observed: 0.7×, Institution-verified: 1.0×).
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B365D] mx-auto mb-3" />
          <h2 className="text-base font-bold text-[#1B365D]">
            Aggregating Live Student Competency Metrics…
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Running server-side SQL join across student_skill_levels and skill_taxonomy
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-rose-900">
                Failed to load institutional aggregation data
              </h2>
              <p className="text-xs text-rose-700 font-mono bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                {error}
              </p>
              <button
                type="button"
                onClick={() => fetchDashboardMetrics(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B365D] hover:underline pt-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry live query</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Honest Empty State UI (Rules.md Rule #7) */}
      {isEmptyState && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 shadow-xs text-center">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto mb-4 text-[#1B365D]">
              <BarChart3 className="w-8 h-8 text-[#1B365D]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#1B365D] tracking-tight">
              No Student Competency Records in Database Yet
            </h2>
            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              Institutional analytics aggregate live assessment scores and faculty evidence tier sign-offs across registered student profiles. In accordance with our zero-mock data policy, placeholder numbers are never fabricated.
            </p>

            {/* Live Database Snapshot Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6 text-left">
              <div className="bg-[#FFFCF6] border border-stone-200 rounded-xl p-3.5">
                <span className="text-[11px] text-stone-500 block">Monitored Domains</span>
                <span className="text-xl font-black text-[#1B365D]">{totalMonitoredDomains}</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">NCISM Taxonomy</span>
              </div>
              <div className="bg-[#FFFCF6] border border-stone-200 rounded-xl p-3.5">
                <span className="text-[11px] text-stone-500 block">Assessed Cohort</span>
                <span className="text-xl font-black text-[#1B365D]">0 Students</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Live DB Count</span>
              </div>
              <div className="bg-[#FFFCF6] border border-stone-200 rounded-xl p-3.5">
                <span className="text-[11px] text-stone-500 block">Mean Effective</span>
                <span className="text-xl font-black text-[#1B365D]">0.0%</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Awaiting Submissions</span>
              </div>
              <div className="bg-[#FFFCF6] border border-stone-200 rounded-xl p-3.5">
                <span className="text-[11px] text-stone-500 block">Evidence Tier Status</span>
                <span className="text-xl font-black text-[#1B365D]">Level 0</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Unassessed Baseline</span>
              </div>
            </div>

            {/* Step-by-step pipeline guidance */}
            <div className="max-w-2xl mx-auto mt-8 p-5 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs text-stone-700 space-y-2.5">
              <div className="font-bold text-[#1B365D] flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-600" />
                <span>How Live Data Populates This Dashboard:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-stone-600 pl-1">
                <li>
                  A student completes the adaptive branching questionnaire at{' '}
                  <code className="text-[#1B365D] font-semibold">/student/assessment</code>.
                </li>
                <li>
                  Assessment answers generate scores saved in{' '}
                  <code className="text-[#1B365D] font-semibold">student_skill_levels</code> with Evidence Tier 1 (0.4× weight multiplier).
                </li>
                <li>
                  Faculty and institutional verifiers elevate clinical observations to Tier 2 (0.7×) or Tier 3 (1.0×).
                </li>
                <li>
                  This dashboard recalculates real-time cohort averages and curriculum gap distributions instantly.
                </li>
              </ol>
            </div>

            {/* Quick Demo Navigation */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/student/assessment"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B365D] text-white text-xs font-bold hover:bg-[#152a48] transition-colors shadow-sm"
              >
                <span>Take Adaptive Assessment Demo</span>
                <ArrowRight className="w-4 h-4 text-sky-200" />
              </Link>
              <button
                type="button"
                onClick={() => fetchDashboardMetrics(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-query Database</span>
              </button>
            </div>
          </div>

          {/* Transparent Taxonomy Preview Table */}
          {metrics.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <div className="border-b border-stone-100 pb-4 mb-4">
                <h3 className="text-base font-bold text-[#1B365D]">
                  Monitored Skill Taxonomy Domains (Seeded Catalog)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  12 officially recognized domains ready to aggregate student submissions
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 font-bold">Domain ID</th>
                      <th className="py-2.5 px-3 font-bold">Taxonomy Domain Name</th>
                      <th className="py-2.5 px-3 font-bold">Evaluated Students</th>
                      <th className="py-2.5 px-3 font-bold">Effective Skill Level</th>
                      <th className="py-2.5 px-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {metrics.map((row) => (
                      <tr key={row.domain_id} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-3 font-mono text-stone-500">{row.domain_id}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#1B365D]">{row.domain_name}</td>
                        <td className="py-2.5 px-3 font-mono text-stone-600">0</td>
                        <td className="py-2.5 px-3 font-mono text-stone-400">0.0%</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                            Awaiting Assessment
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Populated Analytics View (Rendered when real student skill levels exist) */}
      {!loading && !isEmptyState && metrics.length > 0 && (
        <div className="space-y-8">
          {/* Real Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
                <span>Taxonomy Domains</span>
                <BookOpen className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-black text-[#1B365D]">
                {totalMonitoredDomains}
              </div>
              <span className="text-[11px] text-stone-400 block mt-0.5">
                NCISM Curriculum Base
              </span>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
                <span>Assessed Domains</span>
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-[#1B365D]">
                {assessedDomains.length} / {totalMonitoredDomains}
              </div>
              <span className="text-[11px] text-stone-400 block mt-0.5">
                Domains with Live Submissions
              </span>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
                <span>Cohort Mean Score</span>
                <TrendingUp className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-black text-[#1B365D]">
                {cohortMeanScore.toFixed(1)}%
              </div>
              <span className="text-[11px] text-stone-400 block mt-0.5">
                Across Assessed Domains
              </span>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
                <span>Evaluated Competencies</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-[#1B365D]">
                {totalStudentCompetencies}
              </div>
              <span className="text-[11px] text-stone-400 block mt-0.5">
                Verified Skill Records
              </span>
            </div>
          </div>

          {/* SVG Domain Breakdown Bar Chart Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5 mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#1B365D]">
                  Domain Competency Breakdown
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Average effective skill level (raw score × tier multiplier) across all evaluated students
                </p>
              </div>

              {/* Chart Filter and Sort Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      filterMode === 'all'
                        ? 'bg-[#1B365D] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    All ({metrics.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('assessed')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      filterMode === 'assessed'
                        ? 'bg-[#1B365D] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Assessed ({assessedDomains.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('gap')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      filterMode === 'gap'
                        ? 'bg-[#1B365D] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Gaps (&lt;50%)
                  </button>
                </div>

                <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSortOrder('alpha')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      sortOrder === 'alpha'
                        ? 'bg-[#1B365D] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Sort Alphabetically"
                  >
                    A-Z
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortOrder('scoreDesc')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      sortOrder === 'scoreDesc'
                        ? 'bg-[#1B365D] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Sort Highest Score First"
                  >
                    High ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortOrder('scoreAsc')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      sortOrder === 'scoreAsc'
                        ? 'bg-[#1B365D] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Sort Lowest Score First (Curriculum Gaps)"
                  >
                    Low ↑
                  </button>
                </div>
              </div>
            </div>

            {/* Render the SVG Bar Chart */}
            {displayedMetrics.length > 0 ? (
              <DomainBreakdownChart metrics={displayedMetrics} />
            ) : (
              <div className="py-12 text-center text-xs text-stone-500">
                No domains match the selected filter.
              </div>
            )}

            {/* Evidence Tier Multiplier Legend */}
            <div className="mt-8 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1B365D]">Evidence Weight Logic:</span>
                <span>Effective Level = Raw Assessment Score × Tier Multiplier</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                  <span className="w-2 h-2 rounded-full bg-stone-400" />
                  Tier 0: 0.0× (Unassessed)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-50 text-sky-900 border border-sky-200">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Tier 1: 0.4× (Quiz Theory)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Tier 2: 0.7× (Observed)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1B365D] text-white">
                  <span className="w-2 h-2 rounded-full bg-sky-300" />
                  Tier 3: 1.0× (Institution Verified)
                </span>
              </div>
            </div>
          </div>

          {/* Real Tabular Breakdown */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
            <div className="border-b border-stone-100 pb-4 mb-4">
              <h2 className="text-base font-bold text-[#1B365D]">
                Detailed Cohort Skill Distribution & Curriculum Gap Status
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Exact aggregations computed across all student competency records
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-bold">AYUSH Taxonomy Domain</th>
                    <th className="py-3 px-4 font-bold">Assessed Students</th>
                    <th className="py-3 px-4 font-bold">Average Effective Level</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Visual Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {displayedMetrics.map((row) => {
                    const isAssessed = row.student_count > 0

                    let statusLabel = 'Unassessed'
                    let statusClasses = 'bg-stone-100 text-stone-600 border-stone-200'

                    if (isAssessed) {
                      if (row.avg_level >= 70) {
                        statusLabel = 'Strong Competency'
                        statusClasses = 'bg-sky-100 text-[#1B365D] border-sky-300'
                      } else if (row.avg_level >= 45) {
                        statusLabel = 'Core Competency'
                        statusClasses = 'bg-indigo-50 text-indigo-900 border-indigo-200'
                      } else {
                        statusLabel = 'Curriculum Focus Area'
                        statusClasses = 'bg-amber-100 text-amber-900 border-amber-300'
                      }
                    }

                    return (
                      <tr key={row.domain_id} className="hover:bg-stone-50/50">
                        <td className="py-3 px-4 font-semibold text-[#1B365D]">
                          {row.domain_name}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-stone-700">
                          {row.student_count}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#1B365D]">
                          {row.avg_level.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusClasses}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 w-44">
                          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#1B365D] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(row.avg_level, 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
