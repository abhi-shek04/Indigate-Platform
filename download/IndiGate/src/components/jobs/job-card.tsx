"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bookmark, Briefcase, Clock, Banknote } from "lucide-react";
import { CompanyAvatar } from "@/components/brand/logo";
import { SpotlightCard } from "@/components/brand/motion-primitives";
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

export function JobCard({ job }: { job: JobDTO }) {
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

  const title = pick(job.title, job.titleJa);

  return (
    <motion.article
      onClick={() => navigate("job-detail", { jobId: job.id })}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative cursor-pointer rounded-2xl"
    >
      <SpotlightCard className="rounded-2xl border border-border bg-card h-full transition-all duration-200 hover:border-saffron/50 hover:shadow-premium group">
        <div className="p-5 flex flex-col h-full gap-4">

          {/* TOP ROW: Company identity + bookmark */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <CompanyAvatar
                  name={job.company.companyName}
                  color={job.company.logoUrl}
                  size={44}
                />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">
                  {job.company.companyName}
                </p>
                <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="text-[12px] truncate">{job.location}</span>
                </div>
              </div>
            </div>
            <button
              onClick={toggleSave}
              disabled={saving}
              aria-label={isSaved ? "Unsave job" : "Save job"}
              className={cn(
                "shrink-0 p-1.5 rounded-lg transition-all",
                isSaved
                  ? "text-saffron bg-saffron/10"
                  : "text-muted-foreground hover:text-saffron hover:bg-saffron/10"
              )}
            >
              <Bookmark className={cn("h-4 w-4", isSaved && "fill-saffron")} />
            </button>
          </div>

          {/* JOB TITLE */}
          <div>
            <h3 className="font-display font-bold text-[1.05rem] leading-snug text-foreground group-hover:text-crimson transition-colors line-clamp-2">
              {title}
            </h3>
          </div>

          {/* BADGES ROW */}
          <div className="flex flex-wrap gap-2">
            <Badge className={cn("text-[11px] font-semibold px-2.5 py-0.5 border", JLPT_BADGE[job.jlptRequired])}>
              JLPT {job.jlptRequired === "NONE" ? "Not required" : job.jlptRequired}
            </Badge>
            <Badge variant="outline" className="text-[11px] px-2.5 py-0.5 capitalize">
              {job.jobType.replace("_", " ").toLowerCase()}
            </Badge>
          </div>

          {/* SALARY — prominent */}
          {(job.salaryMin || job.salaryMax) && (
            <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2">
              <Banknote className="h-4 w-4 text-saffron shrink-0" />
              <span className="text-[13px] font-bold text-foreground">
                {formatSalary(job)}
              </span>
            </div>
          )}

          {/* SPACER */}
          <div className="flex-1" />

          {/* BOTTOM ROW: posted date + actions */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelative(job.postedAt, locale)}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[12px] px-3"
                onClick={(e) => { e.stopPropagation(); navigate("job-detail", { jobId: job.id }); }}
              >
                {t("jobs.details")}
              </Button>
              <Button
                size="sm"
                className="h-8 text-[12px] px-3 bg-brand-gradient text-white hover:opacity-90 hover:shadow-glow-brand transition-all"
                onClick={(e) => { e.stopPropagation(); navigate("job-detail", { jobId: job.id }); }}
              >
                {t("jobs.apply")}
              </Button>
            </div>
          </div>

        </div>
      </SpotlightCard>
    </motion.article>
  );
}
