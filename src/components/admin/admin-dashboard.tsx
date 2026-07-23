"use client";

import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import {
  DashboardShell,
  RoleGuard,
} from "@/components/dashboard/dashboard-shell";
import { NAV } from "@/components/admin/shared";
import { Overview } from "@/components/admin/tabs/overview";
import { JobsTab } from "@/components/admin/tabs/jobs";
import { CandidatesTab } from "@/components/admin/tabs/candidates";
import { CompaniesTab } from "@/components/admin/tabs/companies";
import { ApplicationsTab } from "@/components/admin/tabs/applications";
import { TestimonialsTab } from "@/components/admin/tabs/testimonials";
import { ContactsTab } from "@/components/admin/tabs/contacts";
import { UsersTab } from "@/components/admin/tabs/users";
import { AuditLogTab } from "@/components/admin/tabs/audit";
import { AlertsTab } from "@/components/admin/tabs/alerts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminDashboard() {
  const user = useApp((s) => s.user);
  const tab = useApp((s) => s.adminTab);
  const setTab = useApp((s) => s.setAdminTab);
  const { t } = useT();

  if (!user || user.role !== "ADMIN") {
    return <RoleGuard expected="ADMIN" />;
  }

  return (
    <DashboardShell
      brand="Admin"
      nav={NAV}
      active={tab}
      onSelect={(k) => setTab(k as typeof tab)}
      welcome={t("admin.title")}
      subtitle="Platform oversight & moderation"
      avatar={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-border hover:opacity-80 transition-opacity outline-none cursor-pointer">
              <div className="grid place-items-center h-8 w-8 rounded-lg bg-brand-gradient text-white text-xs font-bold">
                AD
              </div>
              <span className="text-sm font-semibold leading-tight">Admin</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => useApp.getState().logout()} className="cursor-pointer">
              {t("nav.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      {tab === "overview" && <Overview />}
      {tab === "jobs" && <JobsTab />}
      {tab === "candidates" && <CandidatesTab />}
      {tab === "companies" && <CompaniesTab />}
      {tab === "applications" && <ApplicationsTab />}
      {tab === "testimonials" && <TestimonialsTab />}
      {tab === "contacts" && <ContactsTab />}
      {tab === "users" && <UsersTab />}
      {tab === "audit" && <AuditLogTab />}
      {tab === "alerts" && <AlertsTab />}
    </DashboardShell>
  );
}
