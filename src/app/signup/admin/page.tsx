'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signupAdmin } from '@/app/actions/auth'
import { Building2, AlertCircle, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react'
import AlreadySignedIn, { useSessionCheck, SessionCheckLoader } from '@/components/AlreadySignedIn'

export default function AdminSignupPage() {
  const [state, action, isPending] = useActionState(signupAdmin, null)
  const sessionState = useSessionCheck()

  if (sessionState === null) return <SessionCheckLoader />
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
              <Building2 className="w-4 h-4" />
              Registering as: Institution Admin (AIIA)
            </div>
            <h1 className="text-2xl font-black text-[#1B365D] tracking-tight">
              Create admin account
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
            {/* MVP note */}
            <div className="mb-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <strong>MVP note:</strong> Institution-level provisioning is out of scope for SIH26044.
            </div>

            <form action={action} className="space-y-5">
              {/* Error */}
              {state?.error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{state.error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label
                  htmlFor="admin-fullname"
                  className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide"
                >
                  Full Name
                </label>
                <input
                  id="admin-fullname"
                  name="full_name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. Dr. Anand Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FFFCF6] text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] transition"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide"
                >
                  Institutional email address
                </label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@aiia.gov.in"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FFFCF6] text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] transition"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide"
                >
                  Password
                </label>
                <input
                  id="admin-password"
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
                id="admin-signup-submit"
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
                    <Building2 className="w-4 h-4" />
                    Create Admin Account
                  </>
                )}
              </button>
            </form>
          </div>

          {/* What happens next */}
          <div className="mt-5 bg-sky-50 border border-sky-200 rounded-xl p-4">
            <p className="text-xs font-bold text-[#1B365D] mb-2 uppercase tracking-wide">
              After registration you'll access:
            </p>
            <ul className="space-y-1.5">
              {[
                'Cohort skill-gap analytics dashboard',
                'Domain-level competency aggregations over real student data',
                'Curriculum readiness indicators (NCISM PO alignment)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1B365D] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Not an admin? */}
          <div className="mt-4 text-center text-xs text-stone-500">
            Not an admin?{' '}
            <Link href="/signup/student" className="font-semibold text-[#1B365D] hover:underline">
              Register as Student
            </Link>{' '}
            or{' '}
            <Link href="/signup/employer" className="font-semibold text-[#1B365D] hover:underline">
              Employer
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
