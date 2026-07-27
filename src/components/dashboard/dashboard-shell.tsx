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
  /** Optional numeric badge (e.g. unread count) shown on the right. */
  badge?: number;
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
  const { t, pick } = useT();
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
        <SidebarFooter
          onGoSite={goSite}
          onLogout={handleLogout}
          logoutLabel={t("nav.logout")}
          brand={brand}
        />
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <motion.header
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="topbar sticky top-0 z-40 min-h-[56px] h-auto sm:h-14 py-1.5 sm:py-0 bg-background/95 backdrop-blur-xl border-b border-border/60"
        >
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 lg:px-8 min-h-[44px] sm:h-14">
            <div className="lg:hidden shrink-0">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button
                    aria-label={pick("Open menu", "メニューを開く")}
                    className="grid place-items-center h-9 w-9 rounded-lg border border-border/60 bg-card/80 hover:bg-card transition-colors shrink-0"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[280px] p-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border"
                >
                  <SheetTitle className="sr-only">{brand} {pick("menu", "メニュー")}</SheetTitle>
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
                  <SidebarFooter
                    onGoSite={goSite}
                    onLogout={handleLogout}
                    logoutLabel={t("nav.logout")}
                    brand={brand}
                  />
                </SheetContent>
              </Sheet>
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="font-display font-extrabold text-base sm:text-xl leading-tight truncate text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70"
              >
                {welcome}
              </motion.h1>
              {subtitle && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                  className="hidden sm:flex items-center mt-0.5"
                >
                  <span className="inline-flex items-center rounded-full bg-saffron/15 px-2.5 py-0.5 text-[10px] font-bold text-saffron uppercase tracking-[0.1em] ring-1 ring-inset ring-saffron/20">
                    {subtitle}
                  </span>
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {topbarActions}
              <div className="hidden sm:block h-6 w-px bg-border mx-1" />
              <NotificationsBell />
              <LocaleToggle />
              {avatar}
            </div>
          </div>
        </motion.header>

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
    <nav className="flex flex-col gap-1.5 px-3" aria-label={ariaLabel ?? "Dashboard navigation"}>
      {nav.map((item, i) => {
        const Icon = item.icon;
        const isActive = item.key === active;
        const isDisabled = disabledKeys.includes(item.key);
        return (
          <motion.button
            key={item.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={!isDisabled ? { scale: 1.02 } : undefined}
            whileTap={!isDisabled ? { scale: 0.98 } : undefined}
            transition={{ duration: 0.3, ease: easeOutExpo, delay: i * 0.04 }}
            disabled={isDisabled}
            onClick={() => {
              if (isDisabled) return;
              onSelect(item.key);
              onPick?.();
            }}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "nav-item outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring relative z-10",
              isActive && "active",
              isDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
            )}
          >
            {isActive && (
              <motion.div
                layoutId="nav-active"
                className="absolute inset-0 bg-saffron/15 rounded-xl border border-saffron/20 -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[60%] bg-saffron rounded-r-md shadow-[0_0_8px_rgba(var(--saffron-rgb),0.6)]" />
              </motion.div>
            )}
            <Icon className="nav-icon" />
            <span className="truncate">{item.label}</span>
            {typeof item.badge === "number" && item.badge > 0 && (
              <span
                aria-label={`${item.badge} unread`}
                className="nav-badge"
              >
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  onGoSite,
  onLogout,
  logoutLabel,
  brand,
}: {
  onGoSite: () => void;
  onLogout: () => void;
  logoutLabel: string;
  brand: string;
}) {
  const { pick } = useT();
  return (
    <div className="mt-auto px-3 pb-5 pt-4 border-t border-sidebar-border/60 flex flex-col gap-1.5">
      <motion.button
        onClick={onGoSite}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="nav-item group relative overflow-hidden"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-saffron/0 via-saffron/8 to-saffron/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        <ArrowLeft className="nav-icon transition-transform group-hover:-translate-x-0.5" />
        <span>{pick("Back to site", "サイトへ戻る")}</span>
      </motion.button>
      <motion.button
        onClick={onLogout}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="nav-item group hover:!bg-destructive/10 hover:!text-destructive transition-colors"
      >
        <LogOut className="nav-icon transition-transform group-hover:translate-x-0.5 group-hover:text-destructive" />
        <span>{logoutLabel}</span>
      </motion.button>
      <div className="mt-3 px-3 flex items-center gap-2.5">
        <img
          src="/indobox-logo.png"
          alt="IndiGate"
          className="h-6 w-6 rounded object-contain opacity-70"
        />
        <div className="flex flex-col">
          <p className="text-[11px] font-bold uppercase tracking-wide text-sidebar-foreground/60 leading-tight">
            {brand}
          </p>
          <p className="text-[9px] text-sidebar-foreground/30 leading-tight">
            IndiGate · India × Japan
          </p>
        </div>
      </div>
    </div>
  );
}

function SidebarHeader({ brand }: { brand: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
      className="relative px-5 pt-5 pb-4 border-b border-sidebar-border/60 overflow-hidden"
    >
      {/* Saffron corner accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-saffron/20 blur-3xl animate-pulse"
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
    </motion.div>
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
      className="card-premium group relative p-5 sm:p-6"
    >
      {/* Top accent line */}
      <span
        aria-hidden
        className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-saffron/60 to-transparent opacity-70 group-hover:opacity-100 transition-opacity"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">
            {label}
          </p>
          <p className="metric-num mt-2">{value}</p>
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
      className="card-premium p-10 text-center"
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
  icon: Icon,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
      className={cn("card-premium overflow-hidden", className)}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border/50 bg-muted/20 backdrop-blur-md">
          {typeof title === "string" ? (
            <h2 className="font-display font-bold text-base sm:text-lg flex items-center gap-3">
              {Icon && (
                <span className="grid place-items-center h-8 w-8 rounded-xl bg-saffron/10 text-saffron ring-1 ring-inset ring-saffron/20 shadow-sm">
                  <Icon className="h-4.5 w-4.5" />
                </span>
              )}
              {title}
            </h2>
          ) : (
            title
          )}
          {action}
        </div>
      )}
      <div className={cn("p-6 sm:p-8", bodyClassName)}>{children}</div>
    </motion.section>
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
  const { t, pick } = useT();
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
      <div className="max-w-md w-full card-premium p-8 text-center">
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
    <div className="card-premium p-5 sm:p-6">
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
    <div className="card-premium p-5 sm:p-6">
      <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
      <div className="mt-3 h-8 w-1/3 bg-muted rounded animate-pulse" />
    </div>
  );
}
