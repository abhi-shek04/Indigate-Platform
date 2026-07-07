"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api, formatRelative } from "@/lib/api-client";
import {
  CardSkeleton,
  EmptyState,
  SectionCard,
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
import { Briefcase, Plus, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { JobDTO } from "@/lib/types";
import { JLPT_BADGE } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCompanyJobs } from "../shared";

export function Jobs() {
  const { t, locale } = useT();
  const setTab = useApp((s) => s.setCompanyTab);
  const { jobs, loading, reload } = useCompanyJobs();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function toggleActive(j: JobDTO) {
    setBusyId(j.id);
    try {
      await api(`/api/jobs/${j.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !j.isActive }),
      });
      toast.success(j.isActive ? "Job paused." : "Job reactivated.");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      await api(`/api/jobs/${id}`, { method: "DELETE" });
      toast.success("Job deleted.");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete.");
    } finally {
      setBusyId(null);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          {t("dash.company.jobs")}
        </h2>
        <Button
          size="sm"
          className="bg-brand-gradient text-white hover:opacity-90"
          onClick={() => setTab("new")}
        >
          <Plus className="h-4 w-4" />
          {t("dash.company.new")}
        </Button>
      </div>

      {loading ? (
        <CardSkeleton lines={6} />
      ) : !jobs || jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs yet"
          description="Post your first role to start receiving applications."
          action={
            <Button
              className="bg-brand-gradient text-white hover:opacity-90"
              onClick={() => setTab("new")}
            >
              <Plus className="h-4 w-4" />
              {t("dash.company.new")}
            </Button>
          }
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="max-h-[70vh] overflow-y-auto scroll-area">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">Title</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">JLPT</TableHead>
                  <TableHead>Apps</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-5 sm:pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="pl-5 sm:pl-6">
                      <p className="font-semibold text-sm">{j.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelative(j.postedAt, locale)}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {j.location}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={cn("font-semibold", JLPT_BADGE[j.jlptRequired])}
                      >
                        {j.jlptRequired}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {j.applicationCount ?? 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleActive(j)}
                        disabled={busyId === j.id}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                          j.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200"
                            : "bg-muted text-muted-foreground hover:bg-muted/70",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            j.isActive ? "bg-emerald-500" : "bg-muted-foreground",
                          )}
                        />
                        {j.isActive ? "Active" : "Paused"}
                      </button>
                    </TableCell>
                    <TableCell className="text-right pr-5 sm:pr-6">
                      <div className="inline-flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setTab("applicants", { jobId: j.id })
                          }
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Applicants</span>
                        </Button>
                        <AlertDialog
                          open={deleteId === j.id}
                          onOpenChange={(o) => setDeleteId(o ? j.id : null)}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              aria-label="Delete job"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this job?</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{j.title}" will be permanently removed. Existing
                                applications will remain in your applicants tab.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t("common.cancel")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-white hover:bg-destructive/90"
                                onClick={() => remove(j.id)}
                              >
                                {t("common.delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
