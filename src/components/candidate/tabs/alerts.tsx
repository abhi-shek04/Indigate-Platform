"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Bell,
  Plus,
  Trash2,
  Search,
  MapPin,
  Briefcase,
  Award,
  Banknote,
  Loader2,
} from "lucide-react";
import {
  JLPT_LEVELS,
  JOB_TYPES,
  type JLPTLevel,
  type JobType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Shape returned by GET /api/candidates/me/alerts — matches the Prisma
 * JobAlert model. Defined inline (not in @/lib/types) since this is the only
 * place that consumes it.
 */
export interface JobAlert {
  id: string;
  userId: string;
  name: string;
  search: string | null;
  location: string | null;
  jobType: string | null;
  jlptLevel: string | null;
  salaryMin: number | null;
  isActive: boolean;
  lastChecked: string | null;
  createdAt: string;
}

const JOB_TYPE_LABEL: Record<JobType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
};

interface CreateForm {
  name: string;
  search: string;
  location: string;
  jobType: JobType | "";
  jlptLevel: JLPTLevel | "";
  salaryMin: string;
}

const EMPTY_FORM: CreateForm = {
  name: "",
  search: "",
  location: "",
  jobType: "",
  jlptLevel: "",
  salaryMin: "",
};

export function JobAlerts() {
  const [alerts, setAlerts] = useState<JobAlert[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ alerts: JobAlert[] }>(
        "/api/candidates/me/alerts",
      );
      setAlerts(res.alerts);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setField<K extends keyof CreateForm>(k: K, v: CreateForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  async function createAlert(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error("Alert name must be at least 2 characters.");
      return;
    }
    setCreating(true);
    try {
      const payload: Record<string, unknown> = { name: form.name.trim() };
      if (form.search.trim()) payload.search = form.search.trim();
      if (form.location.trim()) payload.location = form.location.trim();
      if (form.jobType) payload.jobType = form.jobType;
      if (form.jlptLevel) payload.jlptLevel = form.jlptLevel;
      const salary = Number(form.salaryMin);
      if (form.salaryMin && Number.isFinite(salary) && salary >= 0) {
        payload.salaryMin = Math.floor(salary);
      }
      await api("/api/candidates/me/alerts", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Alert created.");
      resetForm();
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create alert.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function deleteAlert(id: string) {
    setDeletingId(id);
    try {
      await api(`/api/candidates/me/alerts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      toast.success("Alert deleted.");
      setAlerts((prev) => (prev ? prev.filter((a) => a.id !== id) : prev));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete alert.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-saffron" />
            Job Alerts
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Save your favorite search criteria and we&apos;ll surface matching jobs.
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-brand-gradient text-white hover:opacity-90 font-semibold"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create Alert
          </Button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={createAlert}
          className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-premium space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold">New Alert</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="alert-name">Alert name</Label>
              <Input
                id="alert-name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Tokyo N3 React jobs"
                required
                minLength={2}
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alert-search">Keyword</Label>
              <Input
                id="alert-search"
                value={form.search}
                onChange={(e) => setField("search", e.target.value)}
                placeholder="React, Python, …"
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alert-location">Location</Label>
              <Input
                id="alert-location"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                placeholder="Tokyo, Osaka, …"
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Job type</Label>
              <Select
                value={form.jobType}
                onValueChange={(v) => setField("jobType", v as JobType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((jt) => (
                    <SelectItem key={jt} value={jt}>
                      {JOB_TYPE_LABEL[jt]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>JLPT level</Label>
              <Select
                value={form.jlptLevel}
                onValueChange={(v) => setField("jlptLevel", v as JLPTLevel)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any level" />
                </SelectTrigger>
                <SelectContent>
                  {JLPT_LEVELS.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>
                      {lvl === "NONE" ? "No certification" : `JLPT ${lvl}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="alert-salary">Minimum salary (¥)</Label>
              <Input
                id="alert-salary"
                type="number"
                min={0}
                step={10000}
                value={form.salaryMin}
                onChange={(e) => setField("salaryMin", e.target.value)}
                placeholder="e.g. 250000"
              />
              <p className="text-xs text-muted-foreground">
                Only show jobs with a salary at or above this amount.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating}
              className="bg-brand-gradient text-white hover:opacity-90 font-semibold shadow-glow-brand"
            >
              {creating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Save Alert
            </Button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : !alerts || alerts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
          <div className="mx-auto mb-3 grid place-items-center h-12 w-12 rounded-xl bg-saffron/10 text-saffron">
            <Bell className="h-6 w-6" />
          </div>
          <p className="font-semibold text-foreground">No alerts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first alert to be notified when matching jobs are posted.
          </p>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-brand-gradient text-white hover:opacity-90"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Create your first alert
            </Button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-premium"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base font-bold truncate">
                      {a.name}
                    </h3>
                    {a.isActive && (
                      <Badge
                        variant="outline"
                        className="bg-saffron/10 text-saffron border-saffron/30"
                      >
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {a.search && (
                      <CriteriaBadge icon={Search} label={a.search} />
                    )}
                    {a.location && (
                      <CriteriaBadge icon={MapPin} label={a.location} />
                    )}
                    {a.jobType && (
                      <CriteriaBadge
                        icon={Briefcase}
                        label={
                          JOB_TYPE_LABEL[a.jobType as JobType] ?? a.jobType
                        }
                      />
                    )}
                    {a.jlptLevel && (
                      <CriteriaBadge
                        icon={Award}
                        label={`JLPT ${a.jlptLevel}`}
                      />
                    )}
                    {a.salaryMin != null && (
                      <CriteriaBadge
                        icon={Banknote}
                        label={`¥${a.salaryMin.toLocaleString()}+`}
                      />
                    )}
                    {!a.search &&
                      !a.location &&
                      !a.jobType &&
                      !a.jlptLevel &&
                      a.salaryMin == null && (
                        <span className="text-xs text-muted-foreground">
                          No criteria — matches all new jobs.
                        </span>
                      )}
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 shrink-0 text-muted-foreground",
                        "hover:text-destructive hover:bg-destructive/5",
                      )}
                      disabled={deletingId === a.id}
                      aria-label={`Delete alert ${a.name}`}
                    >
                      {deletingId === a.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete alert?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &ldquo;{a.name}&rdquo; will be permanently removed. You
                        can create a new one any time.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-white hover:bg-destructive/90"
                        onClick={() => deleteAlert(a.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CriteriaBadge({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Badge
      variant="secondary"
      className="gap-1.5 bg-muted/60 text-foreground border border-border"
    >
      <Icon className="h-3 w-3 text-muted-foreground" />
      {label}
    </Badge>
  );
}
