'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Building2,
  MapPin,
  FileText,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react'

// MOCK DATA — for screenshot purposes only, will be replaced with real Supabase calls per Techspec.md/AppFlow.md in a later pass.
const AYUSH_TAXONOMY_DOMAINS = [
  { id: 'ashtavidha-pariksha', name: 'Ashtavidha Pariksha & Case-Taking' },
  { id: 'panchakarma-procedures', name: 'Panchakarma Procedure Competence' },
  { id: 'nadi-pariksha', name: 'Nadi Pariksha & Pulse Diagnosis' },
  { id: 'dravyaguna-pharmacology', name: 'Dravyaguna & Ayurvedic Pharmacology' },
  { id: 'rasa-shastra', name: 'Rasa Shastra & Bhasma Preparation' },
  { id: 'shalya-tantra', name: 'Shalya Tantra (Surgical & Ksharasutra)' },
  { id: 'shalakya-tantra', name: 'Shalakya Tantra (ENT & Ophthalmology)' },
  { id: 'prasuti-stri-roga', name: 'Prasuti Tantra & Stri Roga (Gynecology)' },
  { id: 'kaumarbhritya-pediatrics', name: 'Kaumarbhritya (AYUSH Pediatrics)' },
  { id: 'swasthavritta-yoga', name: 'Swasthavritta, Yoga & Lifestyle Medicine' },
  { id: 'agada-tantra-toxicology', name: 'Agada Tantra & Medical Jurisprudence' },
  { id: 'digital-it-hygiene', name: 'Digital Health Records & AYUSH IT Hygiene' },
]

// MOCK DATA — for screenshot purposes only, will be replaced with real Supabase calls per Techspec.md/AppFlow.md in a later pass.
interface RequiredSkillRow {
  id: string
  domainId: string
  minLevel: number // 0 - 100
  minEvidenceTier: number // 0 - 3
}

export default function NewOpportunityPage() {
  const [title, setTitle] = useState('Senior Resident Clinical Panchakarma Specialist')
  const [oppType, setOppType] = useState<'job' | 'internship'>('job')
  const [organization, setOrganization] = useState('AIIA Teaching Hospital & Research Wing')
  const [location, setLocation] = useState('New Delhi (Central Hospital Campus)')
  const [description, setDescription] = useState(
    'Looking for a certified BAMS graduate with verified clinical procedure competency in Panchakarma therapies (Janu Basti, Virechana, Shirodhara) and Ashtavidha Pariksha case documentation. Responsible for managing inpatient therapy wards and monitoring dosha progression.'
  )
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null)

  // Repeatable required skills state
  const [skills, setSkills] = useState<RequiredSkillRow[]>([
    {
      id: 'row-1',
      domainId: 'panchakarma-procedures',
      minLevel: 80,
      minEvidenceTier: 2, // Level 2 Observed
    },
    {
      id: 'row-2',
      domainId: 'ashtavidha-pariksha',
      minLevel: 75,
      minEvidenceTier: 2, // Level 2 Observed
    },
    {
      id: 'row-3',
      domainId: 'nadi-pariksha',
      minLevel: 70,
      minEvidenceTier: 1, // Level 1 Theory-verified
    },
  ])

  const handleAddSkillRow = () => {
    const newId = `row-${Date.now()}`
    setSkills([
      ...skills,
      {
        id: newId,
        domainId: 'dravyaguna-pharmacology',
        minLevel: 65,
        minEvidenceTier: 1,
      },
    ])
  }

  const handleRemoveSkillRow = (id: string) => {
    if (skills.length > 1) {
      setSkills(skills.filter((s) => s.id !== id))
    }
  }

  const handleUpdateSkillRow = (
    id: string,
    field: keyof RequiredSkillRow,
    value: string | number
  ) => {
    setSkills(
      skills.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittedMessage(
      'Opportunity specification validated! Stored in mock state. In Phase 2, this triggers real RLS-protected insert into opportunities & opportunity_required_skills tables.'
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFCF6] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
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
              href="/student/profile"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B365D] hover:underline bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs"
            >
              <span>Student Profile</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-stone-100 text-[#1B365D] px-2.5 py-1 rounded-md border border-stone-200">
              Employer Opportunity Gateway
            </span>
          </div>
        </div>

        {/* Form Header Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-start sm:items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1B365D] text-white flex items-center justify-center shrink-0">
              <Briefcase className="w-7 h-7 text-sky-200" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1B365D] tracking-tight">
                Post AYUSH Clinical or Research Opportunity
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Define taxonomy-grounded competency thresholds and evidence tier criteria to match
                pre-verified AIIA scholars.
              </p>
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-stone-700">
            <ShieldCheck className="w-4 h-4 text-[#1B365D] shrink-0 mt-0.5" />
            <span>
              <strong>Deterministic Candidate Filtering: </strong>
              The matching algorithm compares required skills against candidate stored levels and
              evidence tiers. Candidates will see their exact match breakdown upon applying.
            </span>
          </div>
        </div>

        {/* Opportunity Posting Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Information Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-bold text-[#1B365D]">Opportunity Overview</h2>
              <p className="text-xs text-stone-500">Core details shown on student discovery feeds</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Opportunity Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Resident Clinical Panchakarma Specialist"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-[#FFFCF6]"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Engagement Type <span className="text-rose-600">*</span>
                </label>
                <select
                  value={oppType}
                  onChange={(e) => setOppType(e.target.value as 'job' | 'internship')}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-[#FFFCF6]"
                >
                  <option value="job">Full-Time Clinical Job</option>
                  <option value="internship">Paid Clinical Internship</option>
                </select>
              </div>

              {/* Organization */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Organization / Hospital Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. National Institute of Ayurveda Hospital"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-[#FFFCF6]"
                  required
                />
              </div>

              {/* Location */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Work Location <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New Delhi / Gautampuri Campus"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-[#FFFCF6]"
                  required
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Clinical Scope & Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline responsibilities, clinical exposure, patient interaction, and prerequisites..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-[#FFFCF6]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Repeatable Required-Skill Rows */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1B365D]">
                  Required AYUSH Taxonomy Domains
                </h2>
                <p className="text-xs text-stone-500">
                  Select domain benchmarks and minimum evidence tiers for deterministic candidate matching
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSkillRow}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-[#1B365D] text-white hover:bg-[#152a48] transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill Requirement</span>
              </button>
            </div>

            {/* Rows list */}
            <div className="space-y-4">
              {skills.map((row, index) => (
                <div
                  key={row.id}
                  className="p-5 rounded-xl border border-stone-200 bg-[#FFFCF6] relative group hover:border-[#1B365D] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1B365D]">
                      Requirement #{index + 1}
                    </span>

                    {skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkillRow(row.id)}
                        className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                    {/* Domain Select */}
                    <div className="md:col-span-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                        AYUSH Taxonomy Domain
                      </label>
                      <select
                        value={row.domainId}
                        onChange={(e) =>
                          handleUpdateSkillRow(row.id, 'domainId', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-white"
                      >
                        {AYUSH_TAXONOMY_DOMAINS.map((domain) => (
                          <option key={domain.id} value={domain.id}>
                            {domain.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Minimum Level Slider */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 mb-1">
                        <span className="uppercase tracking-wider">Min Level Benchmark</span>
                        <span className="text-xs font-mono font-bold text-[#1B365D]">
                          {row.minLevel}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="95"
                        step="5"
                        value={row.minLevel}
                        onChange={(e) =>
                          handleUpdateSkillRow(
                            row.id,
                            'minLevel',
                            parseInt(e.target.value, 10)
                          )
                        }
                        className="w-full accent-[#1B365D] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
                        <span>Foundational (20%)</span>
                        <span>Clinical Mastery (95%)</span>
                      </div>
                    </div>

                    {/* Minimum Evidence Tier Filter */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Minimum Evidence Tier
                      </label>
                      <select
                        value={row.minEvidenceTier}
                        onChange={(e) =>
                          handleUpdateSkillRow(
                            row.id,
                            'minEvidenceTier',
                            parseInt(e.target.value, 10)
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B365D] bg-white"
                      >
                        <option value={0}>Level 0+ (Any Assessment)</option>
                        <option value={1}>Level 1+ (Theory-verified)</option>
                        <option value={2}>Level 2+ (Observed Signoff)</option>
                        <option value={3}>Level 3 (Institution-verified only)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Feedback Message */}
          {submittedMessage && (
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-300 text-xs sm:text-sm text-[#1B365D] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#1B365D]" />
              <div>
                <p className="font-bold">Form Validated Successfully</p>
                <p className="mt-0.5 text-stone-700">{submittedMessage}</p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <Link
              href="/"
              className="text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel & Return Home
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B365D] text-white font-bold text-sm hover:bg-[#152a48] transition-colors shadow-xs cursor-pointer"
              >
                <span>Publish Clinical Opportunity</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Bottom Fast Navigation Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <Link
            href="/student/profile"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1B365D] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Review Student Evidence Profile</span>
          </Link>

          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 text-[#1B365D] text-xs font-bold hover:bg-stone-200 transition-colors border border-stone-200"
          >
            <span>Proceed to Institution Admin Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
