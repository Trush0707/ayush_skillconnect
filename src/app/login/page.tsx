'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { ShieldCheck, GraduationCap, Stethoscope, Building2, AlertCircle, Loader2 } from 'lucide-react'
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? ''

  const [state, action, isPending] = useActionState(login, null)

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

      {/* Main content */}
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
            <h1 className="text-2xl font-black text-[#1B365D] tracking-tight">
              Sign in to your account
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              New here?{' '}
              <Link href="/" className="font-semibold text-[#1B365D] hover:underline">
                Select your role to register
              </Link>
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
            <form action={action} className="space-y-5">
              {/* Hidden next param so server action can honour it */}
              <input type="hidden" name="next" value={next} />

              {/* Error banner */}
              {state?.error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{state.error}</span>
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide"
                >
                  Email address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FFFCF6] text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] transition"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-[#FFFCF6] text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] transition"
                />
              </div>

              {/* Submit */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1B365D] text-white font-bold text-sm hover:bg-[#152a48] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>

          {/* Role quick-select */}
          <div className="mt-6">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Don't have an account? Register as:
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Link
                href="/signup/student"
                id="register-student-link"
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border-2 border-stone-200 hover:border-[#1B365D] text-[#1B365D] transition-colors group"
              >
                <GraduationCap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Student</span>
              </Link>
              <Link
                href="/signup/employer"
                id="register-employer-link"
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border-2 border-stone-200 hover:border-[#1B365D] text-[#1B365D] transition-colors group"
              >
                <Stethoscope className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Employer</span>
              </Link>
              <Link
                href="/signup/admin"
                id="register-admin-link"
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border-2 border-stone-200 hover:border-[#1B365D] text-[#1B365D] transition-colors group"
              >
                <Building2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Admin</span>
              </Link>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-stone-400 mt-6">
            Hackathon prototype — SIH26044 • Ministry of AYUSH
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFFCF6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B365D]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
