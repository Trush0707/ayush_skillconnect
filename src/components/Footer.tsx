import Link from 'next/link'
import { ShieldCheck, ExternalLink, HelpCircle, FileText, Phone, Mail, MapPin } from 'lucide-react'

// MOCK DATA — for screenshot purposes only, will be replaced with real Supabase calls per Techspec.md/AppFlow.md in a later pass.

export default function Footer() {
  return (
    <footer className="w-full bg-[#0F233D] text-stone-300 text-sm mt-auto border-t-4 border-[#1B365D]">
      {/* Upper Footer Links & Ministry Attribution */}
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
              Ministry of AYUSH initiative for evidence-backed clinical competency evaluation,
              curriculum gap analysis, and explainable industry placements at AIIA.
            </p>
            <div className="text-[11px] text-stone-400 font-mono pt-1">
              Portal Version: <span className="text-stone-200">v1.0.4-MVP</span> • SIH26044
            </div>
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
              <li className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-sky-300" />
                <span className="hover:text-white cursor-pointer">
                  AIIA Official Portal (aiia.gov.in)
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Nodal Contact */}
          <div className="space-y-2.5 text-xs text-stone-300">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-200">
              AIIA Nodal Cell
            </h4>
            <p className="flex items-start gap-2 text-stone-400">
              <MapPin className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
              <span>All India Institute of Ayurveda, Mathura Road, Gautampuri, New Delhi - 110076</span>
            </p>
            <p className="flex items-center gap-2 text-stone-400">
              <Phone className="w-3.5 h-3.5 text-sky-300" />
              <span>+91 11 2695 0401 / 0402</span>
            </p>
            <p className="flex items-center gap-2 text-stone-400">
              <Mail className="w-3.5 h-3.5 text-sky-300" />
              <span>placement.cell@aiia.gov.in</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom GIGW Compliance Bar */}
      <div className="bg-[#09172B] border-t border-stone-800 text-stone-400 text-xs py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            © 2026 AYUSH SkillConnect • Ministry of AYUSH, Government of India. Designed for SIH 2026.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-stone-200 cursor-pointer">Website Policies</span>
            <span>•</span>
            <span className="hover:text-stone-200 cursor-pointer">Terms of Use</span>
            <span>•</span>
            <span className="hover:text-stone-200 cursor-pointer">Security Audit</span>
            <span>•</span>
            <span className="text-sky-300 font-mono">Visitor Count: 01,48,290</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
