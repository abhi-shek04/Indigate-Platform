"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { Logo, CandidateAvatar } from "@/components/brand/logo";
import { LocaleToggle } from "./locale-toggle";
import { NotificationsBell } from "./notifications-bell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, LayoutDashboard, Briefcase, Building2, ShieldCheck, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { View } from "@/lib/store";
import { motion } from "framer-motion";

export function Navbar() {
  const { t } = useT();
  const { user, navigate, logout, view } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems: { label: string; view: View; external?: boolean }[] = [
    { label: t("nav.home"), view: "home" },
    { label: t("nav.jobs"), view: "jobs" },
    { label: "How it works", view: "how-it-works" },
    { label: t("nav.forCompanies"), view: "for-companies" },
    { label: t("nav.about"), view: "about" },
    { label: t("nav.contact"), view: "contact" },
    { label: "Indobox Academy", view: "home", external: true },
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
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "glass border-b border-border/60 bg-background/80 backdrop-blur-md shadow-premium"
          : "bg-background/40 backdrop-blur-sm border-b border-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <button
            onClick={() => go("home")}
            className="flex items-center rounded-lg px-1 py-1 transition-opacity hover:opacity-90"
            aria-label="IndiGate home"
          >
            <Logo />
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = !item.external && view === item.view;
              if (item.external) {
                return (
                  <a
                    key={item.label}
                    href="https://www.indobox-academy.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all text-foreground/70 hover:text-foreground hover:bg-accent/60 inline-flex items-center gap-1"
                  >
                    {item.label}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                );
              }
              return (
                <button
                  key={item.label}
                  onClick={() => go(item.view)}
                  className={cn(
                    "relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all",
                    isActive
                      ? "text-crimson bg-saffron/5"
                      : "text-foreground/70 hover:text-foreground hover:bg-accent/60",
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-brand-gradient"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <LocaleToggle className="hidden sm:inline-flex" />
            <NotificationsBell />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 hover:bg-accent transition-colors">
                    <CandidateAvatar
                      name={user.name || user.email}
                      size={30}
                    />
                    <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                      {user.name || user.email.split("@")[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => go(dashboardView())}
                    className="cursor-pointer"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t("nav.dashboard")}
                  </DropdownMenuItem>
                  {user.role === "CANDIDATE" && (
                    <DropdownMenuItem
                      onClick={() => go("jobs")}
                      className="cursor-pointer"
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      {t("nav.jobs")}
                    </DropdownMenuItem>
                  )}
                  {user.role === "COMPANY" && (
                    <DropdownMenuItem
                      onClick={() => go("company")}
                      className="cursor-pointer"
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      {t("dash.company.overview")}
                    </DropdownMenuItem>
                  )}
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem
                      onClick={() => go("admin")}
                      className="cursor-pointer"
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      {t("admin.title")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => go("login")}
                  className="font-medium"
                >
                  {t("nav.login")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => go("register")}
                  className="bg-brand-gradient text-white hover:opacity-90 font-semibold shadow-glow-brand"
                >
                  {t("nav.signup")}
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden grid place-items-center h-10 w-10 rounded-lg hover:bg-accent transition-colors"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <SheetHeader className="px-5 pt-5">
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 px-3 flex flex-col gap-1">
                  {navItems.map((item, i) => {
                    const isActive = !item.external && view === item.view;
                    if (item.external) {
                      return (
                        <motion.a
                          key={item.label}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: 0.04 + i * 0.04 }}
                          href="https://www.indobox-academy.in"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative text-left px-3.5 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 text-foreground/80 hover:bg-accent hover:text-foreground"
                        >
                          <span className="font-mono text-[10px] text-muted-foreground/70">0{i + 1}</span>
                          {item.label}
                          <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                        </motion.a>
                      );
                    }
                    return (
                      <motion.button
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: 0.04 + i * 0.04 }}
                        onClick={() => go(item.view)}
                        className={cn(
                          "relative text-left px-3.5 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3",
                          isActive
                            ? "bg-saffron/10 text-crimson"
                            : "text-foreground/80 hover:bg-accent hover:text-foreground",
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="mobile-nav-active"
                            className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-brand-gradient"
                          />
                        )}
                        <span className="font-mono text-[10px] text-muted-foreground/70">0{i + 1}</span>
                        {item.label}
                      </motion.button>
                    );
                  })}
                  <div className="my-3 h-px bg-border" />
                  <LocaleToggle className="justify-start w-full" />
                  {!user && (
                    <>
                      <Button
                        className="mt-2 w-full h-11 rounded-xl"
                        variant="outline"
                        onClick={() => {
                          go("login");
                        }}
                      >
                        {t("nav.login")}
                      </Button>
                      <Button
                        className="mt-2 w-full h-11 rounded-xl bg-brand-gradient text-white shadow-glow-brand"
                        onClick={() => go("register")}
                      >
                        {t("nav.signup")}
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
