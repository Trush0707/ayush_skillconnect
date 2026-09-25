'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  BookOpen,
  HelpCircle,
} from 'lucide-react'

// MOCK DATA — for screenshot purposes only, will be replaced with real Supabase calls per Techspec.md/AppFlow.md in a later pass.
const MOCK_QUESTION_DATA = {
  questionId: 'q-ashtavidha-04',
  domainId: 'ashtavidha-pariksha',
  domainName: 'Ashtavidha Pariksha & Clinical Case-Taking',
  discipline: 'Ayurveda (BAMS)',
  currentStep: 4,
  totalSteps: 12,
  progressPercentage: 33,
  timeRemaining: '18:45',
  caseVignette:
    'A 42-year-old patient presents at an Ayurvedic General OPD with chronic Sandhigata Vata (osteoarthritis) of bilateral knee joints. The patient exhibits aggravated Vata-Kapha lakshanas, restricted joint flexion, and mild peri-articular crepitus. Upon Ashtavidha Pariksha (eight-fold diagnostic examination), the Nadi reveals Mandagati with intermittent Tikshna Sparsha, and Jihva exhibits moderate Sama condition.',
  questionText:
    'Based on this Ashtavidha diagnostic presentation and dosha assessment, which preparatory Purvakarma protocol is clinically indicated before administering tailored Sneha Basti?',
  options: [
    {
      id: 'opt-a',
      label: 'Option A',
      text: 'Initiate immediate Tikshna Virechana using Trivrit Lehyam without preliminary Deepana-Pachana, followed by immediate cold Upanaha.',
      rationale: 'Contraindicated: Administering Virechana in Sama condition without Deepana-Pachana risks aggravating Ama and systemic dosha imbalance.',
      pointWeight: 0,
      branchTag: 'Incorrect Protocol',
    },
    {
      id: 'opt-b',
      label: 'Option B (Recommended Clinical Protocol)',
      text: 'Administer Deepana-Pachana with Chitrakadi Vati until Nirama lakshana appears, followed by Sthanika Patra Pinda Sweda and Ruksha Valuka Sweda before Basti.',
      rationale: 'Optimal NCISM Protocol: Relieves Sama state, enhances Agni, and prepares srotas for safe, effective lipid absorption during Basti.',
      pointWeight: 25,
      branchTag: 'Adaptive Branch → Advances to Level 1 Theory-Verified (+25 pts)',
    },
    {
      id: 'opt-c',
      label: 'Option C',
      text: 'Proceed directly with bilateral Jalaukavacharana (Leech Therapy) over the patellar margins irrespective of Sama/Nirama dosha stage.',
      rationale: 'Suboptimal: Jalaukavacharana is primarily indicated for Pitta-Rakta vitiation, not primary Vata-Kapha Sandhigata Vata.',
      pointWeight: 10,
      branchTag: 'Partial Alignment',
    },
    {
      id: 'opt-d',
      label: 'Option D',
      text: 'Prescribe isolated Shamana Vati (Yogaraja Guggulu) with strict bilateral joint immobilization for 21 days with no shodhana intervention.',
      rationale: 'Incomplete: Prolonged joint immobilization leads to joint stiffness (Sandhi Graha) and muscle atrophy without addressing deep Vata pathology.',
      pointWeight: 5,
      branchTag: 'Conservative Stub',
    },
  ],
}

export default function AssessmentPage() {
  const [selectedOption, setSelectedOption] = useState<string>('opt-b')

  const question = MOCK_QUESTION_DATA

  return (
    <div className="min-h-screen bg-[#FFFCF6] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Back Link */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#1B365D] hover:underline bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-stone-500">
              Discipline: <span className="font-bold text-stone-800">{question.discipline}</span>
            </span>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-white px-2.5 py-1 rounded-md border border-stone-200">
              <Clock className="w-3.5 h-3.5 text-[#1B365D]" />
              <span className="font-mono font-semibold">{question.timeRemaining}</span>
            </div>
          </div>
        </div>

        {/* Milestone Progress Header (AICTE "Milestone 0 of 5" Pattern per design.md) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-900 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                  Question {question.currentStep} of {question.totalSteps}
                </span>
                <span className="text-xs text-stone-500">
                  Adaptive State Machine Active
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#1B365D] mt-1">
                Domain: {question.domainName}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-[#1B365D]">
                {question.progressPercentage}% Completed
              </span>
            </div>
          </div>

          {/* Visual Progress Bar (Navy/Indigo Accent per design.md - NO GREEN) */}
          <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#1B365D] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${question.progressPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2">
            <span>Milestone 1: Dosha Diagnosis</span>
            <span className="font-semibold text-[#1B365D]">Milestone 2: Protocol Selection (Current)</span>
            <span>Milestone 3: Outcome Verification</span>
          </div>
        </div>

        {/* Clinical Case Vignette & Question Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-6">
          {/* Case Vignette Header */}
          <div className="bg-[#1B365D] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-200" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-100">
                Clinical Case Simulation (Illustrative)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-sky-200">
              <ShieldCheck className="w-4 h-4" />
              <span>NCISM PO1 & PO3 Assessment</span>
            </div>
          </div>

          {/* Case Description */}
          <div className="p-6 border-b border-stone-200 bg-stone-50/70">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Clinical Vignette:
            </p>
            <p className="text-sm text-stone-800 leading-relaxed font-serif">
              &ldquo;{question.caseVignette}&rdquo;
            </p>
          </div>

          {/* Prompt Question */}
          <div className="p-6">
            <h3 className="text-base sm:text-lg font-bold text-[#1B365D] mb-6 leading-snug">
              {question.questionText}
            </h3>

            {/* 4 Mock Multiple Choice Options */}
            <div className="space-y-3.5">
              {question.options.map((opt) => {
                const isSelected = selectedOption === opt.id

                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#1B365D] bg-sky-50/40 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="pt-0.5">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-[#1B365D] bg-[#1B365D] text-white'
                              : 'border-stone-400 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isSelected ? 'text-[#1B365D]' : 'text-stone-500'
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                            {opt.branchTag}
                          </span>
                        </div>
                        <p className="text-sm text-stone-900 font-medium leading-relaxed">
                          {opt.text}
                        </p>

                        {/* Rationale feedback shown when selected */}
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-sky-100 text-xs text-stone-600 flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#1B365D] shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-[#1B365D]">Clinical Diagnostic Note: </strong>
                              {opt.rationale}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Sparkles className="w-4 h-4 text-[#1B365D]" />
              <span>
                Selection updates running domain tally for{' '}
                <strong className="text-stone-800">Ashtavidha Pariksha</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/student/profile"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B365D] text-white text-xs sm:text-sm font-semibold hover:bg-[#152a48] transition-colors shadow-xs"
              >
                <span>Submit & View Evidence Skill Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Fast Navigation Callout */}
        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#1B365D]">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Walkthrough Shortcut:</strong> Click above or right to review the 12-domain
              evidence-tier skill profile resulting from this assessment.
            </span>
          </div>
          <Link
            href="/student/profile"
            className="font-bold text-[#1B365D] hover:underline whitespace-nowrap"
          >
            Direct to Student Profile →
          </Link>
        </div>
      </div>
    </div>
  )
}
