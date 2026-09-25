'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GraduationCap, Briefcase, Building2, ShieldCheck } from 'lucide-react'

// MOCK DATA — for screenshot purposes only, will be replaced with real Supabase calls per Techspec.md/AppFlow.md in a later pass.

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="w-full bg-[#FFFCF6] border-b border-stone-200 sticky top-0 z-50 shadow-xs">
      {/* Disclaimer Banner per Item 10 */}
      <div className="w-full bg-amber-100 border-b border-amber-300 text-amber-950 text-xs py-1.5 px-4 text-center font-bold tracking-wide">
        Hackathon prototype for SIH26044 — illustrative data, not a live operational system.
      </div>

      {/* Prototype Sub-bar */}
      <div className="bg-stone-100 text-stone-600 text-xs border-b border-stone-200 px-4 py-1">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-stone-800 tracking-wide">
              SIH26044 Hackathon Prototype • Team CodeMorph
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hover:text-stone-900 transition-colors cursor-pointer"
              title="Skip to main content"
            >
              Skip to Main Content
            </button>
            <span className="text-stone-300">|</span>
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

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#1B365D] text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-[#152a48] transition-colors">
              <ShieldCheck className="w-6 h-6 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-[#1B365D]">
                  AYUSH SkillConnect
                </span>
                <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-[#1B365D] border border-sky-200">
                  SIH26044
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Evidence-Backed Competency & Placement Gateway
              </p>
            </div>
          </Link>

          {/* Quick Route Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/'
                  ? 'bg-stone-200/70 text-[#1B365D] font-semibold'
                  : 'text-stone-700 hover:text-[#1B365D] hover:bg-stone-100'
              }`}
            >
              Home
            </Link>
            <Link
              href="/student/assessment"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname?.startsWith('/student/assessment')
                  ? 'bg-[#1B365D] text-white font-semibold shadow-xs'
                  : 'text-stone-700 hover:text-[#1B365D] hover:bg-stone-100'
              }`}
            >
              Assessment
            </Link>
            <Link
              href="/student/profile"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname?.startsWith('/student/profile')
                  ? 'bg-[#1B365D] text-white font-semibold shadow-xs'
                  : 'text-stone-700 hover:text-[#1B365D] hover:bg-stone-100'
              }`}
            >
              Skill Profile
            </Link>
            <Link
              href="/employer/opportunities/new"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname?.startsWith('/employer')
                  ? 'bg-[#1B365D] text-white font-semibold shadow-xs'
                  : 'text-stone-700 hover:text-[#1B365D] hover:bg-stone-100'
              }`}
            >
              Post Opportunity
            </Link>
            <Link
              href="/admin/dashboard"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname?.startsWith('/admin')
                  ? 'bg-[#1B365D] text-white font-semibold shadow-xs'
                  : 'text-stone-700 hover:text-[#1B365D] hover:bg-stone-100'
              }`}
            >
              Institution Admin
            </Link>
          </nav>

          {/* Role Quick Access Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/student/assessment"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-stone-100 text-[#1B365D] hover:bg-stone-200 border border-stone-300 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Student</span>
            </Link>
            <Link
              href="/employer/opportunities/new"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-stone-100 text-[#1B365D] hover:bg-stone-200 border border-stone-300 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Employer</span>
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-[#1B365D] text-white hover:bg-[#152a48] transition-colors shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
