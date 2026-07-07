"use client";

import { useState, type ReactNode } from "react";
import { useApp, type View } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { LocaleToggle } from "@/components/layout/locale-toggle";
import { cn } from "@/lib/utils";
import { LogOut, Menu, ArrowLeft, type LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { easeOutExpo } from "@/lib/motion";

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardShellProps {
  /** brand name shown in sidebar header (e.g. "Candidate", "Company", "Admin") */
  brand: string;
  /** nav items */
  nav: NavItem[];
  /** active nav key */
  active: string;
  /** change handler */
  onSelect: (key: string) => void;
  /** welcome line at top */
  welcome: string;
  /** subtitle below welcome */
  subtitle?: string;
  /** avatar / role pill shown next to bell */
  avatar?: ReactNode;
  /** optional extra slot in topbar (e.g. quick action button) */
  topbarActions?: ReactNode;
  /** which non-nav items to disable (e.g. while pending) */
  disabledKeys?: string[];
  /** page content */
  children: ReactNode;
}

export function DashboardShell({
  brand,
  nav,
  active,
  onSelect,
  welcome,
  subtitle,
  avatar,
  topbarActions,
  disabledKeys = [],
  children,
}: DashboardShellProps) {
  const { t } = useT();
  const logout = useApp((s) => s.logout);
  const navigate = useApp((s) => s.navigate);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    void logout();
    navigate("home");
  }

  function goSite() {
    navigate("home");
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col bg-sidebar text-sidebar-foreground sticky top-0 h-screen border-r border-sidebar-border">
        <SidebarHeader brand={brand} />
        <div className="flex-1 overflow-y-auto scroll-area py-4">
          <NavList
            nav={nav}
            active={active}
            onSelect={onSelect}
            disabledKeys={disabledKeys}
          />
        </div>
        <SidebarFooter onGoSite={goSite} onLogout={handleLogout} logoutLabel={t("nav.logout")} />
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open menu"
              className="grid place-items-center h-10 w-10 rounded-lg hover:bg-accent transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[280px] p-0 bg-sidebar text-sidebar-foreground flex flex-col"
          >
            <SheetTitle className="sr-only">{brand} menu</SheetTitle>
            <SidebarHeader brand={brand} />
            <div className="flex-1 overflow-y-auto scroll-area py-4">
              <NavList
                nav={nav}
                active={active}
                onSelect={onSelect}
                disabledKeys={disabledKeys}
                onPick={() => setMobileOpen(false)}
              />
            </div>
            <SidebarFooter onGoSite={goSite} onLogout={handleLogout} logoutLabel={t("nav.logout")} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 h-16">
            <div className="lg:hidden">
              {/* Spacer for mobile menu button which is rendered by each dashboard */}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display font-extrabold text-lg sm:text-xl leading-tight truncate">
                {welcome}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {topbarActions}
              <div className="hidden sm:block h-6 w-px bg-border mx-1" />
              <NotificationsBell />
              <LocaleToggle />
              {avatar}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: easeOutExpo }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function NavList({
  nav,
  active,
  onSelect,
  disabledKeys = [],
  onPick,
  ariaLabel,
}: {
  nav: NavItem[];
  active: string;
  onSelect: (key: string) => void;
  disabledKeys?: string[];
  onPick?: () => void;
  ariaLabel?: string;
}) {
  return (
    <nav className="flex flex-col gap-1 px-3" aria-label={ariaLabel ?? "Dashboard navigation"}>
      {nav.map((item) => {
        const Icon = item.icon;
        const isActive = item.key === active;
        const isDisabled = disabledKeys.includes(item.key);
        return (
          <button
            key={item.key}
            disabled={isDisabled}
            onClick={() => {
              if (isDisabled) return;
              onSelect(item.key);
              onPick?.();
            }}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all outline-none",
              "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              isDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="sidebar-active"
                aria-hidden
                className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-brand-gradient"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Icon
              className={cn(
                "h-[1.05rem] w-[1.05rem] shrink-0 transition-colors",
                isActive
                  ? "text-saffron"
                  : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground",
              )}
            />
            <span className="truncate">{item.label}</span>
            {isActive && (
              <span
                aria-hidden
                className="ml-auto h-1.5 w-1.5 rounded-full bg-saffron shadow-glow-brand"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  onGoSite,
  onLogout,
  logoutLabel,
}: {
  onGoSite: () => void;
  onLogout: () => void;
  logoutLabel: string;
}) {
  return (
    <div className="mt-auto px-3 pb-5 pt-4 border-t border-sidebar-border/60 flex flex-col gap-1">
      <button
        onClick={onGoSite}
        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
      >
        <ArrowLeft className="h-[1.05rem] w-[1.05rem] transition-transform group-hover:-translate-x-0.5" />
        <span>Back to site</span>
      </button>
      <button
        onClick={onLogout}
        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-sidebar-accent-foreground transition-colors"
      >
        <LogOut className="h-[1.05rem] w-[1.05rem] transition-transform group-hover:translate-x-0.5" />
        <span>{logoutLabel}</span>
      </button>
    </div>
  );
}

function SidebarHeader({ brand }: { brand: string }) {
  return (
    <div className="relative px-5 pt-5 pb-4 border-b border-sidebar-border/60 overflow-hidden">
      {/* Saffron corner accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-saffron/15 blur-2xl"
      />
      <Logo
        size={34}
        textClassName="text-sidebar-foreground text-[1.2rem]"
      />
      <div className="mt-3 flex items-center gap-2">
        <span className="h-1 w-6 rounded-full bg-brand-gradient" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron">
          {brand} portal
        </p>
      </div>
    </div>
  );
}

/* ---------- shared small UI helpers ---------- */

export function MetricCard({
  label,
  value,
  icon: Icon,
  accent = "saffron",
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "saffron" | "crimson" | "emerald" | "violet" | "sky" | "amber";
  hint?: string;
}) {
  const accentMap: Record<string, string> = {
    saffron: "bg-saffron/15 text-saffron",
    crimson: "bg-crimson/15 text-crimson",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    sky: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
      whileHover={{ y: -4 }}
      className="group rounded-2xl border border-border bg-card shadow-premium p-5 sm:p-6 transition-shadow hover:shadow-glow-brand"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold leading-none">
            {value}
          </p>
          {hint && (
            <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "grid place-items-center h-11 w-11 rounded-xl shrink-0",
            accentMap[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
      className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center"
    >
      <div className="mx-auto mb-4 grid place-items-center h-14 w-14 rounded-2xl bg-muted text-muted-foreground">
        <Icon className="h-6 w-6 animate-bob" />
      </div>
      <p className="font-display font-bold text-lg">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </motion.div>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card shadow-premium",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-border">
          {typeof title === "string" ? (
            <h2 className="font-display font-bold text-base sm:text-lg">{title}</h2>
          ) : (
            title
          )}
          {action}
        </div>
      )}
      <div className={cn("p-5 sm:p-6", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Guard wrapper shown when the wrong role is logged in */
export function RoleGuard({
  expected,
  navigateView = "login",
}: {
  expected: string;
  navigateView?: View;
}) {
  const { t } = useT();
  const navigate = useApp((s) => s.navigate);
  const user = useApp((s) => s.user);
  const roleLabel =
    expected === "CANDIDATE"
      ? "candidate"
      : expected === "COMPANY"
        ? "company"
        : "admin";

  return (
    <div className="min-h-screen bg-mesh grid place-items-center px-4 py-16">
      <div className="max-w-md w-full rounded-3xl border border-border bg-card shadow-premium p-8 text-center">
        <div className="mx-auto mb-5 grid place-items-center h-16 w-16 rounded-2xl bg-brand-gradient shadow-glow-brand text-white">
          <LockIcon />
        </div>
        <h1 className="font-display font-extrabold text-2xl">
          {user ? "Access restricted" : "Please log in"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {user
            ? `This area is for ${roleLabel} accounts only. Log out and sign in with a ${roleLabel} account to continue.`
            : `You need to log in as a ${roleLabel} to view this dashboard.`}
        </p>
        <Button
          className="mt-6 w-full bg-brand-gradient text-white hover:opacity-90"
          onClick={() => navigate(navigateView)}
        >
          {user ? "Back to home" : t("nav.login")}
        </Button>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-7 w-7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-premium p-5 sm:p-6">
      <div className="h-5 w-1/3 bg-muted rounded animate-pulse" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-4 w-full bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function MetricSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-premium p-5 sm:p-6">
      <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
      <div className="mt-3 h-8 w-1/3 bg-muted rounded animate-pulse" />
    </div>
  );
}
