'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signupEmployer } from '@/app/actions/auth'
import { Briefcase, AlertCircle, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react'
import AlreadySignedIn, { useSessionCheck } from '@/components/AlreadySignedIn'

export default function EmployerSignupPage() {
  const [state, action, isPending] = useActionState(signupEmployer, null)
  const sessionState = useSessionCheck()

  if (sessionState === null) return null
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
        <div className="w-full max-w-md">
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-300 text-stone-800 text-xs font-bold mb-3">
              <Briefcase className="w-4 h-4" />
              Registering as: AYUSH Employer (Hospital / R&amp;D)
            </div>
            <h1 className="text-2xl font-black text-[#1B365D] tracking-tight">
              Create your employer account
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#1B365D] hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
            <form action={action} className="space-y-5">
              {/* Error */}
              {state?.error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{state.error}</span>
                </div>
              )}

              {/* Organization name */}
              <div>
                <label
                  htmlFor="employer-org"
                  className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide"
                >
                  Organization / Hospital name
                </label>
                <input
                  id="employer-org"
                  name="organization"
                  type="text"
                  required
                  autoComplete="organization"
                  placeholder="e.g. AIIA Wellness Centre, ABC Research Institute"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FFFCF6] text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] transition"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="employer-email"
                  className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide"
                >
                  Email address
                </label>
                <input
                  id="employer-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="hr@yourorg.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FFFCF6] text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] transition"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="employer-password"
                  className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide"
                >
                  Password
                </label>
                <input
                  id="employer-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FFFCF6] text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] transition"
                />
              </div>

              {/* Submit */}
              <button
                id="employer-signup-submit"
                type="submit"
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1B365D] text-white font-bold text-sm hover:bg-[#152a48] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4" />
                    Create Employer Account
                  </>
                )}
              </button>
            </form>
          </div>

          {/* What happens next */}
          <div className="mt-5 bg-sky-50 border border-sky-200 rounded-xl p-4">
            <p className="text-xs font-bold text-[#1B365D] mb-2 uppercase tracking-wide">
              After registration you'll:
            </p>
            <ul className="space-y-1.5">
              {[
                'Post clinical & research opportunities with skill requirements',
                'Review applicants with explainable match scores',
                'Track application statuses end-to-end',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1B365D] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Not an employer? */}
          <div className="mt-4 text-center text-xs text-stone-500">
            Not an employer?{' '}
            <Link href="/signup/student" className="font-semibold text-[#1B365D] hover:underline">
              Register as Student
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
