'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  BookOpen,
  TrendingUp,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Types — matching Schema.md exactly
// ---------------------------------------------------------------------------
interface SkillTaxonomy {
  domain_id: string
  name: string
  description: string | null
  ncism_pos: string[] | null
  evidence_types: string[] | null
}

interface StudentSkillLevel {
  id: string
  student_id: string
  domain_id: string
  raw_score: number | null
  evidence_tier: 0 | 1 | 2 | 3
  evidence_notes: string | null
}

interface StudentProfile {
  id: string
  auth_user_id: string
  discipline: string
  institution: string | null
  semester: number | null
  interests: string[] | null
}

// ---------------------------------------------------------------------------
// Merged domain view (taxonomy + optional skill level row)
// ---------------------------------------------------------------------------
interface DomainView {
  domain_id: string
  name: string
  description: string | null
  ncism_pos: string[] | null
  raw_score: number       // 0 if unassessed
  evidence_tier: 0 | 1 | 2 | 3
  evidence_notes: string | null
  has_assessment: boolean // false = no row yet → Level 0
}

// ---------------------------------------------------------------------------
// Evidence tier helpers (Techspec.md definitions)
// ---------------------------------------------------------------------------
const TIER_LABELS: Record<number, string> = {
  0: 'Level 0: Unassessed',
  1: 'Level 1: Theory-Verified',
  2: 'Level 2: Observed',
  3: 'Level 3: Institution-Verified',
}

const TIER_WEIGHT_LABELS: Record<number, string> = {
  0: '0.0× weight',
  1: '0.4× quiz weight',
  2: '0.7× clinical weight',
  3: '1.0× full weight',
}

// Badge styling per tier (navy accent, no green — design.md constraint)
const TIER_BADGE_CLASSES: Record<number, string> = {
  0: 'bg-stone-100 text-stone-600 border border-stone-300',
  1: 'bg-sky-100 text-sky-900 border border-sky-300',
  2: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
  3: 'bg-[#1B365D] text-white border border-sky-400',
}

// Bar color per tier
const TIER_BAR_CLASSES: Record<number, string> = {
  0: 'bg-stone-300',
  1: 'bg-sky-400',
  2: 'bg-indigo-500',
  3: 'bg-[#1B365D]',
}

// ---------------------------------------------------------------------------
// SVG Bar Chart component — pure SVG, no external dependency
// ---------------------------------------------------------------------------
interface BarChartProps {
  domains: DomainView[]
}

function DomainBarChart({ domains }: BarChartProps) {
  const BAR_HEIGHT = 28
  const BAR_GAP = 14
  const LABEL_WIDTH = 200
  const SCORE_WIDTH = 52
  const CHART_WIDTH = 340
  const CHART_PADDING_TOP = 32
  const CHART_PADDING_BOTTOM = 20

  const totalHeight =
    CHART_PADDING_TOP +
    domains.length * (BAR_HEIGHT + BAR_GAP) - BAR_GAP +
    CHART_PADDING_BOTTOM

  const refLines = [50, 75, 100]

  // SVG fill per tier — no green
  const fillMap: Record<number, string> = {
    0: '#d1d5db',
    1: '#38bdf8',
    2: '#6366f1',
    3: '#1B365D',
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[680px]">
        <svg
          viewBox={`0 0 ${LABEL_WIDTH + CHART_WIDTH + SCORE_WIDTH} ${totalHeight}`}
          width="100%"
          aria-label="Domain competency bar chart showing raw scores per AYUSH skill domain"
          role="img"
        >
          {/* Grid reference lines */}
          {refLines.map((val) => {
            const x = LABEL_WIDTH + (val / 100) * CHART_WIDTH
            return (
              <g key={val}>
                <line
                  x1={x}
                  y1={CHART_PADDING_TOP - 12}
                  x2={x}
                  y2={totalHeight - CHART_PADDING_BOTTOM + 6}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray={val === 100 ? 'none' : '4,3'}
                />
                <text
                  x={x}
                  y={CHART_PADDING_TOP - 16}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#9ca3af"
                  fontFamily="ui-monospace, monospace"
                >
                  {val}%
                </text>
              </g>
            )
          })}

          {/* Left axis */}
          <line
            x1={LABEL_WIDTH}
            y1={CHART_PADDING_TOP - 12}
            x2={LABEL_WIDTH}
            y2={totalHeight - CHART_PADDING_BOTTOM + 6}
            stroke="#d1d5db"
            strokeWidth="1"
          />

          {/* Bars */}
          {domains.map((d, i) => {
            const y = CHART_PADDING_TOP + i * (BAR_HEIGHT + BAR_GAP)
            const barW = (d.raw_score / 100) * CHART_WIDTH

            return (
              <g key={d.domain_id}>
                {/* Domain name label */}
                <text
                  x={LABEL_WIDTH - 8}
                  y={y + BAR_HEIGHT / 2 + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill={d.has_assessment ? '#1B365D' : '#9ca3af'}
                  fontWeight={d.has_assessment ? '600' : '400'}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {d.name.length > 28 ? d.name.substring(0, 26) + '…' : d.name}
                </text>

                {/* Bar background */}
                <rect
                  x={LABEL_WIDTH}
                  y={y}
                  width={CHART_WIDTH}
                  height={BAR_HEIGHT}
                  rx="5"
                  fill="#f3f4f6"
                />

                {/* Bar fill */}
                {d.raw_score > 0 && (
                  <rect
                    x={LABEL_WIDTH}
                    y={y}
                    width={Math.max(barW, 4)}
                    height={BAR_HEIGHT}
                    rx="5"
                    fill={fillMap[d.evidence_tier]}
                    opacity="0.92"
                  />
                )}

                {/* Score label */}
                <text
                  x={LABEL_WIDTH + CHART_WIDTH + 8}
                  y={y + BAR_HEIGHT / 2 + 4}
                  fontSize="11"
                  fill={d.has_assessment ? '#1B365D' : '#9ca3af'}
                  fontWeight="700"
                  fontFamily="ui-monospace, monospace"
                >
                  {d.has_assessment ? `${d.raw_score}%` : 'N/A'}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Chart legend — evidence tier labels */}
        <div className="flex flex-wrap gap-3 mt-2 px-2">
          {([0, 1, 2, 3] as const).map((tier) => (
            <div key={tier} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: fillMap[tier] }}
              />
              <span className="text-[10px] text-stone-500 font-medium">
                {TIER_LABELS[tier]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tier count helper
// ---------------------------------------------------------------------------
function computeTierCounts(domains: DomainView[]) {
  return {
    level3: domains.filter((d) => d.evidence_tier === 3).length,
    level2: domains.filter((d) => d.evidence_tier === 2).length,
    level1: domains.filter((d) => d.evidence_tier === 1).length,
    level0: domains.filter((d) => d.evidence_tier === 0).length,
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
type TabKey = 'chart' | 'all' | 'verified' | 'gaps'

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [domains, setDomains] = useState<DomainView[]>([])
  const [status, setStatus] = useState<'loading' | 'error' | 'unauthenticated' | 'ready'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('chart')

  // ---------------------------------------------------------------------------
  // Fetch: auth → student_profiles → skill_taxonomy + student_skill_levels
  // All reads go through Supabase client (RLS-gated, no Route Handler needed)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function loadProfile() {
      setStatus('loading')

      // 1. Resolve logged-in user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        setStatus('unauthenticated')
        return
      }

      // 2. Fetch student_profiles row (RLS: auth_user_id = auth.uid())
      const { data: profileData, error: profileError } = await supabase
        .from('student_profiles')
        .select('id, auth_user_id, discipline, institution, semester, interests')
        .eq('auth_user_id', user.id)
        .single()

      if (profileError || !profileData) {
        setErrorMsg(
          profileError?.message ??
            'Student profile not found. Please complete sign-up first.'
        )
        setStatus('error')
        return
      }

      setProfile(profileData as StudentProfile)

      // 3. Fetch full skill_taxonomy (all authenticated users may read)
      const { data: taxonomy, error: taxError } = await supabase
        .from('skill_taxonomy')
        .select('domain_id, name, description, ncism_pos, evidence_types')
        .order('name', { ascending: true })

      if (taxError || !taxonomy) {
        setErrorMsg(taxError?.message ?? 'Could not load skill taxonomy.')
        setStatus('error')
        return
      }

      // 4. Fetch this student's skill_level rows (RLS guards to own records)
      const { data: skillLevels, error: skillError } = await supabase
        .from('student_skill_levels')
        .select('id, student_id, domain_id, raw_score, evidence_tier, evidence_notes')
        .eq('student_id', profileData.id)

      if (skillError) {
        setErrorMsg(skillError.message)
        setStatus('error')
        return
      }

      // 5. Merge: every taxonomy domain gets a DomainView;
      //    domains with no student_skill_levels row default to Level 0: Unassessed
      const skillMap = new Map<string, StudentSkillLevel>()
      ;(skillLevels ?? []).forEach((sl) => {
        skillMap.set(sl.domain_id, sl as StudentSkillLevel)
      })

      const merged: DomainView[] = (taxonomy as SkillTaxonomy[]).map((tax) => {
        const sl = skillMap.get(tax.domain_id)
        if (sl) {
          return {
            domain_id: tax.domain_id,
            name: tax.name,
            description: tax.description,
            ncism_pos: tax.ncism_pos,
            raw_score: sl.raw_score ?? 0,
            evidence_tier: sl.evidence_tier as 0 | 1 | 2 | 3,
            evidence_notes: sl.evidence_notes,
            has_assessment: true,
          }
        }
        // No row → Level 0 Unassessed
        return {
          domain_id: tax.domain_id,
          name: tax.name,
          description: tax.description,
          ncism_pos: tax.ncism_pos,
          raw_score: 0,
          evidence_tier: 0 as const,
          evidence_notes: null,
          has_assessment: false,
        }
      })

      // Sort: highest raw_score first, unassessed at bottom
      merged.sort((a, b) => {
        if (!a.has_assessment && b.has_assessment) return 1
        if (a.has_assessment && !b.has_assessment) return -1
        return b.raw_score - a.raw_score
      })

      setDomains(merged)
      setStatus('ready')
    }

    loadProfile()
  }, [])

  // ---------------------------------------------------------------------------
  // Filter domains for list tabs
  // ---------------------------------------------------------------------------
  const filteredDomains = domains.filter((d) => {
    if (activeTab === 'verified') return d.evidence_tier >= 2
    if (activeTab === 'gaps') return d.raw_score < 70 || d.evidence_tier === 0
    return true
  })

  const counts = computeTierCounts(domains)
  const verifiedCount = domains.filter((d) => d.evidence_tier >= 2).length
  const gapCount = domains.filter((d) => d.raw_score < 70 || d.evidence_tier === 0).length

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#FFFCF6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-[#1B365D]">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-sm font-semibold text-stone-600">
            Loading your skill profile…
          </p>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Unauthenticated
  // ---------------------------------------------------------------------------
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#FFFCF6] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#1B365D] mx-auto" />
          <h1 className="text-2xl font-black text-[#1B365D]">Sign in required</h1>
          <p className="text-sm text-stone-600">
            You must be signed in as a student to view your skill profile.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B365D] text-white text-sm font-bold hover:bg-[#152a48] transition-colors shadow-sm"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#FFFCF6] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-black text-[#1B365D]">Could not load profile</h1>
          <p className="text-sm text-stone-600">{errorMsg}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/student/assessment"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B365D] text-white text-sm font-bold hover:bg-[#152a48] transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Take Assessment First</span>
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-sm font-semibold hover:bg-stone-200 transition-colors border border-stone-300 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Ready — render full profile
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FFFCF6] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Breadcrumb ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B365D] hover:underline bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Landing Page</span>
            </Link>
            <span className="text-stone-300">/</span>
            <Link
              href="/student/assessment"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B365D] hover:underline bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs"
            >
              <span>Assessment</span>
            </Link>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider bg-sky-50 text-[#1B365D] px-2.5 py-1 rounded-md border border-sky-200">
            Verified Student Skill Dossier
          </span>
        </div>

        {/* ── Profile Header Card ── */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Avatar + identity */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1B365D] text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                <GraduationCap className="w-9 h-9 text-sky-200" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1B365D] tracking-tight">
                    My Skill Profile
                  </h1>
                  {profile?.discipline && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-[#1B365D] border border-sky-200">
                      {profile.discipline}
                    </span>
                  )}
                </div>
                {profile?.institution && (
                  <p className="text-sm font-medium text-stone-600">
                    {profile.institution}
                    {profile.semester ? ` • Semester ${profile.semester}` : ''}
                  </p>
                )}
                <p className="text-xs text-stone-400 mt-0.5 font-mono">
                  Student ID: {profile?.id?.slice(0, 16)}…
                </p>
              </div>
            </div>

            {/* Evidence tier summary — 4 stat boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 lg:border-l lg:border-stone-100 lg:pl-6">
              {([3, 2, 1, 0] as const).map((tier) => (
                <div
                  key={tier}
                  className="bg-[#FFFCF6] border border-stone-200 rounded-xl p-3 text-center"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block leading-tight mb-1">
                    {/* Short label: "Level N: X" → show "Level N" only in stat box */}
                    {TIER_LABELS[tier]}
                  </span>
                  <span
                    className={`text-xl font-black block ${tier === 0 ? 'text-stone-500' : 'text-[#1B365D]'}`}
                  >
                    {tier === 3
                      ? counts.level3
                      : tier === 2
                      ? counts.level2
                      : tier === 1
                      ? counts.level1
                      : counts.level0}
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    {TIER_WEIGHT_LABELS[tier]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Evidence Framework Callout ── */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 sm:p-5 mb-8 flex items-start gap-3.5 shadow-xs">
          <ShieldCheck className="w-6 h-6 text-[#1B365D] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-stone-800">
            <span className="font-bold text-[#1B365D]">
              Multi-Tier Evidence Framework (SIH26044 Core Requirement):{' '}
            </span>
            Every score is inseparable from its evidence tier.{' '}
            <strong>Level 0</strong> = not yet assessed.{' '}
            <strong>Level 1</strong> = adaptive quiz validated theory knowledge (0.4× matching weight).{' '}
            <strong>Level 2</strong> = clinical faculty observation signoff (0.7×).{' '}
            <strong>Level 3</strong> = institution-verified credential (1.0×).
          </div>
        </div>

        {/* ── Tab Controls ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-[#1B365D] tracking-tight">
              NCISM Competency Domain Profile
            </h2>
            <p className="text-xs text-stone-500">
              {domains.length} domains · {domains.filter((d) => d.has_assessment).length} assessed
            </p>
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold overflow-x-auto">
            {(
              [
                { key: 'chart' as TabKey, label: 'Bar Chart' },
                { key: 'all' as TabKey, label: `All (${domains.length})` },
                { key: 'verified' as TabKey, label: `Verified (${verifiedCount})` },
                { key: 'gaps' as TabKey, label: `Gaps (${gapCount})` },
              ]
            ).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                id={`profile-tab-${key}`}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === key
                    ? 'bg-white text-[#1B365D] shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Bar Chart Tab ── */}
        {activeTab === 'chart' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs mb-8">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-[#1B365D]" />
              <h3 className="text-base font-bold text-[#1B365D]">
                Raw Score by Domain — Colour-coded by Evidence Tier
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-5">
              Bar length = raw assessment score (0–100). Colour = evidence tier.
              Scores and evidence tiers are always displayed together per SIH26044 requirements.
            </p>

            {domains.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-stone-400">
                <BookOpen className="w-10 h-10" />
                <p className="text-sm font-medium">No taxonomy domains found.</p>
              </div>
            ) : (
              <DomainBarChart domains={domains} />
            )}
          </div>
        )}

        {/* ── List Tabs (All / Verified / Gaps) ── */}
        {activeTab !== 'chart' && (
          <div className="space-y-4 mb-10">
            {filteredDomains.length === 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center shadow-xs">
                <p className="text-stone-500 text-sm">No domains match this filter.</p>
              </div>
            )}

            {filteredDomains.map((d) => (
              <div
                key={d.domain_id}
                id={`domain-card-${d.domain_id}`}
                className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs transition-colors hover:border-[#1B365D] ${
                  d.has_assessment ? 'border-stone-200' : 'border-dashed border-stone-300'
                }`}
              >
                {/* Row: name + evidence tier badge (always together — product requirement) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base sm:text-lg font-bold text-[#1B365D] break-words">
                        {d.name}
                      </h3>
                      {d.ncism_pos && d.ncism_pos.length > 0 && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200 shrink-0">
                          {d.ncism_pos.join(', ')}
                        </span>
                      )}
                    </div>
                    {d.description && (
                      <p className="text-xs text-stone-500 line-clamp-2">{d.description}</p>
                    )}
                  </div>

                  {/* Evidence tier badge — always alongside score, never omitted */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full ${TIER_BADGE_CLASSES[d.evidence_tier]}`}
                      aria-label={`Evidence tier: ${TIER_LABELS[d.evidence_tier]}`}
                    >
                      {TIER_LABELS[d.evidence_tier]}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      ({TIER_WEIGHT_LABELS[d.evidence_tier]})
                    </span>
                  </div>
                </div>

                {/* Score bar + numeric score — tier label always present above */}
                <div className="space-y-2 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">
                      {d.has_assessment
                        ? d.evidence_notes
                          ? `Evidence: ${d.evidence_notes}`
                          : 'Assessment completed'
                        : 'No assessment taken for this domain yet'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400 text-xs">Raw Score:</span>
                      <span
                        className={`text-sm font-black font-mono ${
                          d.has_assessment ? 'text-[#1B365D]' : 'text-stone-400'
                        }`}
                      >
                        {d.has_assessment ? `${d.raw_score}%` : 'Unassessed'}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="w-full bg-stone-100 rounded-full h-3 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={d.raw_score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${d.name}: ${d.raw_score}% — ${TIER_LABELS[d.evidence_tier]}`}
                  >
                    <div
                      className={`${TIER_BAR_CLASSES[d.evidence_tier]} h-3 rounded-full transition-all duration-700`}
                      style={{ width: `${d.raw_score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-400">
                    <span>0%</span>
                    <span>50% Min Competency</span>
                    <span>75% Advanced</span>
                    <span>100% Expert</span>
                  </div>

                  {/* Action buttons */}
                  {!d.has_assessment ? (
                    <div className="pt-2">
                      <Link
                        href="/student/assessment"
                        id={`take-assessment-${d.domain_id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#1B365D] text-white hover:bg-[#152a48] transition-colors shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Take Assessment to Unlock This Domain</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : d.raw_score < 70 ? (
                    <div className="pt-2 flex items-center gap-2 flex-wrap">
                      <Link
                        href="/student/assessment"
                        id={`retake-assessment-${d.domain_id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-900 hover:bg-indigo-100 transition-colors border border-indigo-200"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retake to Improve Score</span>
                      </Link>
                      <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                        Below 70% minimum competency threshold
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Next Steps Quick Actions ── */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#1B365D]" />
            <h2 className="text-base font-bold text-[#1B365D]">Next Steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/student/assessment"
              id="profile-action-retake"
              className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:border-[#1B365D] hover:bg-sky-50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center shrink-0 group-hover:bg-[#1B365D] transition-colors">
                <RefreshCw className="w-4 h-4 text-[#1B365D] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1B365D]">Retake Assessment</p>
                <p className="text-xs text-stone-500">Improve tier scores</p>
              </div>
            </Link>

            <Link
              href="/student/assessment"
              id="profile-action-new-domain"
              className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:border-[#1B365D] hover:bg-sky-50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-[#1B365D] transition-colors">
                <BookOpen className="w-4 h-4 text-indigo-700 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1B365D]">Assess New Domains</p>
                <p className="text-xs text-stone-500">{counts.level0} unassessed remaining</p>
              </div>
            </Link>

            <Link
              href="/student/opportunities"
              id="profile-action-opportunities"
              className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:border-[#1B365D] hover:bg-sky-50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#1B365D]/10 flex items-center justify-center shrink-0 group-hover:bg-[#1B365D] transition-colors">
                <CheckCircle2 className="w-4 h-4 text-[#1B365D] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1B365D]">Browse Opportunities</p>
                <p className="text-xs text-stone-500">Matched to your verified skills</p>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Bottom Nav ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <Link
            href="/student/assessment"
            id="profile-nav-back-assessment"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1B365D] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retake / Explore Adaptive Assessment</span>
          </Link>

          <Link
            href="/employer/opportunities/new"
            id="profile-nav-employer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B365D] text-white text-xs sm:text-sm font-bold hover:bg-[#152a48] transition-colors shadow-xs"
          >
            <span>Proceed to Employer Opportunity Posting</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  )
}
