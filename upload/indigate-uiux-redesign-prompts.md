# IndiGate — Professional UI/UX Redesign Prompts
### Paste each prompt into Cursor / Claude Code one at a time
> Do them in order. Each builds on the previous.

---

## MASTER CONTEXT
> Paste this block at the TOP of every single prompt below

```
Project: IndiGate — India × Japan talent platform (indigate.work)
Stack: Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, Zustand

ARCHITECTURE — read before touching anything:
- Single-page app. All views render at "/". Navigation via useApp() Zustand store.
- Do NOT create new Next.js pages or routes.
- Do NOT change any API routes, Prisma schema, or lib files.
- Only modify component files and globals.css.

EXISTING DESIGN TOKENS (defined in globals.css — use these, never hardcode colors):
- --saffron: warm gold/amber (India accent, primary CTAs)
- --crimson: deep red (Japan accent, hover states, badges)
- --ink: near-black text
- bg-brand-gradient: saffron → crimson diagonal gradient
- text-gradient-brand: gradient text (saffron → crimson)
- shadow-premium: soft layered box shadow
- shadow-glow-brand: crimson glow
- glass: frosted glass effect with backdrop blur
- bg-mesh: mesh gradient background
- gradient-border: animated gradient border utility

FONT: Plus Jakarta Sans — font-display class. Use font-display for all headings.

EXISTING COMPONENTS available to use:
- All shadcn/ui components in src/components/ui/
- SpotlightCard, MagneticButton, TiltCard from src/components/brand/motion-primitives.tsx
- Reveal, RevealGroup, motion from src/lib/motion.tsx
- DashboardShell, MetricCard, EmptyState, SectionCard from src/components/dashboard/dashboard-shell.tsx
- CompanyAvatar, CandidateAvatar from src/components/brand/logo.tsx

RULE: Improve only the visual design. Never change:
- Any function, state variable, API call, or business logic
- Props or interfaces of any component
- Import paths (don't add new packages)
- Store actions or navigation logic
```

---

## PROMPT 1 — Job Cards (highest impact, do this first)
**File: `src/components/jobs/job-card.tsx`**

```
[PASTE MASTER CONTEXT HERE]

TASK: Redesign JobCard for a professional, high-information layout.
Only modify src/components/jobs/job-card.tsx.
Keep ALL existing logic (toggleSave, navigate, isSaved, formatSalary, etc.) exactly as-is.
Only change the JSX/className structure inside the return statement.

CURRENT PROBLEMS:
- Company logo is just initials in a circle (CompanyAvatar shows initials)
- Info is cramped without clear hierarchy
- Salary is not prominent enough
- JLPT badge gets lost
- Bottom actions look like an afterthought

TARGET DESIGN: Two-zone horizontal card

Here is the exact new JSX structure to use inside the SpotlightCard wrapper:

<SpotlightCard className="rounded-2xl border border-border bg-card h-full transition-all duration-200 hover:border-saffron/50 hover:shadow-premium group">
  <div className="p-5 flex flex-col h-full gap-4">

    {/* TOP ROW: Company identity + bookmark */}
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <CompanyAvatar
            name={job.company.companyName}
            color={job.company.logoUrl}
            size={44}
          />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate">
            {job.company.companyName}
          </p>
          <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="text-[12px] truncate">{job.location}</span>
          </div>
        </div>
      </div>
      <button
        onClick={toggleSave}
        disabled={saving}
        className={cn(
          "shrink-0 p-1.5 rounded-lg transition-all",
          isSaved
            ? "text-saffron bg-saffron/10"
            : "text-muted-foreground hover:text-saffron hover:bg-saffron/10"
        )}
      >
        <Bookmark className={cn("h-4 w-4", isSaved && "fill-saffron")} />
      </button>
    </div>

    {/* JOB TITLE */}
    <div>
      <h3 className="font-display font-bold text-[1.05rem] leading-snug text-foreground group-hover:text-crimson transition-colors line-clamp-2">
        {title}
      </h3>
    </div>

    {/* BADGES ROW */}
    <div className="flex flex-wrap gap-2">
      <Badge className={cn("text-[11px] font-semibold px-2.5 py-0.5 border", JLPT_BADGE[job.jlptRequired])}>
        JLPT {job.jlptRequired === "NONE" ? "Not required" : job.jlptRequired}
      </Badge>
      <Badge variant="outline" className="text-[11px] px-2.5 py-0.5 capitalize">
        {job.jobType.replace("_", " ").toLowerCase()}
      </Badge>
    </div>

    {/* SALARY — prominent */}
    {(job.salaryMin || job.salaryMax) && (
      <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2">
        <Banknote className="h-4 w-4 text-saffron shrink-0" />
        <span className="text-[13px] font-bold text-foreground">
          {formatSalary(job.salaryMin, job.salaryMax, job.salaryType, job.currency)}
        </span>
      </div>
    )}

    {/* SPACER */}
    <div className="flex-1" />

    {/* BOTTOM ROW: posted date + actions */}
    <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {formatRelative(job.postedAt)}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-[12px] px-3"
          onClick={(e) => { e.stopPropagation(); navigate("job-detail", { jobId: job.id }); }}
        >
          {t("jobs.details")}
        </Button>
        <Button
          size="sm"
          className="h-8 text-[12px] px-3 bg-brand-gradient text-white hover:opacity-90 hover:shadow-glow-brand transition-all"
          onClick={(e) => { e.stopPropagation(); navigate("job-detail", { jobId: job.id }); }}
        >
          {t("jobs.apply")}
        </Button>
      </div>
    </div>

  </div>
</SpotlightCard>

Make sure to keep the outer motion.article wrapper with whileHover={{ y: -4 }} exactly as it was.
Keep all existing imports. Add Clock to the lucide-react import if not already there.
```

---

## PROMPT 2 — Jobs Listing Page
**File: `src/components/jobs/jobs-view.tsx`**

```
[PASTE MASTER CONTEXT HERE]

TASK: Redesign the jobs listing page layout.
Only modify src/components/jobs/jobs-view.tsx.
Keep ALL filter logic, API calls, search state, pagination — do not change any functions.
Only change the JSX layout and classNames.

CHANGES TO MAKE:

1. PAGE HEADER — replace the current header with:
<div className="bg-mesh border-b border-border">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
    <h1 className="font-display text-3xl font-extrabold text-gradient-brand mb-1">
      {t("jobs.title")}
    </h1>
    <p className="text-muted-foreground text-[15px]">{t("jobs.subtitle")}</p>

    {/* Full-width search bar */}
    <div className="mt-6 relative max-w-2xl">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        placeholder={t("jobs.search.placeholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-[14px] focus:outline-none focus:ring-2 focus:ring-saffron/40 focus:border-saffron/60 transition-all"
      />
    </div>
  </div>
</div>

2. MAIN LAYOUT — two-column: sticky filter sidebar left, job grid right
Replace the current main content area with:

<div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
  <div className="flex gap-8 items-start">

    {/* FILTER SIDEBAR — sticky, desktop only */}
    <aside className="hidden lg:block w-[260px] shrink-0 sticky top-4">
      <div className="bg-card border border-border rounded-2xl p-5 shadow-premium">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-semibold text-foreground">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[12px] text-crimson hover:text-crimson/70 font-medium"
            >
              {t("jobs.filter.clear")}
            </button>
          )}
        </div>

        {/* Location filter */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            {t("jobs.filter.location")}
          </label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-full h-9 text-[13px] rounded-lg">
              <SelectValue placeholder={t("jobs.alllocations")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("jobs.alllocations")}</SelectItem>
              {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Job Type filter */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            {t("jobs.filter.type")}
          </label>
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger className="w-full h-9 text-[13px] rounded-lg">
              <SelectValue placeholder={t("jobs.alltypes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("jobs.alltypes")}</SelectItem>
              {JOB_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`jobtype.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* JLPT Level filter */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            {t("jobs.filter.jlpt")}
          </label>
          <div className="flex flex-wrap gap-2">
            {["", "N1", "N2", "N3", "N4", "N5"].map((level) => (
              <button
                key={level}
                onClick={() => setJlptLevel(level)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all",
                  jlptLevel === level
                    ? "bg-brand-gradient text-white border-transparent"
                    : "bg-muted border-border text-muted-foreground hover:border-saffron/50"
                )}
              >
                {level || "Any"}
              </button>
            ))}
          </div>
        </div>

        {/* Min salary filter */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            {t("jobs.filter.salary")}
          </label>
          <Select value={String(salaryMin)} onValueChange={(v) => setSalaryMin(Number(v))}>
            <SelectTrigger className="w-full h-9 text-[13px] rounded-lg">
              <SelectValue placeholder={t("jobs.allsalary")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{t("jobs.allsalary")}</SelectItem>
              <SelectItem value="1000">¥1,000/hr+</SelectItem>
              <SelectItem value="1200">¥1,200/hr+</SelectItem>
              <SelectItem value="1500">¥1,500/hr+</SelectItem>
              <SelectItem value="2000">¥2,000/hr+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </aside>

    {/* JOB RESULTS */}
    <div className="flex-1 min-w-0">
      {/* Results bar */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-[13px] text-muted-foreground">
          {t("jobs.found", { count: total })}
        </p>
      </div>

      {/* Mobile filters — horizontal scrolling chips */}
      <div className="flex lg:hidden gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {/* keep existing mobile filter selects here, just styled as chips */}
      </div>

      {/* Jobs grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 h-[200px] shimmer-sweep" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4 animate-bob">🔍</div>
          <p className="font-display font-bold text-lg mb-1">{t("jobs.empty")}</p>
          <button onClick={clearFilters} className="mt-3 text-[13px] text-saffron hover:underline">
            {t("jobs.filter.clear")}
          </button>
        </div>
      ) : (
        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <motion.div key={job.id} variants={staggerItem}>
              <JobCard job={job} />
            </motion.div>
          ))}
        </RevealGroup>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
            ← Previous
          </Button>
          <span className="text-[13px] text-muted-foreground px-3">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
            Next →
          </Button>
        </div>
      )}
    </div>
  </div>
</div>

Keep all existing state variables and functions (setSearch, setLocation, setJobType, setJlptLevel, setSalaryMin,
clearFilters, hasActiveFilters, total, totalPages, page, setPage, loading, jobs).
Import staggerItem from @/lib/motion if not already imported.
Add JOB_TYPES from @/lib/types if not already imported.
The LOCATIONS array can be: ["Tokyo", "Osaka", "Nagoya", "Yokohama", "Fukuoka", "Sapporo", "Kumamoto"]
```

---

## PROMPT 3 — Auth Pages (Login + Register)
**File: `src/components/auth/auth-view.tsx`**

```
[PASTE MASTER CONTEXT HERE]

TASK: Redesign the auth pages with a professional split-screen layout.
Only modify src/components/auth/auth-view.tsx.
Keep ALL existing logic (handleLogin, handleRegister, mode switching, form state) exactly as-is.

CHANGE: Wrap the entire auth view in a split-screen layout:

The outer container should be:
<div className="min-h-screen flex">

  {/* LEFT PANEL — branded, desktop only */}
  <div className="hidden lg:flex w-[420px] shrink-0 bg-sidebar flex-col justify-between p-10 relative overflow-hidden">
    {/* Mesh background */}
    <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />

    {/* Top: Logo */}
    <div className="relative z-10">
      <Logo className="text-sidebar-foreground" />
      <p className="mt-3 text-sidebar-foreground/60 text-[13px] leading-relaxed">
        India × Japan — bridging talent across borders
      </p>
    </div>

    {/* Middle: Stats */}
    <div className="relative z-10 space-y-5">
      {[
        { number: "500+", label: "Indian professionals placed in Japan" },
        { number: "50+", label: "Partner companies across Japan" },
        { number: "N2", label: "Average JLPT level of placed candidates" },
      ].map((stat) => (
        <div key={stat.label} className="flex items-center gap-4">
          <div className="text-2xl font-display font-extrabold text-gradient-brand">
            {stat.number}
          </div>
          <div className="text-[12px] text-sidebar-foreground/60 leading-tight">
            {stat.label}
          </div>
        </div>
      ))}
    </div>

    {/* Bottom: Testimonial quote */}
    <div className="relative z-10 border-t border-sidebar-border pt-6">
      <p className="text-[13px] text-sidebar-foreground/70 italic leading-relaxed">
        "IndiGate helped me land a software engineering role in Tokyo within 3 months.
        The JLPT matching made all the difference."
      </p>
      <p className="text-[12px] text-sidebar-foreground/50 mt-2 font-semibold">
        — Priya S., Software Engineer at TechNova Japan
      </p>
    </div>
  </div>

  {/* RIGHT PANEL — the actual form */}
  <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-background">
    <div className="w-full max-w-[420px]">

      {/* Keep all existing form JSX here but wrap it in this container */}
      {/* The form cards, mode switching, inputs — all stay the same */}
      {/* Just add these improvements to the inputs: */}

      {/* For every <Input> component, add these classes: */}
      {/* className="h-11 rounded-xl text-[14px] border-border focus:border-saffron/60 focus:ring-saffron/20" */}

      {/* For every <Button type="submit">, ensure it has: */}
      {/* className="w-full h-11 bg-brand-gradient text-white hover:opacity-90 rounded-xl font-semibold text-[14px] shadow-glow-brand transition-all" */}

      {/* For the mode switch links (login ↔ register), use: */}
      {/* className="text-saffron hover:text-crimson font-semibold transition-colors" */}

    </div>
  </div>

</div>

IMPORTANT: The split-screen is the outer wrapper. Inside the right panel, keep ALL the existing
AnimatePresence, mode switching (login/register/verify/forgot/reset), form state, and submit handlers.
Just move them into the right panel div. Do not break any of the existing form logic.
Import Logo from @/components/brand/logo if not already imported.
```

---

## PROMPT 4 — Candidate Dashboard: Overview + Applications
**File: `src/components/candidate/candidate-dashboard.tsx`**

```
[PASTE MASTER CONTEXT HERE]

TASK: Improve the visual design of the candidate dashboard.
Only modify src/components/candidate/candidate-dashboard.tsx.
Keep ALL existing state, API calls, functions exactly as-is.

CHANGE 1 — Metric cards in the Overview tab:
Find the 4 MetricCard components for Applications/Shortlisted/Interviews/Offers.
Wrap them in a grid with gradient-border cards:

<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  {[
    { label: t("dash.apps.sent"), value: counts.APPLIED + counts.SHORTLISTED + counts.INTERVIEWED + counts.OFFERED + counts.REJECTED, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: t("dash.apps.shortlisted"), value: counts.SHORTLISTED, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: t("dash.apps.interviews"), value: counts.INTERVIEWED, icon: CalendarClock, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: t("dash.apps.offers"), value: counts.OFFERED, icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ].map((m) => (
    <div key={m.label} className="bg-card border border-border rounded-2xl p-5 shadow-premium hover:border-saffron/30 transition-all">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", m.bg)}>
        <m.icon className={cn("h-5 w-5", m.color)} />
      </div>
      <div className="text-2xl font-display font-extrabold text-foreground">{m.value}</div>
      <div className="text-[12px] text-muted-foreground mt-0.5">{m.label}</div>
    </div>
  ))}
</div>

Add imports: Star, Trophy, CalendarClock from lucide-react (if not already there).

CHANGE 2 — Application rows in the Applications tab:
Find where applications are rendered in a table or list.
Replace each row with a cleaner card design:

For each application 'a', render:
<div key={a.id} className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4 hover:border-saffron/30 hover:shadow-premium transition-all">
  {/* Company avatar */}
  <CompanyAvatar name={a.job?.company?.companyName ?? "?"} color={a.job?.company?.logoUrl} size={40} />

  {/* Job info */}
  <div className="flex-1 min-w-0">
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="font-semibold text-[14px] text-foreground leading-snug line-clamp-1">
          {a.job?.title}
        </p>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {a.job?.company?.companyName} · {a.job?.location}
        </p>
      </div>
      <Badge className={cn("shrink-0 text-[11px] px-2.5 py-0.5 border font-semibold", STATUS_BADGE[a.status])}>
        {t(`status.${a.status}`)}
      </Badge>
    </div>

    {/* Interview date if scheduled */}
    {a.interviewDate && (
      <div className="mt-2 flex items-center gap-1.5 text-[12px] text-violet-600 dark:text-violet-400 font-medium">
        <CalendarClock className="h-3.5 w-3.5" />
        Interview: {new Date(a.interviewDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </div>
    )}

    {/* Bottom: date + withdraw */}
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
      <span className="text-[11px] text-muted-foreground">Applied {formatRelative(a.appliedAt)}</span>
      {a.status === "APPLIED" && (
        <button
          onClick={() => withdraw(a.id)}
          className="text-[12px] text-muted-foreground hover:text-destructive transition-colors"
        >
          Withdraw
        </button>
      )}
    </div>
  </div>
</div>

Replace the existing application list with this card-based design.
Keep the withdraw() function and AlertDialog for confirmation exactly as-is.

CHANGE 3 — Profile completion banner:
Find the profile completion progress bar section.
Replace with:

<div className="bg-gradient-to-r from-saffron/10 to-crimson/10 border border-saffron/20 rounded-2xl p-5 mb-6">
  <div className="flex items-center justify-between mb-3">
    <div>
      <p className="font-semibold text-[14px] text-foreground">Profile strength</p>
      <p className="text-[12px] text-muted-foreground mt-0.5">{t("dash.profile.complete")}</p>
    </div>
    <span className="text-2xl font-display font-extrabold text-gradient-brand">{completion}%</span>
  </div>
  <div className="h-2 bg-muted rounded-full overflow-hidden">
    <div
      className="h-full bg-brand-gradient rounded-full transition-all duration-700"
      style={{ width: `${completion}%` }}
    />
  </div>
</div>

Keep the existing 'completion' variable calculation exactly as-is.
```

---

## PROMPT 5 — Company Dashboard: Applicants Pipeline
**File: `src/components/company/company-dashboard.tsx`**

```
[PASTE MASTER CONTEXT HERE]

TASK: Redesign the applicants view in the company dashboard as a visual pipeline.
Only modify src/components/company/company-dashboard.tsx.
Keep ALL existing logic, API calls, status update functions exactly as-is.

FIND the applicants section (the component that renders application rows).
REPLACE the plain table/list with this pipeline column layout:

The pipeline has 5 columns: Applied, Shortlisted, Interviewed, Offered, Rejected.
Group applications by status and show them in columns.

Here is the structure:

const PIPELINE_STAGES = [
  { status: "APPLIED",      label: "Applied",     color: "border-blue-500/30 bg-blue-500/5",    badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  { status: "SHORTLISTED",  label: "Shortlisted", color: "border-amber-500/30 bg-amber-500/5",  badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  { status: "INTERVIEWED",  label: "Interviewed", color: "border-violet-500/30 bg-violet-500/5",badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  { status: "OFFERED",      label: "Offered",     color: "border-emerald-500/30 bg-emerald-500/5",badge:"bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  { status: "REJECTED",     label: "Rejected",    color: "border-rose-500/30 bg-rose-500/5",    badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
]

Render as:
<div className="overflow-x-auto -mx-4 px-4">
  <div className="flex gap-3 min-w-[900px] pb-4">
    {PIPELINE_STAGES.map((stage) => {
      const stageApps = filteredApps.filter((a) => a.status === stage.status)
      return (
        <div key={stage.status} className={cn("flex-1 min-w-[170px] border rounded-2xl p-3", stage.color)}>
          {/* Column header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-foreground">{stage.label}</span>
            <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", stage.badge)}>
              {stageApps.length}
            </span>
          </div>

          {/* Application cards in this column */}
          <div className="space-y-2">
            {stageApps.length === 0 ? (
              <div className="text-[11px] text-muted-foreground text-center py-4">No applicants</div>
            ) : (
              stageApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => openApplicantSheet(app)}
                  className="bg-card border border-border rounded-xl p-3 cursor-pointer hover:border-saffron/40 hover:shadow-premium transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CandidateAvatar name={app.candidate?.fullName ?? "?"} size={28} />
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-foreground truncate">{app.candidate?.fullName}</p>
                      <p className={cn("text-[10px] font-bold", JLPT_BADGE[app.candidate?.jlptLevel as JLPTLevel ?? "NONE"].split(" ")[0])}>
                        JLPT {app.candidate?.jlptLevel ?? "—"}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{formatRelative(app.appliedAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )
    })}
  </div>
</div>

Keep the openApplicantSheet / Sheet slide-over exactly as-is.
Add CandidateAvatar to imports from @/components/brand/logo if not already there.
Add JLPT_BADGE and JLPTLevel to imports from @/lib/types if not already there.
Keep the existing job selector (the Select for filtering by job) above the pipeline.

ALSO: Redesign the Job cards in the "My Jobs" tab:
Find where job rows are rendered in a table.
Replace with cards:

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {companyJobs.map((job) => (
    <div key={job.id} className="bg-card border border-border rounded-2xl p-5 hover:border-saffron/30 hover:shadow-premium transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-[14px] text-foreground">{job.title}</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1">
            <MapPin className="h-3 w-3" />{job.location}
          </p>
        </div>
        {/* Keep existing active/inactive Switch exactly as-is */}
      </div>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <Badge variant="outline" className="text-[11px]">{t(`jobtype.${job.jobType}`)}</Badge>
        <Badge className={cn("text-[11px] border", JLPT_BADGE[job.jlptRequired as JLPTLevel])}>{job.jlptRequired}</Badge>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-[12px] text-muted-foreground">
          {job.applicationCount ?? 0} applicants
        </span>
        <div className="flex gap-2">
          {/* Keep existing View Applicants and Delete buttons */}
        </div>
      </div>
    </div>
  ))}
</div>
```

---

## PROMPT 6 — Admin Panel Polish
**File: `src/components/admin/admin-dashboard.tsx`**

```
[PASTE MASTER CONTEXT HERE]

TASK: Polish the admin panel visual design.
Only modify src/components/admin/admin-dashboard.tsx.
Keep ALL existing logic, charts, data fetching, and tab switching exactly as-is.

CHANGE 1 — Overview stat cards:
Find where the 6 MetricCard components are rendered.
Replace with more impactful stat cards:

<div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
  {[
    { label: "Total candidates", value: stats.candidates, icon: Users, accent: "saffron", trend: "+12% this month" },
    { label: "Active jobs", value: stats.activeJobs, icon: Briefcase, accent: "blue", trend: `${stats.totalJobs} total` },
    { label: "Total applications", value: stats.totalApps, icon: FileText, accent: "violet", trend: `${stats.appsThisMonth} this month` },
    { label: "Placements (offers)", value: stats.placements, icon: Trophy, accent: "emerald", trend: "All time" },
    { label: "Partner companies", value: stats.companies, icon: Building2, accent: "crimson", trend: `${stats.pendingCompanies} pending` },
    { label: "This month apps", value: stats.appsThisMonth, icon: TrendingUp, accent: "amber", trend: "Applications" },
  ].map((card) => (
    <div key={card.label} className="bg-card border border-border rounded-2xl p-5 shadow-premium hover:border-saffron/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          card.accent === "saffron" ? "bg-saffron/10 text-saffron" :
          card.accent === "crimson" ? "bg-crimson/10 text-crimson" :
          card.accent === "blue" ? "bg-blue-500/10 text-blue-500" :
          card.accent === "violet" ? "bg-violet-500/10 text-violet-500" :
          card.accent === "emerald" ? "bg-emerald-500/10 text-emerald-500" :
          "bg-amber-500/10 text-amber-500"
        )}>
          <card.icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-3xl font-display font-extrabold text-foreground">{card.value}</div>
      <div className="text-[12px] font-medium text-foreground mt-0.5">{card.label}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{card.trend}</div>
    </div>
  ))}
</div>

Add imports: TrendingUp, Building2, Trophy from lucide-react if not already there.

CHANGE 2 — Data tables (candidates, jobs, companies, applications tabs):
For every table in the admin panel, find the <Table> component and add these improvements:

a) Table header cells: add this className:
"bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"

b) Table rows: add hover state:
"hover:bg-muted/30 transition-colors cursor-pointer"

c) Wrap every table in:
<div className="rounded-2xl border border-border overflow-hidden shadow-premium">
  <Table>...</Table>
</div>

CHANGE 3 — Pending company approval cards:
Find the pending company approval section in the overview tab.
Replace plain rows with:

<div className="space-y-3">
  {pendingCompanies.map((company) => (
    <div key={company.id} className="flex items-center justify-between gap-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <Building2 className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground">{company.companyName}</p>
          <p className="text-[11px] text-muted-foreground">{company.user?.email} · {company.industry}</p>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        {/* Keep existing Approve and Reject buttons with their onClick handlers */}
        {/* Just update their styling: */}
        {/* Approve button: className="h-8 px-3 text-[12px] bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors" */}
        {/* Reject button: className="h-8 px-3 text-[12px] border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" */}
      </div>
    </div>
  ))}
</div>
```

---

## PROMPT 7 — Global Typography + Spacing Consistency
**File: `src/app/globals.css` and `src/components/dashboard/dashboard-shell.tsx`**

```
[PASTE MASTER CONTEXT HERE]

TASK: Improve global typography consistency and dashboard shell polish.

PART A — Add to src/app/globals.css (add these after the existing utilities section):

@layer utilities {
  /* Consistent section titles used throughout the app */
  .section-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }
  .section-title {
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
    font-family: var(--font-display);
  }
  .card-title {
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.3;
  }
  .data-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted-foreground);
  }

  /* Consistent card hover */
  .card-hover {
    transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  }
  .card-hover:hover {
    border-color: color-mix(in oklch, var(--saffron) 35%, transparent);
    box-shadow: 0 1px 2px rgba(20, 12, 6, 0.04), 0 8px 24px -8px rgba(20, 12, 6, 0.12);
    transform: translateY(-2px);
  }

  /* Consistent empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 1.5rem;
    text-align: center;
  }
  .empty-state-icon {
    width: 3rem;
    height: 3rem;
    color: var(--muted-foreground);
    margin-bottom: 1rem;
    animation: bob 3s ease-in-out infinite;
  }
  .empty-state-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--foreground);
    margin-bottom: 0.25rem;
  }
  .empty-state-desc {
    font-size: 0.8125rem;
    color: var(--muted-foreground);
    max-width: 280px;
  }
}

PART B — In src/components/dashboard/dashboard-shell.tsx:

1. Find the DashboardShell topbar (the sticky top bar with welcome text + bell).
   Update it to:
   <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
     <div className="flex items-center justify-between px-5 py-3">
       <div>
         <h1 className="font-display font-bold text-[15px] text-foreground leading-tight">
           {welcome}
         </h1>
         {subtitle && (
           <p className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</p>
         )}
       </div>
       <div className="flex items-center gap-2">
         {topbarActions}
         <NotificationsBell />
         <LocaleToggle />
         {avatar}
       </div>
     </div>
   </header>

2. Find the sidebar nav items (the NavList component).
   Update the active nav item styling to use a stronger indicator:
   Active item: className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sidebar-accent text-sidebar-accent-foreground font-semibold text-[13px] transition-all relative"
   Add a left border indicator: <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-saffron rounded-full" />

3. Find the MetricCard component inside dashboard-shell.tsx.
   Update it to use the new improved design:
   <div className="bg-card border border-border rounded-2xl p-5 shadow-premium hover:border-saffron/30 transition-all">
     <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", iconBg)}>
       {icon && <icon.type {...icon.props} className="h-4.5 w-4.5" />}
     </div>
     <div className="text-2xl font-display font-extrabold text-foreground">{value}</div>
     <div className="text-[12px] text-muted-foreground mt-0.5">{label}</div>
   </div>
```

---

## PROMPT 8 — Landing Page Hero + Sections
**File: `src/components/landing/landing-page.tsx`**

```
[PASTE MASTER CONTEXT HERE]

TASK: Improve key landing page sections for more visual impact.
Only modify src/components/landing/landing-page.tsx.
Keep ALL existing logic (API calls, stats, form submission, navigation) exactly as-is.

CHANGE 1 — Stats bar (the 4 numbers section):
Find the StatCard components. Wrap them in a cleaner container:

<section className="border-y border-border bg-card">
  <div className="max-w-5xl mx-auto px-6 py-8">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {/* Keep existing StatCard components inside here */}
      {/* Update StatCard inner JSX to: */}
      {/*
        <div className="text-center">
          <div className="font-display text-4xl font-extrabold text-gradient-brand">
            {visible ? count : 0}{suffix}
          </div>
          <div className="text-[12px] text-muted-foreground font-medium mt-1.5 uppercase tracking-wide">
            {label}
          </div>
        </div>
      */}
    </div>
  </div>
</section>

CHANGE 2 — Featured jobs section:
Find the "Latest Opportunities" / featured jobs section.
Update the section wrapper to:

<section className="py-16 md:py-20 bg-background">
  <div className="max-w-6xl mx-auto px-4 sm:px-6">
    <div className="flex items-end justify-between mb-8">
      <div>
        <p className="section-eyebrow mb-2">Live opportunities</p>
        <h2 className="section-title text-foreground">{t("jobs.viewall")}</h2>
      </div>
      <button
        onClick={() => navigate("jobs")}
        className="text-[13px] font-semibold text-saffron hover:text-crimson transition-colors flex items-center gap-1"
      >
        {t("common.viewall")} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Keep existing featured job cards */}
    </div>
  </div>
</section>

CHANGE 3 — How it works section:
Find the 3-step "How IndiGate works" section.
Update to a numbered card design:

<section className="py-16 md:py-20 bg-mesh">
  <div className="max-w-5xl mx-auto px-4 sm:px-6">
    <div className="text-center mb-12">
      <p className="section-eyebrow mb-2">{t("how.subtitle")}</p>
      <h2 className="section-title text-foreground">{t("how.title")}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { num: "01", icon: UserPlus, title: t("how.1.title"), desc: t("how.1.desc") },
        { num: "02", icon: Search, title: t("how.2.title"), desc: t("how.2.desc") },
        { num: "03", icon: Plane, title: t("how.3.title"), desc: t("how.3.desc") },
      ].map((step, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-premium relative overflow-hidden">
          <span className="absolute top-4 right-5 text-[52px] font-display font-extrabold text-muted/20 leading-none select-none">
            {step.num}
          </span>
          <div className="w-11 h-11 rounded-xl bg-brand-gradient flex items-center justify-center mb-4 shadow-glow-brand">
            <step.icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-display font-bold text-[16px] text-foreground mb-2">{step.title}</h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{step.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>

CHANGE 4 — Testimonials section:
Find the marquee/scrolling testimonials.
Replace with a static 3-column card grid:

<section className="py-16 md:py-20 bg-background">
  <div className="max-w-6xl mx-auto px-4 sm:px-6">
    <div className="text-center mb-10">
      <p className="section-eyebrow mb-2">{t("testimonials.subtitle")}</p>
      <h2 className="section-title text-foreground">{t("testimonials.title")}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {testimonials.slice(0, 3).map((t) => (
        <div key={t.id} className="bg-card border border-border rounded-2xl p-6 shadow-premium flex flex-col gap-4">
          <Quote className="h-8 w-8 text-saffron/40" />
          <p className="text-[13px] text-muted-foreground leading-relaxed flex-1 italic">
            "{pick(t.content, t.contentJa)}"
          </p>
          <div className="flex items-center gap-3 pt-3 border-t border-border">
            <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white text-[13px] font-bold shrink-0">
              {t.name.charAt(0)}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-foreground">{t.name}</p>
              <p className="text-[11px] text-muted-foreground">{t.role}{t.company ? ` · ${t.company}` : ""}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

Make sure to import Quote from lucide-react if not already imported.
Keep the existing testimonials state variable (fetched from API).
Keep existing pick() function from useT().
Keep the marquee/existing code but it can be replaced with the above.

CHANGE 5 — CTA Section (bottom of page):
Find the call-to-action section near the bottom.
Replace with:

<section className="py-16 md:py-20 bg-sidebar relative overflow-hidden">
  <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />
  <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
    <h2 className="font-display text-3xl md:text-4xl font-extrabold text-sidebar-foreground mb-4 leading-tight">
      {t("cta.title")}
    </h2>
    <p className="text-sidebar-foreground/60 text-[15px] mb-8 leading-relaxed">
      {t("cta.subtitle")}
    </p>
    <MagneticButton>
      <Button
        size="lg"
        onClick={() => navigate("register")}
        className="bg-brand-gradient text-white px-8 py-3 h-auto rounded-xl font-bold text-[15px] shadow-glow-brand hover:opacity-90 transition-all"
      >
        {t("cta.button")} <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </MagneticButton>
  </div>
</section>
```

---

## FINAL TEST CHECKLIST

After running all 8 prompts, check these:

- [ ] Job cards: horizontal layout, salary box, JLPT badge, clean CTA buttons
- [ ] Jobs page: sidebar filter visible on desktop, search bar prominent
- [ ] Login page: split screen (branded panel left, form right)
- [ ] Register page: same split screen layout
- [ ] Candidate dashboard: colored metric cards, application cards (not table rows)
- [ ] Candidate dashboard: profile completion bar with gradient
- [ ] Company dashboard: pipeline view in applicants (5 columns by status)
- [ ] Company dashboard: job list as cards (not table rows)
- [ ] Admin overview: metric cards with colored icons and trend text
- [ ] Admin tables: rounded border, header styling, row hover states
- [ ] Landing page: how-it-works 3 cards with big number watermark
- [ ] Landing page: testimonials as 3 static cards (not scrolling marquee)
- [ ] Landing page: CTA section with dark background + mesh
- [ ] All pages: no broken functionality (no errors in console)
- [ ] Mobile: all pages still work at 375px width

---

*IndiGate UI/UX Redesign Prompts · Indobox Inc · Abhishek*
