"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { Logo, CandidateAvatar } from "@/components/brand/logo";
import { LocaleToggle } from "./locale-toggle";
import { ThemeToggle } from "./theme-toggle";
import { NotificationsBell } from "./notifications-bell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, LayoutDashboard, Briefcase, Building2, ShieldCheck, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { View } from "@/lib/store";
import { motion } from "framer-motion";

export function Navbar() {
  const { t, pick } = useT();
  const { user, navigate, logout, view } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems: { label: string; view: View }[] = [
    { label: t("nav.jobs"), view: "jobs" },
    { label: pick("How it works", "仕組み"), view: "how-it-works" },
    { label: t("nav.forCompanies"), view: "for-companies" },
    { label: t("nav.about"), view: "about" },
    { label: t("nav.contact"), view: "contact" },
  ];

  function go(v: View) {
    navigate(v);
    setMobileOpen(false);
    if (v !== "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function dashboardView(): View {
    if (!user) return "login";
    if (user.role === "CANDIDATE") return "candidate";
    if (user.role === "COMPANY") return "company";
    return "admin";
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full max-w-full overflow-x-hidden transition-all duration-500",
        scrolled
          ? "border-b border-border/50 bg-background/85 backdrop-blur-xl shadow-[0_1px_0_0_color-mix(in_oklch,var(--border)_60%,transparent)] shadow-premium"
          : "border-b border-transparent bg-background/20 backdrop-blur-sm",
      )}
    >
      {scrolled && (
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-saffron/40 to-transparent" />
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-6">

          {/* ── LOGO ─────────────────────────────────────────── */}
          <button
            onClick={() => go("home")}
            className="flex items-center gap-0 shrink-0 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/40 rounded-lg"
            aria-label={pick("IndiGate home", "IndiGateホーム")}
          >
            <Logo />
          </button>

          {/* ── DESKTOP NAV ──────────────────────────────────── */}
          <nav className="hidden md:flex items-center" aria-label={pick("Main navigation", "メインナビゲーション")}>
            <div className="flex items-center gap-0.5 rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-1 shadow-sm">
              {navItems.map((item) => {
                const isActive = view === item.view;
                return (
                  <button
                    key={item.label}
                    onClick={() => go(item.view)}
                    className={cn(
                      "relative px-3.5 py-1.5 text-[13px] rounded-lg transition-all whitespace-nowrap",
                      isActive
                        ? "font-semibold text-foreground bg-saffron/8 shadow-sm"
                        : "font-medium text-foreground/60 hover:text-foreground hover:bg-accent/70",
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-brand-gradient"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* ── RIGHT ACTIONS ─────────────────────────────────── */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggle />
            <LocaleToggle className="hidden sm:inline-flex" />
            
            <a
              href="https://www.indobox-academy.in"
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-saffron/40 hover:text-foreground transition-all ml-1 mr-1"
            >
              {pick("Academy", "アカデミー")}
              <ExternalLink className="h-3 w-3 opacity-50" />
            </a>

            <NotificationsBell />

            {user ? (
              /* ── USER MENU ── */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn(
                    "ml-1 flex items-center gap-2.5 rounded-full border border-border/60 pl-1.5 pr-3 py-1",
                    "bg-card/80 hover:bg-card hover:border-saffron/30 hover:shadow-sm",
                    "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/40",
                  )}>
                    <CandidateAvatar name={user.name || user.email} size={28} />
                    <span className="hidden sm:block text-[13px] font-medium max-w-[100px] truncate">
                      {user.name || user.email.split("@")[0]}
                    </span>
                    <span className={cn(
                      "hidden sm:block h-1.5 w-1.5 rounded-full",
                      user.role === "CANDIDATE" ? "bg-saffron" :
                      user.role === "COMPANY" ? "bg-sky-400" : "bg-crimson"
                    )} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 p-1.5" sideOffset={6}>
                  <div className="px-2.5 py-2.5 mb-1 rounded-lg bg-muted/60 border border-border/60">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-0.5">
                      {user.role}
                    </p>
                    <p className="text-[13px] font-semibold truncate">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={() => go(dashboardView())} className="cursor-pointer rounded-lg gap-2.5 py-2">
                    <div className="grid place-items-center h-6 w-6 rounded-md bg-saffron/10 text-saffron">
                      <LayoutDashboard className="h-3.5 w-3.5" />
                    </div>
                    {t("nav.dashboard")}
                  </DropdownMenuItem>
                  {user.role === "CANDIDATE" && (
                    <DropdownMenuItem onClick={() => go("jobs")} className="cursor-pointer rounded-lg gap-2.5 py-2">
                      <div className="grid place-items-center h-6 w-6 rounded-md bg-saffron/10 text-saffron">
                        <Briefcase className="h-3.5 w-3.5" />
                      </div>
                      {t("nav.jobs")}
                    </DropdownMenuItem>
                  )}
                  {user.role === "COMPANY" && (
                    <DropdownMenuItem onClick={() => go("company")} className="cursor-pointer rounded-lg gap-2.5 py-2">
                      <div className="grid place-items-center h-6 w-6 rounded-md bg-sky-400/10 text-sky-400">
                        <Building2 className="h-3.5 w-3.5" />
                      </div>
                      {t("dash.company.overview")}
                    </DropdownMenuItem>
                  )}
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem onClick={() => go("admin")} className="cursor-pointer rounded-lg gap-2.5 py-2">
                      <div className="grid place-items-center h-6 w-6 rounded-md bg-crimson/10 text-crimson">
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </div>
                      {t("admin.title")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer rounded-lg gap-2.5 py-2 text-destructive focus:text-destructive focus:bg-destructive/8"
                  >
                    <div className="grid place-items-center h-6 w-6 rounded-md bg-destructive/10 text-destructive">
                      <LogOut className="h-3.5 w-3.5" />
                    </div>
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* ── AUTH BUTTONS ── */
              <div className="hidden sm:flex items-center gap-2 ml-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => go("login")}
                  className="h-8 px-3.5 text-[13px] font-medium text-foreground/70 hover:text-foreground"
                >
                  {t("nav.login")}
                </Button>
                <Button size="sm" onClick={() => go("register")}
                  className="bg-brand-gradient text-white hover:opacity-90 font-bold shadow-glow-brand transition-opacity rounded-xl h-9 px-4 text-xs">
                  {pick("Get started", "無料で始める")}
                </Button>
              </div>
            )}

            {/* ── MOBILE MENU ── */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden grid place-items-center h-9 w-9 rounded-lg border border-border/60 bg-card/80 hover:bg-card transition-all"
                  aria-label={pick("Menu", "メニュー")}
                >
                  <Menu className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0 border-l border-border/60 flex flex-col">
                <SheetHeader className="px-5 py-4 border-b border-border/60">
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col flex-1 overflow-y-auto">
                  <nav className="flex-1 px-3 py-3 space-y-0.5">
                    {navItems.map((item, i) => {
                      const isActive = view === item.view;
                      return (
                        <motion.button
                          key={item.label}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: 0.05 + i * 0.04 }}
                          onClick={() => go(item.view)}
                          className={cn(
                            "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors",
                            isActive
                              ? "bg-saffron/10 text-foreground"
                              : "text-foreground/70 hover:text-foreground hover:bg-accent",
                          )}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="mobile-nav-active"
                              className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full bg-brand-gradient"
                            />
                          )}
                          <span className="font-mono text-[9px] font-bold text-muted-foreground/40 w-4 text-right">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-1 text-left">{item.label}</span>
                          {isActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-saffron" />
                          )}
                        </motion.button>
                      );
                    })}
                  </nav>

                  {/* Mobile footer */}
                  <div className="border-t border-border/60 px-3 py-4 space-y-3">
                    <a
                      href="https://www.indobox-academy.in"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-card rounded-lg border border-border/60"
                    >
                      Indobox Academy
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                    
                    <div className="flex items-center gap-2 w-full">
                      <LocaleToggle className="justify-start flex-1" />
                      <ThemeToggle />
                    </div>
                    {!user && (
                      <div className="space-y-2 mt-2">
                        <Button variant="outline" className="w-full h-10 rounded-xl text-[13px]" onClick={() => go("login")}>
                          {t("nav.login")}
                        </Button>
                        <Button onClick={() => go("register")}
                          className="w-full bg-brand-gradient text-white hover:opacity-90 font-bold shadow-glow-brand transition-opacity rounded-xl h-10 px-4 text-[13px]">
                          Get started
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

          </div>
        </div>
      </div>
    </header>
  );
}
