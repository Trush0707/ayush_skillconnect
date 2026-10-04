'use client'

/**
 * AlreadySignedIn + useSessionCheck
 *
 * Usage in any signup page:
 *
 *   const sessionState = useSessionCheck()
 *   if (sessionState === null)    return null                              // still checking — no flash
 *   if (sessionState !== false)   return <AlreadySignedIn {...sessionState} />  // session exists
 *   // else: render the signup form normally
 *
 * useSessionCheck() returns:
 *   null                      — async check still in progress
 *   false                     — no active session
 *   { role, email }           — active session found; role from user_metadata
 */

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ShieldCheck, LogOut, Loader2, UserCheck } from 'lucide-react'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SessionInfo = { role: string; email: string }
type SessionState = null | false | SessionInfo

// ---------------------------------------------------------------------------
// Hook — call once at the top of each signup page component
// ---------------------------------------------------------------------------
export function useSessionCheck(): SessionState {
  const [state, setState] = useState<SessionState>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setState(false)
        return
      }
      const role =
        (session.user.user_metadata?.role as string | undefined) ?? 'student'
      setState({ role, email: session.user.email ?? '' })
    })
  }, [])

  return state
}

// ---------------------------------------------------------------------------
// Loading skeleton — shown while session check is in-flight
// ---------------------------------------------------------------------------
export function SessionCheckLoader() {
  return (
    <div className="min-h-screen bg-[#FFFCF6] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B365D]" />
        <span className="text-xs font-medium">Checking session…</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Display component — only rendered when a session exists
// ---------------------------------------------------------------------------
const ROLE_LABELS: Record<string, string> = {
  student: 'Student (AYUSH Scholar)',
  employer: 'Employer (Hospital / R&D)',
  admin: 'Institution Admin',
}

function roleDashboard(role: string): string {
  switch (role) {
    case 'employer':
      return '/employer/opportunities'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/student/profile'
  }
}

interface AlreadySignedInProps {
  role: string
  email: string
}

export default function AlreadySignedIn({ role, email }: AlreadySignedInProps) {
  const [signingOut, setSigningOut] = useState(false)

  const roleLabel = ROLE_LABELS[role] ?? role
  const dashboard = roleDashboard(role)

  async function handleLogout() {
    setSigningOut(true)
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#FFFCF6] flex flex-col">
      {/* Accessibility bar — matches every signup page */}
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

      {/* Centred card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Brand link */}
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
          </div>

          {/* Notice card */}
          <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm p-8 text-center">
            {/* Session notice icon — UserCheck (distinct from brand ShieldCheck) */}
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-5">
              <UserCheck className="w-7 h-7 text-amber-600" />
            </div>

            <h1 className="text-xl font-black text-[#1B365D] tracking-tight mb-2">
              Already signed in
            </h1>

            <p className="text-sm text-stone-600 leading-relaxed mb-2">
              You&apos;re currently logged in as
            </p>

            {/* Role pill */}
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#1B365D] text-white text-xs font-bold mb-1">
              {roleLabel}
            </div>

            {email && (
              <p className="text-xs text-stone-400 mb-5 mt-1">{email}</p>
            )}

            <p className="text-sm text-stone-600 mb-6">
              Log out to create a different account, or return to your dashboard.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                id="already-signed-in-logout-btn"
                onClick={handleLogout}
                disabled={signingOut}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors shadow-sm"
              >
                {signingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing out…
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Log out &amp; create a new account
                  </>
                )}
              </button>

              <Link
                href={dashboard}
                id="already-signed-in-dashboard-link"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1B365D] hover:bg-[#152a48] text-white font-bold text-sm transition-colors shadow-sm"
              >
                Go to my dashboard →
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-stone-400 mt-6">
            Hackathon prototype — SIH26044 • Ministry of AYUSH
          </p>
        </div>
      </div>
    </div>
  )
}
