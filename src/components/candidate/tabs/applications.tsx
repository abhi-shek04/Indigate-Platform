"use client";

import { Fragment, useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api, formatDate } from "@/lib/api-client";
import {
  EmptyState,
  SectionCard,
  CardSkeleton,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import {
  Briefcase,
  FileText,
  CalendarClock,
  Send,
  Star,
  Trophy,
  XCircle,
} from "lucide-react";
import type { ApplicationDTO, ApplicationStatus } from "@/lib/types";
import { STATUS_BADGE } from "@/lib/types";
import { cn } from "@/lib/utils";

const PIPELINE: { key: ApplicationStatus; label: string; icon: typeof Send }[] = [
  { key: "APPLIED", label: "Applied", icon: Send },
  { key: "SHORTLISTED", label: "Shortlisted", icon: Star },
  { key: "INTERVIEWED", label: "Interviewed", icon: CalendarClock },
  { key: "OFFERED", label: "Offered", icon: Trophy },
];

function progressIndex(status: ApplicationStatus): number {
  const idx = PIPELINE.findIndex((p) => p.key === status);
  return idx < 0 ? -1 : idx;
}

export function Applications() {
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
        icon={FileText}
        bodyClassName="p-5 sm:p-6 space-y-4"
      >
        {apps.map((a) => {
          const activeIdx = progressIndex(a.status);
          const isRejected = a.status === "REJECTED";
          const isWithdrawn = a.status === "WITHDRAWN";
          return (
            <Fragment key={a.id}>
              <div className="card-premium p-5">
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() =>
                      a.job && navigate("job-detail", { jobId: a.job.id })
                    }
                    className="text-left min-w-0"
                  >
                    <p className="font-display font-bold text-base hover:text-crimson transition-colors truncate">
                      {a.job?.title ?? "Job removed"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.job?.company?.companyName} · {a.job?.location} ·{" "}
                      Applied {formatDate(a.appliedAt, locale)}
                    </p>
                  </button>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold shrink-0",
                      STATUS_BADGE[a.status],
                    )}
                  >
                    {t(`status.${a.status}`)}
                  </span>
                </div>

                {/* Progress pipeline */}
                <div className="mt-4 flex items-center gap-1.5">
                  {PIPELINE.map((stage, i) => {
                    const isDone = activeIdx >= 0 && i <= activeIdx;
                    const isCurrent = i === activeIdx;
                    return (
                      <div key={stage.key} className="flex-1 flex flex-col gap-1.5">
                        <div
                          className={cn(
                            "h-1.5 rounded-full transition-colors",
                            isDone
                              ? "bg-brand-gradient"
                              : "bg-muted",
                          )}
                        />
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "grid place-items-center h-5 w-5 rounded-full text-[10px] font-bold transition-colors shrink-0",
                              isCurrent
                                ? "bg-brand-gradient text-white shadow-glow-brand"
                                : isDone
                                  ? "bg-saffron/20 text-saffron"
                                  : "bg-muted text-muted-foreground",
                            )}
                          >
                            <stage.icon className="h-2.5 w-2.5" />
                          </span>
                          <span
                            className={cn(
                              "text-[11px] font-medium truncate transition-colors",
                              isCurrent
                                ? "text-foreground"
                                : isDone
                                  ? "text-saffron"
                                  : "text-muted-foreground",
                            )}
                          >
                            {stage.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Rejection note */}
                {isRejected && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-crimson/5 border border-crimson/20 px-3 py-2">
                    <XCircle className="h-4 w-4 text-crimson shrink-0 mt-0.5" />
                    <p className="text-xs text-crimson">
                      {a.notes
                        ? a.notes
                        : "Application was not selected to move forward."}
                    </p>
                  </div>
                )}

                {/* Interview info */}
                {a.status === "INTERVIEWED" && a.interviewDate && (
                  <div className="mt-3">
                    <InterviewInfo app={a} />
                  </div>
                )}

                {/* Withdraw action */}
                {!isWithdrawn && (
                  <div className="mt-3 flex justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busyId === a.id}
                          className="text-muted-foreground hover:text-destructive h-7 text-xs"
                        >
                          Withdraw application
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Withdraw this application?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            You&rsquo;re about to withdraw your application for{" "}
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
                  </div>
                )}
              </div>
            </Fragment>
          );
        })}
      </SectionCard>
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
    <div className="flex items-start gap-3 flex-wrap rounded-lg bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-900/40 px-3 py-2.5">
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
        <Button size="sm" variant="outline" className="shrink-0 h-8">
          <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
          {locale === "ja" ? "カレンダーに追加" : "Add to Calendar"}
        </Button>
      </a>
    </div>
  );
}
