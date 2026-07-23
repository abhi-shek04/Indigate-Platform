"use client";

import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { formatRelative } from "@/lib/api-client";
import {
  MetricCard,
  MetricSkeleton,
  SectionCard,
  EmptyState,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CandidateAvatar } from "@/components/brand/logo";
import {
  Briefcase,
  Send,
  Star,
  Trophy,
  ArrowRight,
  Plus,
  Users,
  Clock,
  type LucideIcon,
} from "lucide-react";
import type { ApplicationStatus } from "@/lib/types";
import { STATUS_BADGE } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCompanyJobs, useCompanyApps } from "../shared";

/** Status → dot/text color (mirrors candidate overview). */
const STATUS_COLORS: Record<ApplicationStatus, { dot: string; text: string }> = {
  APPLIED: { dot: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" },
  SHORTLISTED: { dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  INTERVIEWED: { dot: "bg-violet-500", text: "text-violet-600 dark:text-violet-400" },
  OFFERED: { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  REJECTED: { dot: "bg-crimson", text: "text-crimson" },
  WITHDRAWN: { dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

export function Overview() {
  const company = useApp((s) => s.company);
  const setTab = useApp((s) => s.setCompanyTab);
  const { t, locale, pick } = useT();
  const { jobs, loading: jobsLoading } = useCompanyJobs();
  const { apps, loading: appsLoading } = useCompanyApps();

  const pending = company?.isApproved === false;
  const activeJobs = (jobs ?? []).filter((j) => j.isActive).length;
  const totalApps = apps?.length ?? 0;
  const shortlisted =
    apps?.filter((a) => a.status === "SHORTLISTED").length ?? 0;
  const offers = apps?.filter((a) => a.status === "OFFERED").length ?? 0;
  const recentApps = (apps ?? []).slice(0, 10);

  return (
    <div className="space-y-6">
      {pending && (
        <div className="card-premium p-4 flex items-start gap-3 !border-amber-200 dark:!border-amber-900 bg-amber-50/60 dark:bg-amber-950/20">
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">
              {t("dash.company.pending")}
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
              {t("dash.company.pending.desc")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {jobsLoading || appsLoading ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              label={t("dash.company.active")}
              value={activeJobs}
              icon={Briefcase}
              accent="saffron"
            />
            <MetricCard
              label={t("dash.company.totalapps")}
              value={totalApps}
              icon={Send}
              accent="sky"
            />
            <MetricCard
              label={t("dash.company.shortlisted")}
              value={shortlisted}
              icon={Star}
              accent="amber"
            />
            <MetricCard
              label={t("dash.company.offers")}
              value={offers}
              icon={Trophy}
              accent="emerald"
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent applicants */}
        <SectionCard
          title={t("dash.company.recent")}
          icon={Users as LucideIcon}
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTab("applicants")}
            >
              {t("common.viewall")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          }
          bodyClassName="p-0"
        >
          {appsLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentApps.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title={pick("No applicants yet", "まだ応募者がいません")}
                description={pick("Once candidates apply to your jobs, you'll see them here.", "候補者が応募すると、ここに表示されます。")}
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentApps.map((a) => {
                const sc = STATUS_COLORS[a.status];
                return (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-accent/40 transition-colors"
                  >
                    <CandidateAvatar
                      name={a.candidate?.fullName || "?"}
                      photoUrl={a.candidate?.photoUrl}
                      size={36}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">
                        {a.candidate?.fullName ?? "Candidate"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.job?.title} · {formatRelative(a.appliedAt, locale)}
                      </p>
                    </div>
                    <span
                      className={cn("status-dot", sc.dot, sc.text)}
                      aria-hidden
                    />
                    <Badge
                      variant="outline"
                      className={cn("font-semibold hidden sm:inline-flex", STATUS_BADGE[a.status])}
                    >
                      {t(`status.${a.status}`)}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        {/* Active jobs */}
        <SectionCard
          title={pick("Active jobs", "募集中の求人")}
          icon={Briefcase as LucideIcon}
          action={
            <Button variant="ghost" size="sm" onClick={() => setTab("jobs")}>
              {t("common.viewall")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          }
          bodyClassName="p-0"
        >
          {jobsLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Briefcase}
                title={pick("No jobs posted", "求人が投稿されていません")}
                description={pick("Post your first job to start receiving applications.", "最初の求人を投稿して、応募の受付を開始しましょう。")}
                action={
                  !pending && (
                    <Button
                      className="bg-brand-gradient text-white hover:opacity-90"
                      onClick={() => setTab("new")}
                    >
                      <Plus className="h-4 w-4" />
                      {t("dash.company.new")}
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {jobs.slice(0, 5).map((j) => (
                <li
                  key={j.id}
                  className="px-5 py-3 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {j.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {j.location} ·{" "}
                        {typeof j.applicationCount === "number"
                          ? `${j.applicationCount} applicant${j.applicationCount === 1 ? "" : "s"}`
                          : "—"}{" "}
                        · {formatRelative(j.postedAt, locale)}
                      </p>
                    </div>
                    <Badge
                      variant={j.isActive ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {j.isActive ? "Active" : "Paused"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Quick actions */}
      {!pending && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-auto py-5 justify-start text-left card-premium hover:shadow-glow-brand"
            onClick={() => setTab("new")}
          >
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-saffron/15 text-saffron mr-3">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{t("dash.company.post")}</p>
              <p className="text-xs text-muted-foreground font-normal">
                Create a new job listing
              </p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-5 justify-start text-left card-premium hover:shadow-glow-brand"
            onClick={() => setTab("applicants")}
          >
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-crimson/15 text-crimson mr-3">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{t("dash.company.applicants")}</p>
              <p className="text-xs text-muted-foreground font-normal">
                Review candidates for your roles
              </p>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
