'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { signupStudent, getSkillTaxonomy } from '@/app/actions/auth'
import { supabase } from '@/lib/supabase/client'
import {
  GraduationCap,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react'
import AlreadySignedIn, { useSessionCheck, SessionCheckLoader } from '@/components/AlreadySignedIn'

const DISCIPLINES = [
  'Ayurveda',
  'Yoga & Naturopathy',
  'Unani',
  'Siddha',
  'Homoeopathy',
] as const

interface TaxonomyDomain {
  domain_id: string
  name: string
}

export default function StudentSignupPage() {
  const [state, action, isPending] = useActionState(signupStudent, null)
  const sessionState = useSessionCheck()

  const [step, setStep] = useState<1 | 2>(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [discipline, setDiscipline] = useState('')
  const [taxonomy, setTaxonomy] = useState<TaxonomyDomain[]>([])
  const [taxonomyLoading, setTaxonomyLoading] = useState(true)
  const [taxonomyError, setTaxonomyError] = useState<string | null>(null)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [step1Error, setStep1Error] = useState<string | null>(null)

  // Fetch skill_taxonomy domains dynamically from the database
  useEffect(() => {
    let isMounted = true
    async function loadTaxonomy() {
      setTaxonomyLoading(true)
      setTaxonomyError(null)
      try {
        // Attempt 1: Fetch via client supabase
        const { data, error } = await supabase
          .from('skill_taxonomy')
          .select('domain_id, name')
          .order('name', { ascending: true })

        if (!error && data && data.length > 0) {
          if (isMounted) {
            setTaxonomy(data)
            setTaxonomyLoading(false)
          }
          return
        }

        // Attempt 2: Server action fallback (handles RLS bypass if unauthenticated)
        const serverData = await getSkillTaxonomy()
        if (isMounted) {
          if (serverData && serverData.length > 0) {
            setTaxonomy(serverData)
          } else {
            setTaxonomyError('Could not load skill domains from database.')
          }
          setTaxonomyLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load skill taxonomy:', err)
          setTaxonomyError('Could not load skill domains.')
          setTaxonomyLoading(false)
        }
      }
    }

    loadTaxonomy()
    return () => {
      isMounted = false
    }
  }, [])

  function toggleInterest(domainId: string) {
    setSelectedInterests((prev) =>
      prev.includes(domainId)
        ? prev.filter((id) => id !== domainId)
        : [...prev, domainId]
    )
  }

  function handleSelectAll() {
    if (selectedInterests.length === taxonomy.length) {
      setSelectedInterests([])
    } else {
      setSelectedInterests(taxonomy.map((t) => t.domain_id))
    }
  }

  function handleNextStep(e: React.MouseEvent) {
    e.preventDefault()
    if (!fullName || fullName.trim().length < 2) {
      setStep1Error('Please enter your full name (at least 2 characters).')
      return
    }
    if (!email || !email.includes('@')) {
      setStep1Error('Please enter a valid email address.')
      return
    }
    if (!password || password.length < 8) {
      setStep1Error('Password must be at least 8 characters.')
      return
    }
    if (!discipline) {
      setStep1Error('Please select your AYUSH discipline.')
      return
    }
    setStep1Error(null)
    setStep(2)
  }

  // Still checking → show a loading spinner (prevents blank-screen stall for new users)
  if (sessionState === null) return <SessionCheckLoader />

  // Session exists → show the intercept notice (hides the form entirely)
  if (sessionState !== false) return <AlreadySignedIn role={sessionState.role} email={sessionState.email} />

  return (
    <div className="min-h-screen bg-[#FFFCF6] flex flex-col">
      {/* Accessibility bar */}
      <div className="bg-stone-100 text-stone-600 text-xs border-b border-stone-200 px-4 py-1">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <span className="font-semibold text-stone-800 tracking-wide">
            SIH26044 Hackathon Prototype • Team CodeMorph
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <span className="px-1 hover:bg-stone-200 rounded cursor-pointer">A-</span>
              <span className="px-1 hover:bg-stone-200 rounded font-semibold cursor-pointer">A</span>
              <span className="px-1 hover:bg-stone-200 rounded cursor-pointer">A+</span>
            </div>
            <span className="text-stone-300">|</span>
            <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 font-semibold cursor-pointer hover:bg-stone-300 transition-colors">
              English / हिन्दी
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg transition-all duration-200">
          {/* Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#1B365D] text-white flex items-center justify-center shadow-sm group-hover:bg-[#152a48] transition-colors">
                <ShieldCheck className="w-7 h-7 text-sky-200" />
              </div>
              <div className="text-left">
                <div className="text-xl font-black tracking-tight text-[#1B365D]">
                  AYUSH SkillConnect
                </div>
                <div className="text-xs text-stone-500">Evidence-Backed Competency Gateway</div>
              </div>
            </Link>

            {/* Role badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-[#1B365D] text-xs font-bold mb-3">
              <GraduationCap className="w-4 h-4" />
              Registering as: AYUSH Scholar (Student)
            </div>
            <h1 className="text-2xl font-black text-[#1B365D] tracking-tight">
              Create your student account
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#1B365D] hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
            <form action={action} className="space-y-5">
              {/* Stepper Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      step === 1
                        ? 'bg-[#1B365D] text-white'
                        : 'bg-emerald-600 text-white hover:opacity-90'
                    }`}
                    title="Go to Step 1"
                  >
                    {step === 2 ? <Check className="w-3.5 h-3.5" /> : '1'}
                  </button>
                  <span
                    className={`text-xs font-bold ${
                      step === 1 ? 'text-[#1B365D]' : 'text-stone-500'
                    }`}
                  >
                    Account Info
                  </span>
                </div>

                <div className="flex-1 mx-3 h-0.5 bg-stone-200">
                  <div
                    className={`h-full bg-[#1B365D] transition-all duration-300 ${
                      step === 2 ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      step === 2
                        ? 'bg-[#1B365D] text-white ring-2 ring-sky-200'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      step === 2 ? 'text-[#1B365D]' : 'text-stone-400'
                    }`}
                  >
                    Interests <span className="font-normal text-stone-400">(Optional)</span>
                  </span>
                </div>
              </div>

              {/* Error Alert */}
              {state?.error && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div>{state.error}</div>
                    {step === 2 && (
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="mt-1.5 text-xs font-bold text-red-900 underline hover:no-underline"
                      >
                        Return to Step 1 to edit your credentials
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 1: Account Credentials & Discipline */}
              <div className={step === 1 ? 'space-y-5' : 'hidden'}>
                {step1Error && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                    <span>{step1Error}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="student-fullname"
                    className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide"
                  >
                    Full Name
                  </label>
                  <input
                    id="student-fullname"
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      if (step1Error) setStep1Error(null)
                    }}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FFFCF6] text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="student-email"
                    className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide"
                  >
                    Email address
                  </label>
                  <input
                    id="student-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (step1Error) setStep1Error(null)
                    }}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FFFCF6] text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] transition"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="student-password"
                    className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide"
                  >
                    Password
                  </label>
                  <input
                    id="student-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (step1Error) setStep1Error(null)
                    }}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FFFCF6] text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] transition"
                  />
                </div>

                {/* Discipline */}
                <div>
                  <label
                    htmlFor="student-discipline"
                    className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide"
                  >
                    AYUSH Discipline
                  </label>
                  <select
                    id="student-discipline"
                    name="discipline"
                    required
                    value={discipline}
                    onChange={(e) => {
                      setDiscipline(e.target.value)
                      if (step1Error) setStep1Error(null)
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FFFCF6] text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] transition"
                  >
                    <option value="" disabled>Select your discipline…</option>
                    {DISCIPLINES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-stone-500">
                    Must match your institutional enrollment (NCISM programs).
                  </p>
                </div>

                {/* Step 1 Actions */}
                <div className="pt-2 space-y-3">
                  <button
                    id="step1-next-btn"
                    type="button"
                    onClick={handleNextStep}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1B365D] text-white font-bold text-sm hover:bg-[#152a48] transition-colors shadow-sm"
                  >
                    <span>Next: Select Skill Interests</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    id="step1-skip-btn"
                    type="submit"
                    disabled={isPending}
                    className="w-full py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating account…</span>
                      </>
                    ) : (
                      <span>Skip interests &amp; create account directly</span>
                    )}
                  </button>
                </div>
              </div>

              {/* STEP 2: Skill Areas Multi-Select (Optional) */}
              <div className={step === 2 ? 'space-y-4' : 'hidden'}>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#1B365D]">
                      Which skill areas interest you most?
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-[#1B365D] text-[11px] font-bold">
                      Optional
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Select the skill taxonomy domains that interest you. You can choose any number or leave them blank.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold text-stone-600">
                    {selectedInterests.length} of {taxonomy.length} selected
                  </span>
                  {taxonomy.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[#1B365D] hover:underline font-semibold"
                    >
                      {selectedInterests.length === taxonomy.length ? 'Clear all' : 'Select all'}
                    </button>
                  )}
                </div>

                {taxonomyLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 text-stone-500 text-xs gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#1B365D]" />
                    <span>Loading skill domains from taxonomy...</span>
                  </div>
                ) : taxonomy.length === 0 ? (
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
                    {taxonomyError || 'No skill taxonomy domains available at this time.'}
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto pr-1 space-y-2 rounded-xl border border-stone-100 p-1">
                    {taxonomy.map((domain) => {
                      const isChecked = selectedInterests.includes(domain.domain_id)
                      return (
                        <label
                          key={domain.domain_id}
                          htmlFor={`interest-${domain.domain_id}`}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                            isChecked
                              ? 'border-[#1B365D] bg-sky-50/70 shadow-xs'
                              : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50 bg-white'
                          }`}
                        >
                          <input
                            id={`interest-${domain.domain_id}`}
                            type="checkbox"
                            name="interests"
                            value={domain.domain_id}
                            checked={isChecked}
                            onChange={() => toggleInterest(domain.domain_id)}
                            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#1B365D] focus:ring-[#1B365D]/30 shrink-0"
                          />
                          <span
                            className={`text-xs leading-snug ${
                              isChecked
                                ? 'font-bold text-[#1B365D]'
                                : 'font-medium text-stone-800'
                            }`}
                          >
                            {domain.name}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {/* Step 2 Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    id="step2-back-btn"
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    id="student-signup-submit"
                    type="submit"
                    disabled={isPending}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1B365D] text-white font-bold text-sm hover:bg-[#152a48] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating account…</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-4 h-4" />
                        <span>
                          {selectedInterests.length > 0
                            ? `Create Account (${selectedInterests.length} selected)`
                            : 'Create Student Account'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* What happens next */}
          <div className="mt-5 bg-sky-50 border border-sky-200 rounded-xl p-4">
            <p className="text-xs font-bold text-[#1B365D] mb-2 uppercase tracking-wide">
              After registration you'll:
            </p>
            <ul className="space-y-1.5">
              {[
                'Complete an adaptive clinical assessment',
                'Get an evidence-backed skill profile with domain levels',
                'View matched job & internship opportunities',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1B365D] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Not a student? */}
          <div className="mt-4 text-center text-xs text-stone-500">
            Not a student?{' '}
            <Link href="/signup/employer" className="font-semibold text-[#1B365D] hover:underline">
              Register as Employer
            </Link>{' '}
            or{' '}
            <Link href="/signup/admin" className="font-semibold text-[#1B365D] hover:underline">
              Institution Admin
            </Link>
          </div>

          <p className="text-center text-xs text-stone-400 mt-4">
            Hackathon prototype — SIH26044 • Ministry of AYUSH
          </p>
        </div>
      </div>
    </div>
  )
}
