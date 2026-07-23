# UI-2 — Dashboard Polish (Candidate / Company / Admin)

Agent: Z.ai Code
Task ID: UI-2
Scope: Apply premium UI/UX redesign to the three role dashboards. Pure JSX/className changes — no logic, state, API calls, or functions altered.

## Files modified

### 1. `src/components/candidate/candidate-dashboard.tsx` — P4 Candidate Dashboard

- **CHANGE 1 — Metric cards in Overview tab**: Replaced the four `MetricCard` components with a mapped array of colored icon cards (`bg-blue-500/10`/`text-blue-500` Sent, amber Shortlisted, violet Interviews, emerald Offers). Each card: `bg-card border border-border rounded-2xl p-5 shadow-premium hover:border-saffron/30 transition-all` with a `w-10 h-10 rounded-xl` colored icon block, `text-2xl font-display font-extrabold` value, `text-[12px] text-muted-foreground` label. Loading state still uses `MetricSkeleton`. `FileText`, `Star`, `CalendarClock`, `Trophy` were already imported; `Send` removed (was only used by the old first card).
- **CHANGE 2 — Profile completion banner**: Replaced the `SectionCard` + `Progress` UI with a gradient banner (`bg-gradient-to-r from-saffron/10 to-crimson/10 border border-saffron/20 rounded-2xl p-5 mb-6`). Header: "Profile strength" + `t("dash.profile.complete")` subtitle (left), `text-2xl font-display font-extrabold text-gradient-brand` percentage (right). Bar: `h-2 bg-muted rounded-full overflow-hidden` with `bg-brand-gradient` fill that has `transition-all duration-700`. The two completion CTA buttons (Complete profile / Upload resume) preserved inside the banner. `Progress` import removed.
- **CHANGE 3 — Application rows**: Every `TableHead` got `bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground` appended (existing `pl-5 sm:pl-6` / `hidden sm:table-cell` / `text-right pr-5 sm:pr-6` preserved). Main data `TableRow` got `hover:bg-muted/30 transition-colors`. The interview-info sub-row keeps its violet background.
- Imports cleaned: removed `MetricCard`, `Progress`, `Send`. Kept `ArrowRight`, `SectionCard`, `MetricSkeleton`, all icons still in use.

### 2. `src/components/company/company-dashboard.tsx` — P5 Company Dashboard

- **CHANGE 1 — Applicants pipeline**: Added module-scope `PIPELINE_STAGES` constant (5 entries: APPLIED/SHORTLISTED/INTERVIEWED/OFFERED/REJECTED, each with colored `color` + `badge` class strings). Replaced the existing `SectionCard`+`Table` block in `Applicants()` with a horizontal-scroll pipeline: `<div className="rounded-2xl border border-border bg-card overflow-hidden">` → `<div className="flex gap-4 overflow-x-auto scroll-area p-4">` → one column per stage. When `statusFilter === "ALL"` all 5 columns render; otherwise only the selected stage's column renders. Each column is `w-72 rounded-xl border p-3 flex flex-col` tinted with the stage color, with a header row (label + count badge) and a `max-h-[60vh] overflow-y-auto` body. Each applicant is rendered as a clickable `bg-card border border-border rounded-lg p-3 hover:shadow-premium hover:border-saffron/30` mini-card containing avatar, name, JLPT badge, applied date, and job title. Clicking calls the existing `setSelectedId(a.id)` so the existing Sheet opens unchanged. The existing top filter bar (job `Select` + status `Select`) is preserved verbatim.
- **CHANGE 2 — My Jobs tab cards**: Replaced the `SectionCard`+`Table` block in `Jobs()` with `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">` of cards. Each job is `bg-card border border-border rounded-2xl p-5 hover:border-saffron/30 hover:shadow-premium transition-all`. Top row: title + `<MapPin/>`-prefixed location (left), the existing toggle button repurposed as a shrink-0 status pill (right). Middle row: `<Badge variant="outline">` for `t(\`jobtype.${j.jobType}\`)` and `<Badge>` with `JLPT_BADGE[j.jlptRequired]` for the JLPT level. Bottom row (border-top separator): `{j.applicationCount ?? 0} applicants` (left) and the existing View Applicants button + Delete `AlertDialog` (right). `toggleActive`, `remove`, `deleteId`, `busyId`, `setTab("applicants", { jobId })` handlers preserved.
- Imports: added `MapPin`. Removed `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` (no longer used). `formatRelative`, `Eye`, `Search`, `SectionCard`, `MetricCard` still used elsewhere.

### 3. `src/components/admin/admin-dashboard.tsx` — P6 Admin Polish

- **CHANGE 1 — Overview stat cards**: Replaced the six `MetricCard` components with a mapped array of colored-icon stat cards. Grid: `grid-cols-2 lg:grid-cols-3 gap-4 mb-8`. Each card: `bg-card border border-border rounded-2xl p-5 shadow-premium hover:border-saffron/20 transition-all` with `w-10 h-10 rounded-xl` icon block (accent branches on `saffron`/`crimson`/`blue`/`violet`/`emerald`/`amber`), `text-3xl font-display font-extrabold` value, `text-[12px] font-medium` label, `text-[11px] text-muted-foreground` trend line. Values still pulled from `stats?.metrics.*` with `?? 0` fallbacks; loading state still uses `MetricSkeleton`.
- **CHANGE 2 — Table styling**: For every `Table` in the admin panel (JobsTab, CandidatesTab, CompaniesTab, ApplicationsTab, ContactsTab):
  - Replaced the wrapping `<SectionCard bodyClassName="p-0">` with `<div className="rounded-2xl border border-border overflow-hidden shadow-premium">` (and the matching `</SectionCard>` → `</div>`).
  - Every `<TableHead>` got `bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground` appended (existing `pl-5 sm:pl-6` / `hidden md:table-cell` / `text-right pr-5 sm:pr-6` preserved).
  - Every data `<TableRow>` got `hover:bg-muted/30 transition-colors`.
  - The inner `<div className="max-h-[70vh] overflow-y-auto scroll-area">` and the sticky `<TableHeader className="sticky top-0 bg-card z-10">` are preserved so vertical scroll + sticky header still work inside the new outer rounded container.
- **CHANGE 3 — Pending company approval cards**: Replaced the `<ul className="divide-y">` of pending companies with a `<div className="p-5 space-y-3">` containing one card per company. Each card: `flex items-center justify-between gap-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4` with: (left) `w-9 h-9 rounded-xl bg-amber-500/15` icon block holding `<Building2 className="h-4 w-4 text-amber-600" />`, then `companyName` (`text-[13px] font-semibold`) + `email` (`text-[11px] text-muted-foreground`); (right) the Approve button restyled as `h-8 px-3 text-[12px] bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors` and the Reject button as `h-8 px-3 text-[12px] border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors`. `approve(c.id, true|false)`, `busyId` gating, and the `CheckCircle2`/`XCircle` icons are preserved.
- Imports cleaned: removed `MetricCard`, `Send`. `formatRelative` still used by Recent applications + Jobs table; `CompanyAvatar` still used by Companies table.

## Verification

- `bun run lint` — passed (zero errors / warnings).
- `npx tsc --noEmit` — only the pre-existing `bcryptjs` type-definition error (Task 1-4 era); zero TS errors in any of the three modified files.
- `dev.log` — `✓ Compiled` repeatedly, `GET / 200`, no runtime/compile errors after the edits.

## Notes for downstream agents

- `MetricCard` is still exported by `dashboard-shell.tsx` and still used by `CompanyDashboard` Overview + Analytics tabs, so do NOT remove the export.
- The admin panel's `<div className="rounded-2xl border border-border overflow-hidden shadow-premium">` table wrapper relies on the inner `max-h-[70vh] overflow-y-auto scroll-area` div for vertical scroll + sticky header. If you change one, change both.
- The pipeline mini-cards in `Applicants()` call `setSelectedId(a.id)` — the same setter the old table's Eye button used — so the existing `Sheet` + `ApplicantDetail` slide-over works unchanged.
- The `PIPELINE_STAGES` constant is typed (`{ status: ApplicationStatus; label: string; color: string; badge: string }[]`) and lives at module scope just above `function Applicants()` to satisfy the `react-hooks/static-components` rule.
- The "Switch" referenced in the UI-2 brief for the company jobs cards was actually a custom toggle button in the original code (not a `<Switch>` component). It is preserved as a toggle button repurposed inside the card header — no behavior change.
