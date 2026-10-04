'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  Stethoscope,
  Building2,
  LogIn,
  UserPlus,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [registerDropdownOpen, setRegisterDropdownOpen] = useState(false)
  const registerDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        registerDropdownRef.current &&
        !registerDropdownRef.current.contains(event.target as Node)
      ) {
        setRegisterDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setRegisterDropdownOpen(false)
  }, [pathname])

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

          {/* Auth Quick Access Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              id="navbar-login-btn"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-stone-100 text-[#1B365D] hover:bg-stone-200 border border-stone-300 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-stone-500" />
              <span>Sign in</span>
            </Link>

            {/* Register with 3-Role Choice Dropdown */}
            <div className="relative" ref={registerDropdownRef}>
              <button
                type="button"
                id="navbar-register-btn"
                onClick={() => setRegisterDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-[#1B365D] text-white hover:bg-[#152a48] transition-colors shadow-xs cursor-pointer"
                aria-haspopup="true"
                aria-expanded={registerDropdownOpen}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${registerDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {registerDropdownOpen && (
                <div
                  id="navbar-register-dropdown"
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                    Create an Account As
                  </div>
                  <Link
                    href="/signup/student"
                    onClick={() => setRegisterDropdownOpen(false)}
                    className="flex items-start gap-3 px-3 py-2.5 hover:bg-sky-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#1B365D] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#1B365D] group-hover:text-white transition-colors">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1B365D]">Student / Scholar</div>
                      <div className="text-[11px] text-stone-500">Take assessment & unlock matched roles</div>
                    </div>
                  </Link>

                  <Link
                    href="/signup/employer"
                    onClick={() => setRegisterDropdownOpen(false)}
                    className="flex items-start gap-3 px-3 py-2.5 hover:bg-sky-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#1B365D] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#1B365D] group-hover:text-white transition-colors">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1B365D]">Employer / Hospital</div>
                      <div className="text-[11px] text-stone-500">Post openings & evaluate candidates</div>
                    </div>
                  </Link>

                  <Link
                    href="/signup/admin"
                    onClick={() => setRegisterDropdownOpen(false)}
                    className="flex items-start gap-3 px-3 py-2.5 hover:bg-sky-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#1B365D] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#1B365D] group-hover:text-white transition-colors">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1B365D]">Institution Admin</div>
                      <div className="text-[11px] text-stone-500">Track cohort analytics & placements</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden ml-1 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-stone-100 text-[#1B365D] hover:bg-stone-200 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-[#FFFCF6] px-4 py-3 space-y-3">
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 pb-1">
              Navigation
            </div>
            {[
              { href: '/', label: 'Home' },
              { href: '/student/assessment', label: 'Assessment' },
              { href: '/student/profile', label: 'Skill Profile' },
              { href: '/employer/opportunities/new', label: 'Post Opportunity' },
              { href: '/admin/dashboard', label: 'Institution Admin' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href || (href !== '/' && pathname?.startsWith(href))
                    ? 'bg-[#1B365D] text-white'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-200 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 pb-1">
              Create an Account
            </div>
            <Link
              href="/signup/student"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100"
            >
              <GraduationCap className="w-4 h-4 text-[#1B365D]" />
              <span>Register as Student</span>
            </Link>
            <Link
              href="/signup/employer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100"
            >
              <Stethoscope className="w-4 h-4 text-[#1B365D]" />
              <span>Register as Employer</span>
            </Link>
            <Link
              href="/signup/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100"
            >
              <Building2 className="w-4 h-4 text-[#1B365D]" />
              <span>Register as Institution Admin</span>
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#1B365D] bg-stone-100 hover:bg-stone-200 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Existing Account</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
