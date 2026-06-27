"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api, formatRelative, formatDate } from "@/lib/api-client";
import {
  DashboardShell,
  MetricCard,
  EmptyState,
  SectionCard,
  RoleGuard,
  CardSkeleton,
  MetricSkeleton,
  type NavItem,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  FileText,
  Quote,
  Send,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Download,
  TrendingUp,
  Hourglass,
  Trophy,
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
import type {
  ApplicationDTO,
  ApplicationStatus,
  CompanyProfileDTO,
  CandidateProfileDTO,
  JobDTO,
} from "@/lib/types";
import {
  JLPT_LEVELS,
  JLPT_BADGE,
  STATUS_BADGE,
  APPLICATION_STATUSES,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV: NavItem[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "candidates", label: "Candidates", icon: Users },
  { key: "companies", label: "Companies", icon: Building2 },
  { key: "applications", label: "Applications", icon: FileText },
  { key: "testimonials", label: "Testimonials", icon: Quote },
];

interface AdminStats {
  metrics: {
    candidates: number;
    companies: number;
    pendingCompanies: number;
    activeJobs: number;
    totalJobs: number;
    totalApps: number;
    appsThisMonth: number;
    placements: number;
  };
  appsPerWeek: { label: string; count: number }[];
  appsByStatus: { status: ApplicationStatus; count: number }[];
  companiesList: {
    id: string;
    companyName: string;
    industry: string | null;
    locationJapan: string | null;
    isApproved: boolean;
    email: string;
    createdAt: string;
  }[];
}

type CandidateRow = CandidateProfileDTO & { email?: string };
type CompanyRow = CompanyProfileDTO & { email?: string };
type TestimonialRow = {
  id: string;
  name: string;
  role: string;
  company: string | null;
  content: string;
  contentJa: string | null;
  photoUrl: string | null;
  order: number;
  isActive?: boolean;
};

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
        <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-border">
          <div className="grid place-items-center h-8 w-8 rounded-lg bg-brand-gradient text-white text-xs font-bold">
            AD
          </div>
        </div>
      }
    >
      {tab === "overview" && <Overview />}
      {tab === "jobs" && <JobsTab />}
      {tab === "candidates" && <CandidatesTab />}
      {tab === "companies" && <CompaniesTab />}
      {tab === "applications" && <ApplicationsTab />}
      {tab === "testimonials" && <TestimonialsTab />}
    </DashboardShell>
  );
}

/* ============== Overview ============== */

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPLIED: "var(--chart-3)",
  SHORTLISTED: "var(--chart-2)",
  INTERVIEWED: "var(--chart-5)",
  OFFERED: "var(--chart-4)",
  REJECTED: "var(--crimson)",
  WITHDRAWN: "var(--muted-foreground)",
};

function Overview() {
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
          <ul className="divide-y">
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
          <ul className="divide-y">
            {apps.map((a) => (
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
                <Badge
                  variant="outline"
                  className={cn("font-semibold hidden sm:inline-flex", STATUS_BADGE[a.status])}
                >
                  {t(`status.${a.status}`)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

/* ============== Reusable admin table wrapper ============== */

function ExportCsvButton({ resource }: { resource: string }) {
  const { t } = useT();
  return (
    <Button
      variant="outline"
      size="sm"
      asChild
    >
      <a href={`/api/admin/list/${resource}?export=csv`} download>
        <Download className="h-3.5 w-3.5" />
        {t("admin.export")}
      </a>
    </Button>
  );
}

/* ============== Jobs tab ============== */

function JobsTab() {
  const { t, locale } = useT();
  const [items, setItems] = useState<JobDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ items: JobDTO[] }>("/api/admin/list/jobs");
      setItems(res.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.companyName.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q),
    );
  }, [items, search]);

  async function toggleActive(j: JobDTO) {
    setBusyId(j.id);
    try {
      await api(`/api/jobs/${j.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !j.isActive }),
      });
      toast.success(j.isActive ? "Paused." : "Activated.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      await api(`/api/jobs/${id}`, { method: "DELETE" });
      toast.success("Job deleted.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusyId(null);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          {t("admin.jobs")}
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("common.search")}
              className="pl-8 h-9 w-[200px]"
            />
          </div>
          <ExportCsvButton resource="jobs" />
        </div>
      </div>

      {loading ? (
        <CardSkeleton lines={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description={search ? "Try a different search." : undefined}
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="max-h-[70vh] overflow-y-auto scroll-area">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">Title</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">JLPT</TableHead>
                  <TableHead>Apps</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right pr-5 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="pl-5 sm:pl-6">
                      <p className="font-semibold text-sm">{j.title}</p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {j.company.companyName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelative(j.postedAt, locale)}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {j.company.companyName}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {j.location}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={cn("font-semibold", JLPT_BADGE[j.jlptRequired])}
                      >
                        {j.jlptRequired}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {j.applicationCount ?? 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={j.isActive}
                        onCheckedChange={() => toggleActive(j)}
                        disabled={busyId === j.id}
                        aria-label="Toggle active"
                      />
                    </TableCell>
                    <TableCell className="text-right pr-5 sm:pr-6">
                      <AlertDialog
                        open={deleteId === j.id}
                        onOpenChange={(o) => setDeleteId(o ? j.id : null)}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            aria-label="Delete job"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{j.title}" by {j.company.companyName} will be removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("common.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-white hover:bg-destructive/90"
                              onClick={() => remove(j.id)}
                            >
                              {t("common.delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* ============== Candidates tab ============== */

function CandidatesTab() {
  const { t, locale } = useT();
  const [items, setItems] = useState<CandidateRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jlpt, setJlpt] = useState<string>("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api<{ items: CandidateRow[] }>(
          "/api/admin/list/candidates",
        );
        setItems(res.items);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      if (jlpt !== "all" && c.jlptLevel !== jlpt) return false;
      if (!q) return true;
      return (
        c.fullName.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, search, jlpt]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          {t("admin.candidates")}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or email"
              className="pl-8 h-9 w-[200px]"
            />
          </div>
          <Select value={jlpt} onValueChange={setJlpt}>
            <SelectTrigger className="h-9 w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("jobs.alljlpt")}</SelectItem>
              {JLPT_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l === "NONE" ? "None" : l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExportCsvButton resource="candidates" />
        </div>
      </div>

      {loading ? (
        <CardSkeleton lines={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description={search || jlpt !== "all" ? "Try different filters." : undefined}
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="max-h-[70vh] overflow-y-auto scroll-area">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead>JLPT</TableHead>
                  <TableHead className="hidden sm:table-cell">Exp</TableHead>
                  <TableHead className="hidden lg:table-cell">Skills</TableHead>
                  <TableHead className="hidden sm:table-cell pr-5 sm:pr-6 text-right">
                    Joined
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-5 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <CandidateAvatar
                          name={c.fullName}
                          photoUrl={c.photoUrl}
                          size={32}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {c.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground md:hidden truncate">
                            {c.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {c.email ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {c.location ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("font-semibold", JLPT_BADGE[c.jlptLevel])}
                      >
                        {c.jlptLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {c.experienceYears}y
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {c.skills.slice(0, 3).map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {s}
                          </Badge>
                        ))}
                        {c.skills.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{c.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell pr-5 sm:pr-6 text-sm text-muted-foreground text-right">
                      {formatDate(c.createdAt, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* ============== Companies tab ============== */

function CompaniesTab() {
  const { t, locale } = useT();
  const [items, setItems] = useState<CompanyRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ items: CompanyRow[] }>(
        "/api/admin/list/companies",
      );
      setItems(res.items);
    } catch {
      setItems([]);
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
      toast.success(approve ? "Approved." : "Rejected.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusyId(null);
    }
  }

  const filtered = useMemo(() => {
    if (!items) return [];
    if (filter === "approved") return items.filter((c) => c.isApproved);
    if (filter === "pending") return items.filter((c) => !c.isApproved);
    return items;
  }, [items, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          {t("admin.companies")}
        </h2>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <ExportCsvButton resource="companies" />
        </div>
      </div>

      {loading ? (
        <CardSkeleton lines={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies found"
          description={filter !== "all" ? "Try a different filter." : undefined}
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="max-h-[70vh] overflow-y-auto scroll-area">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">Company</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Industry</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-5 sm:pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-5 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <CompanyAvatar
                          name={c.companyName}
                          color={c.logoUrl}
                          size={32}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {c.companyName}
                          </p>
                          <p className="text-xs text-muted-foreground md:hidden truncate">
                            {c.email}
                          </p>
                          <p className="text-xs text-muted-foreground hidden sm:block">
                            Joined {formatDate(c.createdAt, locale)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {c.email ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {c.industry ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {c.locationJapan ?? "—"}
                    </TableCell>
                    <TableCell>
                      {c.isApproved ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-transparent font-semibold">
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-transparent font-semibold">
                          <Hourglass className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-5 sm:pr-6">
                      {!c.isApproved ? (
                        <div className="inline-flex gap-1">
                          <Button
                            size="sm"
                            className="bg-brand-gradient text-white hover:opacity-90 h-7"
                            disabled={busyId === c.id}
                            onClick={() => approve(c.id, true)}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="hidden sm:inline">
                              {t("admin.approve")}
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive h-7"
                            disabled={busyId === c.id}
                            onClick={() => approve(c.id, false)}
                          >
                            <XCircle className="h-3 w-3" />
                            <span className="hidden sm:inline">
                              {t("admin.reject")}
                            </span>
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive h-7"
                          disabled={busyId === c.id}
                          onClick={() => approve(c.id, false)}
                        >
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* ============== Applications tab ============== */

function ApplicationsTab() {
  const { t, locale } = useT();
  const [items, setItems] = useState<ApplicationDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api<{ items: ApplicationDTO[] }>(
          "/api/admin/list/applications",
        );
        setItems(res.items);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (status === "all") return items;
    return items.filter((a) => a.status === status);
  }, [items, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          {t("admin.applications")}
        </h2>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as ApplicationStatus | "all")}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`status.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExportCsvButton resource="applications" />
        </div>
      </div>

      {loading ? (
        <CardSkeleton lines={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description={status !== "all" ? "Try a different status filter." : undefined}
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="max-h-[70vh] overflow-y-auto scroll-area">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">Candidate</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-5 sm:pr-6">Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="pl-5 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <CandidateAvatar
                          name={a.candidate?.fullName || "?"}
                          photoUrl={a.candidate?.photoUrl}
                          size={28}
                        />
                        <span className="text-sm font-medium truncate max-w-[160px]">
                          {a.candidate?.fullName ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {a.job?.title ?? "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {a.job?.company?.companyName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("font-semibold", STATUS_BADGE[a.status])}
                      >
                        {t(`status.${a.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-5 sm:pr-6 text-sm text-muted-foreground">
                      {formatDate(a.appliedAt, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* ============== Testimonials tab ============== */

function TestimonialsTab() {
  const { t } = useT();
  const [items, setItems] = useState<TestimonialRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ items: TestimonialRow[] }>(
        "/api/admin/list/testimonials",
      );
      setItems(res.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(id: string) {
    setBusyId(id);
    try {
      await api(`/api/admin/list/testimonials`, {
        method: "PATCH",
        body: JSON.stringify({ id }),
      });
      toast.success("Updated.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          {t("admin.testimonials")}
        </h2>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={4} />
        </div>
      ) : !items || items.length === 0 ? (
        <EmptyState icon={Quote} title="No testimonials yet" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((row) => (
            <div
              key={row.id}
              className={cn(
                "rounded-2xl border border-border bg-card shadow-premium p-5 flex flex-col gap-3",
                !row.isActive && "opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display font-bold">{row.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.role}
                    {row.company ? ` · ${row.company}` : ""}
                  </p>
                </div>
                <Badge
                  variant={row.isActive ? "default" : "secondary"}
                  className="shrink-0"
                >
                  {row.isActive ? "Active" : "Hidden"}
                </Badge>
              </div>
              <Quote className="h-4 w-4 text-saffron/60" />
              <p className="text-sm text-foreground/90 leading-relaxed line-clamp-4">
                {row.content}
              </p>
              {row.contentJa && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {row.contentJa}
                </p>
              )}
              <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Order #{row.order}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === row.id}
                  onClick={() => toggle(row.id)}
                >
                  {row.isActive ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
