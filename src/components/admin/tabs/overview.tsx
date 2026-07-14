"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useT } from "@/lib/use-t";
import { api, formatRelative } from "@/lib/api-client";
import {
  MetricCard,
  EmptyState,
  SectionCard,
  MetricSkeleton,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CompanyAvatar, CandidateAvatar } from "@/components/brand/logo";
import { toast } from "sonner";
import {
  Briefcase,
  Users,
  Building2,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPie,
  XAxis,
  YAxis,
} from "recharts";
import type { ApplicationDTO, ApplicationStatus } from "@/lib/types";
import { APPLICATION_STATUSES, STATUS_BADGE } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AdminStats, STATUS_COLORS } from "../shared";

/** Status → status-dot color, mirroring other dashboards. */
const DOT_COLORS: Record<ApplicationStatus, string> = {
  APPLIED: "bg-sky-500 text-sky-600 dark:text-sky-400",
  SHORTLISTED: "bg-amber-500 text-amber-600 dark:text-amber-400",
  INTERVIEWED: "bg-violet-500 text-violet-600 dark:text-violet-400",
  OFFERED: "bg-emerald-500 text-emerald-600 dark:text-emerald-400",
  REJECTED: "bg-crimson text-crimson",
  WITHDRAWN: "bg-muted-foreground text-muted-foreground",
};

/* ============== Overview ============== */

export function Overview() {
  const { t, locale } = useT();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [apps, setApps] = useState<ApplicationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([
        api<AdminStats>("/api/admin/stats"),
        api<{ items: ApplicationDTO[] }>("/api/admin/list/applications"),
      ]);
      setStats(s);
      setApps(a.items.slice(0, 10));
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(id: string, approve: boolean) {
    setBusyId(id);
    try {
      await api(`/api/admin/companies/${id}?action=${approve ? "approve" : "reject"}`, {
        method: "PATCH",
      });
      toast.success(approve ? "Company approved." : "Company rejected.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusyId(null);
    }
  }

  const pendingCompanies = stats?.companiesList.filter((c) => !c.isApproved) ?? [];

  const chartConfig: ChartConfig = useMemo(
    () => ({
      count: { label: "Applications" },
      ...Object.fromEntries(
        APPLICATION_STATUSES.map((s) => [
          s,
          { label: t(`status.${s}`), color: STATUS_COLORS[s] },
        ]),
      ),
    }),
    [t],
  );

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <MetricSkeleton key={i} />)
        ) : (
          <>
            <MetricCard
              label="Candidates"
              value={stats?.metrics.candidates ?? 0}
              icon={Users}
              accent="saffron"
            />
            <MetricCard
              label="Companies"
              value={stats?.metrics.companies ?? 0}
              icon={Building2}
              accent="crimson"
              hint={`${stats?.metrics.pendingCompanies ?? 0} pending`}
            />
            <MetricCard
              label="Active jobs"
              value={stats?.metrics.activeJobs ?? 0}
              icon={Briefcase}
              accent="emerald"
            />
            <MetricCard
              label="Total applications"
              value={stats?.metrics.totalApps ?? 0}
              icon={Send}
              accent="sky"
            />
            <MetricCard
              label={t("admin.thismonth")}
              value={stats?.metrics.appsThisMonth ?? 0}
              icon={TrendingUp}
              accent="violet"
            />
            <MetricCard
              label={t("admin.placements")}
              value={stats?.metrics.placements ?? 0}
              icon={Trophy}
              accent="amber"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-6">
        <SectionCard
          title="Applications over time"
          icon={TrendingUp as LucideIcon}
          className="lg:col-span-3"
          bodyClassName="pt-2"
        >
          {loading || !stats ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <ChartContainer config={chartConfig} className="aspect-[16/9] w-full">
              <AreaChart data={stats.appsPerWeek} margin={{ left: -16, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="appsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--saffron)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--saffron)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={36}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--saffron)"
                  strokeWidth={2.5}
                  fill="url(#appsGrad)"
                  dot={{ r: 3, fill: "var(--saffron)" }}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </SectionCard>

        <SectionCard
          title="By status"
          icon={FileText as LucideIcon}
          className="lg:col-span-2"
          bodyClassName="pt-2"
        >
          {loading || !stats ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ChartContainer config={chartConfig} className="aspect-square w-full max-w-[240px]">
                <RechartsPie data={stats.appsByStatus}>
                  <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                  <Pie
                    data={stats.appsByStatus}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {stats.appsByStatus.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status]}
                      />
                    ))}
                  </Pie>
                </RechartsPie>
              </ChartContainer>
              <ul className="grid grid-cols-2 gap-1.5 w-full text-xs">
                {stats.appsByStatus
                  .filter((s) => s.count > 0)
                  .map((s) => (
                    <li
                      key={s.status}
                      className="flex items-center gap-1.5"
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ background: STATUS_COLORS[s.status] }}
                      />
                      <span className="text-muted-foreground">
                        {t(`status.${s.status}`)}
                      </span>
                      <span className="font-semibold ml-auto">{s.count}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Pending approvals */}
      <SectionCard
        title={t("admin.pending")}
        icon={Building2 as LucideIcon}
        action={
          pendingCompanies.length > 0 && (
            <Badge variant="secondary" className="font-semibold">
              {pendingCompanies.length} to review
            </Badge>
          )
        }
        bodyClassName="p-0"
      >
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : pendingCompanies.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={CheckCircle2}
              title="All caught up"
              description="No companies pending approval."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {pendingCompanies.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 px-5 sm:px-6 py-3"
              >
                <CompanyAvatar
                  name={c.companyName}
                  color={null}
                  size={36}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">
                    {c.companyName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.email} · {c.industry ?? "Industry not set"} ·{" "}
                    {formatRelative(c.createdAt, locale)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="bg-brand-gradient text-white hover:opacity-90"
                    disabled={busyId === c.id}
                    onClick={() => approve(c.id, true)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {t("admin.approve")}
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    disabled={busyId === c.id}
                    onClick={() => approve(c.id, false)}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {t("admin.reject")}
                    </span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* Recent applications */}
      <SectionCard
        title="Recent applications"
        icon={FileText as LucideIcon}
        bodyClassName="p-0"
      >
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FileText}
              title="No applications yet"
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {apps.map((a) => {
              const dc = DOT_COLORS[a.status];
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 px-5 sm:px-6 py-3"
                >
                  <CandidateAvatar
                    name={a.candidate?.fullName || "?"}
                    photoUrl={a.candidate?.photoUrl}
                    size={32}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">
                      {a.candidate?.fullName ?? "Candidate"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {a.job?.title} · {a.job?.company?.companyName} ·{" "}
                      {formatRelative(a.appliedAt, locale)}
                    </p>
                  </div>
                  <span
                    className={cn("status-dot", dc)}
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
    </div>
  );
}
