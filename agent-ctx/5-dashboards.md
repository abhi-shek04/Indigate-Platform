# Task 5 — Dashboards (Candidate / Company / Admin)

Agent: Z.ai Code
Task ID: 5
Scope: Build the three premium dashboard components for the IndiGate platform.

## Files created

1. `src/components/dashboard/dashboard-shell.tsx`
   Shared layout used by all three dashboards. Exports:
   - `DashboardShell` — dark sidebar (saffron active accent + left bar), desktop
     sticky aside + mobile `Sheet` slide-in, sticky top bar with welcome text,
     `NotificationsBell`, `LocaleToggle`, and avatar slot.
   - `MetricCard`, `EmptyState`, `SectionCard`, `RoleGuard`, `CardSkeleton`,
     `MetricSkeleton`, `NavItem` type.
   - `NavList`, `SidebarHeader`, `SidebarFooter` are declared at module scope
     (NOT inside `DashboardShell`) to satisfy the `react-hooks/static-components`
     ESLint rule.

2. `src/components/dashboard/widgets.tsx`
   Reusable form widgets:
   - `SkillsInput` — tag input (Enter / "," to add, Backspace to remove, max 20).
   - `FileDropZone` — drag-and-drop upload zone with progress bar.

3. `src/components/candidate/candidate-dashboard.tsx`
   Exports `CandidateDashboard`. Tabs: overview, applications, profile, resume,
   saved. Includes role guard and `authLoading` / `!candidate` loading gate.

4. `src/components/company/company-dashboard.tsx`
   Exports `CompanyDashboard`. Tabs: overview, jobs, new, applicants, profile.
   Includes role guard, `authLoading` / `!company` loading gate, and pending-
   approval state that disables `jobs` / `new` / `applicants` tabs and shows
   a friendly pending card in the main area.

5. `src/components/admin/admin-dashboard.tsx`
   Exports `AdminDashboard`. Tabs: overview, jobs, candidates, companies,
   applications, testimonials. Includes role guard and recharts charts
   (AreaChart for apps-per-week, donut PieChart for apps-by-status).

## Key implementation notes

- All API endpoints used are existing (Task 1-4); no schema/route changes.
- Company jobs fetched via `/api/jobs?limit=50` then filtered client-side by
  `job.company.userId === user.id` (CompanyProfileDTO exposes userId).
- Company applicants filter clearing uses `useApp.setState({ companyApplicantsJobId: null })`
  because the store's `setCompanyTab` keeps the existing jobId when `opts.jobId`
  is undefined.
- After every candidate/company profile mutation we call `await refreshAuth()`
  to update the store.
- Lint passes for all Task-5 files (verified).
- `tsc --noEmit` passes for all Task-5 files (only pre-existing bcryptjs error).
- `dev.log` shows clean incremental compiles.

## Lint status

`bun run lint` reports 4 issues — **all in pre-existing Task 1-4 files**:
- `src/components/brand/logo.tsx` (unused eslint-disable warning)
- `src/components/jobs/job-detail-view.tsx` (unused eslint-disable warning)
- `src/components/layout/notifications-bell.tsx` (unused eslint-disable warning)
- `src/lib/types.ts` (empty interface error — pre-existing)

Zero issues in any Task-5 file. Per instructions, the pre-existing files were
not touched.
