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
import { Menu, LogOut, LayoutDashboard, Briefcase, Building2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { View } from "@/lib/store";

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

  const navItems: { label: string; view: View }[] = [
    { label: t("nav.home"), view: "home" },
    { label: t("nav.jobs"), view: "jobs" },
    { label: t("nav.forCompanies"), view: "for-companies" },
    { label: t("nav.about"), view: "about" },
    { label: t("nav.contact"), view: "home" },
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
          ? "glass border-b border-border/60 shadow-premium"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <button
            onClick={() => go("home")}
            className="flex items-center"
            aria-label="IndiGate home"
          >
            <Logo />
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => go(item.view)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  view === item.view
                    ? "text-crimson bg-crimson/5"
                    : "text-foreground/80 hover:text-foreground hover:bg-accent",
                )}
              >
                {item.label}
              </button>
            ))}
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
                  className="md:hidden grid place-items-center h-9 w-9 rounded-lg hover:bg-accent"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-1">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => go(item.view)}
                      className="text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="my-2 h-px bg-border" />
                  <LocaleToggle className="justify-start w-full" />
                  {!user && (
                    <>
                      <Button
                        className="mt-2 w-full"
                        variant="outline"
                        onClick={() => {
                          go("login");
                        }}
                      >
                        {t("nav.login")}
                      </Button>
                      <Button
                        className="mt-2 w-full bg-brand-gradient text-white"
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
