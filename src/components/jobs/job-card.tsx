"use client";

import { cn } from "@/lib/utils";
import { MapPin, Bookmark, Briefcase, Clock, Banknote } from "lucide-react";
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

import { ArrowRight, Sparkles } from "lucide-react";

function toDisplay(str: string): string {
  if (!str) return "";
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function JobCard({ job, listMode = false }: { job: JobDTO; listMode?: boolean }) {
  const { t, locale, pick } = useT();
  const navigate = useApp((s) => s.navigate);
  const user = useApp((s) => s.user);
  const candidate = useApp((s) => s.candidate);
  const refreshAuth = useApp((s) => s.refreshAuth);
  const [saving, setSaving] = useState(false);

  const isSaved = candidate?.savedJobIds.includes(job.id) ?? false;

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
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-card text-card-foreground",
        "border border-border/40 transition-all duration-500",
        "hover:border-saffron/30 hover:shadow-[0_8px_30px_-12px_rgba(255,153,51,0.2)] hover:-translate-y-1",
        "cursor-pointer",
        listMode ? "sm:flex-row sm:items-center sm:gap-6 p-5" : "h-full p-6"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-saffron/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {(job as any).featured && (
        <>
          <div className={cn(
            "absolute bg-brand-gradient",
            listMode ? "inset-y-0 left-0 w-[2px] rounded-l-2xl" : "inset-x-0 top-0 h-[2px] rounded-t-2xl"
          )} />
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full border border-saffron/30 bg-saffron/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-saffron">
            <Sparkles className="h-3 w-3" />
            Featured
          </div>
        </>
      )}

      {listMode ? (
        <>
          <div className="relative flex items-center gap-4 flex-1 min-w-0 z-10">
            <CompanyAvatar
              name={job.company.companyName}
              color={job.company.logoUrl}
              size={36}
            />
            
            <div className="min-w-0 flex-1">
              <h3 className="font-display font-bold text-base leading-snug truncate group-hover:text-crimson transition-colors">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                <span className="font-medium text-foreground/80">{companyName}</span>
                <span aria-hidden>·</span>
                <MapPin className="h-3 w-3" />
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
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-3">
              <CompanyAvatar
                name={companyName}
                color={job.company.logoUrl}
                size={44}
              />
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {companyName}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                </p>
              </div>
            </div>
            <button
              onClick={toggleSave}
              disabled={saving}
              aria-label={isSaved ? "Unsave job" : "Save job"}
              className={cn(
                "shrink-0 grid place-items-center h-8 w-8 rounded-lg border transition-colors",
                isSaved
                  ? "bg-saffron/15 border-saffron/40 text-saffron"
                  : "bg-background border-border/40 text-muted-foreground hover:text-saffron hover:border-saffron/40",
              )}
            >
              <Bookmark className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
            </button>
          </div>

          <h3 className="font-display font-bold text-[1.1rem] leading-snug group-hover:text-crimson transition-colors line-clamp-2">
            {title}
          </h3>

          <div className="mt-2 mb-4">
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", JLPT_BADGE[job.jlptRequired])}>
              {job.jlptRequired} required
            </span>
          </div>

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-auto">
            {job.skillsRequired.slice(0, 3).map((s) => (
              <span key={s} className="skill-tag font-medium bg-secondary/50 border-secondary-foreground/10 text-secondary-foreground shadow-sm">
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
              <p className="font-display font-bold text-base text-saffron mt-1">
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
