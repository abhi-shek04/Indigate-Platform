"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
    <article
      onClick={() => navigate("job-detail", { jobId: job.id })}
      className="group relative cursor-pointer rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-premium hover:-translate-y-0.5 hover:border-saffron/40"
    >
      <div className="flex items-start gap-4">
        <CompanyAvatar
          name={job.company.companyName}
          color={job.company.logoUrl}
          size={48}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display font-bold text-[1.02rem] leading-snug truncate group-hover:text-crimson transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {job.company.companyName}
              </p>
            </div>
            <button
              onClick={toggleSave}
              disabled={saving}
              aria-label={isSaved ? "Unsave job" : "Save job"}
              className={cn(
                "shrink-0 grid place-items-center h-9 w-9 rounded-lg border transition-colors",
                isSaved
                  ? "bg-saffron/15 border-saffron/40 text-saffron"
                  : "bg-background border-border text-muted-foreground hover:text-saffron hover:border-saffron/40",
              )}
            >
              <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
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

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn("font-semibold", JLPT_BADGE[job.jlptRequired])}
            >
              {job.jlptRequired}
            </Badge>
            {job.skillsRequired.slice(0, 3).map((s) => (
              <Badge key={s} variant="secondary" className="font-medium">
                {s}
              </Badge>
            ))}
            {job.skillsRequired.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{job.skillsRequired.length - 3}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
              <Banknote className="h-3.5 w-3.5 text-saffron" />
              {formatSalary(job)}
            </div>
            <span className="text-xs font-medium text-crimson group-hover:translate-x-0.5 transition-transform">
              {t("jobs.details")} →
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
