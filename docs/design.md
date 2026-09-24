# design.md — SIH26044 UI Design Brief (for Google Stitch)

## Reference Sites — What Was Actually Found

Fetched directly: `ayushportal.nic.in`, `e-aushadhi.gov.in`, `internship.aicte-india.org`.
Blocked (robots.txt): `elms.ayush.gov.in`, `anudan.ayush.gov.in` — treat as following the same GIGW pattern below; same ministry ecosystem, same design system almost certainly applies.

**Two distinct design languages showed up, not one:**

### Language A — Classic GIGW Govt Portal (ayushportal.nic.in, e-aushadhi.gov.in)
- Accessibility toolbar: `A- / A / A+` font-size toggle, "Screen Reader Access," "Skip to main content" — present on every page
- Bilingual toggle (English/Hindi)
- Government of India emblem + Ministry logo in header
- PM/Minister photo banners on homepage (e-Aushadhi shows PM + Minister of State portraits prominently)
- Rotating image-slider banners
- Dense navigation: multi-level dropdowns (Notification → Gazette Notifications, Circulars, Events, Guidelines)
- "Related Links" / "Important Links" — grid of partner-scheme logos (MyGov, Digital India, Swachh Bharat, Azadi Ka Amrit Mahotsav, PM Gati Shakti)
- Advanced search with heavy filter panels (ayushportal.nic.in's research search has Medical System, Category, Body System, Evidence Grade dropdowns — this is your closest structural analog for a filterable opportunity/skill search)
- Footer: visitor counter, sitemap, website policies, FAQs, "User Manual" link, physical address, version/last-update date
- Overall tone: dense, utilitarian, institutional trust signals over visual polish

### Language B — Modern GoI Portal (internship.aicte-india.org)
- Confirmed background theme color: `#FFFCF6` (warm off-white, not stark white)
- Consumer-app patterns: milestone-based onboarding progress bar ("Milestone 0 of 5"), role-based login switcher (Student / Industry / University-TPO / other roles as distinct buttons), live stat counters ("79,57,193+ Internships," "83,170 Companies")
- Card-based content: internship listings, "stream" category cards with tags (Full-stack, Mobile, DevOps...)
- Plain-language, warm copywriting ("Your Dream Internship Is Just A Single Click Away," "Made in Bharat for the students of Bharat")
- QR-verifiable certificate concept — visual trust badge pattern
- Still carries GoI legitimacy markers (AICTE + Ministry of Education emblems in footer) but prioritizes usability over density

**Implication for your design:** Language B proves modern, warm, usable GoI portals are legitimate precedent — you are not deviating from "government seriousness" by choosing clarity over density. Recommended position: **structurally closer to Language A** (accessibility toolbar, GoI trust markers, filterable search, official tone — because your judges are evaluating a Ministry of AYUSH submission and these cues signal deployability) **but visually closer to Language B** (warm neutral background, card-based layouts, stat counters, role-based entry, plain-language copy) for actual usability. Don't build a dense bureaucratic UI — build a trustworthy one that happens to also be pleasant to use.

---

## Color Palette

**⚠️ Explicit constraint: do NOT use green as the accent color.** AYUSH SkillBridge (ayushbridge.vercel.app, the live SIH26044 competitor) uses a green-through-beige-golden-to-orange accent palette. Overlapping accent colors risks visual confusion with a direct competitor in a judge's memory — pick a palette that reads as clearly distinct on sight.

- **Background:** warm off-white, not stark white — reference AICTE's confirmed `#FFFCF6`
- **Primary accent (recommended): institutional navy/deep blue** — consistent across ayushportal.nic.in and e-aushadhi.gov.in headers, carries GoI trust signaling without touching SkillBridge's territory. Alternative: a deep maroon/indigo, also unused by SkillBridge and still reads as serious/institutional.
- **Secondary:** neutral slate gray or a muted teal-blue (avoid true teal/green-teal blends that could still read green-adjacent)
- **Tricolor accent (sparingly):** a thin saffron/white/[navy instead of green] accent line or badge treatment — common GoI visual signature, use only as a subtle strip (e.g., top border, section divider), never as a dominant color block
- **Neutral text/borders:** standard dark gray/charcoal for body text, light gray for borders and dividers

*Note: exact hex values weren't extractable from text-based fetches — before building in Stitch, have someone screenshot the three live sites and eyedropper-sample the real header/button colors for precision. Treat the above as directional, not final. Whatever final accent is chosen, do a quick side-by-side glance against SkillBridge's homepage to confirm no visual overlap.*

---

## Typography

- Clean, highly legible sans-serif (matches both reference languages — no display/decorative fonts on any of the three sites)
- Clear heading hierarchy — GIGW sites lean on bold section headers over multiple nav levels; keep headers bold and unambiguous
- Support for bilingual rendering (English/Hindi) in font choice, even if you only ship English for the MVP — pick a typeface family with good Devanagari pairing available, as a forward-compatible choice

---

## Layout & Accessibility Patterns to Adopt

1. **Accessibility toolbar** (font-size toggle, skip-to-content) — cheap to add, strong trust/legitimacy signal for a Ministry submission, and genuinely good practice
2. **Role-based entry point** — like AICTE's "Sign in as: Student / Industry / University," make your Student / Employer / Institution Admin login choice explicit and visible on the landing page, not buried
3. **Filterable search/browse** — model your opportunity/skill browsing on ayushportal.nic.in's advanced search (Medical System, Category, Evidence Grade filters) → your equivalent: AYUSH discipline, taxonomy domain, opportunity type filters
4. **Stat counters on landing/dashboard** — "X students assessed," "Y opportunities matched" — cheap, high perceived-credibility pattern from AICTE
5. **Milestone/progress indicators** — for the adaptive skill assessment flow specifically, AICTE's "Milestone 0 of 5" pattern maps well onto your branching questionnaire's progress state
6. **Government trust footer** — Ministry of AYUSH branding, contact info, "User Manual" link (ties directly into your mentor-requested deliverable), website policies — matches both GIGW references and is low-effort to include

---

## Persona-Specific Notes

- **Student dashboard:** skill profile + gap report (visual, not just tabular — consider radial/bar visualization for competency levels, similar spirit to e-Aushadhi's clear status displays), matched opportunities as cards (AICTE pattern), adaptive assessment with milestone progress
- **Employer dashboard:** opportunity posting form, applicant list with explainable match scores (show the *why* behind each score — this is your core differentiator, make it visually prominent, not buried in a tooltip)
- **Institution dashboard:** cohort-level analytics — closer to Language A's dense-data conventions (tables, filters, exportable views) since this audience expects thoroughness over charm

---

## Stitch Prompt Starters

Use these as direct input into Google Stitch, adjusted as needed:

**Landing page:**
> "Design a landing page for an AYUSH academia-industry skill platform. Warm off-white background (#FFFCF6-style), deep navy/indigo primary accent (no green — avoid any green, beige-gold, or orange tones). Government of India trust markers in header (accessibility toolbar with A-/A/A+, bilingual toggle placeholder). Role-based sign-in buttons: Student, Employer, Institution Admin. Stat counters below hero (students assessed, opportunities matched). Card-based feature highlights. Clean sans-serif typography, generous whitespace, no dense bureaucratic clutter."

**Student Dashboard:**
> "Design a student dashboard for a skill-assessment platform. Show: skill profile with visual competency levels (radial or bar chart style) per AYUSH taxonomy domain, a gap report section, matched opportunities as clean cards with an explainable match-percentage badge, and an adaptive assessment progress indicator (milestone-style, e.g. 'Step 2 of 5'). Warm neutral background, navy/indigo accents (no green, beige-gold, or orange), card-based layout."

**Institution Dashboard:**
> "Design an institution admin dashboard for tracking student cohort skill gaps. Dense data-table and filter-panel layout (filters: AYUSH discipline, skill domain, cohort/batch). Include a curriculum-gap visualization comparing industry demand vs. student competency vs. curriculum coverage. Professional, data-dense but clean — navy accents (no green, beige-gold, or orange), GoI-style trust footer."

---

*Compiled from live-fetched content of ayushportal.nic.in, e-aushadhi.gov.in, and internship.aicte-india.org (Sept 2026). elms.ayush.gov.in and anudan.ayush.gov.in blocked automated fetching — assumed to follow the same GIGW pattern as the other two Ministry properties above; verify visually before finalizing if time allows.*
