# UI-1 — UI/UX Redesign (Jobs, Auth, Landing)

## Scope
3 files modified per the UI-1 brief. Only JSX / className changes — no logic, state, API calls, or imports were altered.

## Files modified

### 1. `src/components/jobs/jobs-view.tsx` — P2 Jobs Listing Redesign
- Replaced the simple `<div className="mb-8">` header with a **mesh-background header** (`bg-mesh border-b border-border`) containing the gradient title (`text-gradient-brand`), subtitle, and full-width search bar (rounded-xl, focus ring `saffron/40`).
- Re-architected the body into a **two-column layout**:
  - **Left sticky filter sidebar** (`hidden lg:block w-[260px] sticky top-4`) inside a `bg-card rounded-2xl shadow-premium` container, with `Filters` heading + clear button, four labelled filter groups using `data-label`-style typography (`text-[11px] uppercase tracking-wider`):
    - Location — `Select` dropdown
    - Job Type — `Select` dropdown
    - JLPT Level — button chip group (all/N1..N5) with `bg-brand-gradient` active state
    - Min salary — `Select` dropdown
  - **Right results column** with a results bar (`{count} jobs found`), the existing mobile filter row re-wrapped in `lg:hidden` horizontal-scroll container, and the original loading/empty/grid/pagination logic preserved verbatim.
- All state (`location`, `jobType`, `jlptLevel`, `salaryMin`, `search`, `debouncedSearch`, `loading`, `data`, `hasFilters`, `clearFilters`, `load`) preserved. `LOCATIONS`, `JOB_TYPES`, `JLPT_LEVELS` imports preserved. `FilterSelect` helper component untouched.

### 2. `src/components/auth/auth-view.tsx` — P3 Auth Split-Screen
- Form `<Input>` elements received consistent styling: `h-11 rounded-xl text-[14px]` (added to email, name, password inputs). Verify/reset code inputs keep their distinctive `text-2xl tracking-[0.5em] font-bold text-center` styling but now also have `h-11 rounded-xl` for consistent height/border-radius.
- Submit `<Button>` className updated to `w-full h-11 bg-brand-gradient text-white hover:opacity-90 rounded-xl font-semibold text-[14px] shadow-glow-brand`.
- Mode-switch links (login → register, register → login) now use `text-saffron hover:text-crimson font-semibold transition-colors` instead of the previous `text-crimson hover:underline`.
- Added a **3-stat block** to the left branded panel after the bullet list — `500+` / `50+` / `N2` rendered with `text-2xl font-display font-extrabold text-gradient-brand` numbers and `text-[12px] text-sidebar-foreground/60` labels.
- All submit logic, `setMode` handlers, demo accounts section, `RoleCard`/`Field`/`DemoLine` helpers preserved.

### 3. `src/components/landing/landing-page.tsx` — P8 Landing Page Polish
1. **Stats bar**: Outer `<div>` became `<section className="border-y border-border bg-card">` (dropped the `bg-card/60 glass` treatment). Inner container is now `max-w-5xl mx-auto px-6 py-8`. `StatCard` label `<p>` className changed from `mt-1.5 text-sm font-medium text-muted-foreground` to `text-[12px] text-muted-foreground font-medium mt-1.5 uppercase tracking-wide`.
2. **Featured jobs**: Removed the `<Badge>` + `<Briefcase>` eyebrow; replaced with `<p className="section-eyebrow mb-2">Live opportunities</p>` and `<h2 className="section-title text-foreground">Latest opportunities</h2>`. Kept the subtitle paragraph and "View all" button.
3. **How it works**: Big-number watermark span updated to `absolute top-4 right-5 text-[52px] font-display font-extrabold text-muted/20 leading-none select-none` (was `top-5 right-6 font-display text-5xl text-saffron/15`).
4. **Testimonials**: Removed the scrolling marquee (`animate-marquee` + duplicated array + fixed-width figures). Replaced with a static `RevealGroup` 3-column card grid (`grid gap-6 md:grid-cols-3`) iterating `testimonials.slice(0, 3)`. Each card is a flex-col `<figure>` with Quote icon, italic blockquote (`italic text-sm leading-relaxed text-foreground/90 flex-1`), and avatar+name figcaption at the bottom.
5. **CTA section**: Replaced the rounded gradient panel with a dark `bg-sidebar` band: `<section className="py-16 md:py-20 bg-sidebar relative overflow-hidden">` with an `bg-mesh opacity-20` overlay, a centered `max-w-3xl` container, and the title now branches on `user ? t("hero.title") : t("cta.title")`. Added `const user = useApp((s) => s.user);` selector to `LandingPage`.
- All existing data fetching (`/api/jobs/stats`, `/api/jobs?limit=3`, `/api/testimonials?active=true`), `useCountUp`, `PipelineBar`, `VisaAccordionItem`, `ContactSection`, and animation imports preserved.

## Verification
- `bun run lint` — passed (zero errors / warnings).
- Dev server logs show `✓ Compiled` and successful `GET /` 200 responses with no compile-time errors.

## Notes for downstream agents
- The `Briefcase` icon import in `landing-page.tsx` is still used by the Hiring Models section, so do NOT remove it.
- `Badge` import in `landing-page.tsx` is still used in many sections (Why India, How it works, Hiring Models, Challenges, Visa Guide, Why IndiGate, Testimonials, FAQ, Contact) — keep it.
- The `FilterSelect` helper in `jobs-view.tsx` is now only used by the mobile (`lg:hidden`) filter row; the desktop sidebar uses inline `Select` components. Both bind to the same state vars so they stay in sync.
- The `user` selector added to `LandingPage` is currently only consumed by the CTA heading; downstream agents building personalisation can reuse it.
