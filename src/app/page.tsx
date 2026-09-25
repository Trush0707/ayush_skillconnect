import Link from 'next/link'
import {
  GraduationCap,
  Briefcase,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  FileCheck,
  BarChart3,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

// MOCK DATA — for screenshot purposes only, will be replaced with real Supabase calls per Techspec.md/AppFlow.md in a later pass.
const MOCK_STATS = [
  {
    id: 'pilot-cohort',
    value: '0–50',
    label: 'Pilot Cohort',
    subtext: 'Designed for initial pilot cohort',
    icon: GraduationCap,
  },
  {
    id: 'pilot-placements',
    value: '0–5',
    label: 'Pilot Placements',
    subtext: 'Target initial clinical postings',
    icon: Briefcase,
  },
  {
    id: 'pilot-institution',
    value: '1',
    label: 'Pilot Host Institution',
    subtext: 'Designed for a future AIIA pilot',
    icon: Building2,
  },
  {
    id: 'match-accuracy',
    value: '84%',
    label: 'Avg Skill Match',
    subtext: 'Deterministic match baseline',
    icon: Activity,
  },
]

// MOCK DATA — for screenshot purposes only, will be replaced with real Supabase calls per Techspec.md/AppFlow.md in a later pass.
const MOCK_CORE_FEATURES = [
  {
    title: 'Evidence-Backed Skill Profiles',
    description:
      'Skills are never unverified self-claims. Every competency level is grounded in 4 rigorous evidence tiers: Unassessed, Theory-verified, Clinical-observed, and Institution-verified.',
    badge: 'Core Differentiator',
    icon: ShieldCheck,
    points: [
      'Zero unverified self-assessment entries',
      'NCISM Program Outcomes (PO) mapping',
    ],
  },
  {
    title: 'Explainable Deterministic Matching',
    description:
      'No black-box ML or opaque scoring. Placement compatibility is designed to be evaluated using an auditable formula with published weights and human-readable reasoning strings.',
    badge: 'SIH26044 Compliance',
    icon: FileCheck,
    points: [
      'Weighted formula: 0.60 Skill + 0.30 Eligibility + 0.10 Interest',
      'Stored reasoning strings for every score',
      'Instant gap visibility for unsuccessful criteria',
    ],
  },
  {
    title: 'Adaptive Clinical Assessment',
    description:
      'Interactive state machine evaluations with dynamic question branching. Different diagnostic decisions lead to specialized case scenarios, reflecting true clinical acumen.',
    badge: 'Branching Engine',
    icon: Sparkles,
    points: [
      'Dynamic question tree per AYUSH discipline',
      'Designed to show skill domain score aggregation',
      'Automatic Level 1 Theory-verified credentialing',
    ],
  },
  {
    title: 'Institutional Cohort Analytics',
    description:
      'Designed for institutional leadership and faculty to gain granular visibility into batch-wide competency gaps, clinical procedure readiness, and curriculum alignment metrics in a future AIIA pilot.',
    badge: 'Institution Leadership View',
    icon: BarChart3,
    points: [
      'Illustrative domain-wise competency distributions',
      'Intervention identification before placement drives',
      'Direct aggregate queries over student profiles',
    ],
  },
]

// MOCK DATA — for screenshot purposes only, will be replaced with real Supabase calls per Techspec.md/AppFlow.md in a later pass.
const MOCK_RECENT_OPPORTUNITIES = [
  {
    id: 'opp-1',
    role: 'Clinical Panchakarma Physician',
    org: 'Sample Wellness Clinic (Demo Posting)',
    location: 'New Delhi / Jaipur',
    type: 'Full-Time Internship',
    requiredSkills: ['Panchakarma Procedure Competence', 'Ashtavidha Pariksha'],
    minMatchTier: 'Level 2+ Observed',
  },
  {
    id: 'opp-2',
    role: 'Ayurvedic Clinical Research Associate',
    org: 'Sample Research Institute (Demo Posting)',
    location: 'Haridwar (Hybrid)',
    type: 'Research Fellow',
    requiredSkills: ['Dravyaguna Pharmacology', 'Digital IT Hygiene'],
    minMatchTier: 'Level 1+ Verified',
  },
]

export default function LandingPage() {
  return (
    <div className="w-full bg-[#FFFCF6]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-stone-200 py-16 sm:py-24">
        {/* Subtle patterned backdrop */}
        <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#1B365D_0.75px,transparent_0.75px)] [background-size:16px_16px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* National Pilot Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#1B365D] text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-[#1B365D] animate-pulse" />
              <span>SIH26044 Hackathon Prototype • Team CodeMorph • Proposed for Future AIIA Pilot</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1B365D] leading-[1.12]">
              Evidence-Backed AYUSH Competency & Placement Gateway
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-stone-700 leading-relaxed font-normal">
              A closed-loop skill mapping platform connecting verified academic talent with healthcare
              employers. Featuring adaptive clinical assessments, deterministic matching, and institutional
              gap intelligence.
            </p>

            {/* Core Differentiator Callout Box */}
            <div className="mt-8 p-4 rounded-xl bg-white border border-stone-200/90 shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#1B365D] text-white flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-sky-200" />
              </div>
              <div className="text-xs sm:text-sm text-stone-700">
                <span className="font-bold text-[#1B365D]">Verified Multi-Tier Evidence Framework: </span>
                Every skill carries an explicit evidence tier (Level 0 Unassessed to Level 3 Institution-verified)
                and auditable match rationale. No unverified claims, no black-box ML.
              </div>
            </div>
          </div>

          {/* Role-Based Entry Action Box (Prominent AICTE Pattern per design.md) */}
          <div className="mt-12">
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Select Your Access Role to Begin (Instant Direct Demo Access)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Student Entry */}
              <div className="group relative bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-sm hover:border-[#1B365D] hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#1B365D] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6 text-[#1B365D]" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-[#1B365D]">AYUSH Scholar</h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-[#1B365D]">
                    Student
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 mb-6 leading-relaxed">
                  Take adaptive clinical assessments, build an evidence-backed skill dossier, and get
                  placed with explainable match scores.
                </p>
                <Link
                  href="/student/assessment"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1B365D] text-white font-semibold text-sm hover:bg-[#152a48] transition-colors shadow-xs"
                >
                  <span>Launch Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="mt-3 text-center">
                  <Link
                    href="/student/profile"
                    className="text-xs font-medium text-[#1B365D] hover:underline"
                  >
                    Or view sample verified student profile →
                  </Link>
                </div>
              </div>

              {/* Employer Entry */}
              <div className="group relative bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-sm hover:border-[#1B365D] hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#1B365D] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6 text-[#1B365D]" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-[#1B365D]">AYUSH Employer</h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    Hospital / R&D
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 mb-6 leading-relaxed">
                  Post clinical & research openings with specific taxonomy requirements and review
                  candidates with transparent fit justifications.
                </p>
                <Link
                  href="/employer/opportunities/new"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1B365D] text-white font-semibold text-sm hover:bg-[#152a48] transition-colors shadow-xs"
                >
                  <span>Post Clinical Opportunity</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="mt-3 text-center">
                  <span className="text-xs text-stone-500">
                    Custom domain weighting & tier filters
                  </span>
                </div>
              </div>

              {/* Institution Admin Entry */}
              <div className="group relative bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-sm hover:border-[#1B365D] hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#1B365D] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6 text-[#1B365D]" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-[#1B365D]">Institution Admin</h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    Institution Leadership
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 mb-6 leading-relaxed">
                  Review cohort-wide competency dashboards, uncover curriculum gaps, and track student
                  readiness for national healthcare benchmarks.
                </p>
                <Link
                  href="/admin/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1B365D] text-white font-semibold text-sm hover:bg-[#152a48] transition-colors shadow-xs"
                >
                  <span>Access Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="mt-3 text-center">
                  <span className="text-xs text-stone-500">
                    Designed for a future AIIA pilot & NCISM outcomes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat Counters Section (AICTE-Style Live Credibility Pattern per design.md) */}
      <section className="py-12 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {MOCK_STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.id}
                  className="bg-[#FFFCF6] border border-stone-200 rounded-xl p-5 hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl sm:text-4xl font-black text-[#1B365D] tracking-tight">
                      {stat.value}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#1B365D] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-stone-800">{stat.label}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">{stat.subtext}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Core Feature Highlights (Card-based layout) */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-sky-900 mb-2">
            Engineered for SIH26044
          </h2>
          <p className="text-3xl font-black text-[#1B365D] tracking-tight">
            Built Around Verification, Explainability & Institutional Impact
          </p>
          <p className="mt-3 text-sm text-stone-600">
            Adhering strictly to the NCISM competency guidelines and deterministic evaluation formulas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MOCK_CORE_FEATURES.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200 p-7 shadow-xs hover:border-[#1B365D] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 text-[#1B365D] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#1B365D]" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-[#1B365D] border border-stone-200">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1B365D] mb-2">{feature.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-5">
                    {feature.description}
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-4 space-y-2">
                  {feature.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-xs text-stone-700">
                      <CheckCircle2 className="w-4 h-4 text-[#1B365D] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Sample Verified Clinical Opportunities Preview */}
      <section className="py-14 bg-stone-100/60 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1B365D]">
                Employer Gateway Preview
              </span>
              <h2 className="text-2xl font-black text-[#1B365D] tracking-tight mt-1">
                Featured Verified Clinical Opportunities
              </h2>
            </div>
            <Link
              href="/employer/opportunities/new"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B365D] hover:underline"
            >
              <span>Post a new opportunity</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_RECENT_OPPORTUNITIES.map((opp) => (
              <div
                key={opp.id}
                className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold text-[#1B365D]">{opp.role}</h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-50 text-[#1B365D] border border-sky-200 shrink-0">
                      {opp.type}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-stone-700">{opp.org}</p>
                  <p className="text-xs text-stone-500 mb-4">{opp.location}</p>

                  <div className="space-y-1.5 mb-4">
                    <span className="text-[11px] font-semibold text-stone-500 block uppercase">
                      Required Taxonomy Domains:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.requiredSkills.map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-xs px-2.5 py-1 rounded bg-[#FFFCF6] border border-stone-200 text-stone-800"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-3 flex items-center justify-between text-xs">
                  <span className="text-stone-500">
                    Threshold: <span className="font-semibold text-stone-800">{opp.minMatchTier}</span>
                  </span>
                  <Link
                    href="/student/assessment"
                    className="font-bold text-[#1B365D] hover:text-[#152a48] inline-flex items-center gap-1"
                  >
                    Check Match Compatibility →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-[#1B365D] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
            Ready to Experience the AYUSH SkillConnect Closed Loop?
          </h2>
          <p className="text-sky-100 max-w-2xl mx-auto text-sm sm:text-base mb-8">
            Click through the adaptive clinical assessment, explore the student competency profile with
            evidence tiers, or post a new clinical opportunity.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/student/assessment"
              className="px-6 py-3 rounded-xl bg-white text-[#1B365D] font-bold text-sm hover:bg-stone-100 transition-colors shadow-sm"
            >
              1. Try Adaptive Assessment
            </Link>
            <Link
              href="/student/profile"
              className="px-6 py-3 rounded-xl bg-sky-900/60 border border-sky-400/40 text-white font-bold text-sm hover:bg-sky-900 transition-colors"
            >
              2. View Skill Profile
            </Link>
            <Link
              href="/employer/opportunities/new"
              className="px-6 py-3 rounded-xl bg-sky-900/60 border border-sky-400/40 text-white font-bold text-sm hover:bg-sky-900 transition-colors"
            >
              3. Post Opportunity Form
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
