'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  Loader2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// DB shape types (matching Schema.md exactly)
// ---------------------------------------------------------------------------
interface AssessmentQuestion {
  question_id: string
  domain_id: string
  text: string
  discipline_filter: string[] | null
}

interface AssessmentOption {
  id: string
  question_id: string
  label: string
  value: number
  next_question_id: string | null
}

// ---------------------------------------------------------------------------
// State machine types
// ---------------------------------------------------------------------------
// domain_id → running numeric score
type SkillTally = Record<string, number>

type PageStatus =
  | 'loading'       // initial load
  | 'no-questions'  // no questions found for this discipline
  | 'in-progress'   // answering questions
  | 'saving'        // writing skill levels to DB
  | 'error'         // any unrecoverable fetch/write error

// ---------------------------------------------------------------------------
// Helper — clamp raw_score to 0–100 as required by Schema.md CHECK constraint
// ---------------------------------------------------------------------------
function clamp(value: number): number {
  return Math.max(0, Math.min(100, value))
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function AssessmentPage() {
  const router = useRouter()

  // ── resolved from session on mount ──
  const [studentId, setStudentId] = useState<string | null>(null)
  const [discipline, setDiscipline] = useState<string | null>(null)

  // ── state machine ──
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null)
  const [currentOptions, setCurrentOptions] = useState<AssessmentOption[]>([])
  const [skillTally, setSkillTally] = useState<SkillTally>({})
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)

  // ── UI state ──
  const [status, setStatus] = useState<PageStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [questionCount, setQuestionCount] = useState<number>(0)

  // -------------------------------------------------------------------------
  // Fetch a question + its options by question_id
  // -------------------------------------------------------------------------
  const loadQuestion = useCallback(async (questionId: string) => {
    const { data: qData, error: qError } = await supabase
      .from('assessment_questions')
      .select('question_id, domain_id, text, discipline_filter')
      .eq('question_id', questionId)
      .single()

    if (qError || !qData) {
      setErrorMessage(
        `Could not load question "${questionId}": ${qError?.message ?? 'Not found'}`
      )
      setStatus('error')
      return
    }

    const { data: opts, error: optsError } = await supabase
      .from('assessment_options')
      .select('id, question_id, label, value, next_question_id')
      .eq('question_id', questionId)

    if (optsError) {
      setErrorMessage(
        `Could not load options for question "${questionId}": ${optsError.message}`
      )
      setStatus('error')
      return
    }

    setCurrentQuestion(qData as AssessmentQuestion)
    setCurrentOptions((opts ?? []) as AssessmentOption[])
    setSelectedOptionId(null)
    setStatus('in-progress')
  }, [])

  // -------------------------------------------------------------------------
  // On mount: resolve session → student profile → first question
  // -------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false

    async function init() {
      // 1. Get current session user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/login')
        return
      }

      // 2. Fetch student profile for discipline
      const { data: profile, error: profileError } = await supabase
        .from('student_profiles')
        .select('id, discipline')
        .eq('auth_user_id', user.id)
        .single()

      console.debug('[assessment] profile fetch →', { profile, profileError, authUserId: user.id })

      if (profileError || !profile) {
        setErrorMessage('Could not load your student profile. Please try again.')
        setStatus('error')
        return
      }

      if (cancelled) return
      setStudentId(profile.id as string)
      setDiscipline(profile.discipline as string)

      const disc = profile.discipline as string

      // 3. Fetch all questions, then filter client-side:
      //    discipline_filter IS NULL (shown to all) OR contains this discipline.
      //    Supabase JS doesn't natively expose `@>` for arrays so we filter after fetch.
      const { data: allQuestions, error: aqError } = await supabase
        .from('assessment_questions')
        .select('question_id, domain_id, text, discipline_filter')

      console.debug('[assessment] allQuestions fetch →', { count: allQuestions?.length, aqError, rows: allQuestions })

      if (aqError || !allQuestions) {
        setErrorMessage(
          `Could not load assessment questions: ${aqError?.message ?? 'Unknown error'}`
        )
        setStatus('error')
        return
      }

      const eligibleQuestions = (allQuestions as AssessmentQuestion[]).filter(
        (q) =>
          q.discipline_filter === null || q.discipline_filter.includes(disc)
      )

      console.debug('[assessment] eligibleQuestions →', { disc, eligible: eligibleQuestions })

      if (eligibleQuestions.length === 0) {
        setStatus('no-questions')
        return
      }

      if (cancelled) return

      // 4. Find root question(s): eligible questions that are NOT referenced
      //    as next_question_id by any option — i.e. nothing points to them,
      //    so they are entry points.  We fetch all non-null next_question_ids.
      const { data: allOptions, error: aoError } = await supabase
        .from('assessment_options')
        .select('next_question_id')

      console.debug('[assessment] allOptions fetch →', { count: allOptions?.length, aoError })

      if (aoError) {
        setErrorMessage(`Could not resolve entry question: ${aoError.message}`)
        setStatus('error')
        return
      }

      const referencedIds = new Set(
        (allOptions ?? [])
          .map((o: { next_question_id: string | null }) => o.next_question_id)
          .filter(Boolean) as string[]
      )

      const rootQuestions = eligibleQuestions.filter(
        (q) => !referencedIds.has(q.question_id)
      )

      // Pick the first root (alphabetically for determinism); fall back to
      // the first eligible question if no clear root exists.
      const entryQuestion: AssessmentQuestion =
        rootQuestions[0] ?? eligibleQuestions[0]

      if (cancelled) return
      await loadQuestion(entryQuestion.question_id)
    }

    init()
    return () => {
      cancelled = true
    }
  }, [router, loadQuestion])

  // -------------------------------------------------------------------------
  // Handle option selection → advance state machine
  // -------------------------------------------------------------------------
  async function handleSelectOption(option: AssessmentOption) {
    if (!currentQuestion || status !== 'in-progress') return

    setSelectedOptionId(option.id)

    // Brief visual pause so selection registers before transition
    await new Promise<void>((resolve) => setTimeout(resolve, 320))

    const newTally: SkillTally = { ...skillTally }
    newTally[currentQuestion.domain_id] =
      (newTally[currentQuestion.domain_id] ?? 0) + option.value

    setSkillTally(newTally)
    setQuestionCount((n) => n + 1)

    if (option.next_question_id !== null) {
      // Continue — load next question in the chain
      await loadQuestion(option.next_question_id)
    } else {
      // Assessment complete — write results
      await completeAssessment(newTally)
    }
  }

  // -------------------------------------------------------------------------
  // Write one student_skill_levels row per domain via direct Supabase upsert.
  // Direct RLS-gated client call per Techspec.md — no Route Handler needed.
  // evidence_tier = 1 (theory-verified, set automatically from assessment quiz score)
  // raw_score clamped to 0-100 per Schema.md CHECK constraint.
  // -------------------------------------------------------------------------
  async function completeAssessment(tally: SkillTally) {
    if (!studentId) {
      setErrorMessage('Session lost — please log in again.')
      setStatus('error')
      return
    }

    setStatus('saving')

    const rows = Object.entries(tally).map(([domain_id, rawScore]) => ({
      student_id: studentId,
      domain_id,
      raw_score: clamp(rawScore),
      evidence_tier: 1,
      evidence_notes: 'Set automatically from assessment quiz score',
    }))

    if (rows.length === 0) {
      router.push('/student/profile')
      return
    }

    const { error } = await supabase
      .from('student_skill_levels')
      .upsert(rows, { onConflict: 'student_id,domain_id' })

    if (error) {
      setErrorMessage(`Could not save your results: ${error.message}`)
      setStatus('error')
      return
    }

    router.push('/student/profile')
  }

  // =========================================================================
  // Render
  // =========================================================================

  if (status === 'loading') return <LoadingState />
  if (status === 'no-questions') return <NoQuestionsState discipline={discipline} />
  if (status === 'error') return <ErrorState message={errorMessage} />
  if (status === 'saving') return <SavingState />

  // in-progress
  return (
    <div className="min-h-full py-6 px-2 sm:px-0">
      <div className="max-w-2xl mx-auto space-y-5">
        <ProgressHeader questionCount={questionCount} discipline={discipline} />

        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            options={currentOptions}
            selectedOptionId={selectedOptionId}
            onSelect={handleSelectOption}
          />
        )}

        {Object.keys(skillTally).length > 0 && (
          <TallyHint tally={skillTally} />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="w-14 h-14 rounded-full bg-[#1B365D]/10 flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#1B365D] animate-spin" />
      </div>
      <p className="text-sm font-medium text-stone-600">Loading your assessment…</p>
    </div>
  )
}

function SavingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-[#1B365D]/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#1B365D] animate-spin" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-base font-bold text-[#1B365D]">Saving your skill profile…</p>
        <p className="text-xs text-stone-500">
          Writing evidence-tier results to your profile
        </p>
      </div>
    </div>
  )
}

function NoQuestionsState({ discipline }: { discipline: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 max-w-lg mx-auto text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-amber-600" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-[#1B365D]">
          Assessment not yet available
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          The adaptive skill assessment hasn&apos;t been published for{' '}
          <strong className="text-stone-800">
            {discipline ?? 'your discipline'}
          </strong>{' '}
          yet. Currently only Ayurveda questions are seeded. Please check back
          soon or contact your institution administrator.
        </p>
      </div>
      <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 text-left">
        <div className="font-bold uppercase tracking-wider mb-2">What this means</div>
        <ul className="space-y-1 list-disc list-inside">
          <li>Assessment questions are discipline-specific</li>
          <li>
            Your institution admin can seed questions for your discipline
          </li>
          <li>
            Your skill profile can still be viewed and updated manually
          </li>
        </ul>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5 max-w-lg mx-auto text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
        <ShieldAlert className="w-7 h-7 text-red-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-base font-bold text-[#1B365D]">Something went wrong</h2>
        <p className="text-sm text-stone-600">{message}</p>
      </div>
      <button
        id="assessment-retry-btn"
        type="button"
        onClick={() => window.location.reload()}
        className="px-5 py-2.5 rounded-xl bg-[#1B365D] text-white text-sm font-semibold hover:bg-[#152a48] transition-colors"
      >
        Retry
      </button>
    </div>
  )
}

function ProgressHeader({
  questionCount,
  discipline,
}: {
  questionCount: number
  discipline: string | null
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#1B365D]/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-[#1B365D]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Adaptive Assessment
            </p>
            <p className="text-sm font-semibold text-[#1B365D] truncate">
              {discipline ?? '—'}
            </p>
          </div>
        </div>

        {/* Question counter — intentionally shows only answered count, not total,
            because the branching path length is unknowable in advance. */}
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-[11px] font-medium text-stone-500">Answered:</span>
          <span className="text-xl font-black text-[#1B365D] tabular-nums">
            {questionCount}
          </span>
        </div>
      </div>

      {/* Animated dot-trail progress — rhythm without misleading N of M */}
      <div className="mt-3 flex items-center gap-1.5">
        {Array.from({ length: Math.max(3, questionCount + 2) }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i < questionCount
                ? 'bg-[#1B365D] w-5'
                : i === questionCount
                ? 'bg-sky-400 w-3 animate-pulse'
                : 'bg-stone-200 w-1.5'
            }`}
          />
        ))}
      </div>

      <p className="text-[11px] text-stone-400 mt-2">
        Path length varies by your answers — branching assessment, no fixed total.
      </p>
    </div>
  )
}

function QuestionCard({
  question,
  options,
  selectedOptionId,
  onSelect,
}: {
  question: AssessmentQuestion
  options: AssessmentOption[]
  selectedOptionId: string | null
  onSelect: (option: AssessmentOption) => void
}) {
  const isLocked = selectedOptionId !== null

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Domain badge */}
      <div className="bg-[#1B365D] px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-sky-300">
            Domain
          </span>
          <ChevronRight className="w-3 h-3 text-sky-400" />
          <span className="text-xs font-semibold text-sky-100 truncate">
            {question.domain_id
              .replace(/-/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        </div>
      </div>

      {/* Question text */}
      <div className="px-6 pt-6 pb-4">
        <h2
          id="assessment-question-text"
          className="text-base sm:text-lg font-bold text-stone-900 leading-snug"
        >
          {question.text}
        </h2>
      </div>

      {/* Options */}
      <div className="px-6 pb-6 space-y-3">
        {options.map((opt) => {
          const isSelected = selectedOptionId === opt.id

          return (
            <button
              key={opt.id}
              id={`assessment-option-${opt.id}`}
              type="button"
              disabled={isLocked}
              onClick={() => onSelect(opt)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 flex items-start gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B365D] focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-[#1B365D] bg-sky-50/60 shadow-sm'
                  : isLocked
                  ? 'border-stone-200 bg-stone-50 opacity-50 cursor-not-allowed'
                  : 'border-stone-200 bg-white hover:border-[#1B365D]/40 hover:bg-sky-50/30 cursor-pointer'
              }`}
            >
              {/* Radio indicator */}
              <div className="pt-0.5 shrink-0">
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-[#1B365D]" />
                ) : (
                  <Circle
                    className={`w-5 h-5 transition-colors ${
                      isLocked
                        ? 'text-stone-300'
                        : 'text-stone-400 group-hover:text-[#1B365D]/60'
                    }`}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      isSelected ? 'text-[#1B365D]' : 'text-stone-500'
                    }`}
                  >
                    {opt.label}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#1B365D]/10 text-[#1B365D]">
                      Selected
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm leading-relaxed ${
                    isSelected
                      ? 'text-stone-900 font-medium'
                      : 'text-stone-700'
                  }`}
                >
                  {opt.label}
                </p>
              </div>

              {!isLocked && (
                <div className="shrink-0 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-[#1B365D]/60" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-stone-100 bg-stone-50/70 px-6 py-3 flex items-center gap-2 text-xs text-stone-500">
        <Sparkles className="w-3.5 h-3.5 text-[#1B365D] shrink-0" />
        <span>
          Selecting an option{' '}
          {selectedOptionId ? (
            <strong className="text-[#1B365D]">advances the assessment automatically</strong>
          ) : (
            'will advance the assessment to the next question or complete it'
          )}
          .
        </span>
      </div>
    </div>
  )
}

function TallyHint({ tally }: { tally: SkillTally }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 px-5 py-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-3">
        Running skill tally (this session)
      </p>
      <div className="space-y-2">
        {Object.entries(tally).map(([domainId, score]) => (
          <div key={domainId} className="flex items-center gap-3">
            <span className="text-xs font-medium text-stone-700 flex-1 truncate">
              {domainId
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-20 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1B365D] transition-all duration-500"
                  style={{ width: `${Math.min(100, score)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#1B365D] tabular-nums w-8 text-right">
                {score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
