# Task CONTENT-1 — Update IndiGate content to match real Indobox company info

Agent: main (Z.ai Code)
Task ID: CONTENT-1
Scope: Rewrite the marketing copy on the IndiGate landing page so it matches the
real Indobox Inc. narrative — India→Japan talent bridge, IIT-calibre talent,
4 hiring models, 3 hiring hurdles + Indobox solutions, and a Japan-focused
hiring FAQ. All copy is bilingual (EN + JA).

## Files touched

1. `src/lib/i18n.ts` — both `en` and `ja` dictionaries updated:
   - **Hero** — new badge, title, subtitle (IndiGate by Indobox Inc.),
     CTA labels.
   - **Stats** — `candidates` → "Indian students in Japan"; `placements`
     → "India-Japan exchanges (5yr target)".
   - **`why.*` (NEW)** — title/subtitle, 3 stat cards (IIT 1–1.6%
     acceptance, 70/100 unicorn founders, 29.4% Japan preference), banner
     + source attribution, 4 reason cards (safety/culture, advanced tech,
     salary, premium brand).
   - **`how.*`** — replaced title ("End-to-end support from both India and
     Japan") + 3 step titles/descs (Screening & candidate matching /
     Onboarding & visa support / Life support & continued growth).
   - **`hire.*` (NEW)** — 4 hiring types (Internship / New graduate
     conditional offer / Experienced hire / Indian residents in Japan)
     with tags.
   - **`challenges.*` (NEW)** — 3 hurdles (Language barrier / Cultural
     differences / Internal readiness), each with problem + Indobox
     solution + solution.badge label.
   - **`visa.*.desc` + `visa.support`** — Indobox-tuned SSW (added nursing
     care, food & beverage), engineer (added embedded/finance, N3+
     recommendation), transfer (intra-company clarified).
   - **`faq.q1`–`q8` + `a1`–`a8`** — fully replaced with Japan-focused
     hiring FAQ (Japanese communication, religious considerations, food,
     job-hopping, internships, in-person interviews, cultural differences).
   - **`contact.title`** → "Get in touch with Indobox" / "お問い合わせ".

2. `src/components/landing/landing-page.tsx`:
   - Imports: removed `FileText` (no longer used); added `GraduationCap`,
     `Trophy`, `Users`, `Cpu`, `Banknote`, `UserPlus` from lucide-react.
   - Hero section already wired to `t()` keys — no JSX change needed
     (verified).
   - **NEW "WHY INDIAN TALENT" section** inserted AFTER stats bar,
     BEFORE featured jobs: heading + 3 SpotlightCard stat cards
     (GraduationCap/Trophy/Heart icons, `text-gradient-brand` values) +
     `bg-brand-gradient` banner with source + 4 reason cards
     (ShieldCheck/Cpu/Banknote/Sparkles icons).
   - **"HOW IT WORKS" step icons** updated per spec:
     `FileText` → `Search` → `Plane` → `Building2`. Titles/descs flow
     from new i18n keys.
   - **NEW "HIRING TYPES" section** inserted AFTER How It Works,
     BEFORE Visa Guide: heading + 4 SpotlightCard cards
     (GraduationCap/UserPlus/Briefcase/Users icons) with tag Badge +
     title + desc.
   - **NEW "CHALLENGES" section** inserted AFTER Hiring Types,
     BEFORE Visa Guide: heading + 3 SpotlightCard cards with oversized
     01/02/03 number, problem text, and Indobox-solution callout box
     (`bg-saffron/10` with `solution.badge`).
   - FAQ and Contact sections already wired to `t("faq.q1")…q8` and
     `t("contact.title/subtitle")` — no JSX change needed (verified).
   - All new sections reuse existing design tokens (`bg-brand-gradient`,
     `text-gradient-brand`, `shadow-glow-brand`, `shadow-premium`,
     `text-crimson`, `bg-saffron/10`, `font-display`) and motion
     components (`Reveal`, `RevealGroup`, `staggerItem`, `fadeUp`,
     `SpotlightCard`). Existing stagger + spring hover + spotlight
     animations applied to all new cards.

## Section order on landing page (after edits)

1. Hero
2. Stats bar
3. **Why Indian Talent** (NEW)
4. Featured Jobs
5. How It Works
6. **Hiring Types** (NEW)
7. **Challenges** (NEW)
8. Visa Guide
9. Why IndiGate (existing)
10. Testimonials
11. FAQ
12. CTA
13. Contact

## Lint status

`bun run lint` — clean, zero errors/warnings.

## Dev log

- HTTP 200 on `/`, `/api/jobs/stats`, `/api/jobs?limit=3`,
  `/api/testimonials?active=true`, `/api/auth/me`, `/api/notifications`.
- A transient `FileText is not defined` ReferenceError appeared briefly
  mid-edit (import removed before usage was replaced in How-It-Works
  step list). Resolved immediately after the icon swap completed; final
  GET / returns 200.

## Notes for downstream agents

- All new i18n keys are present in BOTH `en` and `ja` dictionaries with
  matching key sets, so the locale toggle remains consistent.
- No API routes, auth, dashboards, admin, store, or schema files were
  touched.
- The new sections use the same pattern (Reveal + RevealGroup +
  SpotlightCard + motion.div with stagger variants) as the existing
  How-It-Works and Visa cards — easy to extend or restyle.
