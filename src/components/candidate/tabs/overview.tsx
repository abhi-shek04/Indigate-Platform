"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api, formatRelative } from "@/lib/api-client";
import {
  MetricCard,
  EmptyState,
  SectionCard,
  MetricSkeleton,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Send,
  Star,
  CalendarClock,
  Trophy,
  Upload,
  Briefcase,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type {
  ApplicationDTO,
  ApplicationStatus,
  CandidateProfileDTO,
  JobMatchDTO,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/** Status → tailwind text/bg classes for status dots & accents. */
const STATUS_COLORS: Record<ApplicationStatus, { dot: string; text: string }> = {
  APPLIED: { dot: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" },
  SHORTLISTED: { dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  INTERVIEWED: { dot: "bg-violet-500", text: "text-violet-600 dark:text-violet-400" },
  OFFERED: { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  REJECTED: { dot: "bg-crimson", text: "text-crimson" },
  WITHDRAWN: { dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

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

export function Overview() {
  const candidate = useApp((s) => s.candidate);
  const setTab = useApp((s) => s.setCandidateTab);
  const navigate = useApp((s) => s.navigate);
  const { t, locale } = useT();

  const [apps, setApps] = useState<ApplicationDTO[] | null>(null);
  const [loading, setLoading] = useState(true);

  // AI Job Matches state
  const [matches, setMatches] = useState<JobMatchDTO[] | null>(null);
  const [matchLoading, setMatchLoading] = useState(true);
  const [hasScores, setHasScores] = useState(false);

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

  const loadMatches = useCallback(async () => {
    setMatchLoading(true);
    try {
      const res = await api<{ matches: JobMatchDTO[]; hasScores: boolean }>(
        "/api/candidates/me/matches",
      );
      setMatches(res.matches);
      setHasScores(res.hasScores);
    } catch {
      setMatches([]);
    } finally {
      setMatchLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    loadMatches();
  }, [load, loadMatches]);

  // Poll matches every 60s while dashboard tab is open
  useEffect(() => {
    const interval = setInterval(loadMatches, 60_000);
    return () => clearInterval(interval);
  }, [loadMatches]);

  const completion = computeCompletion(candidate);
  const counts = {
    sent: apps?.length ?? 0,
    shortlisted: apps?.filter((a) => a.status === "SHORTLISTED").length ?? 0,
    interviews: apps?.filter((a) => a.status === "INTERVIEWED").length ?? 0,
    offers: apps?.filter((a) => a.status === "OFFERED").length ?? 0,
  };
  const recent = (apps ?? []).slice(0, 5);

  const segments = Array.from({ length: 10 }, (_, i) => {
    const threshold = (i + 1) * 10;
    return completion >= threshold;
  });

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
        <div className="space-y-4">
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
          {/* Segmented progress bar — 10 cells */}
          <div className="flex gap-1.5">
            {segments.map((filled, i) => (
              <span
                key={i}
                aria-hidden
                className={cn(
                  "h-2.5 flex-1 rounded-full transition-colors",
                  filled ? "bg-brand-gradient" : "bg-muted",
                )}
              />
            ))}
          </div>
          {completion < 100 && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                className="bg-brand-gradient text-white hover:opacity-90"
                onClick={() => setTab("profile")}
              >
                Complete profile →
              </Button>
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

      {/* ── AI JOB MATCHES ─────────────────────────────────── */}
      <SectionCard
        title={
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-saffron fill-saffron" />
            <span>AI-Matched Jobs</span>
            {hasScores && matches && matches.length > 0 && (
              <span className="ml-1 text-[10px] font-extrabold uppercase tracking-wider text-saffron bg-saffron/10 border border-saffron/20 px-2 py-0.5 rounded-full">
                {matches.length} matches
              </span>
            )}
          </div>
        }
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("jobs")}
            className="text-[12px] font-semibold text-muted-foreground hover:text-saffron gap-1"
          >
            Browse all jobs
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        }
      >
        {matchLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[80px] rounded-xl shimmer-sweep bg-muted/40"
              />
            ))}
          </div>
        ) : !hasScores ? (
          // Profile incomplete — no scores yet
          <div className="flex items-start gap-4 rounded-2xl border border-dashed border-saffron/40 bg-saffron/5 p-5">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-saffron/15 text-saffron shrink-0">
              <Sparkles className="h-5 w-5 fill-saffron" />
            </div>
            <div>
              <p className="font-display font-bold text-[14px]">
                Complete your profile to unlock AI matching
              </p>
              <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
                Add your skills, JLPT level, and a short bio — our AI will instantly
                rank the best-matching Japanese jobs for you.
              </p>
              <Button
                size="sm"
                onClick={() => setTab("profile")}
                className="mt-3 bg-brand-gradient text-white font-semibold h-8 px-4 text-xs shadow-glow-brand"
              >
                Complete profile →
              </Button>
            </div>
          </div>
        ) : matches && matches.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No strong matches yet"
            description="We'll find you matches as new jobs are posted. Check back soon."
          />
        ) : (
          <div className="space-y-3">
            {(matches ?? []).slice(0, 5).map((match) => (
              <motion.div
                key={match.jobId}
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                onClick={() => navigate("job-detail", { jobId: match.jobId })}
                className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 cursor-pointer hover:border-saffron/40 hover:bg-saffron/[0.02] transition-all shadow-sm"
              >
                {/* Score ring */}
                <div className="relative shrink-0 grid place-items-center">
                  <svg width="48" height="48" className="-rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="currentColor"
                      className="text-muted/40"
                      strokeWidth="3.5"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 20 * (1 - match.matchScore / 100)
                      }`}
                      style={{ transition: "stroke-dashoffset 0.8s ease" }}
                    />
                    <defs>
                      <linearGradient
                        id="scoreGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#ff9933" />
                        <stop offset="100%" stopColor="#e02424" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute font-display font-extrabold text-[11px] text-gradient-brand">
                    {match.matchScore}%
                  </span>
                </div>

                {/* Job info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <p className="font-display font-bold text-[14px] leading-snug group-hover:text-crimson transition-colors line-clamp-1">
                        {match.title}
                      </p>
                      <p className="text-[12px] text-muted-foreground font-medium">
                        {match.company}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full",
                          match.matchScore >= 75
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : match.matchScore >= 55
                            ? "bg-saffron/10 text-saffron border border-saffron/20"
                            : "bg-muted text-muted-foreground border border-border",
                        )}
                      >
                        {match.matchScore >= 75
                          ? "Strong fit"
                          : match.matchScore >= 55
                          ? "Good fit"
                          : "Partial fit"}
                      </span>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground mb-2">
                    <span>{match.location}</span>
                    <span aria-hidden className="h-1 w-1 rounded-full bg-border" />
                    <span>
                      {match.jlptRequired !== "NONE"
                        ? match.jlptRequired + " required"
                        : "No JLPT req."}
                    </span>
                  </div>

                  {/* AI reasons */}
                  {match.matchReasons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {match.matchReasons.slice(0, 2).map((r, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[10.5px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/40"
                        >
                          <span className="h-1 w-1 rounded-full bg-saffron shrink-0" />
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {matches && matches.length > 5 && (
              <button
                onClick={() => navigate("jobs")}
                className="w-full text-center text-[12.5px] font-semibold text-saffron hover:underline py-2"
              >
                View {matches.length - 5} more matches →
              </button>
            )}
          </div>
        )}
      </SectionCard>

      {/* Applications */}
      <SectionCard
        title={t("dash.apps.recent")}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTab("applications")}
            className="text-[12px] font-medium text-muted-foreground hover:text-foreground"
          >
            {t("common.viewall")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        }
      >
        {loading ? (
          <div className="space-y-3">
            <div className="h-12 rounded-xl shimmer-sweep bg-muted/40" />
            <div className="h-12 rounded-xl shimmer-sweep bg-muted/40" />
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t("dash.apps.noapps")}
            description={t("dash.apps.noapps.desc")}
            action={
              <Button
                size="sm"
                className="bg-brand-gradient text-white hover:opacity-90 shadow-glow-brand"
                onClick={() => navigate("jobs")}
              >
                <Briefcase className="h-3.5 w-3.5" />
                {t("dash.apps.browse")}
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-border/60">
            {recent.map((app) => {
              const statusInfo =
                STATUS_COLORS[app.status] ?? STATUS_COLORS.APPLIED;
              return (
                <div
                  key={app.id}
                  className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-sm truncate">
                      {app.job?.title ?? "Application"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {app.job?.company?.companyName ?? "Company"} · {app.job?.location ?? "Japan"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          statusInfo.dot,
                        )}
                      />
                      <span className={statusInfo.text}>
                        {t(`status.${app.status}`)}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground/70 hidden sm:inline">
                      {formatRelative(app.appliedAt, locale)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
