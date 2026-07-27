"use client";

import { cn } from "@/lib/utils";
import { MapPin, Bookmark, ArrowRight, Sparkles, CheckCircle2, Bot, Star } from "lucide-react";
import { CompanyAvatar } from "@/components/brand/logo";
import { formatSalary } from "@/lib/api";
import { formatRelative } from "@/lib/api-client";
import type { JobDTO } from "@/lib/types";
import { JLPT_BADGE } from "@/lib/types";
import { useT } from "@/lib/use-t";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";

function toDisplay(str: string): string {
  if (!str) return "";
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Radial AI score ring component */
function MatchGauge({ score }: { score: number }) {
  const strokeDasharray = 2 * Math.PI * 13;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * Math.min(score, 100)) / 100;
  
  const ringColor =
    score >= 85
      ? "stroke-emerald-500"
      : score >= 70
      ? "stroke-amber-500"
      : "stroke-blue-500";

  const textColor =
    score >= 85
      ? "text-emerald-500"
      : score >= 70
      ? "text-amber-500"
      : "text-blue-500";

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg className="w-10 h-10 transform -rotate-90">
        <circle
          cx="20"
          cy="20"
          r="13"
          className="stroke-muted/40"
          strokeWidth="3"
          fill="transparent"
        />
        <circle
          cx="20"
          cy="20"
          r="13"
          className={cn("transition-all duration-700 ease-out", ringColor)}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <span className={cn("absolute text-[10px] font-extrabold tracking-tighter", textColor)}>
        {score}%
      </span>
    </div>
  );
}

export function JobCard({
  job,
  listMode = false,
  matchScore,
  matchBadge,
  matchReasons,
}: {
  job: JobDTO;
  listMode?: boolean;
  matchScore?: number | null;
  matchBadge?: string | null;
  matchReasons?: string[];
}) {
  const { t, locale, pick } = useT();
  const navigate = useApp((s) => s.navigate);
  const user = useApp((s) => s.user);
  const candidate = useApp((s) => s.candidate);
  const refreshAuth = useApp((s) => s.refreshAuth);
  const [saving, setSaving] = useState(false);

  const isSaved = candidate?.savedJobIds.includes(job.id) ?? false;

  const score = matchScore ?? job.matchScore;
  const badge = matchBadge ?? job.matchBadge;
  const reasons = matchReasons ?? job.matchReasons ?? [];

  async function toggleSave(e: React.MouseEvent) {
    e.stopPropagation();
    if (user?.role !== "CANDIDATE") {
      toast.error("Log in as a candidate to save jobs.");
      navigate("login");
      return;
    }
    setSaving(true);
    try {
      if (isSaved) {
        await api(`/api/candidates/me/saved-jobs?jobId=${job.id}`, {
          method: "DELETE",
        });
        toast.success("Removed from saved jobs.");
      } else {
        await api("/api/candidates/me/saved-jobs", {
          method: "POST",
          body: JSON.stringify({ jobId: job.id }),
        });
        toast.success("Saved to your list.");
      }
      await refreshAuth();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to toggle.");
    } finally {
      setSaving(false);
    }
  }

  const title = toDisplay(pick(job.title, job.titleJa));
  const companyName = toDisplay(job.company.companyName);
  const location = toDisplay(job.location);

  return (
    <motion.article
      onClick={() => navigate("job-detail", { jobId: job.id })}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-card text-card-foreground",
        "border border-border/40 transition-all duration-500",
        "hover:border-saffron/40 hover:shadow-[0_12px_40px_-15px_rgba(255,153,51,0.22)] hover:-translate-y-1",
        "cursor-pointer",
        job.isFeatured
          ? "shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_8px_32px_-8px_rgba(245,158,11,0.15)] border-amber-500/40 bg-gradient-to-b from-amber-500/5 via-card to-card"
          : "",
        listMode ? "sm:flex-row sm:items-center sm:gap-6 p-5" : "h-full p-6"
      )}
    >
      {/* Gold gradient top border — 2px strip */}
      {job.isFeatured && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[2px] rounded-t-[inherit] pointer-events-none z-20"
          style={{
            background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)",
          }}
        />
      )}

      {/* Featured badge — top-right, below bookmark button */}
      {job.isFeatured && (
        <div className="absolute top-3 right-10 z-20">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/12 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold px-2 py-0.5 shadow-sm">
            <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
            Featured
          </span>
        </div>
      )}

      {listMode ? (
        <>
          <div className="relative flex items-center gap-4 flex-1 min-w-0 z-10">
            <CompanyAvatar
              name={job.company.companyName}
              color={job.company.logoUrl}
              size={40}
            />
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base leading-snug truncate group-hover:text-crimson transition-colors">
                  {title}
                </h3>
                {badge && score !== undefined && score !== null && score > 0 && candidate && (
                  <span className="rounded-full bg-saffron/10 border border-saffron/25 text-crimson text-[11px] font-bold px-2.5 py-0.5 shrink-0 inline-flex items-center gap-1">
                    <Bot className="h-3 w-3 text-saffron" /> {badge} {score}%
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                <span className="font-semibold text-foreground">{companyName}</span>
                <span aria-hidden>·</span>
                <MapPin className="h-3 w-3 text-saffron" />
                {location}
              </p>
            </div>
          </div>
          
          <div className="relative shrink-0 flex items-center gap-6 z-10">
            <span className={cn("skill-tag font-semibold text-[10px] py-0.5 px-2", JLPT_BADGE[job.jlptRequired])}>
              {job.jlptRequired}
            </span>
            
            <div className="w-24 text-right">
              <p className="font-display font-bold text-sm text-saffron">{formatSalary(job)}</p>
            </div>
            
            <button
              onClick={toggleSave}
              disabled={saving}
              aria-label={isSaved ? "Unsave job" : "Save job"}
              className={cn(
                "grid place-items-center h-8 w-8 rounded-lg border transition-colors",
                isSaved
                  ? "bg-saffron/15 border-saffron/40 text-saffron"
                  : "bg-background border-border/40 text-muted-foreground hover:text-saffron hover:border-saffron/40",
              )}
            >
              <Bookmark className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
            </button>
            
            <ArrowRight className="h-4 w-4 text-crimson opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </>
      ) : (
        <div className="relative flex flex-col h-full z-10">
          {/* Card Top Row: Company Avatar + AI Score Gauge */}
          <div className="flex items-start justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-3">
              <CompanyAvatar
                name={companyName}
                color={job.company.logoUrl}
                size={44}
              />
              <div>
                <p className="text-xs text-foreground font-semibold">
                  {companyName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-saffron shrink-0" />
                  {location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Radial AI score ring for candidates */}
              {score !== undefined && score !== null && score > 0 && candidate && (
                <div className="flex items-center gap-1 bg-card/90 border border-border/60 rounded-2xl p-1 shadow-sm" title={`AI Match Score: ${score}%`}>
                  <MatchGauge score={score} />
                </div>
              )}

              <button
                onClick={toggleSave}
                disabled={saving}
                aria-label={isSaved ? "Unsave job" : "Save job"}
                className={cn(
                  "grid place-items-center h-9 w-9 rounded-2xl border transition-all",
                  isSaved
                    ? "bg-saffron/15 border-saffron/40 text-saffron shadow-sm"
                    : "bg-background border-border/40 text-muted-foreground hover:text-saffron hover:border-saffron/40",
                )}
              >
                <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
              </button>
            </div>
          </div>

          {/* Job Title */}
          <h3 className="font-display font-bold text-[1.15rem] leading-snug group-hover:text-crimson transition-colors line-clamp-2 mt-1">
            {title}
          </h3>

          {/* Requirements / Badge Pills */}
          <div className="mt-2.5 mb-3 flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider", JLPT_BADGE[job.jlptRequired])}>
              {job.jlptRequired} required
            </span>
            {badge && score !== undefined && score !== null && score > 0 && candidate && (
              <span className="rounded-full bg-saffron/10 border border-saffron/30 text-crimson text-[11px] font-extrabold px-2.5 py-0.5 inline-flex items-center gap-1 shadow-sm">
                <Bot className="h-3 w-3 text-saffron" /> {badge}
              </span>
            )}
          </div>

          {/* AI Match Reasons Box */}
          {reasons.length > 0 && candidate && (
            <div className="my-2 p-2.5 rounded-2xl bg-saffron/5 border border-saffron/20 space-y-1.5 shadow-sm">
              <div className="text-[10px] font-bold text-saffron uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="h-3 w-3 fill-saffron" /> Why You&apos;re A Great Fit
              </div>
              {reasons.slice(0, 2).map((r, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-foreground/80 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span className="truncate">{r}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-2">
            {job.skillsRequired.slice(0, 3).map((s) => (
              <span key={s} className="skill-tag font-medium bg-secondary/60 border-secondary-foreground/10 text-secondary-foreground shadow-sm">
                {s}
              </span>
            ))}
            {job.skillsRequired.length > 3 && (
              <span className="text-xs text-muted-foreground font-medium px-1">
                +{job.skillsRequired.length - 3}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                {t(`jobtype.${job.jobType}`)} · {formatRelative(job.postedAt, locale)}
              </p>
              <p className="font-display font-bold text-base text-saffron mt-0.5">
                {formatSalary(job)}
              </p>
            </div>
            <span className="text-xs font-bold text-crimson inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              View role <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      )}
    </motion.article>
  );
}
