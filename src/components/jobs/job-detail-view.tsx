"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api, formatRelative, formatDate } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  Banknote,
  Calendar,
  Building2,
  Globe,
  Users,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Send,
} from "lucide-react";
import { CompanyAvatar } from "@/components/brand/logo";
import { JobCard } from "@/components/jobs/job-card";
import { formatSalary } from "@/lib/api";
import { cn } from "@/lib/utils";
import { JLPT_BADGE } from "@/lib/types";
import type { JobDTO } from "@/lib/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function JobDetailView() {
  const { t, locale, pick } = useT();
  const { selectedJobId, navigate, user, candidate, refreshAuth } = useApp();
  const [job, setJob] = useState<JobDTO | null>(null);
  const [related, setRelated] = useState<JobDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [cover, setCover] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!selectedJobId) {
      navigate("jobs");
      return;
    }
    setLoading(true);
    Promise.all([
      api<JobDTO>(`/api/jobs/${selectedJobId}`),
      api<{ jobs: JobDTO[] }>(`/api/jobs?limit=4`),
    ])
      .then(([j, r]) => {
        setJob(j);
        setRelated(r.jobs.filter((x) => x.id !== j.id).slice(0, 3));
      })
      .catch(() => {
        toast.error("Job not found.");
        navigate("jobs");
      })
      .finally(() => setLoading(false));
    // check if applied
    if (user?.role === "CANDIDATE") {
      api<{ applications: { jobId: string; status: string }[] }>(
        `/api/applications?jobId=${selectedJobId}`,
      )
        .then((d) => {
          if (d.applications.length > 0) setApplied(true);
        })
        .catch(() => {});
    }
  }, [selectedJobId]);

  const isSaved = candidate?.savedJobIds.includes(selectedJobId ?? "") ?? false;

  async function toggleSave() {
    if (user?.role !== "CANDIDATE") {
      toast.error("Log in as a candidate to save jobs.");
      navigate("login");
      return;
    }
    try {
      if (isSaved) {
        await api(`/api/candidates/me/saved-jobs?jobId=${selectedJobId}`, {
          method: "DELETE",
        });
        toast.success("Removed from saved jobs.");
      } else {
        await api("/api/candidates/me/saved-jobs", {
          method: "POST",
          body: JSON.stringify({ jobId: selectedJobId }),
        });
        toast.success("Saved to your list.");
      }
      await refreshAuth();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    }
  }

  async function submitApplication() {
    setApplying(true);
    try {
      await api("/api/applications", {
        method: "POST",
        body: JSON.stringify({ jobId: selectedJobId, coverNote: cover }),
      });
      setApplied(true);
      setApplyOpen(false);
      toast.success("Application submitted! 🎉");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to apply.");
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-6 w-24 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </main>
    );
  }

  if (!job) return null;

  const title = pick(job.title, job.titleJa);
  const description = pick(job.description, job.descriptionJa);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate("jobs")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-premium">
            <div className="flex items-start gap-4">
              <CompanyAvatar
                name={job.company.companyName}
                color={job.company.logoUrl}
                size={64}
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {title}
                </h1>
                <button
                  onClick={() => toast.info(job.company.companyName)}
                  className="mt-1 inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Building2 className="h-4 w-4" />
                  {job.company.companyName}
                </button>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {t(`jobtype.${job.jobType}`)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatRelative(job.postedAt, locale)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-1.5">
              <Badge
                variant="outline"
                className={cn("font-semibold", JLPT_BADGE[job.jlptRequired])}
              >
                JLPT {job.jlptRequired}
              </Badge>
              {job.skillsRequired.map((s) => (
                <Badge key={s} variant="secondary" className="font-medium">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold mb-3">
              {locale === "ja" ? "仕事内容" : "About the role"}
            </h2>
            <div className="prose prose-sm max-w-none">
              {description.split("\n").map((line, i) => (
                <p key={i} className="text-foreground/80 leading-relaxed mb-3">
                  {line}
                </p>
              ))}
            </div>

            {job.company.description && (
              <>
                <h2 className="font-display text-xl font-bold mt-8 mb-3">
                  {locale === "ja" ? "会社について" : "About the company"}
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  {pick(job.company.description, null)}
                </p>
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  {job.company.industry && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Industry:</span>
                      <span className="font-medium">{job.company.industry}</span>
                    </div>
                  )}
                  {job.company.locationJapan && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">HQ:</span>
                      <span className="font-medium">
                        {job.company.locationJapan}
                      </span>
                    </div>
                  )}
                  {job.company.employeeCount && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium">
                        {job.company.employeeCount}
                      </span>
                    </div>
                  )}
                  {job.company.website && (
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-crimson hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      {job.company.website.replace(/^https?:\/\//, "")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-20 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-premium">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                  <Banknote className="h-4 w-4 text-saffron" />
                  {t("jobs.salary")}
                </span>
                <span className="font-display font-bold text-lg">
                  {formatSalary(job)}
                </span>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <Row icon={Briefcase} label={t("jobs.filter.type")} value={t(`jobtype.${job.jobType}`)} />
                <Row icon={MapPin} label={t("jobs.filter.location")} value={job.location} />
                <Row
                  icon={CheckCircle2}
                  label={t("jobs.filter.jlpt")}
                  value={`JLPT ${job.jlptRequired}`}
                />
                {job.deadline && (
                  <Row
                    icon={Calendar}
                    label={t("jobs.deadline")}
                    value={formatDate(job.deadline, locale)}
                  />
                )}
                <Row
                  icon={Users}
                  label={locale === "ja" ? "応募数" : "Applicants"}
                  value={String(job.applicationCount ?? 0)}
                />
              </div>

              <div className="mt-6 space-y-2">
                {applied ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {locale === "ja" ? "応募済みです" : "You've applied to this job"}
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      if (user?.role !== "CANDIDATE") {
                        toast.error("Log in as a candidate to apply.");
                        navigate("login");
                        return;
                      }
                      if (!candidate?.resumeUrl) {
                        toast.error("Upload your resume first.");
                        navigate("candidate");
                        useApp.getState().setCandidateTab("resume");
                        return;
                      }
                      setApplyOpen(true);
                    }}
                    className="w-full bg-brand-gradient text-white hover:opacity-90 font-semibold h-11"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {t("jobs.apply")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={toggleSave}
                  className="w-full font-medium"
                >
                  <Bookmark
                    className={cn("mr-2 h-4 w-4", isSaved && "fill-current text-saffron")}
                  />
                  {isSaved ? t("jobs.saved") : t("jobs.save")}
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold mb-6">
            {t("jobs.related")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </section>
      )}

      {/* Apply dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {locale === "ja" ? "応募する" : "Apply to"} {title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">
              {locale === "ja" ? "カバーノート（任意）" : "Cover note (optional)"}
            </label>
            <Textarea
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder={
                locale === "ja"
                  ? "なぜこのポジションに応募するのか教えてください..."
                  : "Tell the company why you're a great fit..."
              }
            />
            {candidate?.resumeUrl && (
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-muted-foreground">
                  {locale === "ja" ? "履歴書:" : "Resume:"}
                </span>
                <span className="font-medium truncate">
                  {candidate.resumeName ?? "resume.pdf"}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={submitApplication}
              disabled={applying}
              className="bg-brand-gradient text-white hover:opacity-90 font-semibold"
            >
              {applying ? t("common.loading") : t("jobs.apply")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
