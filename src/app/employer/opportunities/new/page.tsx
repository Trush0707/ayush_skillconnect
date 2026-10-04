'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

// Types matching Schema.md
interface SkillTaxonomy {
  domain_id: string
  name: string
}

interface RequiredSkillRow {
  _key: string
  domain_id: string
  min_level: number
}

export default function NewOpportunityPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [taxonomy, setTaxonomy] = useState<SkillTaxonomy[]>([])
  const [taxonomyLoading, setTaxonomyLoading] = useState(true)
  const [taxonomyError, setTaxonomyError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<'internship' | 'job'>('internship')
  const [organization, setOrganization] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')

  const [skills, setSkills] = useState<RequiredSkillRow[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [skillsError, setSkillsError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadTaxonomy() {
      setTaxonomyLoading(true)
      setTaxonomyError(null)
      const { data, error } = await supabase
        .from('skill_taxonomy')
        .select('domain_id, name')
        .order('name', { ascending: true })

      if (error) {
        setTaxonomyError('Failed to load skill taxonomy. Please refresh.')
      } else if (data && data.length > 0) {
        setTaxonomy(data as SkillTaxonomy[])
        setSkills([
          { _key: `row-${Date.now()}`, domain_id: (data[0] as SkillTaxonomy).domain_id, min_level: 50 },
        ])
      }
      setTaxonomyLoading(false)
    }
    loadTaxonomy()
  }, [])

  function addSkillRow() {
    if (taxonomy.length === 0) return
    setSkills((prev) => [
      ...prev,
      { _key: `row-${Date.now()}`, domain_id: taxonomy[0].domain_id, min_level: 50 },
    ])
    setSkillsError(null)
  }

  function removeSkillRow(key: string) {
    setSkills((prev) => prev.filter((s) => s._key !== key))
  }

  function updateSkillRow(key: string, field: 'domain_id' | 'min_level', value: string | number) {
    setSkills((prev) => prev.map((s) => (s._key === key ? { ...s, [field]: value } : s)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSkillsError(null)

    if (skills.length === 0) {
      setSkillsError('Please add at least one required skill domain before submitting.')
      return
    }

    startTransition(async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setFormError('Session expired. Please sign in again.')
        return
      }

      const { data: opp, error: oppError } = await supabase
        .from('opportunities')
        .insert({
          employer_auth_id: user.id,
          title: title.trim(),
          type,
          organization: organization.trim(),
          description: description.trim(),
          location: location.trim(),
          status: 'open',
        })
        .select('id')
        .single()

      if (oppError || !opp) {
        setFormError(oppError?.message ?? 'Failed to create opportunity. Please try again.')
        return
      }

      const skillRows = skills.map((s) => ({
        opportunity_id: opp.id,
        domain_id: s.domain_id,
        min_level: s.min_level,
      }))

      const { error: skillsInsertError } = await supabase
        .from('opportunity_required_skills')
        .insert(skillRows)

      if (skillsInsertError) {
        setFormError(skillsInsertError.message ?? 'Failed to save required skills.')
        return
      }

      setSuccess(true)
      // router.refresh() forces Next.js to invalidate cached page renders so the
      // newly posted opportunity appears immediately when navigating to the list.
      router.refresh()
      setTimeout(() => { router.push('/employer/opportunities') }, 1200)
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-xs text-stone-500">
        <Link
          href="/employer/opportunities"
          className="inline-flex items-center gap-1.5 font-semibold text-[#1B365D] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          My Opportunities
        </Link>
        <span>/</span>
        <span className="text-stone-400">Post New</span>
      </div>

      {/* Page header card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1B365D] flex items-center justify-center shrink-0">
            <Briefcase className="w-7 h-7 text-sky-200" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B365D] tracking-tight">
              Post a New Opportunity
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Define competency thresholds so the platform can match verified AYUSH candidates to your opening.
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-sky-50 border border-sky-200 p-3.5 text-xs text-stone-700">
          <ShieldCheck className="w-4 h-4 text-[#1B365D] shrink-0 mt-0.5" />
          <span>
            <strong>RLS-gated:</strong> this opportunity will be owned by your account and only you can edit or close it.
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* Section 1: Opportunity overview */}
        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-lg font-bold text-[#1B365D]">Opportunity Overview</h2>
            <p className="text-xs text-stone-500 mt-0.5">Core details shown on student discovery feeds</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label htmlFor="opp-title" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Opportunity Title <span className="text-rose-600">*</span>
              </label>
              <input
                id="opp-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Resident Clinical Panchakarma Specialist"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-[#FFFCF6] focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="opp-type" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Engagement Type <span className="text-rose-600">*</span>
              </label>
              <select
                id="opp-type"
                value={type}
                onChange={(e) => setType(e.target.value as 'internship' | 'job')}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-[#FFFCF6] focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition"
              >
                <option value="internship">Clinical Internship</option>
                <option value="job">Full-Time Job</option>
              </select>
            </div>

            <div>
              <label htmlFor="opp-org" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Organization / Hospital <span className="text-rose-600">*</span>
              </label>
              <input
                id="opp-org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. AIIA New Delhi"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-[#FFFCF6] focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="opp-location" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Work Location <span className="text-rose-600">*</span>
              </label>
              <input
                id="opp-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New Delhi / Pune / Remote"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-[#FFFCF6] focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="opp-desc" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Description <span className="text-rose-600">*</span>
              </label>
              <textarea
                id="opp-desc"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline responsibilities, clinical exposure, patient interaction and prerequisites..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-[#FFFCF6] focus:outline-none focus:ring-2 focus:ring-[#1B365D] resize-y transition"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Required Skills */}
        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1B365D]">Required AYUSH Taxonomy Domains</h2>
              <p className="text-xs text-stone-500 mt-0.5">At least one domain required — drives deterministic candidate matching</p>
            </div>
            {!taxonomyLoading && !taxonomyError && taxonomy.length > 0 && (
              <button
                type="button"
                id="add-skill-domain-btn"
                onClick={addSkillRow}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B365D] text-white text-xs font-bold hover:bg-[#152a48] transition-colors shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Domain
              </button>
            )}
          </div>

          {taxonomyLoading && (
            <div className="flex items-center gap-2 text-sm text-stone-500 py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading skill taxonomy...
            </div>
          )}
          {taxonomyError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {taxonomyError}
            </div>
          )}
          {skillsError && (
            <div id="skills-validation-error" className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-300 p-3 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {skillsError}
            </div>
          )}

          {!taxonomyLoading && !taxonomyError && (
            <div className="space-y-4">
              {skills.length === 0 ? (
                <p className="text-sm text-stone-400 italic text-center py-6">
                  No skill domains added yet. Click &ldquo;Add Domain&rdquo; to begin.
                </p>
              ) : (
                skills.map((row, index) => (
                  <div key={row._key} className="p-5 rounded-xl border border-stone-200 bg-[#FFFCF6] hover:border-[#1B365D] transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1B365D]">
                        Requirement #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSkillRow(row._key)}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove this requirement"
                        aria-label={`Remove requirement ${index + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                      <div>
                        <label htmlFor={`skill-domain-${row._key}`} className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                          AYUSH Taxonomy Domain
                        </label>
                        <select
                          id={`skill-domain-${row._key}`}
                          value={row.domain_id}
                          onChange={(e) => updateSkillRow(row._key, 'domain_id', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition"
                        >
                          {taxonomy.map((d) => (
                            <option key={d.domain_id} value={d.domain_id}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 mb-1">
                          <label htmlFor={`skill-level-${row._key}`} className="uppercase tracking-wider">
                            Min Level Threshold
                          </label>
                          <span className="font-mono text-[#1B365D]">{row.min_level}</span>
                        </div>
                        <input
                          id={`skill-level-${row._key}`}
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={row.min_level}
                          onChange={(e) => updateSkillRow(row._key, 'min_level', parseInt(e.target.value, 10))}
                          className="w-full accent-[#1B365D] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
                          <span>0</span><span>50</span><span>100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {formError && (
          <div id="form-error-message" className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {success && (
          <div id="success-message" className="flex items-center gap-2.5 rounded-xl bg-sky-50 border border-sky-200 p-4 text-sm text-[#1B365D]">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-sky-600" />
            <span><strong>Opportunity published!</strong> Redirecting to your listings...</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/employer/opportunities" className="text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors">
            Cancel
          </Link>
          <button
            id="submit-opportunity-btn"
            type="submit"
            disabled={isPending || success || taxonomyLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B365D] text-white font-bold text-sm hover:bg-[#152a48] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</>
            ) : (
              <>Publish Opportunity<ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

