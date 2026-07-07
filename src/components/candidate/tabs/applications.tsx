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
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import {
  Briefcase,
  FileText,
  CalendarClock,
} from "lucide-react";
import type { ApplicationDTO } from "@/lib/types";
import { STATUS_BADGE } from "@/lib/types";
import { cn } from "@/lib/utils";

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
