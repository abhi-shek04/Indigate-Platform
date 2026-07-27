"use client";

import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { DashboardShell, RoleGuard, type NavItem } from "@/components/dashboard/dashboard-shell";
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
import { MessagesView } from "@/components/messages/messages-view";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CompanyDashboard() {
  const user = useApp((s) => s.user);
  const company = useApp((s) => s.company);
  const authLoading = useApp((s) => s.authLoading);
  const tab = useApp((s) => s.companyTab);
  const setTab = useApp((s) => s.setCompanyTab);
  const unread = useApp((s) => s.messageUnreadCount);
  const { t, pick } = useT();

  // Overlay the i18n label + live unread badge on the nav entries.
  const nav: NavItem[] = useMemo(
    () =>
      NAV.map((item) => {
        let label = item.label;
        if (item.key === "overview") label = pick("Overview", "概要");
        else if (item.key === "jobs") label = pick("My Jobs", "求人一覧");
        else if (item.key === "new") label = pick("Post New Job", "求人を投稿");
        else if (item.key === "applicants") label = pick("Applicants", "応募者");
        else if (item.key === "talent") label = pick("Find Talent", "タレント検索");
        else if (item.key === "analytics") label = pick("Analytics", "分析");
        else if (item.key === "messages") label = t("dash.messages");
        else if (item.key === "profile") label = pick("Company Profile", "会社情報");

        return {
          ...item,
          label,
          ...(item.key === "messages" ? { badge: unread } : {})
        };
      }),
    [t, pick, unread],
  );

  if (!user || user.role !== "COMPANY") {
    return <RoleGuard expected="COMPANY" />;
  }

  // Wait for the company profile to load before deciding pending state.
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh flex-col gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-saffron border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh flex-col gap-4">
        <div className="p-6 bg-white rounded-2xl shadow border max-w-sm text-center">
          <h2 className="text-lg font-semibold mb-2">{pick("Profile Not Found", "プロフィールが見つかりません")}</h2>
          <p className="text-sm text-muted-foreground mb-4">{pick("Your company profile is missing or corrupted. Please log out and contact support.", "会社プロフィールが存在しないか破損しています。ログアウトしてサポートにお問い合わせください。")}</p>
          <Button onClick={() => useApp.getState().logout()}>{pick("Log Out", "ログアウト")}</Button>
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
      nav={nav}
      active={tab}
      onSelect={(k) => setTab(k as typeof tab)}
      welcome={welcome}
      subtitle={subtitle}
      disabledKeys={disabled}
      avatar={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-border hover:opacity-80 transition-opacity outline-none cursor-pointer">
              <CompanyAvatar
                name={company?.companyName || "?"}
                color={company?.logoUrl}
                size={32}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTab("profile")} className="cursor-pointer">
              {pick("Profile", "会社情報")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => useApp.getState().logout()} className="cursor-pointer">
              {t("nav.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
