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
import {
  Reveal,
  RevealGroup,
  staggerItem,
  fadeUp,
  slideInLeft,
  slideInRight,
  motion,
} from "@/lib/motion";
import { MagneticButton } from "@/components/brand/motion-primitives";

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

  // Track anonymous job view (fire-and-forget, never blocks)
  useEffect(() => {
    if (!selectedJobId) return;
    fetch(`/api/jobs/${selectedJobId}/view`, { method: "POST" }).catch(() => {});
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
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <button
        onClick={() => navigate("jobs")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-8 group transition-colors"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        {t("common.back")}
      </button>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* Main content */}
        <RevealGroup className="space-y-6" stagger={0.1}>
          <motion.div variants={fadeUp} className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-premium relative overflow-hidden">
            <div aria-hidden className="absolute inset-0 bg-mesh opacity-20" />
            <div aria-hidden className="absolute -top-24 -right-24 h-48 w-48 bg-crimson/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
              <CompanyAvatar
                name={job.company.companyName}
                color={job.company.logoUrl}
                size={80}
                className="shrink-0 ring-4 ring-background shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                  {title}
                </h1>
                <button
                  onClick={() => toast.info(job.company.companyName)}
                  className="inline-flex items-center gap-1.5 text-base font-semibold text-crimson hover:underline"
                >
                  <Building2 className="h-4 w-4" />
                  {job.company.companyName}
                </button>
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm text-muted-foreground font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-saffron" /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-saffron" />
                    {t(`jobtype.${job.jobType}`)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-saffron" />
                    {formatRelative(job.postedAt, locale)}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-border/60 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={cn("font-bold text-[11px] px-2.5 py-1 uppercase tracking-wider", JLPT_BADGE[job.jlptRequired])}
              >
                JLPT {job.jlptRequired}
              </Badge>
              {job.skillsRequired.map((s) => (
                <Badge key={s} variant="secondary" className="font-semibold text-xs px-2.5 py-1">
                  {s}
                </Badge>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm relative">
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="h-6 w-1.5 bg-saffron rounded-full" />
              {locale === "ja" ? "仕事内容" : "About the role"}
            </h2>
            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:text-foreground">
              {description.split("\n").map((line, i) => (
                <p key={i}>
                  {line}
                </p>
              ))}
            </div>

            {job.company.description && (
              <>
                <h2 className="font-display text-2xl font-bold mt-10 mb-6 flex items-center gap-2">
                  <div className="h-6 w-1.5 bg-crimson rounded-full" />
                  {locale === "ja" ? "会社について" : "About the company"}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {pick(job.company.description, null)}
                </p>
                <div className="mt-8 grid sm:grid-cols-2 gap-4 rounded-2xl bg-muted/30 p-5 border border-border/50">
                  {job.company.industry && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-background border border-border grid place-items-center shrink-0">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{pick("Industry", "産業")}</span>
                        <span className="font-medium">{job.company.industry}</span>
                      </div>
                    </div>
                  )}
                  {job.company.locationJapan && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-background border border-border grid place-items-center shrink-0">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">HQ</span>
                        <span className="font-medium">
                          {job.company.locationJapan}
                        </span>
                      </div>
                    </div>
                  )}
                  {job.company.employeeCount && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-background border border-border grid place-items-center shrink-0">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{pick("Size", "あなたへ")}</span>
                        <span className="font-medium">
                          {job.company.employeeCount}
                        </span>
                      </div>
                    </div>
                  )}
                  {job.company.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-background border border-border grid place-items-center shrink-0">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{pick("Website", "ウェブサイト")}</span>
                        <a
                          href={job.company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-crimson hover:underline inline-flex items-center gap-1"
                        >
                          {job.company.website.replace(/^https?:\/\//, "")}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </RevealGroup>

        {/* Sidebar */}
        <Reveal variants={slideInRight} className="lg:sticky lg:top-20 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-premium relative overflow-hidden">
            <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-saffron to-crimson" />
            
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Banknote className="h-4 w-4 text-saffron" />
                {t("jobs.salary")}
              </span>
              <span className="font-display font-bold text-2xl text-gradient-brand">
                {formatSalary(job)}
              </span>
            </div>
            
            <div className="space-y-4 text-sm bg-muted/20 rounded-2xl p-5 border border-border/40">
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

            <div className="mt-6 space-y-3">
              {applied ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3.5 text-sm text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  {locale === "ja" ? "応募済みです" : "You've applied"}
                </div>
              ) : (
                <MagneticButton
                  onClick={() => {
                    if (user?.role !== "CANDIDATE") {
                      toast.error("Log in as a candidate to apply.");
                      navigate("login");
                      return;
                    }
                    if (!(candidate?.resumeUrl || candidate?.hasResumeData)) {
                      toast.error("Complete your resume first.");
                      navigate("candidate");
                      useApp.getState().setCandidateTab("resume");
                      return;
                    }
                    setApplyOpen(true);
                  }}
                  className="w-full bg-brand-gradient text-white hover:opacity-90 font-bold h-12 rounded-xl flex items-center justify-center shadow-glow-brand"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {t("jobs.apply")}
                </MagneticButton>
              )}
              <Button
                variant="outline"
                onClick={toggleSave}
                className="w-full font-bold h-12 rounded-xl border-2 hover:border-saffron/30 hover:bg-saffron/5 hover:text-saffron transition-all"
              >
                <Bookmark
                  className={cn("mr-2 h-4 w-4", isSaved && "fill-current text-saffron")}
                />
                {isSaved ? t("jobs.saved") : t("jobs.save")}
              </Button>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <Reveal variants={fadeUp} className="mt-20">
          <h2 className="font-display text-2xl font-bold mb-8 flex items-center gap-2">
            <div className="h-6 w-1.5 bg-brand-gradient rounded-full" />
            {t("jobs.related")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </Reveal>
      )}

      {/* Apply dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl">
          <div aria-hidden className="absolute inset-0 bg-mesh opacity-30" />
          <div className="relative z-10 p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <div className="h-12 w-12 rounded-2xl bg-saffron/10 text-saffron grid place-items-center mb-4 ring-1 ring-inset ring-saffron/20 mx-auto">
                <Send className="h-6 w-6" />
              </div>
              <DialogTitle className="font-display text-2xl font-bold text-center">
                {locale === "ja" ? "応募する" : "Apply to"} {title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground mb-2 block">
                  {locale === "ja" ? "カバーノート（任意）" : "Cover note (optional)"}
                </label>
                <Textarea
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  className="resize-none bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-saffron/30 rounded-xl"
                  placeholder={
                    locale === "ja"
                      ? "なぜこのポジションに応募するのか教えてください..."
                      : "Tell the company why you're a great fit..."
                  }
                />
              </div>
              {candidate?.resumeUrl && (
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold mb-0.5">
                      {locale === "ja" ? "履歴書が添付されました" : "Resume attached"}
                    </span>
                    <span className="block text-sm text-muted-foreground truncate">
                      {candidate.resumeName ?? "resume.pdf"}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="mt-8 gap-3 sm:gap-0">
              <Button variant="outline" onClick={() => setApplyOpen(false)} className="rounded-xl font-bold h-11 border-2">
                {t("common.cancel")}
              </Button>
              <Button
                onClick={submitApplication}
                disabled={applying}
                className="bg-brand-gradient text-white hover:opacity-90 font-bold h-11 rounded-xl shadow-glow-brand"
              >
                {applying ? t("common.loading") : t("jobs.apply")}
                {!applying && <Send className="ml-2 h-4 w-4" />}
              </Button>
            </DialogFooter>
          </div>
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
    <div className="flex items-center justify-between py-1">
      <span className="inline-flex items-center gap-2 text-muted-foreground font-medium">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="font-bold text-right text-foreground">{value}</span>
    </div>
  );
}
