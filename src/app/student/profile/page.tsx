'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Sparkles,
} from 'lucide-react'

// MOCK DATA — for screenshot purposes only, will be replaced with real Supabase calls per Techspec.md/AppFlow.md in a later pass.
const MOCK_STUDENT_PROFILE = {
  id: 'stu-demo-2024-88',
  name: 'Aarav Sharma (Demo Profile)',
  discipline: 'Ayurveda (BAMS)',
  institution: 'Sample Host Institution (Illustrative Demo)',
  enrollmentNo: 'DEMO/BAMS/2022/042',
  semester: '7th Semester',
  overallRank: 'Illustrative Cohort Evaluation',
  verifiedTiersCount: {
    level3: 3, // Institution-verified
    level2: 4, // Observed
    level1: 4, // Theory-verified
    level0: 1, // Unassessed
  },
}

// MOCK DATA — for screenshot purposes only, will be replaced with real Supabase calls per Techspec.md/AppFlow.md in a later pass.
interface SkillDomain {
  id: string
  name: string
  score: number // 20 - 95
  evidenceTier: 0 | 1 | 2 | 3
  tierLabel: 'Level 0 — Unassessed' | 'Level 1 — Theory-verified' | 'Level 2 — Observed' | 'Level 3 — Institution-verified'
  tierBadgeColor: string
  verifiedBy: string
  ncismPO: string
  clinicalNote: string
}

const MOCK_SKILL_DOMAINS: SkillDomain[] = [
  {
    id: 'ashtavidha-pariksha',
    name: 'Ashtavidha Pariksha & Case-Taking',
    score: 88,
    evidenceTier: 3,
    tierLabel: 'Level 3 — Institution-verified',
    tierBadgeColor: 'bg-[#1B365D] text-white border-sky-400',
    verifiedBy: 'Signed by HOD Kayachikitsa (Sample Clinical Dept)',
    ncismPO: 'PO1, PO3',
    clinicalNote: 'Comprehensive 8-fold diagnostic examination with precision case documentation.',
  },
  {
    id: 'panchakarma-procedures',
    name: 'Panchakarma Procedure Competence',
    score: 92,
    evidenceTier: 3,
    tierLabel: 'Level 3 — Institution-verified',
    tierBadgeColor: 'bg-[#1B365D] text-white border-sky-400',
    verifiedBy: 'Sample Panchakarma Ward Certified',
    ncismPO: 'PO2, PO4',
    clinicalNote: 'Certified independent administration of Sneha Basti, Virechana & Shirodhara.',
  },
  {
    id: 'nadi-pariksha',
    name: 'Nadi Pariksha & Pulse Diagnosis',
    score: 84,
    evidenceTier: 2,
    tierLabel: 'Level 2 — Observed',
    tierBadgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    verifiedBy: 'Faculty Clinical Observation Signoff',
    ncismPO: 'PO1',
    clinicalNote: 'Consistent differentiation of Gati (Sarpa, Manduka, Hamsa) in OPD cases.',
  },
  {
    id: 'dravyaguna-pharmacology',
    name: 'Dravyaguna & Ayurvedic Pharmacology',
    score: 79,
    evidenceTier: 2,
    tierLabel: 'Level 2 — Observed',
    tierBadgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    verifiedBy: 'Herbarium & Clinical Pharmacy Log',
    ncismPO: 'PO5',
    clinicalNote: 'Medicinal plant morphological identification and formulation compounding.',
  },
  {
    id: 'swasthavritta-yoga',
    name: 'Swasthavritta, Yoga & Lifestyle Medicine',
    score: 85,
    evidenceTier: 2,
    tierLabel: 'Level 2 — Observed',
    tierBadgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    verifiedBy: 'Departmental Clinical Logbook',
    ncismPO: 'PO3, PO7',
    clinicalNote: 'Dinacharya counseling and therapeutic Asana protocol design.',
  },
  {
    id: 'shalya-tantra',
    name: 'Shalya Tantra (Surgical & Ksharasutra)',
    score: 73,
    evidenceTier: 2,
    tierLabel: 'Level 2 — Observed',
    tierBadgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    verifiedBy: 'Sample Minor OT Procedural Signoff',
    ncismPO: 'PO4',
    clinicalNote: 'Assisted in Ksharasutra ligation for Bhagandara (fistula-in-ano).',
  },
  {
    id: 'rasa-shastra',
    name: 'Rasa Shastra & Bhasma Preparation',
    score: 71,
    evidenceTier: 1,
    tierLabel: 'Level 1 — Theory-verified',
    tierBadgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    verifiedBy: 'Adaptive Diagnostic Assessment Score',
    ncismPO: 'PO5',
    clinicalNote: 'Knowledge of Shodhana, Marana, and Pariksha standards for metallic calces.',
  },
  {
    id: 'shalakya-tantra',
    name: 'Shalakya Tantra (ENT & Ophthalmology)',
    score: 66,
    evidenceTier: 1,
    tierLabel: 'Level 1 — Theory-verified',
    tierBadgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    verifiedBy: 'Adaptive Diagnostic Assessment Score',
    ncismPO: 'PO2',
    clinicalNote: 'Assessment of Netra Kriya Kalpa (Tarpana, Putapaka) indications.',
  },
  {
    id: 'prasuti-stri-roga',
    name: 'Prasuti Tantra & Stri Roga (Gynecology)',
    score: 68,
    evidenceTier: 1,
    tierLabel: 'Level 1 — Theory-verified',
    tierBadgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    verifiedBy: 'Adaptive Diagnostic Assessment Score',
    ncismPO: 'PO2, PO6',
    clinicalNote: 'Garbhini Paricharya and management of Yonivyapad clinical guidelines.',
  },
  {
    id: 'kaumarbhritya-pediatrics',
    name: 'Kaumarbhritya (AYUSH Pediatrics)',
    score: 62,
    evidenceTier: 1,
    tierLabel: 'Level 1 — Theory-verified',
    tierBadgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    verifiedBy: 'Adaptive Diagnostic Assessment Score',
    ncismPO: 'PO2',
    clinicalNote: 'Dosage calculations according to Kashyapa Samhita principles.',
  },
  {
    id: 'agada-tantra-toxicology',
    name: 'Agada Tantra & Medical Jurisprudence',
    score: 55,
    evidenceTier: 3,
    tierLabel: 'Level 3 — Institution-verified',
    tierBadgeColor: 'bg-[#1B365D] text-white border-sky-400',
    verifiedBy: 'Departmental Viva & Legal Exam Signoff',
    ncismPO: 'PO8',
    clinicalNote: 'Dooshivisha treatment protocols and forensic documentation.',
  },
  {
    id: 'digital-it-hygiene',
    name: 'Digital Health Records & AYUSH IT Hygiene',
    score: 38,
    evidenceTier: 0,
    tierLabel: 'Level 0 — Unassessed',
    tierBadgeColor: 'bg-stone-100 text-stone-600 border-stone-300',
    verifiedBy: 'Pending Verification / Evaluation',
    ncismPO: 'PO7',
    clinicalNote: 'Ayush Hospital Management Information System (A-HMIS) module pending.',
  },
]

// MOCK DATA — for screenshot purposes only, will be replaced with real Supabase calls per Techspec.md/AppFlow.md in a later pass.
const MOCK_MATCHED_OPPORTUNITIES = [
  {
    id: 'opp-101',
    role: 'Resident Clinical Panchakarma Specialist',
    organization: 'Sample Wellness Clinic (Demo Posting)',
    location: 'New Delhi / Jaipur',
    type: 'Clinical Residency',
    matchScore: 91,
    reasoning: [
      'Strong Fit: Panchakarma Procedure Competence (92% vs 75% required)',
      'Strong Fit: Ashtavidha Pariksha & Case-Taking (88% vs 70% required)',
      'High Credibility: Level 3 Institution-verified tier multiplier applied (1.0x)',
      'Eligibility Gate Passed: BAMS Degree & candidate criteria matched',
    ],
  },
  {
    id: 'opp-102',
    role: 'Junior Clinical Research Fellow (Ayurvedic Formulations)',
    organization: 'Sample Research Institute (Demo Posting)',
    location: 'Haridwar (Hybrid)',
    type: 'Research Fellowship',
    matchScore: 78,
    reasoning: [
      'Strong Fit: Dravyaguna Pharmacology (79% vs 70% required)',
      'Moderate Fit: Nadi Pariksha & Clinical Diagnosis (84% Level 2 Observed)',
      'Identified Gap: Digital Health Records & IT Hygiene (38% vs 65% required)',
      'Interest Bonus: Candidate tagged interest in Ayurvedic Drug Standardization',
    ],
  },
]

export default function StudentProfilePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'gaps'>('all')

  const filteredDomains = MOCK_SKILL_DOMAINS.filter((d) => {
    if (activeTab === 'verified') return d.evidenceTier >= 2
    if (activeTab === 'gaps') return d.score < 70 || d.evidenceTier === 0
    return true
  })

  return (
    <div className="min-h-screen bg-[#FFFCF6] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Back Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B365D] hover:underline bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Landing Page</span>
            </Link>
            <span className="text-stone-300">/</span>
            <Link
              href="/student/assessment"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B365D] hover:underline bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs"
            >
              <span>Back to Assessment</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-sky-50 text-[#1B365D] px-2.5 py-1 rounded-md border border-sky-200">
              Verified Student Skill Dossier
            </span>
          </div>
        </div>

        {/* Student Profile Header Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1B365D] text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                <GraduationCap className="w-9 h-9 text-sky-200" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1B365D] tracking-tight">
                    {MOCK_STUDENT_PROFILE.name}
                  </h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-[#1B365D] border border-sky-200">
                    {MOCK_STUDENT_PROFILE.discipline}
                  </span>
                </div>
                <p className="text-sm font-medium text-stone-600 mt-1">
                  {MOCK_STUDENT_PROFILE.institution} • {MOCK_STUDENT_PROFILE.semester}
                </p>
                <p className="text-xs text-stone-400 mt-0.5 font-mono">
                  Enrollment: {MOCK_STUDENT_PROFILE.enrollmentNo}
                </p>
              </div>
            </div>

            {/* Evidence Tier Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 lg:border-l lg:border-stone-100 lg:pl-6">
              <div className="bg-[#FFFCF6] border border-stone-200 rounded-xl p-3 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  Level 3 Verified
                </span>
                <span className="text-xl font-black text-[#1B365D]">
                  {MOCK_STUDENT_PROFILE.verifiedTiersCount.level3} Domains
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">1.0x Full Weight</span>
              </div>
              <div className="bg-[#FFFCF6] border border-stone-200 rounded-xl p-3 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  Level 2 Observed
                </span>
                <span className="text-xl font-black text-[#1B365D]">
                  {MOCK_STUDENT_PROFILE.verifiedTiersCount.level2} Domains
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">0.7x Clinical Weight</span>
              </div>
              <div className="bg-[#FFFCF6] border border-stone-200 rounded-xl p-3 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  Level 1 Theory
                </span>
                <span className="text-xl font-black text-[#1B365D]">
                  {MOCK_STUDENT_PROFILE.verifiedTiersCount.level1} Domains
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">0.4x Quiz Weight</span>
              </div>
              <div className="bg-[#FFFCF6] border border-stone-200 rounded-xl p-3 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  Level 0 Unassessed
                </span>
                <span className="text-xl font-black text-stone-600">
                  {MOCK_STUDENT_PROFILE.verifiedTiersCount.level0} Domain
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">0.0x Weight Multiplier</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Differentiator Callout Banner */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 sm:p-5 mb-8 flex items-start gap-3.5 shadow-xs">
          <ShieldCheck className="w-6 h-6 text-[#1B365D] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-stone-800">
            <span className="font-bold text-[#1B365D]">
              Verified Multi-Tier Evidence Framework (SIH26044 Mandate):{' '}
            </span>
            Unlike generic resume portals, every skill rating below is attached to an explicit
            verifiable evidence tier. Raw diagnostic quiz results automatically award Level 1;
            Level 2 and Level 3 require verified faculty observation and institutional departmental signoff.
          </div>
        </div>

        {/* Tab Controls & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-[#1B365D] tracking-tight">
              NCISM 12-Domain Competency Matrix
            </h2>
            <p className="text-xs text-stone-500">
              Evaluated against National Commission for Indian System of Medicine standards
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-[#1B365D] shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All 12 Domains ({MOCK_SKILL_DOMAINS.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('verified')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'verified'
                  ? 'bg-white text-[#1B365D] shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Clinical Verified (7)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gaps')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'gaps'
                  ? 'bg-white text-[#1B365D] shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Gap Report / Action Required (5)
            </button>
          </div>
        </div>

        {/* 12 Authentic AYUSH Domains List with Visible Evidence Tiers */}
        <div className="space-y-4 mb-12">
          {filteredDomains.map((skill) => (
            <div
              key={skill.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs hover:border-[#1B365D] transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base sm:text-lg font-bold text-[#1B365D]">
                      {skill.name}
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                      {skill.ncismPO}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">{skill.clinicalNote}</p>
                </div>

                {/* Visible Evidence Tier Badge (Core Visual Differentiator per design.md) */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${skill.tierBadgeColor}`}
                  >
                    {skill.tierLabel}
                  </span>
                </div>
              </div>

              {/* Competency Score Bar & Details */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">
                    Evidence Source:{' '}
                    <strong className="text-stone-700 font-medium">{skill.verifiedBy}</strong>
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-stone-500">Raw Assessment:</span>
                    <span className="text-sm font-black text-[#1B365D]">{skill.score}%</span>
                  </div>
                </div>

                {/* Visual Progress Bar (Navy/Indigo Accent - STRICTLY NO GREEN) */}
                <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#1B365D] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${skill.score}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span>0% Foundational</span>
                  <span>50% Minimum Competency</span>
                  <span>75% Advanced Practice</span>
                  <span>100% Master Practitioner</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Explainable Matching Engine Preview Section (Prd.md / Techspec.md) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1B365D]" />
                <h2 className="text-xl font-black text-[#1B365D] tracking-tight">
                  Matched Clinical Opportunities & Explainable Score Breakdown
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Generated using deterministic formula: 0.60 × Skill + 0.30 × Eligibility + 0.10 ×
                Interest. Every match includes stored reasoning.
              </p>
            </div>

            <Link
              href="/employer/opportunities/new"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B365D] hover:underline"
            >
              <span>Employer Posting Portal →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {MOCK_MATCHED_OPPORTUNITIES.map((opp) => (
              <div
                key={opp.id}
                className="bg-[#FFFCF6] rounded-xl border border-stone-200 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-[#1B365D]">{opp.role}</h3>
                      <p className="text-xs font-medium text-stone-700">{opp.organization}</p>
                      <p className="text-xs text-stone-500">{opp.location}</p>
                    </div>

                    {/* Numeric Match Badge */}
                    <div className="bg-[#1B365D] text-white px-3 py-1.5 rounded-xl text-center shrink-0">
                      <span className="text-lg font-black block leading-none">
                        {opp.matchScore}%
                      </span>
                      <span className="text-[10px] uppercase font-bold text-sky-200 tracking-wider">
                        Match
                      </span>
                    </div>
                  </div>

                  {/* Explainable Match Reasoning Array (Mandatory Product Requirement) */}
                  <div className="mt-4 pt-3 border-t border-stone-200 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                      Deterministic Match Reasoning:
                    </span>
                    {opp.reasoning.map((reason, rIdx) => (
                      <div key={rIdx} className="flex items-start gap-2 text-xs text-stone-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1B365D] shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-200 flex items-center justify-between">
                  <span className="text-xs text-stone-500">Sample Opportunity Match</span>
                  <button
                    type="button"
                    onClick={() =>
                      alert('Demo action: Application record logged with explainable match reasoning!')
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#1B365D] text-white hover:bg-[#152a48] transition-colors cursor-pointer"
                  >
                    <span>Apply with Verified Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Fast Navigation Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <Link
            href="/student/assessment"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1B365D] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retake / Explore Adaptive Assessment</span>
          </Link>

          <Link
            href="/employer/opportunities/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B365D] text-white text-xs sm:text-sm font-bold hover:bg-[#152a48] transition-colors shadow-xs"
          >
            <span>Proceed to Employer Opportunity Posting</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
