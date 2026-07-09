"use client";

import { Fragment, useEffect, useState, useCallback } from "react";
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
import { Progress } from "@/components/ui/progress";
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
import { Switch } from "@/components/ui/switch";
import { JobCard } from "@/components/jobs/job-card";
import { CandidateAvatar } from "@/components/brand/logo";
import { ResumeBuilder } from "@/components/candidate/resume-builder";
import { JobAlerts } from "@/components/candidate/tabs/alerts";
import { AccountSettings } from "@/components/candidate/tabs/settings";
import { toast } from "sonner";
import {
  LayoutDashboard,
  FileText,
  User,
  Upload,
  Bookmark,
  Briefcase,
  Send,
  Star,
  CalendarClock,
  Trophy,
  Plus,
  Trash2,
  FileUp,
  FileCheck2,
  AlertCircle,
  ArrowRight,
  FileEdit,
  Bell,
  CircleDot,
  Settings,
} from "lucide-react";
import type {
  ApplicationDTO,
  CandidateProfileDTO,
  EducationEntry,
  JobDTO,
  JLPTLevel,
} from "@/lib/types";
import {
  JLPT_LEVELS,
  JLPT_BADGE,
  STATUS_BADGE,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV: NavItem[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "applications", label: "My Applications", icon: FileText },
  { key: "profile", label: "Profile", icon: User },
  { key: "builder", label: "Resume Builder", icon: FileEdit },
  { key: "resume", label: "Upload Resume", icon: Upload },
  { key: "saved", label: "Saved Jobs", icon: Bookmark },
  { key: "alerts", label: "Job Alerts", icon: Bell },
  { key: "settings", label: "Account Settings", icon: Settings },
];

export function CandidateDashboard() {
  const user = useApp((s) => s.user);
  const candidate = useApp((s) => s.candidate);
  const authLoading = useApp((s) => s.authLoading);
  const tab = useApp((s) => s.candidateTab);
  const setTab = useApp((s) => s.setCandidateTab);
  const navigate = useApp((s) => s.navigate);
  const { t } = useT();

  if (!user || user.role !== "CANDIDATE") {
    return <RoleGuard expected="CANDIDATE" />;
  }

  // Wait for the candidate profile to load.
  if (authLoading || !candidate) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-saffron border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const welcome = t("dash.candidate.welcome", {
    name: candidate?.fullName?.split(" ")[0] || user.name || user.email,
  });
  const subtitle = candidate?.location
    ? `${candidate.location} · JLPT ${candidate.jlptLevel}`
    : `JLPT ${candidate?.jlptLevel ?? "—"}`;

  return (
    <DashboardShell
      brand="Candidate"
      nav={NAV}
      active={tab}
      onSelect={(k) => setTab(k as typeof tab)}
      welcome={welcome}
      subtitle={subtitle}
      avatar={
        <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-border">
          <CandidateAvatar
            name={candidate?.fullName || user.name || user.email}
            photoUrl={candidate?.photoUrl}
            size={32}
          />
        </div>
      }
      topbarActions={
        <Button
          size="sm"
          variant="outline"
          className="hidden sm:inline-flex"
          onClick={() => navigate("jobs")}
        >
          <Briefcase className="h-4 w-4" />
          {t("dash.candidate.browse")}
        </Button>
      }
    >
      {tab === "overview" && <Overview />}
      {tab === "applications" && <Applications />}
      {tab === "profile" && <Profile />}
      {tab === "builder" && <ResumeBuilder />}
      {tab === "resume" && <Resume />}
      {tab === "saved" && <Saved />}
      {tab === "alerts" && <JobAlerts />}
      {tab === "settings" && <AccountSettings />}
    </DashboardShell>
  );
}

/* ============== Overview ============== */

function computeCompletion(c: CandidateProfileDTO | null): number {
  if (!c) return 0;
  const checks: boolean[] = [
    !!c.fullName?.trim(),
    !!c.phone?.trim(),
    !!c.bio?.trim(),
    !!c.location?.trim(),
    c.jlptLevel !== "NONE",
    (c.skills?.length ?? 0) >= 3,
    !!c.resumeUrl,
    c.experienceYears > 0,
    !!c.education && c.education.length > 0,
    !!c.linkedinUrl?.trim(),
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

function Overview() {
  const candidate = useApp((s) => s.candidate);
  const setTab = useApp((s) => s.setCandidateTab);
  const { t, locale } = useT();
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

  const completion = computeCompletion(candidate);
  const counts = {
    sent: apps?.length ?? 0,
    shortlisted: apps?.filter((a) => a.status === "SHORTLISTED").length ?? 0,
    interviews: apps?.filter((a) => a.status === "INTERVIEWED").length ?? 0,
    offers: apps?.filter((a) => a.status === "OFFERED").length ?? 0,
  };
  const recent = (apps ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              label={t("dash.apps.sent")}
              value={counts.sent}
              icon={Send}
              accent="saffron"
            />
            <MetricCard
              label={t("dash.apps.shortlisted")}
              value={counts.shortlisted}
              icon={Star}
              accent="amber"
            />
            <MetricCard
              label={t("dash.apps.interviews")}
              value={counts.interviews}
              icon={CalendarClock}
              accent="violet"
            />
            <MetricCard
              label={t("dash.apps.offers")}
              value={counts.offers}
              icon={Trophy}
              accent="emerald"
            />
          </>
        )}
      </div>

      {/* Profile completion */}
      <SectionCard
        title={t("dash.profile.completion")}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTab("profile")}
            className="text-crimson hover:text-crimson"
          >
            {t("common.edit")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {completion < 100
                ? t("dash.profile.complete")
                : "Your profile is complete — looking great!"}
            </p>
            <p className="font-display font-extrabold text-2xl text-gradient-brand">
              {completion}%
            </p>
          </div>
          <Progress
            value={completion}
            className="h-2.5 bg-muted"
          />
          {completion < 100 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {completion < 50 && (
                <Button
                  size="sm"
                  className="bg-brand-gradient text-white hover:opacity-90"
                  onClick={() => setTab("profile")}
                >
                  Complete profile
                </Button>
              )}
              {!candidate?.resumeUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTab("resume")}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload resume
                </Button>
              )}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Recent applications */}
      <SectionCard
        title={t("dash.recent.apps")}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTab("applications")}
          >
            {t("common.viewall")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        }
        bodyClassName="p-0"
      >
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FileText}
              title={t("dash.apps.empty")}
              description="Apply to jobs and track your progress here."
              action={
                <Button
                  className="bg-brand-gradient text-white hover:opacity-90"
                  onClick={() => useApp.getState().navigate("jobs")}
                >
                  <Briefcase className="h-4 w-4" />
                  {t("dash.apps.apply")}
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="divide-y">
            {recent.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 px-5 sm:px-6 py-3 hover:bg-accent/40 transition-colors"
              >
                <CandidateAvatar
                  name={a.job?.company?.companyName || "?"}
                  size={36}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">
                    {a.job ? a.job.title : "Job removed"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {a.job?.company?.companyName} ·{" "}
                    {formatRelative(a.appliedAt, locale)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("font-semibold", STATUS_BADGE[a.status])}
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

/* ============== Applications ============== */

function Applications() {
  const { t, locale } = useT();
  const navigate = useApp((s) => s.navigate);
  const refreshAuth = useApp((s) => s.refreshAuth);
  const [apps, setApps] = useState<ApplicationDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  async function withdraw(a: ApplicationDTO) {
    setBusyId(a.id);
    try {
      await api(`/api/applications/${a.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "WITHDRAWN" }),
      });
      toast.success("Application withdrawn.");
      await load();
      await refreshAuth();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to withdraw.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton lines={6} />
      </div>
    );
  }

  if (!apps || apps.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={t("dash.apps.empty")}
        description="Browse curated roles in Japan and apply with one click."
        action={
          <Button
            className="bg-brand-gradient text-white hover:opacity-90"
            onClick={() => navigate("jobs")}
          >
            <Briefcase className="h-4 w-4" />
            {t("dash.apps.apply")}
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title={`${apps.length} application${apps.length === 1 ? "" : "s"}`}
        bodyClassName="p-0"
      >
        <div className="max-h-[70vh] overflow-y-auto scroll-area">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="pl-5 sm:pl-6">Role</TableHead>
                <TableHead className="hidden sm:table-cell">Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-5 sm:pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((a) => (
                <Fragment key={a.id}>
                <TableRow>
                  <TableCell className="pl-5 sm:pl-6">
                    <button
                      onClick={() =>
                        a.job && navigate("job-detail", { jobId: a.job.id })
                      }
                      className="text-left"
                    >
                      <p className="font-semibold text-sm hover:text-crimson transition-colors">
                        {a.job?.title ?? "Job removed"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.job?.company?.companyName} ·{" "}
                        {a.job?.location}
                      </p>
                    </button>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {formatDate(a.appliedAt, locale)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("font-semibold", STATUS_BADGE[a.status])}
                    >
                      {t(`status.${a.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-5 sm:pr-6">
                    {a.status !== "WITHDRAWN" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busyId === a.id}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            Withdraw
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Withdraw this application?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              You're about to withdraw your application for{" "}
                              <span className="font-medium text-foreground">
                                {a.job?.title}
                              </span>{" "}
                              at{" "}
                              <span className="font-medium text-foreground">
                                {a.job?.company?.companyName}
                              </span>
                              . This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("common.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-white hover:bg-destructive/90"
                              onClick={() => withdraw(a)}
                            >
                              Withdraw
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
                {a.status === "INTERVIEWED" && a.interviewDate && (
                  <TableRow className="bg-violet-50/50 dark:bg-violet-950/20">
                    <TableCell colSpan={4} className="px-5 sm:px-6 py-3">
                      <InterviewInfo app={a} />
                    </TableCell>
                  </TableRow>
                )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}

/* ============== Profile ============== */

function Profile() {
  const candidate = useApp((s) => s.candidate);
  const refreshAuth = useApp((s) => s.refreshAuth);
  const { t } = useT();

  const [form, setForm] = useState({
    fullName: candidate?.fullName ?? "",
    phone: candidate?.phone ?? "",
    location: candidate?.location ?? "",
    bio: candidate?.bio ?? "",
    linkedinUrl: candidate?.linkedinUrl ?? "",
    experienceYears: candidate?.experienceYears ?? 0,
    jlptLevel: (candidate?.jlptLevel ?? "NONE") as JLPTLevel,
    skills: candidate?.skills ?? [],
    education: (candidate?.education ?? []) as EducationEntry[],
  });
  const [saving, setSaving] = useState(false);
  const [openToWork, setOpenToWork] = useState<boolean>(
    candidate?.openToWork ?? true,
  );
  const [toggling, setToggling] = useState(false);

  // re-sync when store candidate changes (e.g. after refreshAuth)
  useEffect(() => {
    if (!candidate) return;
    setForm((prev) => ({
      ...prev,
      fullName: candidate.fullName,
      phone: candidate.phone ?? "",
      location: candidate.location ?? "",
      bio: candidate.bio ?? "",
      linkedinUrl: candidate.linkedinUrl ?? "",
      experienceYears: candidate.experienceYears,
      jlptLevel: candidate.jlptLevel,
      skills: candidate.skills,
      education: candidate.education ?? [],
    }));
    setOpenToWork(candidate.openToWork);
  }, [candidate?.updatedAt]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function addEducation() {
    set("education", [
      ...form.education,
      { degree: "", field: "", institution: "", year: "" },
    ]);
  }
  function removeEducation(idx: number) {
    set(
      "education",
      form.education.filter((_, i) => i !== idx),
    );
  }
  function setEducation(idx: number, patch: Partial<EducationEntry>) {
    set(
      "education",
      form.education.map((e, i) => (i === idx ? { ...e, ...patch } : e)),
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/api/candidates/me", {
        method: "PUT",
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone: form.phone.trim() || null,
          location: form.location.trim() || null,
          bio: form.bio.trim() || null,
          linkedinUrl: form.linkedinUrl.trim() || null,
          experienceYears: Number(form.experienceYears) || 0,
          jlptLevel: form.jlptLevel,
          skills: form.skills,
          education: form.education.length ? form.education : null,
        }),
      });
      await refreshAuth();
      toast.success(t("dash.profile.saved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleOpenToWork(next: boolean) {
    setToggling(true);
    const prev = openToWork;
    setOpenToWork(next); // optimistic
    try {
      await api("/api/candidates/me/open-to-work", {
        method: "PATCH",
        body: JSON.stringify({ openToWork: next }),
      });
      await refreshAuth();
      toast.success(
        next
          ? "You're now visible as Open to Work."
          : "Open to Work turned off.",
      );
    } catch (err) {
      setOpenToWork(prev); // rollback
      toast.error(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setToggling(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Open to Work toggle */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-premium">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={cn(
                "grid place-items-center h-11 w-11 rounded-xl shrink-0 transition-colors",
                openToWork
                  ? "bg-saffron/15 text-saffron"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <CircleDot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-lg font-bold">Open to Work</h2>
                {openToWork && (
                  <Badge
                    variant="outline"
                    className="bg-saffron/10 text-saffron border-saffron/30"
                  >
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Companies searching for talent will see you're available.
              </p>
            </div>
          </div>
          <Switch
            checked={openToWork}
            onCheckedChange={(v) => toggleOpenToWork(v)}
            disabled={toggling}
            aria-label="Open to Work"
            className="data-[state=checked]:bg-saffron"
          />
        </div>
      </section>

      {/* Basic info */}
      <SectionCard title={t("dash.profile.basic")}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+91 ..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Bengaluru, India"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              value={form.linkedinUrl}
              onChange={(e) => set("linkedinUrl", e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="experienceYears">Experience (years)</Label>
            <Input
              id="experienceYears"
              type="number"
              min={0}
              max={50}
              value={form.experienceYears}
              onChange={(e) =>
                set("experienceYears", Number(e.target.value) || 0)
              }
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="A short professional summary..."
              maxLength={2000}
            />
          </div>
        </div>
      </SectionCard>

      {/* Japan readiness */}
      <SectionCard title={t("dash.profile.japan")}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>JLPT level</Label>
            <Select
              value={form.jlptLevel}
              onValueChange={(v) => set("jlptLevel", v as JLPTLevel)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JLPT_LEVELS.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {lvl === "NONE" ? "No certification yet" : `JLPT ${lvl}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Current badge</Label>
            <div className="flex items-center h-9">
              <Badge
                variant="outline"
                className={cn("font-semibold", JLPT_BADGE[form.jlptLevel])}
              >
                {form.jlptLevel}
              </Badge>
            </div>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Skills</Label>
            <SkillsInput
              value={form.skills}
              onChange={(next) => set("skills", next)}
              placeholder="Type a skill and press Enter"
            />
            <p className="text-xs text-muted-foreground">
              Add at least 3 skills for the best visibility.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Education */}
      <SectionCard
        title={t("dash.profile.education")}
        action={
          <Button type="button" size="sm" variant="outline" onClick={addEducation}>
            <Plus className="h-3.5 w-3.5" />
            Add entry
          </Button>
        }
        bodyClassName="space-y-4"
      >
        {form.education.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No education entries yet. Click "Add entry" to add one.
          </p>
        ) : (
          form.education.map((ed, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-background/60 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Entry #{i + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeEducation(i)}
                  aria-label="Remove entry"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Degree</Label>
                  <Input
                    value={ed.degree}
                    onChange={(e) =>
                      setEducation(i, { degree: e.target.value })
                    }
                    placeholder="B.Tech"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Field</Label>
                  <Input
                    value={ed.field}
                    onChange={(e) => setEducation(i, { field: e.target.value })}
                    placeholder="Computer Science"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Institution</Label>
                  <Input
                    value={ed.institution}
                    onChange={(e) =>
                      setEducation(i, { institution: e.target.value })
                    }
                    placeholder="IIT Madras"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Year</Label>
                  <Input
                    value={ed.year}
                    onChange={(e) => setEducation(i, { year: e.target.value })}
                    placeholder="2022"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </SectionCard>

      <div className="flex items-center justify-end gap-3 sticky bottom-4">
        <Button
          type="submit"
          disabled={saving}
          className="bg-brand-gradient text-white shadow-premium hover:opacity-90 px-6"
        >
          {saving ? t("common.loading") : t("dash.profile.save")}
        </Button>
      </div>
    </form>
  );
}

/* ============== Resume ============== */

function Resume() {
  const candidate = useApp((s) => s.candidate);
  const refreshAuth = useApp((s) => s.refreshAuth);
  const { t, locale } = useT();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  async function uploadFile(file: File) {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Resume must be a PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max file size is 5MB.");
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "resume");
      // simulate upload progress (fetch doesn't give us easy progress)
      const fakeTimer = setInterval(() => {
        setProgress((p) => Math.min(90, (p ?? 0) + 10));
      }, 80);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      clearInterval(fakeTimer);
      setProgress(100);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Upload failed.");
      }
      toast.success("Resume uploaded.");
      await refreshAuth();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(null), 600);
    }
  }

  async function removeResume() {
    setBusy(true);
    try {
      // The candidate PUT schema accepts `resumeUrl: null`. (The upload route
      // sets resumeName separately — we only null the URL here, which is what
      // applicants see.)
      await api("/api/candidates/me", {
        method: "PUT",
        body: JSON.stringify({ resumeUrl: null }),
      });
      toast.success("Resume removed.");
      await refreshAuth();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {candidate?.resumeUrl ? (
        <SectionCard title={t("dash.resume.current")}>
          <div className="flex items-center gap-4">
            <div className="grid place-items-center h-14 w-14 rounded-xl bg-crimson/15 text-crimson shrink-0">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">
                {candidate.resumeName || "Resume.pdf"}
              </p>
              <p className="text-xs text-muted-foreground">
                Uploaded {formatRelative(candidate.updatedAt, locale)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                >
                  Download
                </a>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    {t("dash.resume.remove")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove resume?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your resume will be removed from your profile. You can
                      upload a new one any time.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-white hover:bg-destructive/90"
                      onClick={removeResume}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </SectionCard>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            You haven't uploaded a resume yet. A PDF resume is required to apply
            to most jobs.
          </p>
        </div>
      )}

      <SectionCard title={t("dash.resume.upload")}>
        <FileDropZone
          accept="application/pdf"
          onFile={uploadFile}
          busy={busy}
          progress={progress ?? undefined}
          title={t("dash.resume.drag")}
          hint="PDF only · max 5 MB"
          icon={<FileUp className="h-5 w-5" />}
        />
        {candidate?.resumeUrl && (
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Uploading a new file will replace your current resume.
          </p>
        )}
      </SectionCard>
    </div>
  );
}

/* ============== Saved Jobs ============== */

function Saved() {
  const { t } = useT();
  const navigate = useApp((s) => s.navigate);
  const [jobs, setJobs] = useState<JobDTO[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api<{ jobs: JobDTO[] }>(
          "/api/candidates/me/saved-jobs",
        );
        if (mounted) setJobs(res.jobs);
      } catch {
        if (mounted) setJobs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title={t("dash.saved.empty")}
        action={
          <Button
            className="bg-brand-gradient text-white hover:opacity-90"
            onClick={() => navigate("jobs")}
          >
            <Briefcase className="h-4 w-4" />
            {t("dash.candidate.browse")}
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {jobs.map((j) => (
        <JobCard key={j.id} job={j} />
      ))}
    </div>
  );
}

/* ============== Interview Info (Milestone H) ============== */

function InterviewInfo({ app }: { app: ApplicationDTO }) {
  const { locale } = useT();
  if (!app.interviewDate) return null;
  const d = new Date(app.interviewDate);
  const dateStr = d.toLocaleString(locale === "ja" ? "ja-JP" : "en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });
  // Google Calendar link
  const start = d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const end = new Date(d.getTime() + 60 * 60 * 1000)
    .toISOString()
    .replace(/[-:]/g, "")
    .split(".")[0] + "Z";
  const calTitle = encodeURIComponent(
    `Interview at ${app.job?.company?.companyName ?? "Company"}`,
  );
  const calDetails = encodeURIComponent(app.interviewNotes || "");
  const calUrl = `https://www.google.com/calendar/event?action=TEMPLATE&text=${calTitle}&dates=${start}/${end}&details=${calDetails}&ctz=Asia/Tokyo`;

  return (
    <div className="flex items-start gap-3 flex-wrap">
      <div className="grid place-items-center h-9 w-9 rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 shrink-0">
        <CalendarClock className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-violet-800 dark:text-violet-300">
          {locale === "ja" ? "面接日程" : "Interview scheduled"}
        </p>
        <p className="text-sm text-foreground">
          {dateStr} JST
        </p>
        {app.interviewNotes && (
          <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
            {app.interviewNotes}
          </p>
        )}
      </div>
      <a href={calUrl} target="_blank" rel="noreferrer">
        <Button size="sm" variant="outline" className="shrink-0">
          <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
          {locale === "ja" ? "カレンダーに追加" : "Add to Calendar"}
        </Button>
      </a>
    </div>
  );
}
