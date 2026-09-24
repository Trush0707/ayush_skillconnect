import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  BarChart3,
  Users,
  ShieldCheck,
  TrendingUp,
  Download,
  Filter,
} from 'lucide-react'

// MOCK DATA — for screenshot purposes only, will be replaced with real Supabase calls per Techspec.md/AppFlow.md in a later pass.
const MOCK_COHORT_SUMMARY = {
  institution: 'All India Institute of Ayurveda (AIIA), New Delhi',
  batch: 'BAMS Batch 2022–2027 (7th Semester)',
  totalStudents: 142,
  assessedStudents: 138,
  averageCompetency: '76.4%',
  placementReadyPercentage: '81.2%',
}

// MOCK DATA — for screenshot purposes only, will be replaced with real Supabase calls per Techspec.md/AppFlow.md in a later pass.
const MOCK_DOMAIN_AVERAGES = [
  { domain: 'Ashtavidha Pariksha & Case-Taking', avgScore: 84, benchmark: 75, status: 'Above Benchmark' },
  { domain: 'Nadi Pariksha & Clinical Diagnosis', avgScore: 78, benchmark: 70, status: 'Above Benchmark' },
  { domain: 'Panchakarma Procedure Competence', avgScore: 88, benchmark: 80, status: 'Exemplary' },
  { domain: 'Dravyaguna Pharmacology', avgScore: 74, benchmark: 70, status: 'Above Benchmark' },
  { domain: 'Rasa Shastra & Bhasma Preparation', avgScore: 68, benchmark: 65, status: 'Meets Criteria' },
  { domain: 'Shalya Tantra (Surgical / Ksharasutra)', avgScore: 62, benchmark: 70, status: 'Curriculum Gap' },
  { domain: 'Digital Health Records & IT Hygiene', avgScore: 59, benchmark: 75, status: 'Priority Intervention' },
]

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#FFFCF6] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#1B365D] hover:underline bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-sky-100 text-[#1B365D] px-2.5 py-1 rounded-md border border-sky-200">
              Institution Admin Portal (AIIA Pilot)
            </span>
          </div>
        </div>

        {/* Institution Header Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1B365D] text-white flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7 text-sky-200" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#1B365D] tracking-tight">
                  {MOCK_COHORT_SUMMARY.institution}
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                  Cohort Skill-Gap Analytics • {MOCK_COHORT_SUMMARY.batch}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Cohort</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-[#1B365D] text-white hover:bg-[#152a48]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export NCISM Report</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#FFFCF6] border border-stone-200 rounded-xl p-4">
              <span className="text-xs text-stone-500 block">Enrolled Students</span>
              <span className="text-2xl font-black text-[#1B365D]">
                {MOCK_COHORT_SUMMARY.totalStudents}
              </span>
              <span className="text-[11px] text-stone-400 block mt-0.5">AIIA Registered</span>
            </div>
            <div className="bg-[#FFFCF6] border border-stone-200 rounded-xl p-4">
              <span className="text-xs text-stone-500 block">Assessed with Evidence</span>
              <span className="text-2xl font-black text-[#1B365D]">
                {MOCK_COHORT_SUMMARY.assessedStudents}
              </span>
              <span className="text-[11px] text-stone-400 block mt-0.5">97.1% Completion</span>
            </div>
            <div className="bg-[#FFFCF6] border border-stone-200 rounded-xl p-4">
              <span className="text-xs text-stone-500 block">Cohort Mean Score</span>
              <span className="text-2xl font-black text-[#1B365D]">
                {MOCK_COHORT_SUMMARY.averageCompetency}
              </span>
              <span className="text-[11px] text-stone-400 block mt-0.5">Across 12 Domains</span>
            </div>
            <div className="bg-[#FFFCF6] border border-stone-200 rounded-xl p-4">
              <span className="text-xs text-stone-500 block">Placement Qualified</span>
              <span className="text-2xl font-black text-[#1B365D]">
                {MOCK_COHORT_SUMMARY.placementReadyPercentage}
              </span>
              <span className="text-[11px] text-stone-400 block mt-0.5">Tier 2+ Verified</span>
            </div>
          </div>
        </div>

        {/* Aggregate Domain Table (Language A Institutional Style per design.md) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#1B365D]">
                Curriculum & Clinical Competency Analysis
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Aggregate average score per NCISM domain across all assessed AIIA students
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-bold">Taxonomy Domain</th>
                  <th className="py-3 px-4 font-bold">Cohort Mean</th>
                  <th className="py-3 px-4 font-bold">NCISM Benchmark</th>
                  <th className="py-3 px-4 font-bold">Gap Status</th>
                  <th className="py-3 px-4 font-bold">Distribution Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {MOCK_DOMAIN_AVERAGES.map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="py-3.5 px-4 font-semibold text-stone-900">{row.domain}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1B365D]">
                      {row.avgScore}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-500">{row.benchmark}%</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          row.avgScore < row.benchmark
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-sky-100 text-[#1B365D] border border-sky-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 w-48">
                      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#1B365D] h-2 rounded-full"
                          style={{ width: `${row.avgScore}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
