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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CompanyAvatar, CandidateAvatar } from "@/components/brand/logo";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { EnglishResumePDF } from "@/lib/pdf-templates/english-resume-pdf";
import { JapaneseResumePDF } from "@/lib/pdf-templates/japanese-resume-pdf";
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
  Plus,
  Pencil,
  Mail,
  ShieldCheck,
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
  JOB_TYPES,
  type TestimonialDTO,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV: NavItem[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "candidates", label: "Candidates", icon: Users },
  { key: "companies", label: "Companies", icon: Building2 },
  { key: "applications", label: "Applications", icon: FileText },
  { key: "testimonials", label: "Testimonials", icon: Quote },
  { key: "contacts", label: "Enquiries", icon: Mail },
  { key: "users", label: "Users & Roles", icon: ShieldCheck },
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
      {tab === "contacts" && <ContactsTab />}
      {tab === "users" && <UsersTab />}
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
  const [editorState, setEditorState] = useState<{
    mode: "create" | "edit";
    job: JobDTO | null;
  } | null>(null);

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
          <Button
            size="sm"
            className="bg-brand-gradient text-white hover:opacity-90 font-semibold"
            onClick={() => setEditorState({ mode: "create", job: null })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Post Job
          </Button>
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
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-crimson"
                          aria-label="Edit job"
                          onClick={() =>
                            setEditorState({ mode: "edit", job: j })
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}

      {editorState && (
        <JobEditorSheet
          mode={editorState.mode}
          job={editorState.job}
          onClose={() => setEditorState(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}

/* ============== Job Editor Sheet (admin) ============== */

interface JobFormState {
  companyId: string;
  title: string;
  titleJa: string;
  description: string;
  descriptionJa: string;
  location: string;
  jobType: string;
  jlptRequired: string;
  salaryMin: string;
  salaryMax: string;
  salaryType: string;
  skillsInput: string;
  deadline: string;
  isActive: boolean;
}

function JobEditorSheet({
  mode,
  job,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  job: JobDTO | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [companies, setCompanies] = useState<
    { id: string; companyName: string }[]
  >([]);
  const [form, setForm] = useState<JobFormState>({
    companyId: "",
    title: "",
    titleJa: "",
    description: "",
    descriptionJa: "",
    location: "",
    jobType: "FULL_TIME",
    jlptRequired: "NONE",
    salaryMin: "",
    salaryMax: "",
    salaryType: "MONTHLY",
    skillsInput: "",
    deadline: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Pre-fill form in edit mode
    if (job) {
      setForm({
        companyId: job.companyId,
        title: job.title,
        titleJa: job.titleJa ?? "",
        description: job.description,
        descriptionJa: job.descriptionJa ?? "",
        location: job.location,
        jobType: job.jobType,
        jlptRequired: job.jlptRequired,
        salaryMin: job.salaryMin ? String(job.salaryMin) : "",
        salaryMax: job.salaryMax ? String(job.salaryMax) : "",
        salaryType: job.salaryType,
        skillsInput: job.skillsRequired.join(", "),
        deadline: job.deadline
          ? new Date(job.deadline).toISOString().slice(0, 10)
          : "",
        isActive: job.isActive,
      });
    }
  }, [job]);

  // Load companies for create mode
  useEffect(() => {
    if (mode === "create") {
      api<{ items: CompanyProfileDTO[] }>(
        "/api/admin/list/companies",
      )
        .then((res) =>
          setCompanies(
            res.items
              .filter((c) => c.isApproved)
              .map((c) => ({ id: c.id, companyName: c.companyName })),
          ),
        )
        .catch(() => {});
    }
  }, [mode]);

  function update<K extends keyof JobFormState>(
    key: K,
    value: JobFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "create" && !form.companyId) {
      toast.error("Select a company.");
      return;
    }
    if (form.description.length < 50) {
      toast.error("Description must be at least 50 characters.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        titleJa: form.titleJa || undefined,
        description: form.description,
        descriptionJa: form.descriptionJa || undefined,
        location: form.location,
        jobType: form.jobType,
        jlptRequired: form.jlptRequired,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        salaryType: form.salaryType,
        skillsRequired: form.skillsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        deadline: form.deadline || undefined,
        isActive: form.isActive,
      };
      if (mode === "create") {
        payload.companyId = form.companyId;
        await api("/api/admin/jobs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Job created.");
      } else if (job) {
        await api(`/api/admin/jobs/${job.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Job updated.");
      }
      await onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[440px] sm:max-w-[440px] overflow-y-auto scroll-area">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Post New Job" : "Edit Job"}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={submit} className="space-y-4 mt-4 pr-1">
          {mode === "create" && (
            <div>
              <Label className="mb-1.5 block text-xs font-medium">
                Company *
              </Label>
              <Select
                value={form.companyId}
                onValueChange={(v) => update("companyId", v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select approved company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <FormField label="Title *">
            <Input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Senior Backend Engineer"
            />
          </FormField>
          <FormField label="Title (Japanese)">
            <Input
              value={form.titleJa}
              onChange={(e) => update("titleJa", e.target.value)}
              placeholder="シニアバックエンドエンジニア"
            />
          </FormField>
          <FormField label="Description * (min 50 chars)">
            <Textarea
              required
              rows={5}
              minLength={50}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the role, responsibilities, requirements..."
            />
          </FormField>
          <FormField label="Description (Japanese)">
            <Textarea
              rows={4}
              value={form.descriptionJa}
              onChange={(e) => update("descriptionJa", e.target.value)}
            />
          </FormField>
          <FormField label="Location *">
            <Input
              required
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Tokyo, Japan"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Job type">
              <Select
                value={form.jobType}
                onValueChange={(v) => update("jobType", v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((jt) => (
                    <SelectItem key={jt} value={jt}>
                      {jt.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="JLPT required">
              <Select
                value={form.jlptRequired}
                onValueChange={(v) => update("jlptRequired", v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JLPT_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Salary min">
              <Input
                type="number"
                value={form.salaryMin}
                onChange={(e) => update("salaryMin", e.target.value)}
                placeholder="500000"
              />
            </FormField>
            <FormField label="Salary max">
              <Input
                type="number"
                value={form.salaryMax}
                onChange={(e) => update("salaryMax", e.target.value)}
                placeholder="800000"
              />
            </FormField>
            <FormField label="Type">
              <Select
                value={form.salaryType}
                onValueChange={(v) => update("salaryType", v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOURLY">Hourly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <FormField label="Skills (comma-separated)">
            <Input
              value={form.skillsInput}
              onChange={(e) => update("skillsInput", e.target.value)}
              placeholder="React, Go, PostgreSQL"
            />
          </FormField>
          <FormField label="Deadline">
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => update("deadline", e.target.value)}
            />
          </FormField>
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => update("isActive", v)}
            />
            <span className="text-sm">Active</span>
          </label>
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-card pb-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-brand-gradient text-white hover:opacity-90 font-semibold"
            >
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Create Job"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function CandidatesTab() {
  const { t, locale } = useT();
  const [items, setItems] = useState<CandidateRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jlpt, setJlpt] = useState<string>("all");
  const [editingCandidate, setEditingCandidate] = useState<CandidateRow | null>(null);

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
                  <TableHead className="text-right pr-5 sm:pr-6">Actions</TableHead>
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
                    <TableCell className="pr-5 sm:pr-6 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setEditingCandidate(c)}
                      >
                        View & PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}

      {/* Candidate Editor Sheet */}
      <CandidateEditorSheet
        candidate={editingCandidate}
        onClose={() => setEditingCandidate(null)}
      />
    </div>
  );
}

function CandidateEditorSheet({
  candidate,
  onClose,
}: {
  candidate: CandidateRow | null;
  onClose: () => void;
}) {
  const { locale } = useT();
  const [resumeData, setResumeData] = useState<any>(null);

  useEffect(() => {
    if (!candidate) return;
    (async () => {
      try {
        const res = await api<{ resumeData: any }>(
          `/api/admin/list/candidates?userId=${candidate.userId}`,
        );
        setResumeData(res.resumeData);
      } catch {
        setResumeData(null);
      }
    })();
  }, [candidate]);

  if (!candidate) return null;

  return (
    <Sheet open={!!candidate} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[600px] sm:max-w-none overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Candidate Editor</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {/* Profile info */}
          <div className="rounded-xl border border-border p-4 space-y-2">
            <div className="flex items-center gap-3">
              <CandidateAvatar
                name={candidate.fullName}
                photoUrl={candidate.photoUrl}
                size={48}
              />
              <div>
                <p className="font-display font-bold text-lg">{candidate.fullName}</p>
                <p className="text-sm text-muted-foreground">{candidate.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mt-3">
              <div>
                <span className="text-muted-foreground">JLPT:</span>{" "}
                <Badge variant="outline" className={cn("font-semibold", JLPT_BADGE[candidate.jlptLevel])}>
                  {candidate.jlptLevel}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Experience:</span> {candidate.experienceYears}y
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span> {candidate.location || "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span> {candidate.phone || "—"}
              </div>
            </div>
            {candidate.bio && (
              <p className="text-sm text-muted-foreground mt-2">{candidate.bio}</p>
            )}
            {candidate.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {candidate.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Resume data */}
          {resumeData && (
            <div className="rounded-xl border border-border p-4">
              <p className="font-semibold text-sm mb-2">Resume Data (EN + JP)</p>
              <pre className="text-xs bg-muted rounded-lg p-3 overflow-x-auto max-h-40">
                {JSON.stringify(resumeData, null, 2)}
              </pre>
            </div>
          )}

          {/* PDF export */}
          <div className="flex gap-2">
            {resumeData && (
              <>
                <PDFDownloadLink
                  document={<EnglishResumePDF data={resumeData} />}
                  fileName={`${candidate.fullName}_EN.pdf`}
                >
                  {({ loading }) => (
                    <Button variant="outline" size="sm" disabled={loading} className="font-semibold">
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      {loading ? "Generating..." : "EN PDF"}
                    </Button>
                  )}
                </PDFDownloadLink>
                <PDFDownloadLink
                  document={<JapaneseResumePDF data={resumeData} />}
                  fileName={`${candidate.fullName}_JP.pdf`}
                >
                  {({ loading }) => (
                    <Button variant="outline" size="sm" disabled={loading} className="font-semibold">
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      {loading ? "生成中..." : "履歴書 PDF"}
                    </Button>
                  )}
                </PDFDownloadLink>
              </>
            )}
            {candidate.resumeUrl && (
              <Button variant="outline" size="sm" asChild className="font-semibold">
                <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Uploaded PDF
                </a>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<{
    mode: "create" | "edit";
    item: TestimonialRow | null;
  } | null>(null);

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
      await api(`/api/admin/testimonials/${id}/toggle`, { method: "PATCH" });
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
      await api(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      toast.success("Testimonial deleted.");
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
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          {t("admin.testimonials")}
        </h2>
        <Button
          size="sm"
          className="bg-brand-gradient text-white hover:opacity-90 font-semibold"
          onClick={() => setEditorState({ mode: "create", item: null })}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Testimonial
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={4} />
        </div>
      ) : !items || items.length === 0 ? (
        <EmptyState
          icon={Quote}
          title="No testimonials yet"
          description="Add success stories from placed candidates and happy employers."
          action={
            <Button
              className="bg-brand-gradient text-white"
              onClick={() => setEditorState({ mode: "create", item: null })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Testimonial
            </Button>
          }
        />
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
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === row.id}
                    onClick={() => toggle(row.id)}
                  >
                    {row.isActive ? "Hide" : "Show"}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-crimson"
                    aria-label="Edit"
                    onClick={() =>
                      setEditorState({ mode: "edit", item: row })
                    }
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog
                    open={deleteId === row.id}
                    onOpenChange={(o) => setDeleteId(o ? row.id : null)}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete this testimonial?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          "{row.name}"'s testimonial will be permanently
                          removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-white hover:bg-destructive/90"
                          onClick={() => remove(row.id)}
                        >
                          {t("common.delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editorState && (
        <TestimonialEditorSheet
          mode={editorState.mode}
          item={editorState.item}
          onClose={() => setEditorState(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}

/* ============== Testimonial Editor Sheet ============== */

interface TestimonialFormState {
  name: string;
  role: string;
  company: string;
  content: string;
  contentJa: string;
  photoUrl: string;
  order: string;
  isActive: boolean;
}

function TestimonialEditorSheet({
  mode,
  item,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  item: TestimonialRow | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<TestimonialFormState>({
    name: "",
    role: "",
    company: "",
    content: "",
    contentJa: "",
    photoUrl: "",
    order: "0",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        role: item.role,
        company: item.company ?? "",
        content: item.content,
        contentJa: item.contentJa ?? "",
        photoUrl: item.photoUrl ?? "",
        order: String(item.order),
        isActive: item.isActive ?? false,
      });
    }
  }, [item]);

  function update<K extends keyof TestimonialFormState>(
    key: K,
    value: TestimonialFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.content.length < 10) {
      toast.error("Content must be at least 10 characters.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        role: form.role,
        company: form.company || undefined,
        content: form.content,
        contentJa: form.contentJa || undefined,
        photoUrl: form.photoUrl || undefined,
        order: Number(form.order) || 0,
        isActive: form.isActive,
      };
      if (mode === "create") {
        await api("/api/admin/testimonials", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Testimonial created.");
      } else if (item) {
        await api(`/api/admin/testimonials/${item.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Testimonial updated.");
      }
      await onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[440px] sm:max-w-[440px] overflow-y-auto scroll-area">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Add Testimonial" : "Edit Testimonial"}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={submit} className="space-y-4 mt-4 pr-1">
          <FormField label="Name *">
            <Input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Arjun Sharma"
            />
          </FormField>
          <FormField label="Role *">
            <Input
              required
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              placeholder="Backend Engineer"
            />
          </FormField>
          <FormField label="Company">
            <Input
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              placeholder="TechNova Japan"
            />
          </FormField>
          <FormField label="Content (English) *">
            <Textarea
              required
              rows={4}
              minLength={10}
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              placeholder="IndiGate made my move to Tokyo seamless..."
            />
          </FormField>
          <FormField label="Content (Japanese)">
            <Textarea
              rows={4}
              value={form.contentJa}
              onChange={(e) => update("contentJa", e.target.value)}
              placeholder="IndiGateのおかげで東京への移住がスムーズでした..."
            />
          </FormField>
          <FormField label="Photo URL">
            <Input
              value={form.photoUrl}
              onChange={(e) => update("photoUrl", e.target.value)}
              placeholder="https://..."
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Display order">
              <Input
                type="number"
                value={form.order}
                onChange={(e) => update("order", e.target.value)}
              />
            </FormField>
            <label className="flex items-center gap-2 cursor-pointer pt-6">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => update("isActive", v)}
              />
              <span className="text-sm">Active</span>
            </label>
          </div>
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-card pb-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-brand-gradient text-white hover:opacity-90 font-semibold"
            >
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/* ============== Contacts tab ============== */

interface ContactRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  userId: string | null;
  createdAt: string;
}

function ContactsTab() {
  const { t, locale } = useT();
  const [items, setItems] = useState<ContactRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ items: ContactRow[] }>(
        "/api/admin/list/contacts",
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

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.subject ?? "").toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q),
    );
  }, [items, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          Contact Enquiries
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
          <ExportCsvButton resource="contacts" />
        </div>
      </div>

      {loading ? (
        <CardSkeleton lines={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No enquiries yet"
          description="Contact form submissions will appear here."
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="max-h-[70vh] overflow-y-auto scroll-area">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Subject</TableHead>
                  <TableHead className="hidden lg:table-cell">Message</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right pr-5 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-5 sm:pl-6">
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {c.email}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {c.email}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {c.subject || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-xs truncate">
                      {c.message}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {formatDate(c.createdAt, locale)}
                    </TableCell>
                    <TableCell className="text-right pr-5 sm:pr-6">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelected(c)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}

      <Sheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      >
        <SheetContent className="w-[440px] sm:max-w-[440px] overflow-y-auto scroll-area">
          <SheetHeader>
            <SheetTitle>Enquiry from {selected?.name}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Email
                </p>
                <a
                  href={`mailto:${selected.email}`}
                  className="text-sm text-crimson hover:underline"
                >
                  {selected.email}
                </a>
              </div>
              {selected.subject && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Subject
                  </p>
                  <p className="text-sm">{selected.subject}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Message
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/40 rounded-lg p-3">
                  {selected.message}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Received
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selected.createdAt, locale)}
                </p>
              </div>
              <a href={`mailto:${selected.email}`}>
                <Button className="w-full bg-brand-gradient text-white hover:opacity-90 font-semibold">
                  <Mail className="mr-2 h-4 w-4" />
                  Reply by Email
                </Button>
              </a>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api<{ users: any[] }>("/api/admin/users");
      setUsers(res.users);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateRole(id: string) {
    try {
      await api(`/api/admin/users?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: editRole }),
      });
      toast.success("User role updated.");
      setEditingId(null);
      load();
    } catch (e) {
      toast.error("Failed to update user.");
    }
  }

  async function toggleVerified(id: string, current: boolean) {
    try {
      await api(`/api/admin/users?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isVerified: !current }),
      });
      toast.success(!current ? "User verified." : "User unverified.");
      load();
    } catch {
      toast.error("Failed to update user.");
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      await api(`/api/admin/users?id=${id}`, { method: "DELETE" });
      toast.success("User deleted.");
      load();
    } catch {
      toast.error("Failed to delete user.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Users & Roles</h2>
        <Badge variant="secondary">{users?.length ?? 0} users</Badge>
      </div>

      {!users || users.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          No users found.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    {editingId === u.id ? (
                      <Select value={editRole} onValueChange={setEditRole}>
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CANDIDATE">CANDIDATE</SelectItem>
                          <SelectItem value="COMPANY">COMPANY</SelectItem>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline">{u.role}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleVerified(u.id, u.isVerified)}
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-md transition-colors",
                        u.isVerified
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {u.isVerified ? "Verified" : "Unverified"}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {u.googleId && <Badge variant="secondary" className="text-xs">Google</Badge>}
                      <Badge variant="secondary" className="text-xs">Password</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {u.totpEnabled ? (
                      <Badge className="bg-saffron/10 text-saffron text-xs">2FA</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editingId === u.id ? (
                        <>
                          <Button size="sm" className="h-7 text-xs" onClick={() => updateRole(u.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => {
                              setEditingId(u.id);
                              setEditRole(u.role);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => deleteUser(u.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
