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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CandidateAvatar } from "@/components/brand/logo";
import {
  FileText,
  Send,
  Star,
  CalendarClock,
  Trophy,
  Upload,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import type {
  ApplicationDTO,
  CandidateProfileDTO,
} from "@/lib/types";
import { STATUS_BADGE } from "@/lib/types";
import { cn } from "@/lib/utils";

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
