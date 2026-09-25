import Link from 'next/link'
import { ShieldCheck, HelpCircle, FileText } from 'lucide-react'

// MOCK DATA — for screenshot purposes only, will be replaced with real Supabase calls per Techspec.md/AppFlow.md in a later pass.

export default function Footer() {
  return (
    <footer className="w-full bg-[#0F233D] text-stone-300 text-sm mt-auto border-t-4 border-[#1B365D]">
      {/* Upper Footer Links & Project Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Portal Overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-sky-900/60 flex items-center justify-center text-sky-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-base tracking-wide">
                AYUSH SkillConnect
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              SIH26044 hackathon prototype designed for evidence-backed clinical competency evaluation,
              curriculum gap analysis, and explainable industry placements (designed for a future AIIA pilot).
            </p>
          </div>

          {/* Col 2: Institutional Workflows */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-200">
              Workflows & Portals
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-300">
              <li>
                <Link href="/student/assessment" className="hover:text-white transition-colors">
                  Adaptive Skill Assessment
                </Link>
              </li>
              <li>
                <Link href="/student/profile" className="hover:text-white transition-colors">
                  Student Competency & Gap Profile
                </Link>
              </li>
              <li>
                <Link href="/employer/opportunities/new" className="hover:text-white transition-colors">
                  Post AYUSH Clinical Opportunity
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-white transition-colors">
                  Institutional Cohort Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Guidelines & User Deliverables */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-200">
              Governance & Resources
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-300">
              <li className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-300" />
                <span className="hover:text-white cursor-pointer">
                  Platform User Manual (PDF)
                </span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                <span className="hover:text-white cursor-pointer">
                  NCISM Program Outcomes (PO1-PO8)
                </span>
              </li>
              <li className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-sky-300" />
                <span className="hover:text-white cursor-pointer">
                  Assessment Evidence Tiers (0–3)
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Project Team */}
          <div className="space-y-2.5 text-xs text-stone-300">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-200">
              Project Team
            </h4>
            <p className="text-stone-400 leading-relaxed">
              Developed by Team CodeMorph for Smart India Hackathon (Problem Statement SIH26044).
            </p>
            <p className="text-stone-400">
              Illustrative demonstration prototype for hackathon evaluation purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Compliance & Disclaimer Bar */}
      <div className="bg-[#09172B] border-t border-stone-800 text-stone-400 text-xs py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            © 2026 Team CodeMorph — Unofficial SIH26044 hackathon prototype. Not affiliated with or endorsed by the Government of India or the Ministry of AYUSH.
          </p>
          <div className="text-[11px] text-amber-300/90 font-medium">
            Illustrative data, not a live operational system.
          </div>
        </div>
      </div>
    </footer>
  )
}
