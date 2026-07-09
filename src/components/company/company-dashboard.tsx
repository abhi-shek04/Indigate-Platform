"use client";

import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { DashboardShell, RoleGuard } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { CompanyAvatar } from "@/components/brand/logo";
import { Plus } from "lucide-react";
import { NAV, PendingState } from "./shared";
import { Overview } from "./tabs/overview";
import { Jobs } from "./tabs/jobs";
import { NewJob } from "./tabs/new-job";
import { Applicants } from "./tabs/applicants";
import { TalentSearch } from "./tabs/talent-search";
import { Analytics } from "./tabs/analytics";
import { Profile } from "./tabs/profile";

export function CompanyDashboard() {
  const user = useApp((s) => s.user);
  const company = useApp((s) => s.company);
  const authLoading = useApp((s) => s.authLoading);
  const tab = useApp((s) => s.companyTab);
  const setTab = useApp((s) => s.setCompanyTab);
  const { t } = useT();

  if (!user || user.role !== "COMPANY") {
    return <RoleGuard expected="COMPANY" />;
  }

  // Wait for the company profile to load before deciding pending state.
  if (authLoading || !company) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-saffron border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const welcome = t("dash.company.welcome", {
    name: company?.companyName || user.name || user.email,
  });
  const subtitle = company?.locationJapan
    ? `${company.locationJapan}${company.industry ? " · " + company.industry : ""}`
    : company?.industry ?? undefined;

  const pending = company?.isApproved === false;

  // While pending, only overview + profile are usable
  const disabled = pending ? ["jobs", "new", "applicants"] : [];

  return (
    <DashboardShell
      brand="Company"
      nav={NAV}
      active={tab}
      onSelect={(k) => setTab(k as typeof tab)}
      welcome={welcome}
      subtitle={subtitle}
      disabledKeys={disabled}
      avatar={
        <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-border">
          <CompanyAvatar
            name={company?.companyName || "?"}
            color={company?.logoUrl}
            size={32}
          />
        </div>
      }
      topbarActions={
        !pending && (
          <Button
            size="sm"
            className="hidden sm:inline-flex bg-brand-gradient text-white hover:opacity-90"
            onClick={() => setTab("new")}
          >
            <Plus className="h-4 w-4" />
            {t("dash.company.new")}
          </Button>
        )
      }
    >
      {pending && tab !== "overview" && tab !== "profile" ? (
        <PendingState />
      ) : (
        <>
          {tab === "overview" && <Overview />}
          {tab === "jobs" && <Jobs />}
          {tab === "new" && <NewJob />}
          {tab === "applicants" && <Applicants />}
          {tab === "talent" && <TalentSearch />}
          {tab === "analytics" && <Analytics />}
          {tab === "profile" && <Profile />}
        </>
      )}
    </DashboardShell>
  );
}
