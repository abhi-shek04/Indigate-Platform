# IndiGate Build Worklog

Project: IndiGate — India × Japan talent platform (Next.js 16 single-page app).
Constraint: Only the `/` route is user-visible. All views are client-side
switched via a Zustand store (`useApp`). API routes live under `/api/*`.

---
Task ID: 1-4
Agent: main (Z.ai Code)
Task: Design system, Prisma schema + seed, auth/i18n libs, all API routes, shared UI primitives, landing page, jobs view, job detail view, auth view.

Work Log:
- Installed bcryptjs.
- Wrote premium design system in `src/app/globals.css` (saffron + crimson brand palette, mesh backgrounds, glass, premium shadows, marquee/float animations, custom scrollbar).
- Updated `src/app/layout.tsx` (Plus Jakarta Sans display font, ThemeProvider, Sonner toaster, IndiGate metadata).
- Created `src/components/theme-provider.tsx`.
- Wrote `prisma/schema.prisma` with 8 models (User, CandidateProfile, CompanyProfile, Job, Application, Notification, Testimonial, ContactSubmission) adapted for SQLite (enums as String, arrays as JSON strings).
- Ran `bun run db:push`.
- Wrote `prisma/seed.ts` with 1 admin, 6 companies (1 pending), 12 jobs, 5 candidates, ~15 applications, notifications, testimonials. Ran it.
- Auth: `src/lib/auth.ts` (HMAC-signed cookie sessions, getSession/requireSession/requireRole, createSession/destroySession).
- Types: `src/lib/types.ts` (all DTOs, enums, badge classes).
- i18n: `src/lib/i18n.ts` (EN + JA dictionaries, translate()).
- API helpers: `src/lib/api.ts` (ok/err/handleError, all to*DTO mappers, formatSalary, notify, csvEscape).
- API client: `src/lib/api-client.ts` (api() fetch wrapper, formatRelative, formatDate).
- Zustand store: `src/lib/store.ts` (useApp: user/candidate/company auth, view navigation, dashboard tabs, locale).
- React i18n hook: `src/lib/use-t.ts` (useT() returns { locale, t, pick }).
- Brand: `src/components/brand/logo.tsx` (Logo, CompanyAvatar, CandidateAvatar), `use-count-up.ts`.
- Layout: `src/components/layout/{navbar,footer,locale-toggle,notifications-bell}.tsx`.
- Jobs: `src/components/jobs/{job-card,jobs-view,job-detail-view}.tsx`.
- Auth: `src/components/auth/auth-view.tsx` (login/register/verify/forgot/reset).
- Landing: `src/components/landing/landing-page.tsx` (hero, stats count-up, featured jobs, how-it-works, value props with pipeline viz, testimonials marquee, CTA, contact form).
- API routes: auth/{register,login,logout,me,verify,reset-request,reset-confirm}, jobs (route + [id] + stats), applications (route + [id] + [id]/status), candidates/me + me/saved-jobs, companies/me, admin/stats + admin/companies/[id] + admin/list/[resource], notifications (route + [id]/read), testimonials, contact, upload.

Stage Summary:
- Backend fully functional with seed data.
- Public-facing UI (landing, jobs, job detail, auth) complete with premium design.
- Design tokens: saffron `--saffron`, crimson `--crimson`, ink `--ink`. Use `bg-brand-gradient`, `text-gradient-brand`, `bg-mesh`, `glass`, `shadow-premium`, `shadow-glow-brand`.
- All client components use `useApp()` for nav/auth and `useT()` for i18n. `useT().pick(en, ja)` returns localized string.
- Components import from `@/components/ui/*` (shadcn). All needed shadcn components exist.
- Demo accounts: candidate `arjun@example.com`/`candidate123`, company `hr@technova.jp`/`company123`, admin `admin@indigate.work`/`admin123`.

---

---
Task ID: 5
Agent: dashboards (Z.ai Code)
Task: Build Candidate, Company, and Admin dashboards (premium, professional UI).

Files created:
- `src/components/dashboard/dashboard-shell.tsx` — shared `DashboardShell` (dark sidebar w/ saffron active accent, mobile Sheet nav, sticky topbar w/ NotificationsBell + LocaleToggle + avatar slot), `MetricCard`, `EmptyState`, `SectionCard`, `RoleGuard`, `CardSkeleton`, `MetricSkeleton`, `NavItem` type. Inner sub-components (NavList, SidebarHeader, SidebarFooter) are declared at module scope to satisfy the `react-hooks/static-components` rule.
- `src/components/dashboard/widgets.tsx` — `SkillsInput` (Enter/comma to add, Backspace to remove, max-20 cap) and `FileDropZone` (drag-and-drop, accept filter, fake progress bar) reused by candidate profile/resume and company new-job/profile.
- `src/components/candidate/candidate-dashboard.tsx` — exports `CandidateDashboard`. Tabs: overview (4 metric cards by status + profile completion Progress + recent apps), applications (table w/ withdraw AlertDialog), profile (basic info + Japan readiness w/ SkillsInput + dynamic Education entries), resume (drag-drop PDF upload + remove), saved (JobCard grid). All mutations call `refreshAuth()`. Includes `authLoading`/`!candidate` loading guard.
- `src/components/company/company-dashboard.tsx` — exports `CompanyDashboard`. Tabs: overview (4 metrics, recent applicants, active jobs, quick actions), jobs (table w/ inline active/paused toggle + delete AlertDialog), new (premium form: title/desc≥50/location/jobType/jlpt/salary min-max-type/skills/deadline), applicants (filter by job Select + status Select + inline status Select + slide-over `<Sheet>` w/ candidate detail + Shortlist/Interview/Offer/Reject actions + resume download), profile (logo FileDropZone + details form). Pending-approval state gates `jobs`/`new`/`applicants` tabs (disabled in sidebar + PendingState card in main). `useCompanyJobs()` filters `/api/jobs?limit=50` by `job.company.userId === user.id` (since `CompanyProfileDTO` exposes `userId`). `useCompanyApps()` pulls from `/api/applications` (server already scopes to this company). Uses `useApp.setState({ companyApplicantsJobId: null })` to clear the job filter (the store's setCompanyTab keeps the existing jobId when `opts.jobId` is undefined).
- `src/components/admin/admin-dashboard.tsx` — exports `AdminDashboard`. Tabs: overview (6 metric cards from `/api/admin/stats` + AreaChart of `appsPerWeek` + donut PieChart of `appsByStatus` colored by `STATUS_COLORS` + pending-company approvals list w/ Approve/Reject + recent applications), jobs (searchable table, Switch toggle active, delete AlertDialog, CSV export), candidates (search + JLPT filter, table, CSV export), companies (filter All/Approved/Pending, table w/ inline Approve/Reject for pending + Revoke for approved, CSV export), applications (status filter, table, CSV export), testimonials (card grid w/ toggle active). Charts use the shadcn `ChartContainer` + `ChartTooltip` and recharts `AreaChart`/`Pie`. CSV export links to `/api/admin/list/{resource}?export=csv`.

Conventions followed:
- All client components (`"use client"`).
- `useApp()` for state + actions, `useT()` + `t()` + `pick()` for i18n.
- `api()` from `@/lib/api-client` for JSON; raw `fetch` for `FormData` uploads.
- shadcn/ui primitives (Button, Card, Badge, Input, Label, Textarea, Select, Table, AlertDialog, Sheet, Switch, Skeleton, Progress, Chart, Separator).
- `STATUS_BADGE`, `JLPT_BADGE`, `JLPT_LEVELS`, `JOB_TYPES`, `SALARY_TYPES`, `APPLICATION_STATUSES` from `@/lib/types`.
- Brand utilities: `bg-brand-gradient`, `text-gradient-brand`, `shadow-premium`, `shadow-glow-brand`, `scroll-area`, `bg-sidebar`/`text-sidebar-foreground`/`bg-sidebar-accent`/`border-sidebar-border`.
- `MetricCard` icon in colored rounded square, large `font-display text-3xl font-extrabold` number, hover lift.
- Tables use sticky headers inside `max-h-[70vh] overflow-y-auto scroll-area` containers.
- Empty states: icon + title + description + CTA.
- All mutations: loading state on button + `sonner` toast on success/error + data refresh.

Stage Summary:
- Three production-grade dashboards wired to the existing API surface; no API or schema changes were needed.
- `DashboardShell` is reusable — adding a fourth dashboard later is trivial.
- Lint: `bun run lint` reports ZERO issues in any Task-5 file. (Remaining 4 issues — `brand/logo.tsx`, `jobs/job-detail-view.tsx`, `layout/notifications-bell.tsx`, `lib/types.ts` — are all pre-existing from Task 1-4 and untouched per instructions.)
- TypeScript: `bunx tsc --noEmit` is clean for all Task-5 files (only pre-existing `bcryptjs` types error remains).
- Dev server: `bun run dev` auto-restarts cleanly; `dev.log` shows successful incremental compiles with no warnings or errors from the new files.
- Note for main agent: the main `page.tsx` must lazy-load these (e.g. `next/dynamic`) so the heavy `recharts` import only ships on the admin route, and must call `useApp().refreshAuth()` on mount before rendering the dashboard so `user`/`candidate`/`company` are populated. The dashboards already include their own `authLoading` guards where the role-dependent profile is required.

---
Task ID: 6-12
Agent: main (Z.ai Code)
Task: Static pages, main page controller, lint fixes, dev server, end-to-end Agent Browser verification.

Work Log:
- Built static pages (privacy, terms, about, for-companies, companies) in `src/components/landing/static-pages.tsx`.
- Built main page controller `src/app/page.tsx` (view switching via useApp, auth bootstrap, chrome visibility logic, full-screen loader).
- Fixed `Yen` icon (not a lucide export) → `Banknote` in job-card and job-detail-view.
- Fixed lint: empty interface `PublicUser` → type alias; removed unused eslint-disable directives; resolved `react-hooks/set-state-in-effect` in notifications-bell.
- Started dev server (port 3000), all pages compile cleanly.
- Agent Browser end-to-end verification:
  - Home page: hero, stats count-up, featured jobs (3 cards), how-it-works, value props + pipeline viz, testimonials marquee, CTA, contact form — all render.
  - Jobs view: 12 job cards with filters (location/type/JLPT/salary), search, count.
  - Job detail: full layout with apply dialog, save toggle, related jobs.
  - Candidate login (arjun@example.com) → dashboard with overview metrics, applications, profile, resume, saved jobs.
  - Company login (hr@technova.jp) → dashboard with 3 active jobs, post-job form, applicants.
  - Admin login (admin@indigate.work) → panel with 6 metrics, area+donut charts (recharts), pending-approval (Aurora Robotics) approve flow verified working.
  - Bilingual toggle EN→JA verified (titles localize to 日本語).
  - Mobile (iPhone 14) responsive verified.
  - Sticky footer CSS verified (`min-h-screen flex flex-col` + `mt-auto`).
  - Zero console/runtime errors throughout.

Stage Summary:
- IndiGate platform is production-ready and fully interactive end-to-end.
- All 10 milestones' features are implemented and browser-verified.
- Lint passes clean. Dev server runs without errors.
- Demo accounts: candidate `arjun@example.com`/`candidate123`, company `hr@technova.jp`/`company123`, admin `admin@indigate.work`/`admin123`.

---
Task ID: ANIM-UPGRADE
Agent: main (Z.ai Code)
Task: Premium animation + UI/UX upgrade across the entire IndiGate platform.

Work Log:
- Created `src/lib/motion.tsx`: reusable Framer Motion variants (fadeUp, fadeIn, scaleIn, slideIn, staggerContainer, staggerItem), easing curves (easeOutExpo, springSoft), Reveal + RevealGroup scroll-reveal wrappers.
- Created `src/components/brand/motion-primitives.tsx`: MagneticButton (cursor-follow spring), SpotlightCard (radial cursor spotlight), TiltCard (3D perspective tilt), ScrollProgress (top gradient progress bar), ShimmerText.
- Upgraded `src/app/globals.css`: added keyframes (aurora drift, ping-soft, glow-pulse, shimmer-sweep, border-draw, bob, rise-in, shimmer-text), gradient-border utility, premium ::selection, :focus-visible ring, smooth scroll, prefers-reduced-motion guard.
- Upgraded `src/app/page.tsx`: AnimatePresence view transitions (fade+slide between every view), branded full-screen loader with pulsing logo + bouncing dots.
- Rebuilt `src/components/landing/landing-page.tsx`: staggered hero entrance (badge→title→subtitle→CTAs), aurora parallax blobs, RevealGroup for featured jobs + how-it-works cards, scroll-triggered PipelineBar fills, spring company-logo hover, SpotlightCard on step cards, MagneticButton on CTAs, spring success checkmark on contact form.
- Upgraded `src/components/jobs/job-card.tsx`: motion.article with spring hover lift, SpotlightCard cursor glow, wobble on company avatar hover.
- Upgraded `src/components/jobs/jobs-view.tsx`: RevealGroup staggered job card entrance, animate-bob on empty-state icon.
- Upgraded `src/components/auth/auth-view.tsx`: AnimatePresence on mode switch (login→register→verify), staggered form fields, motion title/subtitle transitions.
- Upgraded `src/components/layout/navbar.tsx`: layoutId animated active underline that springs between nav items.
- Upgraded `src/components/layout/notifications-bell.tsx`: soft ping ring on unread badge.
- Upgraded `src/components/dashboard/dashboard-shell.tsx`: layoutId sidebar active indicator (springs between tabs), AnimatePresence content transition on tab change (fade+slide), MetricCard spring-in + hover lift + icon wobble, EmptyState bob animation.

Verification (Agent Browser):
- Home: staggered hero, aurora blobs, scroll reveals all render. HTTP 200.
- View transition home→jobs→login: smooth fade+slide, no errors.
- Candidate login → dashboard: metrics spring in, sidebar indicator slides between Overview/Profile/Saved Jobs tabs.
- Admin login → panel: recharts render, JA toggle works (管理パネル), mobile (iPhone 14) responsive.
- Zero console/runtime errors across all flows.
- `bun run lint` clean. Dev server compiles without warnings.

Stage Summary:
- Platform now has a cohesive premium animation system: page transitions, scroll reveals, staggered lists, magnetic/spotlight/tilt micro-interactions, animated nav indicator, spring physics throughout.
- All animations respect prefers-reduced-motion for accessibility.
- No pending items — the entire 10-milestone plan is complete AND visually polished.

---
Task ID: UIUX
Agent: frontend-styling-expert (UI/UX improvements)
Task: Improve frontend design — landing page, navbar, jobs view, auth view, dashboard shell

Work Log:
- Read all target files first (landing-page, navbar, jobs-view, auth-view, dashboard-shell, globals.css, motion.tsx) and the existing worklog to understand the project structure, brand palette (saffron + crimson), and existing animation system.
- Verified dev server running on http://localhost:3000/ (HTTP 200) and pre-existing lint clean before changes.
- Landing page (`src/components/landing/landing-page.tsx`):
  - Hero section: added a fine 56px grid pattern overlay (radial-masked, 18% opacity) on top of the existing aurora blobs; added a bottom 32-px fade-into-background gradient; bumped spacing (pt-20 pb-24 sm:pt-28 sm:pb-32) and tightened the badge→title→subtitle rhythm; gave the hero badge a subtle `shadow-premium`.
  - Stat cards (`StatCard`): wrapped each stat in a real card (`rounded-2xl border bg-card/80 glass px-5 py-6` with hover lift + saffron border on hover); added a saffron accent line on the top edge; added an icon prop (Briefcase / Users / Building2 / Award) above the count-up number with a subtle ring + wobble hover; uppercase tracking label.
  - Featured jobs ("Latest opportunities"): badge got `bg-saffron/5`, the "View all" button uses `h-11 px-5 rounded-xl border-saffron/30 hover:border-saffron/60 hover:bg-saffron/5`, grid gap bumped from `gap-4` to `gap-5 sm:gap-6`.
  - How it works (end-to-end support): added a horizontal timeline connector line (gradient from saffron/10 via saffron/40 to crimson/10) behind the 3 step cards on md+; replaced the plain icon tile with a numbered circular badge (`h-12 w-12 rounded-full bg-brand-gradient ring-4 ring-background`) that sits ON the timeline; added a small "Step 0N" eyebrow label; the giant background step number tone dropped from `/15` to `/10` and marked `select-none`.
  - Why IndiGate value props: turned each `<li>` from a plain flex into a hover-card (`rounded-xl border border-transparent hover:border-border hover:bg-card/60 p-3 -m-3 transition-all`) with horizontal slide-on-hover (`whileHover x:4`); the icon tile now has an inset saffron ring and morphs to the brand gradient on hover.
  - Testimonials marquee: added left + right edge fade masks (gradient-to-background); redesigned each card with a top row showing a Quote icon + 5-star rating; added a divider before the figcaption; hover state lifts the card (-translate-y-1) and switches to saffron border + brand-glow shadow.
  - Visa accordion (`VisaAccordionItem`): bumped icon tile to `h-11 w-11 rounded-xl` with inset saffron ring; icon tile transitions to brand-gradient when accordion is `data-[state=open]`; requirements list now uses a 2-col grid on sm+ with saffron check icons (was emerald); accordion content is indented under the icon on sm+ for better visual hierarchy; opened state also gets `border-saffron/40`.
  - Imports: added `Users`, `Award`, `TrendingUp` from lucide-react.
- Navbar (`src/components/layout/navbar.tsx`):
  - Sticky header: now always uses `backdrop-blur` (sm when not scrolled, md when scrolled) with `bg-background/40` (idle) → `bg-background/80 glass` (scrolled) + `shadow-premium`. Logo button gets rounded hover.
  - Desktop nav active state: kept the layoutId underline but added a subtle `bg-saffron/5` pill background tint behind active items; tightened the underline insets.
  - Mobile menu (Sheet): widened to 300px, full-height with proper padding; each nav item is now a `motion.button` with staggered entrance (`opacity:0, x:20 → opacity:1, x:0`, 40ms delay per item); active item gets a `bg-saffron/10 text-crimson` bg + a layoutId left-edge gradient bar (`mobile-nav-active`); each item shows a small `01..05` mono index for visual rhythm; touch targets bumped to `h-10 w-10` for the trigger button and `py-3 px-3.5` for items; login/signup buttons get `h-11 rounded-xl` + saffron-glow shadow.
  - Back-to-top arrow on logo; right-side actions get hover separators.
- Jobs view (`src/components/jobs/jobs-view.tsx`):
  - Replaced the inline header eyebrow with a proper pill badge (`rounded-full border-saffron/30 bg-saffron/5`); bumped page padding to `py-10 sm:py-12`.
  - Search bar: larger touch target (`pl-12 pr-4 py-3.5`), `transition-all` on focus.
  - Filters: now wrapped in a premium glass card (`rounded-2xl border border-border bg-card/60 glass p-3 sm:p-4`); added a small uppercase "Filters" label with SlidersHorizontal icon + a vertical separator; Clear button moves to the right with `ml-auto` and turns crimson on hover.
  - FilterSelect: active state highlights the trigger with `border-saffron/50 bg-saffron/5 text-crimson`; hover state adds `hover:border-saffron/40 hover:bg-saffron/5` — gives users clear feedback on which filters are active.
  - Count display: now shows the count in a small saffron-tinted badge (`bg-saffron/10 text-crimson`) followed by the localized "jobs found" text — uses `t("jobs.found", { count: "" }).replace(/^\s+/, "")` to strip the count placeholder while staying i18n-safe.
  - Grid: gap bumped to `gap-5 sm:gap-6`; skeletons bumped to `h-48`; empty state uses `bg-card/40` and a larger icon.
- Auth view (`src/components/auth/auth-view.tsx`):
  - Left visual panel: added the same fine grid pattern overlay (48px, 12% opacity, radial-masked) on top of the aurora blobs; added a trust footer row at the bottom ("Manual employer vetting · 24–48h approval") with a divider.
  - Right form panel: gets a subtle `bg-card/30` tint to differentiate from the visual side.
  - Form fields: bumped inputs to `h-11 rounded-xl` for premium feel and bigger touch target; verification/reset code inputs are `h-14`; Field component now uses `group` so the icon transitions to saffron on focus-within; back button gets a `group-hover:-translate-x-0.5` nudge.
  - Submit button: `h-12 rounded-xl shadow-glow-brand` (was `h-11`).
  - RoleCard: when active, shows a top accent line (`bg-brand-gradient`) and the icon tile gets `shadow-glow-brand`; hover state adds `hover:bg-saffron/5`.
  - Demo accounts block: made less prominent — uses `bg-muted/30 border-border/70` (was `bg-muted/40`), tighter padding (`p-3.5`), uppercase tracked label with a ShieldCheck icon (was plain bold); each DemoLine is now a group with a saffron status dot + smaller mono font (`text-[11px]`) for the credentials; hover transitions to darker text.
- Dashboard shell (`src/components/dashboard/dashboard-shell.tsx`):
  - Sidebar nav (`NavList`): rounded buttons to `rounded-xl`; active state now gets `shadow-sm` + a small saffron dot (`h-1.5 w-1.5 rounded-full bg-saffron shadow-glow-brand`) at the right edge — gives a second visual signal beyond the left bar; the layoutId active bar switched from solid `bg-saffron` to `bg-brand-gradient` for brand consistency; icon hover state softened.
  - SidebarHeader: added a saffron corner glow (`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-saffron/15 blur-2xl`); the "X portal" label now has a short gradient bar (`h-1 w-6 rounded-full bg-brand-gradient`) in front of it.
  - SidebarFooter: Back-to-site and Logout buttons get `group` hover with arrow micro-animation (`group-hover:-translate-x-0.5` / `group-hover:translate-x-0.5`); rounded to `rounded-xl`.
  - Top bar: `backdrop-blur` → `backdrop-blur-md`; added a thin separator (`h-6 w-px bg-border`) between topbarActions and the bell/locale/avatar cluster; mobile menu trigger bumped to `h-10 w-10` (44px touch target).
  - Mobile Sheet widened to 280px.

Verification (Agent Browser + lint + tsc):
- `bun run lint` reports ZERO issues throughout (clean).
- `npx tsc --noEmit` shows only the pre-existing `bcryptjs` types error (documented in the Task-5 worklog entry — not introduced by this task; all UIUX files type-check cleanly).
- Dev server (`bun run dev`) compiles cleanly with zero warnings or errors in `dev.log` — all routes return 200.
- Agent Browser smoke test (desktop 1280px + iPhone 14):
  - Landing page (http://localhost:3000/): hero with new grid pattern + aurora, stat cards with icons, featured jobs (3 cards), how-it-works timeline (3 steps), visa accordion (3 items), why-IndiGate section, testimonials marquee, FAQ, CTA, contact form — all render correctly with zero console errors.
  - Jobs view: search bar, 4-filter card-wrapped bar, 12 job cards in 3-col grid, count badge — all render correctly.
  - Auth view: split-screen layout with left visual + right form; demo credentials panel visible but subtle; logged in as `arjun@example.com` successfully.
  - Candidate dashboard: new sidebar with 6 nav items (Overview / My Applications / Profile / Resume Builder / Upload Resume / Saved Jobs), gradient active indicator + saffron dot, Back-to-site + Logout footer with arrow micro-anim; tab switch to "My Applications" works.
  - Mobile (iPhone 14): mobile menu Sheet opens with staggered entrance + numbered items + active pill.

Stage Summary:
- 5 files modified, all UI/UX-only changes — zero business logic, API calls, state management, or i18n keys touched.
- Consistent design language applied across all surfaces: glassmorphism cards (`glass + border + shadow-premium`), saffron/crimson accent system, 44px+ touch targets, gradient brand bars for active states, fine grid pattern overlays for premium feel, staggered entrance animations via Framer Motion.
- All animations respect prefers-reduced-motion (existing rule in globals.css).
- Files modified:
  - `src/components/landing/landing-page.tsx` — hero grid pattern + spacing; StatCard wrapped in glass card with icon + saffron accent; featured-jobs header/grid refinements; how-it-works timeline connector + numbered step badges; why-IndiGate list items get hover-card treatment with brand-gradient icon morph; testimonials marquee gets edge fades + star ratings + hover lift; visa accordion gets indented content + 2-col requirements + saffron check icons.
  - `src/components/layout/navbar.tsx` — backdrop-blur sticky at all scroll positions; active nav item gets saffron pill bg + layoutId gradient underline; mobile menu uses staggered motion buttons with numbered indices + layoutId active bar; 44px touch targets.
  - `src/components/jobs/jobs-view.tsx` — pill badge header; search bar with bigger touch target; filters wrapped in glass card with uppercase label + separator; FilterSelect shows active state via saffron border/bg; count display uses saffron-tinted badge; grid gap bumped; empty state bg.
  - `src/components/auth/auth-view.tsx` — left panel gets grid pattern overlay + trust footer; right panel gets bg-card/30 tint; inputs bumped to h-11/h-14 rounded-xl with focus-within icon color change; submit button gets shadow-glow-brand; RoleCard gets top accent line when active; demo block made subtle (muted bg, uppercase tracked label, saffron status dots, smaller mono font).
  - `src/components/dashboard/dashboard-shell.tsx` — sidebar nav buttons rounded-xl with shadow-sm + saffron dot indicator on active; gradient layoutId bar (was solid saffron); SidebarHeader gets saffron corner glow + gradient bar before portal label; SidebarFooter buttons get arrow micro-animations on hover; top bar gets backdrop-blur-md + vertical separator before action cluster; mobile Sheet widened to 280px.

---
Task ID: FEATURES-UI
Agent: general-purpose (resume redesign + Open to Work + Job Alerts UI)
Task: Redesign resume builder with sidebar nav, add Open to Work toggle, add Job Alerts tab

Work Log:
- Read `worklog.md` + all 4 target files (`resume-builder.tsx`, `candidate-dashboard.tsx`, the inline `Profile`/`Resume`/`Saved` functions inside it, and the `open-to-work` + `alerts` API routes) before any edits. Discovered the task spec referenced `src/components/candidate/tabs/profile.tsx` which doesn't exist — the Profile tab is a `Profile()` function defined inline in `candidate-dashboard.tsx`. Implemented the Open to Work toggle there to match the actual codebase structure (no file-structure change required).
- PART 1 — Resume Builder sidebar redesign (`src/components/candidate/resume-builder.tsx`):
  - Added `Progress` import from `@/components/ui/progress`.
  - Added module-scope `SECTIONS` array (6 entries with id + icon + label) and `computeProgress(data)` pure function that checks which sections have at least some data and returns a 0–100 percentage.
  - Added `activeSection` state + `IntersectionObserver` useEffect that tracks which section is currently in view (only runs when `tab === "edit"`; SSR-safe guard for missing `IntersectionObserver`).
  - Added `scrollToSection(id)` helper using `element.scrollIntoView({ behavior: "smooth", block: "start" })`.
  - Wrapped the existing 6 `<Section>` components inside a new `lg:grid lg:grid-cols-[240px_minmax(0,1fr)]` two-column layout: sticky `<aside>` sidebar (hidden below `lg`, hidden in print) + content `<div>` for the form. The existing sticky Save bar remains full-width below the grid.
  - The sidebar contains a progress card (rounded-2xl border bg-card p-4 shadow-premium — shows `%` + Progress bar + helper text) and a section nav (rounded-2xl border bg-card p-2 shadow-premium — 6 buttons with icons + active-state saffron bg/dot).
  - Added `id` prop to the `Section` helper component and pass `id="section-…" to each of the 6 sections; added `scroll-mt-6` so smooth-scroll doesn't hide titles behind sticky header.
  - All existing state/handlers/fields/API calls/PDF download/preview tabs preserved untouched — only the JSX layout was restructured.
- PART 2 — Open to Work toggle (inside `Profile()` in `candidate-dashboard.tsx`):
  - Added `Switch` import from `@/components/ui/switch`.
  - Added `openToWork` + `toggling` state, initialized from `useApp((s) => s.candidate)?.openToWork ?? true`. Re-syncs in the existing `useEffect([candidate?.updatedAt])`.
  - Added `toggleOpenToWork(next)` async handler: optimistic UI update → `PATCH /api/candidates/me/open-to-work` with `{ openToWork }` → `refreshAuth()` → success toast; on error, rolls back state + error toast.
  - Added a premium card at the TOP of the Profile form (before "Basic information") with: CircleDot icon tile (saffron when active, muted when inactive), "Open to Work" title + "Active" badge (when on), description "Companies searching for talent will see you're available.", and the Switch on the right (saffron checked bg). Uses bg-card border-border shadow-premium to match other SectionCard styling.
- PART 3 — Job Alerts tab:
  - Created `src/components/candidate/tabs/alerts.tsx` exporting `JobAlerts` component. Defines a local `JobAlert` interface (matches the Prisma model since no DTO exists in `@/lib/types`). Uses existing shadcn primitives (Input, Label, Select, Button, Badge, AlertDialog, Skeleton). Imports `JLPT_LEVELS`, `JOB_TYPES`, types from `@/lib/types`. Uses saffron/Banknote icons (NOT `Yen` which is not a lucide export — pre-existing Task 6-12 note).
  - Header row: "Job Alerts" title (with Bell icon) + description + "Create Alert" button (toggles form visibility).
  - Create form: name (required, 2–100 chars), keyword, location, jobType Select, jlptLevel Select, salaryMin number. Submits via POST `/api/candidates/me/alerts` with only non-empty fields. Loading spinner on Save button. Optimistic form cancel/reset.
  - List: each alert is a card (rounded-2xl border border-border bg-card shadow-premium) showing name + Active badge + criteria badges (Search/MapPin/Briefcase/Award/Banknote icons). Delete uses AlertDialog confirmation → DELETE `/api/candidates/me/alerts?id=…` → toast + remove from state.
  - Empty state: saffron-tinted Bell icon + "No alerts yet" + "Create your first alert" CTA.
  - Wired into `candidate-dashboard.tsx`: added "Job Alerts" NAV item (with Bell icon) after "Saved Jobs", added `{tab === "alerts" && <JobAlerts />}` render, added `JobAlerts` import.
  - Added `"alerts"` to the `candidateTab` union type in `src/lib/store.ts` (required for TypeScript).
- Pre-existing API bug fix (minimal, in-scope because both new UI features depend on these routes): the `open-to-work` and `alerts` routes imported a non-existent `parseBody` from `@/lib/api.ts` which caused webpack compilation errors and 500s on every request (the broken module cascaded to ALL API routes in dev mode). Replaced with `await req.json().catch(() => null)` — the exact pattern used by the working `resume/route.ts`. No business logic, validation, or response shape changed.

Verification:
- `npx tsc --noEmit`: clean (only the pre-existing `bcryptjs` types error documented in Task 5 worklog).
- `bun run lint`: ZERO issues.
- Dev server (Turbopack) compiles cleanly after the parseBody fix; all API routes return 200.
- Agent Browser smoke test (desktop 1440×900 + iPhone 14):
  - Logged in as `arjun@example.com` via demo button + Log in.
  - **Resume Builder tab**: header (Back / title / Save / EN PDF / 履歴書 PDF / Print) intact; tabs (Edit / 日本語 履歴書 / English Resume) intact; new sticky sidebar shows "Resume sections" nav with all 6 items + progress card; clicking sidebar items smooth-scrolls + sets `aria-current="true"` on the active item; all 6 form sections render with their existing fields; Save Resume sticky bar works.
  - **Profile tab**: "Open to Work" card appears at the TOP (before "Basic information"); Switch flips ON → toast "You're now visible as Open to Work." → API returns `{openToWork:true}` 200; flips OFF → toast "Open to Work turned off." → API 200. Zero console errors.
  - **Job Alerts tab**: renders header + empty state initially; "Create Alert" → form with all 6 fields; filled "Osaka Python N2" + keyword "Python" + location "Osaka" → Save → toast "Alert created." → new alert card appears with criteria badges. Delete confirmation dialog → confirm → toast "Alert deleted." → card removed.
  - **Mobile (iPhone 14)**: resume builder sidebar is correctly `hidden` (single-column form remains, as required); job alerts list + form stack vertically and remain usable.
  - Verified both API routes via direct curl with session cookie: GET alerts 200 (empty array), POST create 201 (full alert object), PATCH open-to-work 200 (`{openToWork:true/false}`), DELETE 200.
  - Cleanup: reverted test candidate `openToWork` to its initial value and deleted the test alert so the seeded DB is back to its original state.

Stage Summary:
- 4 files modified, 1 file created:
  - `src/components/candidate/resume-builder.tsx` — wrapped existing form sections in a `lg:grid` two-column layout with a sticky sidebar (progress card + section nav with smooth-scroll + IntersectionObserver-driven active state); sidebar is `hidden lg:block` so mobile keeps the single-column form. All existing state, handlers, fields, API calls, PDF download, and preview tabs preserved.
  - `src/components/candidate/candidate-dashboard.tsx` — added "Open to Work" toggle card at the top of the inline `Profile()` component (optimistic PATCH + refreshAuth + toast); added "Job Alerts" nav item (Bell icon) after "Saved Jobs"; added `{tab === "alerts" && <JobAlerts />}` render; added `Switch` + `JobAlerts` imports + 2 new lucide icons (`Bell`, `CircleDot`).
  - `src/components/candidate/tabs/alerts.tsx` (NEW) — full LinkedIn-style Job Alerts UI: header with Create button, create form (name/keyword/location/jobType/jlptLevel/salaryMin), alert list with criteria badges + AlertDialog delete confirmation, empty state. Uses only existing shadcn primitives + brand tokens (bg-card, border-border, text-saffron, bg-brand-gradient, shadow-premium, shadow-glow-brand).
  - `src/lib/store.ts` — added `"alerts"` to the `candidateTab` union type (1-line type addition so the new tab compiles).
  - `src/app/api/candidates/me/open-to-work/route.ts` — replaced non-existent `parseBody` import with `req.json().catch(() => null)` (matches the pattern in `resume/route.ts`). Bug fix only — no logic/contract change.
  - `src/app/api/candidates/me/alerts/route.ts` — same `parseBody` → `req.json()` fix in the POST handler.
- All 3 features verified end-to-end via Agent Browser (desktop + mobile) and direct curl API calls. Zero console errors. Lint + tsc clean (modulo pre-existing `bcryptjs` types error).

---
Task ID: RESUME-REWRITE
Agent: general-purpose (resume template rewrite)
Task: Rewrite EN + JP resume PDF templates to match professional samples (Abhishek_EN_Resume.pdf / Abhishek_JP_Resume.pdf). Extracted exact text from both sample PDFs via `pdftotext -layout` before writing.

Work Log:
- Read all 4 target files (`src/lib/resume-types.ts`, both PDF templates in `src/lib/pdf-templates/`, `src/components/candidate/resume-builder.tsx`) plus the in-browser HTML preview (`src/components/candidate/resume-preview.tsx`), the resume PUT/GET API route (`src/app/api/candidates/me/resume/route.ts`), and the sample PDFs in `upload/`.
- Extracted the exact text of both sample PDFs with `pdftotext -layout` to understand the precise column layout and section order for EN (Resume / Date header → personal info block → Education table → Work Experience table → Certifications table → Projects table → Skills table with ☒/☐ checkmarks → "Skills in Which I Excel" numbered list → Current JLPT (N1–N5) → Expected JLPT → Other languages → "More About Why You Want to Work in Japan" 3 Q&A) and JP (履歴書 → 氏名/生年月日/性別/メールアドレス/国籍/本籍地/既習言語 → 教育 (4-col) → プロジェクト (3-col) → ITスキル (4-col with 初心者/中級/高度な checkboxes) → 免許・資格 (3-col) → インターンシップ/実務経験 (4-col) → 趣味/興味/自己PR → 宣言).
- Updated `src/lib/resume-types.ts`:
  - Added `month?` to `ResumeEducation` (EN Education table has separate Year | Month columns).
  - Added `year?` to `ResumeProject` and `ResumeActivity` (EN Work Experience / Projects tables have separate Year column).
  - Added `month?` to `ResumeAward` (EN Certifications table has separate Year | Month columns).
  - Added new types: `ResumeSkill` (name + 3 boolean proficiency flags), `ResumeJapanMotivation` (whyJapan/careerInJapan/challenges), `JlptLevel` union.
  - Added new top-level fields on `ResumeData`: `currentDegree`, `expectedGraduation`, `skills: ResumeSkill[]`, `skillsExcelSummary: string[]`, `currentJlpt`, `expectedJlpt`, `otherLanguages`, `japanMotivation`.
  - Updated `EMPTY_RESUME` to initialize all new fields with sensible defaults (skills=[], skillsExcelSummary=[], japanMotivation={…}, etc.).
  - Added `JLPT_OPTIONS = ["N1"…"N5"]` constant.
  - Added `computeAge(dob)` helper used by the EN PDF/preview to render "(Age: 21)" next to the DOB.
- Updated `src/app/api/candidates/me/resume/route.ts` zod schema to accept all new fields (month/year on existing entries, currentDegree, expectedGraduation, skills, skillsExcelSummary, currentJlpt, expectedJlpt, otherLanguages, japanMotivation). Verified round-trip: PUT a fully-populated test resume → GET returns it unchanged.
- Rewrote `src/lib/pdf-templates/english-resume-pdf.tsx` end-to-end:
  - "Resume" title row + "Date: DD/MM/YYYY" (auto-generated) at the top.
  - Personal-info block exactly matching the sample: "Your Name :", DOB as "DD/MM/YYYY (Age: NN)" + gender, "E-Mail :" + "Telephone Number:" on the same row, "Address :", "Current Degree being Pursued:", "Expected time of Graduation:".
  - Education table (Year | Month | School | Degree) using `flexDirection: "row"` with `width: "12% / 12% / 40% / 36%"` columns.
  - Work Experience table (Year | Month | Description) — combines role + organization + duties into the Description cell.
  - Certifications / Achievements table (Year | Month | Title | Description) — title cell stacks the organization under the title.
  - Projects / Co-Curricular Activities table (Year | Month | Project / Description) — cell stacks name + tech stack + description.
  - Skills table (Skill Name | Learned in class | Can operate alone | Can teach others) with ☒/☐ Unicode glyphs.
  - "Skills in Which I Excel" numbered list (1./2./3.) rendered from `skillsExcelSummary[]`.
  - "Current Japanese Proficiency Level" — N1–N5 row with one checkbox selected based on `currentJlpt`.
  - "Expected Japanese Proficiency Level to be Achieved by Graduation Time" — same pattern with `expectedJlpt`.
  - "Other languages" centered line.
  - "More About Why You Want to Work in Japan" — 3 bordered Q&A cards with the bilingual question text (English + Japanese in parentheses) and the candidate's answer.
- Rewrote `src/lib/pdf-templates/japanese-resume-pdf.tsx` end-to-end (NotoSansJP font already registered):
  - 履歴書 title (centered, letter-spacing 6).
  - Personal-info table (氏名 | value | 生年月日 | value) × 4 rows + (既習言語 spanning) — 本籍地 shows "同上" when placeOfOrigin is empty (matches sample convention).
  - 教育 table (年/月 | 程度 | 学校/学部/学科 | 大学) — falls back to English data when the `*Ja` variant is absent.
  - プロジェクト table (年/月 | プロジェクト名 | プロジェクトの内容/担当).
  - ITスキル table (スキル名 | 初心者 | 中級 | 高度な) — maps the EN 3-flag proficiency (learnedInClass/canOperate/canTeach) onto JP tiers via heuristic (canTeach → 高度な, canOperate → 中級, else 初心者) with ☒/☐ glyphs.
  - 免許・資格 table (年/月 | タイトル | 機関/組織/内容).
  - インターンシップ/実務経験 table (年/月 | 会社名・団体名 | 担当部署/仕事内容 | 期間).
  - 趣味 / 興味 / 自己PR free-text section + 宣言 signature block.
- Rewrote `src/components/candidate/resume-preview.tsx` (in-browser HTML preview) to mirror both new PDF layouts (EN: title row + personal-info rows + 4 tables + skills-with-checkboxes table + numbered excel list + JLPT rows + other-languages + 3 Q&A cards; JP: 履歴書 + personal info + 教育 + プロジェクト + ITスキル + 免許・資格 + インターンシップ + 自己PR + 宣言). Uses the same ☒/☐ glyphs and the same JLPT/skill-tier mapping as the PDFs so the preview matches the downloaded PDF.
- Rewrote `src/components/candidate/resume-builder.tsx` form:
  - REMOVED all Japanese input fields: nameJa, degreeJa, fieldJa, institutionJa, nameJa, descriptionJa, organizationJa, roleJa, dutiesJa, titleJa, descriptionJa, organizationJa, selfPrJa, hobbiesJa (all 13 Japanese fields). The form is now English-only — the JP PDF is auto-generated from the English data with Japanese labels/structure.
  - The `languagesJa` array is still synced automatically from `languages` via `LANGUAGE_OPTIONS` (the candidate only ever picks English language names; the JP label is looked up).
  - Expanded `SECTIONS` sidebar nav from 6 → 10 entries: Personal Info / Education / Work Experience / Certifications / Projects / Skills / Skills I Excel In / Japanese & Languages / Why Japan? / Self-PR & Hobbies.
  - Updated `computeProgress()` to check all 10 sections.
  - Personal Info: added "Current degree being pursued" and "Expected time of graduation" inputs.
  - Education: split Year + Month into separate inputs; degree is now "combined text shown in PDF" (matches sample).
  - Work Experience: split Year + Month(period) + Duration + Role + Organization + Description (English only).
  - Certifications: Year + Month + Organization + Title + Description (English only).
  - Projects: Year + Month(period) + Name + Tech stack + Description (English only).
  - NEW Skills section: each row has Skill name + 3 shadcn Checkboxes (Learned in class / Can operate alone / Can teach others).
  - NEW "Skills in Which I Excel" section: dynamic numbered bullet list with add/remove.
  - NEW "Japanese Proficiency & Other Languages" section: 2 Select dropdowns (current JLPT, expected JLPT) + "Other languages" comma-separated input.
  - NEW "More About Why You Want to Work in Japan" section: 3 Textareas for the bilingual Q&A.
  - Self-PR & Hobbies: kept (English-only).
  - `load()` now merges saved data with `EMPTY_RESUME` (and deep-merges `japanMotivation`) so previously-saved resumes without the new sub-objects still load cleanly.
  - Added new lucide-react icons: `Code2` (Projects, Skills), `Languages` (Japanese & Languages), `MapPin` (Why Japan?), `ListChecks` (Skills I Excel In).
  - Added `Checkbox` import from `@/components/ui/checkbox` for the proficiency flags.
  - Updated the header PDF-download filenames to use `data.name` (no longer falls back to `nameJa`).
- Verification:
  - `npx tsc --noEmit`: clean (exit 0).
  - `bun run lint`: ZERO issues (exit 0).
  - Dev server (already running on :3000) hot-reloaded all 5 modified files cleanly; no compile errors.
  - API round-trip test via curl: PUT a fully-populated test resume with all new fields → 200 `{saved:true}` → GET returns it unchanged (including skills array, japanMotivation object, JLPT levels, currentDegree/expectedGraduation).
  - Agent-browser smoke test (logged in as candidate):
    - Resume Builder Edit tab: all 10 sidebar sections render; new fields visible (Current degree, Expected time of graduation, JLPT dropdowns, Skills-with-checkboxes, 3 Why-Japan textareas). No Japanese input fields remain.
    - Filled Personal Info + 1 Skill (all 3 checkboxes ticked) → Save → 200 OK → API GET confirms the new fields persisted (name=Abhishek, currentDegree=Bachelors in Technology…, expectedGraduation=06/2026, skills=[{name:'HTML, CSS, JavaScript', learnedInClass:true, canOperate:true, canTeach:true}], japanMotivation object present).
    - English Resume preview: renders the new title row + personal info block + 4-column Education table header. No console errors (only the pre-existing `ShieldCheck is not defined` error from `admin-dashboard.tsx`, unrelated to resume work).
    - 日本語 履歴書 preview: renders 履歴書 title + personal-info table with 氏名/生年月日/性別/メールアドレス/国籍(インド)/本籍地(同上)/電話番号/住所/既習言語(英語) + ITスキル table with skill "HTML, CSS, JavaScript" → ☐ ☐ ☒ (高度な, because canTeach=true). All Japanese labels rendered correctly via NotoSansJP.
  - Restored testuser's resume to minimal state after testing so no test data remains in the DB.

Stage Summary:
- 5 files modified:
  1. `src/lib/resume-types.ts` — added `month?` (education/awards), `year?` (projects/activities), new `ResumeSkill` + `ResumeJapanMotivation` + `JlptLevel` types, new top-level fields (`currentDegree`, `expectedGraduation`, `skills`, `skillsExcelSummary`, `currentJlpt`, `expectedJlpt`, `otherLanguages`, `japanMotivation`), updated `EMPTY_RESUME`, added `JLPT_OPTIONS` and `computeAge()` helper.
  2. `src/app/api/candidates/me/resume/route.ts` — extended zod schema with all new fields (backward compatible — all new fields are optional or default to `[]`).
  3. `src/lib/pdf-templates/english-resume-pdf.tsx` — full rewrite matching the EN sample: Resume+Date title row, personal-info block with all 6 sample rows, Education/Work Experience/Certifications/Projects tables with the right column widths, Skills proficiency table with ☒/☐ glyphs, "Skills in Which I Excel" numbered list, JLPT N1–N5 checkbox rows (current + expected), Other languages line, "More About Why You Want to Work in Japan" 3 bordered Q&A cards. Uses @react-pdf/renderer `Document`/`Page`/`View`/`Text` only — tables built from `flexDirection:"row"` + percentage widths.
  4. `src/lib/pdf-templates/japanese-resume-pdf.tsx` — full rewrite matching the JP sample: 履歴書 title, personal-info table (氏名/生年月日/性別/メールアドレス/国籍/本籍地/電話番号/住所/既習言語 with "同上" fallback), 教育 (4-col), プロジェクト (3-col), ITスキル (4-col with 初心者/中級/高度な checkboxes — proficiency mapped from the EN 3-flag shape), 免許・資格 (3-col), インターンシップ/実務経験 (4-col), 趣味/自己PR + 宣言 block. NotoSansJP font used throughout.
  5. `src/components/candidate/resume-builder.tsx` — full rewrite of the form: removed ALL 13 Japanese input fields (form is now English-only), expanded from 6 → 10 sidebar sections, added new editors for Skills (3-checkbox proficiency), Skills I Excel In (numbered list), JLPT levels (2 dropdowns), Other languages, Japan motivation (3 textareas). `load()` deep-merges with `EMPTY_RESUME` for backward compat. New lucide icons imported (Code2, Languages, MapPin, ListChecks) + `Checkbox` from shadcn.
- 1 additional file modified for consistency:
  6. `src/components/candidate/resume-preview.tsx` — full rewrite of the in-browser HTML preview to mirror both new PDF layouts exactly (same column structure, same ☒/☐ glyphs, same JLPT/skill-tier mapping). The browser preview now matches what the candidate will see when they download the PDF.

Backward compatibility: previously-saved resumes (without `skills`, `japanMotivation`, etc.) continue to load and render — `EMPTY_RESUME` defaults + zod `default([])` on the API ensure missing arrays/objects are filled in. Existing `*Ja` optional fields remain in the type so old data isn't lost; the form simply doesn't expose them anymore.

Known unrelated issue (NOT introduced by this task): `src/components/admin/admin-dashboard.tsx` references `ShieldCheck` which is not imported from lucide-react — this throws a `ReferenceError` during SSR and falls back to client rendering. It affects only the admin dashboard, not the candidate resume builder. Pre-existing on arrival.

---
Task ID: RE-SPLIT-COMPANY
Agent: sub (general-purpose)
Task: Re-split `src/components/company/company-dashboard.tsx` (had regressed back to 2014 lines with all tab functions inline) into focused tab files under `src/components/company/tabs/`.

Work Log:
- Read full 2014-line `company-dashboard.tsx` plus all 7 existing `tabs/*.tsx` files and `shared.tsx`.
- Verified each tab file already contained the verbatim extraction of its inline counterpart from the monolith (Overview 269 lines, Jobs 227, NewJob 267, Applicants 592 incl. ApplicantDetail, TalentSearch 236 incl. CandidateTalentCard + CandidateDetailPanel, Analytics 108, Profile 227). All seven files were `("use client")`, exported their public function with the original name/signature, imported `useCompanyJobs`/`useCompanyApps` from `../shared`, and pulled only the UI primitives/types/icons they actually used.
- Confirmed `shared.tsx` already exports `NAV`, `useCompanyJobs`, `useCompanyApps`, `PendingState` (104 lines).
- Rewrote `company-dashboard.tsx` from 2014 → 100 lines as a slim orchestrator. The new file imports `NAV` + `PendingState` from `./shared` and the seven tab components from `./tabs/*`, then renders the same `DashboardShell` wrapper, the same auth/loading/pending guards, the same avatar/topbarActions, and the same `tab === "..."` switch as before. All JSX preserved verbatim; no logic, styling, or props changed.
- Ran `bun run lint` → 0 errors (45 pre-existing warnings in unrelated files; none in `src/components/company/`). Ran `npx tsc --noEmit` → exit 0, clean.
- No files outside `src/components/company/` were touched. `auth.ts`, API routes, store, types — untouched.

Files modified (1):
- `src/components/company/company-dashboard.tsx` — rewritten as slim orchestrator (2014 → 100 lines).

Files verified-but-unchanged (already correct from prior split; left as-is):
- `src/components/company/shared.tsx`
- `src/components/company/tabs/overview.tsx`
- `src/components/company/tabs/jobs.tsx`
- `src/components/company/tabs/new-job.tsx`
- `src/components/company/tabs/applicants.tsx`
- `src/components/company/tabs/talent-search.tsx`
- `src/components/company/tabs/analytics.tsx`
- `src/components/company/tabs/profile.tsx`

---
Task ID: RE-SPLIT-ADMIN
Agent: sub (general-purpose)
Task: Re-split `src/components/admin/admin-dashboard.tsx` (had regressed back to 2555 lines with all tab functions inline) into focused tab files under `src/components/admin/tabs/`.

Work Log:
- Read full 2555-line `admin-dashboard.tsx` plus all 7 existing `tabs/*.tsx` files and `shared.tsx`.
- Mapped the monolith's structure: orchestrator `AdminDashboard` (lines 172-208) + inline `Overview`, `ExportCsvButton`, `FormField`, `JobsTab` + `JobEditorSheet`, `CandidatesTab` + `CandidateEditorSheet`, `CompaniesTab`, `ApplicationsTab`, `TestimonialsTab` + `TestimonialEditorSheet`, `ContactsTab`, `UsersTab`, plus shared `NAV`/`AdminStats`/`CandidateRow`/`CompanyRow`/`TestimonialRow`/`STATUS_COLORS` declarations.
- Verified existing tab extractions against the in-dashboard source for: `overview.tsx` (386 lines, ✓), `jobs.tsx` (627 lines incl. `JobEditorSheet`, ✓), `companies.tsx` (218 lines, ✓), `applications.tsx` (150 lines, ✓), `testimonials.tsx` (438 lines incl. `TestimonialEditorSheet`, ✓), `contacts.tsx` (219 lines, ✓). All six were already `"use client"`, exported their function with the original name/signature, imported only what they used, and pulled `AdminStats`/`STATUS_COLORS`/`CandidateRow`/`CompanyRow`/`TestimonialRow`/`ExportCsvButton`/`FormField` from `../shared`. Left them unchanged.
- Found `tabs/candidates.tsx` was STALE — it predated the addition of the "View & PDF" button + `CandidateEditorSheet`. Rewrote it (195 → 351 lines) by extracting `CandidatesTab` + `CandidateEditorSheet` verbatim from the monolith (incl. PDFDownloadLink for EN/JP resume PDFs, resumeData fetch, uploaded-PDF download). `CandidateEditorSheet` lives only in `candidates.tsx` (not exported). Removed the unused `toast` import that the monolith had carried for unrelated tabs; the rest of the body is byte-identical to the in-dashboard source.
- Created `tabs/users.tsx` (212 lines) — extracted `UsersTab` verbatim from the monolith (incl. role-edit inline Select, verified toggle, delete confirm, 2FA badge, Google/Password login badges). The previous split had missed this tab entirely; the orchestrator was rendering `<UsersTab />` from an inline function only. New file exports `UsersTab`.
- Updated `shared.tsx`: added `ShieldCheck` to the lucide-react import and appended `{ key: "users", label: "Users & Roles", icon: ShieldCheck }` to `NAV`. This also resolves the pre-existing `ReferenceError: ShieldCheck is not defined` SSR crash noted in the RE-RESUME-2025 worklog (the orchestrator's old inline NAV referenced `ShieldCheck` without importing it). No other exports touched — `NAV`, `STATUS_COLORS`, `AdminStats`, `CandidateRow`, `CompanyRow`, `TestimonialRow`, `ExportCsvButton`, `FormField` all unchanged.
- Rewrote `admin-dashboard.tsx` from 2555 → 55 lines as a slim orchestrator. The new file imports `NAV` from `./shared` and the eight tab components from `./tabs/*`, then renders the same `DashboardShell` wrapper, the same `RoleGuard` early return, the same avatar/topbarActions, and the same `tab === "..."` switch as before. All JSX preserved verbatim; no logic, styling, or props changed.
- Ran `npx tsc --noEmit` → exit 0, clean. Ran `bun run lint` → 0 errors (38 pre-existing warnings in unrelated files; the only new warnings in `tabs/candidates.tsx` and `tabs/users.tsx` are inherited from the in-dashboard source — `any` types in `resumeData`/`users` state, an unused `locale` destructure in `CandidateEditorSheet`, an unused `e` in `updateRole`'s catch — all preserved verbatim per the "zero behavior change" rule).
- No files outside `src/components/admin/` were touched. `auth.ts`, API routes, store, types, PDF templates — untouched.

Files modified (3):
- `src/components/admin/admin-dashboard.tsx` — rewritten as slim orchestrator (2555 → 55 lines).
- `src/components/admin/shared.tsx` — added `ShieldCheck` import + `users` NAV entry (also fixes pre-existing SSR crash).
- `src/components/admin/tabs/candidates.tsx` — rewrote to include the missing `CandidateEditorSheet` + "View & PDF" button column (195 → 351 lines).

Files created (1):
- `src/components/admin/tabs/users.tsx` — new file, exports `UsersTab`.

Files verified-but-unchanged (already correct from prior split; left as-is):
- `src/components/admin/tabs/overview.tsx`
- `src/components/admin/tabs/jobs.tsx`
- `src/components/admin/tabs/companies.tsx`
- `src/components/admin/tabs/applications.tsx`
- `src/components/admin/tabs/testimonials.tsx`
- `src/components/admin/tabs/contacts.tsx`
