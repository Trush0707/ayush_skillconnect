'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap,
  Briefcase,
  Building2,
  ShieldCheck,
  LayoutDashboard,
  ClipboardList,
  Search,
  PlusCircle,
  Users,
  BarChart3,
  LogOut,
  ChevronRight,
  User,
} from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { useTransition } from 'react'

type Role = 'student' | 'employer' | 'admin'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  student: [
    { label: 'Skill Profile', href: '/student/profile', icon: User },
    { label: 'Assessment', href: '/student/assessment', icon: ClipboardList },
    { label: 'Opportunities', href: '/student/opportunities', icon: Search },
    { label: 'My Applications', href: '/student/applications', icon: LayoutDashboard },
  ],
  employer: [
    { label: 'Opportunities', href: '/employer/opportunities', icon: Briefcase },
    { label: 'Post Opportunity', href: '/employer/opportunities/new', icon: PlusCircle },
  ],
  admin: [
    { label: 'Cohort Analytics', href: '/admin/dashboard', icon: BarChart3 },
  ],
}

const ROLE_LABELS: Record<Role, string> = {
  student: 'AYUSH Scholar',
  employer: 'AYUSH Employer',
  admin: 'Institution Admin',
}

const ROLE_ICONS: Record<Role, React.ElementType> = {
  student: GraduationCap,
  employer: Briefcase,
  admin: Building2,
}

interface AppShellProps {
  role: Role
  userEmail?: string
  children: React.ReactNode
}

export default function AppShell({ role, userEmail, children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const navItems = NAV_ITEMS[role]
  const RoleIcon = ROLE_ICONS[role]

  function handleLogout() {
    startTransition(async () => {
      await logout()
      router.push('/login')
    })
  }

  return (
    <div className="min-h-screen bg-[#FFFCF6] flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#1B365D] text-white flex flex-col sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <ShieldCheck className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight leading-tight">
                AYUSH SkillConnect
              </div>
              <div className="text-[10px] text-sky-300 leading-tight">SIH26044</div>
            </div>
          </Link>
        </div>

        {/* Role indicator */}
        <div className="px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-400/20 flex items-center justify-center shrink-0">
              <RoleIcon className="w-4 h-4 text-sky-300" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-sky-200 truncate">
                {ROLE_LABELS[role]}
              </div>
              {userEmail && (
                <div className="text-[10px] text-white/50 truncate">{userEmail}</div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/' &&
                pathname.startsWith(`${item.href}/`) &&
                !navItems.some(
                  (other) =>
                    other.href !== item.href &&
                    other.href.length > item.href.length &&
                    pathname.startsWith(other.href)
                ))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-300' : 'text-white/50 group-hover:text-white/70'}`} />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-300" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            id="app-shell-logout-btn"
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4 shrink-0 text-white/50" />
            <span>{isPending ? 'Signing out…' : 'Sign out'}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-stone-200 sticky top-0 z-30 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider hidden sm:block">
              {ROLE_LABELS[role]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              SIH26044 Prototype
            </span>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
