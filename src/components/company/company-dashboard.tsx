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
import { SkillsInput, FileDropZone } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyAvatar, CandidateAvatar } from "@/components/brand/logo";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Briefcase,
  Plus,
  Users,
  Building2,
  Send,
  Star,
  Trophy,
  ImageIcon,
  Trash2,
  Eye,
  ArrowRight,
  Download,
  Clock,
  XCircle,
  CalendarClock,
} from "lucide-react";
import type {
  ApplicationDTO,
  ApplicationStatus,
  JobDTO,
  JobType,
  JLPTLevel,
  SalaryType,
  EducationEntry,
} from "@/lib/types";
import {
  JLPT_LEVELS,
  JLPT_BADGE,
  JOB_TYPES,
  SALARY_TYPES,
  STATUS_BADGE,
  APPLICATION_STATUSES,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV: NavItem[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "jobs", label: "My Jobs", icon: Briefcase },
  { key: "new", label: "Post New Job", icon: Plus },
  { key: "applicants", label: "Applicants", icon: Users },
  { key: "profile", label: "Company Profile", icon: Building2 },
];

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
  const disabled = pending
    ? ["jobs", "new", "applicants"]
    : [];

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
          {tab === "profile" && <Profile />}
        </>
      )}
    </DashboardShell>
  );
}

/* ============== Pending ============== */

function PendingState() {
  const { t } = useT();
  return (
    <div className="grid place-items-center py-12">
      <div className="max-w-md w-full rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-8 text-center">
        <div className="mx-auto mb-5 grid place-items-center h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
          <Clock className="h-7 w-7" />
        </div>
        <h2 className="font-display font-extrabold text-xl">
          {t("dash.company.pending")}
        </h2>
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
          {t("dash.company.pending.desc")}
        </p>
      </div>
    </div>
  );
}

/* ============== Overview ============== */

function useCompanyJobs() {
  const user = useApp((s) => s.user);
  const [jobs, setJobs] = useState<JobDTO[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ jobs: JobDTO[] }>(`/api/jobs?limit=50`);
      // Filter to this company's jobs (including inactive ones we own)
      const mine = (res.jobs || []).filter(
        (j) => j.company?.userId === user?.id,
      );
      setJobs(mine);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return { jobs, loading, reload: load };
}

function useCompanyApps() {
  const [apps, setApps] = useState<ApplicationDTO[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ applications: ApplicationDTO[] }>(
        "/api/applications",
      );
      setApps(res.applications);
    } catch {
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { apps, loading, reload: load };
}

function Overview() {
  const company = useApp((s) => s.company);
  const setTab = useApp((s) => s.setCompanyTab);
  const { t, locale } = useT();
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
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-4 flex items-start gap-3">
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
                title="No applicants yet"
                description="Once candidates apply to your jobs, you'll see them here."
              />
            </div>
          ) : (
            <ul className="divide-y">
              {recentApps.map((a) => (
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

        {/* Active jobs */}
        <SectionCard
          title="Active jobs"
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
                title="No jobs posted"
                description="Post your first job to start receiving applications."
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
            <ul className="divide-y">
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
            className="h-auto py-5 justify-start text-left"
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
            className="h-auto py-5 justify-start text-left"
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

/* ============== Jobs list ============== */

function Jobs() {
  const { t, locale } = useT();
  const setTab = useApp((s) => s.setCompanyTab);
  const { jobs, loading, reload } = useCompanyJobs();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function toggleActive(j: JobDTO) {
    setBusyId(j.id);
    try {
      await api(`/api/jobs/${j.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !j.isActive }),
      });
      toast.success(j.isActive ? "Job paused." : "Job reactivated.");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      await api(`/api/jobs/${id}`, { method: "DELETE" });
      toast.success("Job deleted.");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete.");
    } finally {
      setBusyId(null);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          {t("dash.company.jobs")}
        </h2>
        <Button
          size="sm"
          className="bg-brand-gradient text-white hover:opacity-90"
          onClick={() => setTab("new")}
        >
          <Plus className="h-4 w-4" />
          {t("dash.company.new")}
        </Button>
      </div>

      {loading ? (
        <CardSkeleton lines={6} />
      ) : !jobs || jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs yet"
          description="Post your first role to start receiving applications."
          action={
            <Button
              className="bg-brand-gradient text-white hover:opacity-90"
              onClick={() => setTab("new")}
            >
              <Plus className="h-4 w-4" />
              {t("dash.company.new")}
            </Button>
          }
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="max-h-[70vh] overflow-y-auto scroll-area">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">Title</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">JLPT</TableHead>
                  <TableHead>Apps</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-5 sm:pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="pl-5 sm:pl-6">
                      <p className="font-semibold text-sm">{j.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelative(j.postedAt, locale)}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
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
                      <button
                        onClick={() => toggleActive(j)}
                        disabled={busyId === j.id}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                          j.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200"
                            : "bg-muted text-muted-foreground hover:bg-muted/70",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            j.isActive ? "bg-emerald-500" : "bg-muted-foreground",
                          )}
                        />
                        {j.isActive ? "Active" : "Paused"}
                      </button>
                    </TableCell>
                    <TableCell className="text-right pr-5 sm:pr-6">
                      <div className="inline-flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setTab("applicants", { jobId: j.id })
                          }
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Applicants</span>
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
                                "{j.title}" will be permanently removed. Existing
                                applications will remain in your applicants tab.
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
    </div>
  );
}

/* ============== New job ============== */

function NewJob() {
  const { t } = useT();
  const setTab = useApp((s) => s.setCompanyTab);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    jobType: "FULL_TIME" as JobType,
    jlptRequired: "N3" as JLPTLevel,
    salaryMin: "",
    salaryMax: "",
    salaryType: "MONTHLY" as SalaryType,
    skills: [] as string[],
    deadline: "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.title.trim().length < 3) {
      toast.error("Job title must be at least 3 characters.");
      return;
    }
    if (form.description.trim().length < 50) {
      toast.error("Description must be at least 50 characters.");
      return;
    }
    if (form.location.trim().length < 2) {
      toast.error("Location is required.");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        jobType: form.jobType,
        jlptRequired: form.jlptRequired,
        salaryType: form.salaryType,
        skillsRequired: form.skills,
      };
      if (form.salaryMin) body.salaryMin = Number(form.salaryMin);
      if (form.salaryMax) body.salaryMax = Number(form.salaryMax);
      if (form.deadline) body.deadline = form.deadline;
      const res = await api<JobDTO>("/api/jobs", {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast.success("Job posted! 🎉");
      setTab("applicants", { jobId: res.id });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to post job.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          {t("dash.company.post")}
        </h2>
      </div>

      <SectionCard>
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">
              {t("dash.company.post.title")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Senior Frontend Engineer (React)"
              required
              minLength={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">
              {t("dash.company.post.desc")} <span className="text-destructive">*</span>
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                ({form.description.length}/50 min)
              </span>
            </Label>
            <Textarea
              id="description"
              rows={6}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe responsibilities, requirements, and what makes this role exciting..."
              required
              minLength={50}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="location">
                {t("dash.company.post.location")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Tokyo, Japan"
                required
                minLength={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deadline">
                {t("dash.company.post.deadline")}
              </Label>
              <Input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("dash.company.post.type")}</Label>
              <Select
                value={form.jobType}
                onValueChange={(v) => set("jobType", v as JobType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((jt) => (
                    <SelectItem key={jt} value={jt}>
                      {t(`jobtype.${jt}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("dash.company.post.jlpt")}</Label>
              <Select
                value={form.jlptRequired}
                onValueChange={(v) => set("jlptRequired", v as JLPTLevel)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JLPT_LEVELS.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>
                      {lvl === "NONE" ? "Any JLPT" : `JLPT ${lvl}+`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="salaryMin">
                {t("dash.company.post.salary.min")}
              </Label>
              <Input
                id="salaryMin"
                type="number"
                min={0}
                value={form.salaryMin}
                onChange={(e) => set("salaryMin", e.target.value)}
                placeholder="e.g. 250000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salaryMax">
                {t("dash.company.post.salary.max")}
              </Label>
              <Input
                id="salaryMax"
                type="number"
                min={0}
                value={form.salaryMax}
                onChange={(e) => set("salaryMax", e.target.value)}
                placeholder="e.g. 400000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("dash.company.post.salary.type")}</Label>
              <Select
                value={form.salaryType}
                onValueChange={(v) => set("salaryType", v as SalaryType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_TYPES.map((st) => (
                    <SelectItem key={st} value={st}>
                      {t(`salarytype.${st}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("dash.company.post.skill")}</Label>
            <SkillsInput
              value={form.skills}
              onChange={(next) => set("skills", next)}
              placeholder={t("dash.company.post.skill.placeholder")}
            />
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center justify-end gap-3 sticky bottom-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setTab("jobs")}
          disabled={saving}
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="bg-brand-gradient text-white shadow-premium hover:opacity-90 px-6"
        >
          {saving ? t("common.loading") : t("dash.company.post.submit")}
        </Button>
      </div>
    </form>
  );
}

/* ============== Applicants ============== */

function Applicants() {
  const { t, locale } = useT();
  const jobId = useApp((s) => s.companyApplicantsJobId);
  const setTab = useApp((s) => s.setCompanyTab);
  const { jobs } = useCompanyJobs();
  const { apps, loading, reload } = useCompanyApps();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">(
    "ALL",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = apps ?? [];
    if (jobId) list = list.filter((a) => a.jobId === jobId);
    if (statusFilter !== "ALL")
      list = list.filter((a) => a.status === statusFilter);
    return list;
  }, [apps, jobId, statusFilter]);

  const selectedApp = filtered.find((a) => a.id === selectedId) ?? null;

  async function changeStatus(app: ApplicationDTO, status: ApplicationStatus) {
    setBusyId(app.id);
    try {
      await api(`/api/applications/${app.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`Marked as ${t(`status.${status}`)}.`);
      await reload();
      if (selectedId === app.id) {
        // keep slide-over open; data will refresh
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Top filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-xl">
            {t("dash.company.applicants")}
          </h2>
          {jobId ? (
            <p className="text-sm text-muted-foreground">
              {t("dash.company.applicants.title", {
                title: jobs?.find((j) => j.id === jobId)?.title ?? "Selected job",
              })}{" "}
              <button
                className="text-crimson hover:underline ml-1"
                onClick={() => useApp.setState({ companyApplicantsJobId: null })}
              >
                (show all)
              </button>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {jobs && jobs.length > 0
                ? "All applications across your jobs"
                : "Post a job to start receiving applications."}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {jobs && jobs.length > 0 && (
            <Select
              value={jobId ?? "all"}
              onValueChange={(v) => {
                if (v === "all") {
                  useApp.setState({ companyApplicantsJobId: null });
                } else {
                  setTab("applicants", { jobId: v });
                }
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All jobs</SelectItem>
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ApplicationStatus | "ALL")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("common.all")}</SelectItem>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`status.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <CardSkeleton lines={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("dash.company.applicants.empty")}
          description="Try changing the status filter or check back later."
          action={
            <Button variant="outline" onClick={() => setTab("jobs")}>
              <Briefcase className="h-4 w-4" />
              View your jobs
            </Button>
          }
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="max-h-[70vh] overflow-y-auto scroll-area">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">Candidate</TableHead>
                  <TableHead className="hidden md:table-cell">JLPT</TableHead>
                  <TableHead className="hidden lg:table-cell">Skills</TableHead>
                  <TableHead className="hidden sm:table-cell">Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-5 sm:pr-6">Action</TableHead>
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
                          size={36}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {a.candidate?.fullName ?? "Candidate"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {a.job?.title}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {a.candidate?.jlptLevel && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-semibold",
                            JLPT_BADGE[a.candidate.jlptLevel],
                          )}
                        >
                          {a.candidate.jlptLevel}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {(a.candidate?.skills ?? []).slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px]">
                            {s}
                          </Badge>
                        ))}
                        {(a.candidate?.skills ?? []).length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{(a.candidate?.skills ?? []).length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {formatDate(a.appliedAt, locale)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={a.status}
                        onValueChange={(v) =>
                          changeStatus(a, v as ApplicationStatus)
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="w-[130px] h-8"
                          disabled={busyId === a.id}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPLICATION_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {t(`status.${s}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right pr-5 sm:pr-6">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedId(a.id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">
                          {t("dash.company.viewprofile")}
                        </span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}

      {/* Slide-over detail */}
      <Sheet
        open={!!selectedApp}
        onOpenChange={(o) => !o && setSelectedId(null)}
      >
        <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto scroll-area">
          {selectedApp && (
            <>
              <SheetHeader className="px-5 pt-5">
                <SheetTitle className="font-display text-lg">
                  Candidate profile
                </SheetTitle>
                <SheetDescription>
                  {selectedApp.job?.title} ·{" "}
                  {selectedApp.job?.company?.companyName}
                </SheetDescription>
              </SheetHeader>
              <ApplicantDetail
                app={selectedApp}
                busy={busyId === selectedApp.id}
                onAction={(s) => changeStatus(selectedApp, s)}
              />
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ApplicantDetail({
  app,
  busy,
  onAction,
}: {
  app: ApplicationDTO;
  busy: boolean;
  onAction: (s: ApplicationStatus) => void;
}) {
  const { t, locale } = useT();
  const c = app.candidate;
  if (!c) {
    return (
      <div className="p-5">
        <p className="text-sm text-muted-foreground">
          Candidate data unavailable.
        </p>
      </div>
    );
  }

  const actions: { label: string; status: ApplicationStatus; icon: typeof Star; accent: string }[] = [
    { label: t("status.SHORTLISTED"), status: "SHORTLISTED", icon: Star, accent: "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300" },
    { label: "Schedule interview", status: "INTERVIEWED", icon: CalendarClock, accent: "bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-950 dark:text-violet-300" },
    { label: "Make offer", status: "OFFERED", icon: Trophy, accent: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300" },
    { label: t("status.REJECTED"), status: "REJECTED", icon: XCircle, accent: "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300" },
  ];

  return (
    <div className="px-5 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4 pt-3">
        <CandidateAvatar
          name={c.fullName}
          photoUrl={c.photoUrl}
          size={56}
        />
        <div className="min-w-0">
          <p className="font-display font-bold text-lg truncate">
            {c.fullName}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {c.location ?? "—"}
          </p>
        </div>
      </div>

      {/* Status pill */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn("font-semibold", STATUS_BADGE[app.status])}
        >
          {t(`status.${app.status}`)}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Applied {formatDate(app.appliedAt, locale)}
        </span>
      </div>

      {/* Quick facts */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground uppercase">JLPT</p>
          <Badge
            variant="outline"
            className={cn("mt-1 font-semibold", JLPT_BADGE[c.jlptLevel])}
          >
            {c.jlptLevel}
          </Badge>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground uppercase">Experience</p>
          <p className="mt-1 font-semibold">
            {c.experienceYears} year{c.experienceYears === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Skills */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Skills
        </p>
        <div className="flex flex-wrap gap-1.5">
          {c.skills.length === 0 ? (
            <span className="text-sm text-muted-foreground">No skills listed</span>
          ) : (
            c.skills.map((s) => (
              <Badge key={s} variant="secondary" className="font-medium">
                {s}
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Bio */}
      {c.bio && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            About
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {c.bio}
          </p>
        </div>
      )}

      {/* Education */}
      {c.education && c.education.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Education
          </p>
          <ul className="space-y-1.5 text-sm">
            {c.education.map((ed: EducationEntry, i: number) => (
              <li key={i} className="text-foreground/90">
                <span className="font-medium">{ed.degree}</span> · {ed.field}
                <br />
                <span className="text-xs text-muted-foreground">
                  {ed.institution} · {ed.year}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resume */}
      {(c.resumeUrl || app.resumeUrlSnapshot) && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Resume
          </p>
          <Button asChild variant="outline" size="sm">
            <a
              href={c.resumeUrl || app.resumeUrlSnapshot || "#"}
              target="_blank"
              rel="noreferrer"
              download
            >
              <Download className="h-3.5 w-3.5" />
              Download {c.resumeName || "resume.pdf"}
            </a>
          </Button>
        </div>
      )}

      {/* Cover note */}
      {app.coverNote && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Cover note
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap rounded-lg border border-border bg-background/60 p-3">
            {app.coverNote}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-3 border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Update status
        </p>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Button
                key={a.status}
                type="button"
                variant="outline"
                disabled={busy}
                className={cn("justify-start h-auto py-2.5", a.accent)}
                onClick={() => onAction(a.status)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{a.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============== Profile ============== */

function Profile() {
  const company = useApp((s) => s.company);
  const refreshAuth = useApp((s) => s.refreshAuth);
  const { t } = useT();
  const [form, setForm] = useState({
    companyName: company?.companyName ?? "",
    industry: company?.industry ?? "",
    locationJapan: company?.locationJapan ?? "",
    description: company?.description ?? "",
    website: company?.website ?? "",
    employeeCount: company?.employeeCount ?? "",
    logoUrl: company?.logoUrl ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!company) return;
    setForm({
      companyName: company.companyName,
      industry: company.industry ?? "",
      locationJapan: company.locationJapan ?? "",
      description: company.description ?? "",
      website: company.website ?? "",
      employeeCount: company.employeeCount ?? "",
      logoUrl: company.logoUrl ?? "",
    });
  }, [company?.updatedAt]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadLogo(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Logo must be an image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max logo size is 2MB.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "logo");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error || "Upload failed");
      }
      const data = (await res.json()) as { url: string };
      // The upload route already persists logoUrl on the company profile,
      // so refreshAuth will pick it up. We also update local form state.
      set("logoUrl", data.url);
      toast.success("Logo updated.");
      await refreshAuth();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/api/companies/me", {
        method: "PUT",
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          industry: form.industry.trim() || null,
          locationJapan: form.locationJapan.trim() || null,
          description: form.description.trim() || null,
          website: form.website.trim() || null,
          employeeCount: form.employeeCount.trim() || null,
        }),
      });
      await refreshAuth();
      toast.success("Company profile saved.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6 max-w-3xl">
      {/* Logo */}
      <SectionCard title="Company logo">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <CompanyAvatar
            name={form.companyName || "?"}
            color={form.logoUrl}
            size={72}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {form.logoUrl
                ? "Logo uploaded"
                : "No logo yet — using a colored avatar."}
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              PNG, JPG or SVG · max 2MB
            </p>
            <FileDropZone
              accept="image/*"
              onFile={uploadLogo}
              busy={uploading}
              title={uploading ? "Uploading..." : "Upload new logo"}
              hint="Drag an image or click to browse"
              icon={<ImageIcon className="h-5 w-5" />}
              className="py-5"
            />
          </div>
        </div>
      </SectionCard>

      {/* Details */}
      <SectionCard title="Company details">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              value={form.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={form.industry}
              onChange={(e) => set("industry", e.target.value)}
              placeholder="e.g. IT Services"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="locationJapan">Location (Japan)</Label>
            <Input
              id="locationJapan"
              value={form.locationJapan}
              onChange={(e) => set("locationJapan", e.target.value)}
              placeholder="e.g. Shibuya, Tokyo"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="employeeCount">Employee count</Label>
            <Input
              id="employeeCount"
              value={form.employeeCount}
              onChange={(e) => set("employeeCount", e.target.value)}
              placeholder="e.g. 50-200"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">About the company</Label>
            <Textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Tell candidates what makes your company special..."
              maxLength={5000}
            />
          </div>
        </div>
      </SectionCard>

      {company?.isApproved === false && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">
              {t("dash.company.pending")}
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
              You can edit your profile now — it will be visible once an admin
              approves your account.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 sticky bottom-4">
        <Button
          type="submit"
          disabled={saving}
          className="bg-brand-gradient text-white shadow-premium hover:opacity-90 px-6"
        >
          {saving ? t("common.loading") : t("common.save")}
        </Button>
      </div>
    </form>
  );
}
