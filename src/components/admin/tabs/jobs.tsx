"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useT } from "@/lib/use-t";
import { api, formatRelative } from "@/lib/api-client";
import {
  EmptyState,
  SectionCard,
  CardSkeleton,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Briefcase, Trash2, Search, Plus, Pencil } from "lucide-react";
import type { JobDTO, CompanyProfileDTO } from "@/lib/types";
import { JLPT_LEVELS, JLPT_BADGE, JOB_TYPES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ExportCsvButton, FormField } from "../shared";

/* ============== Jobs tab ============== */

export function JobsTab() {
  const { t, locale } = useT();
  const [items, setItems] = useState<JobDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<{
    mode: "create" | "edit";
    job: JobDTO | null;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ items: JobDTO[] }>("/api/admin/list/jobs");
      setItems(res.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.companyName.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q),
    );
  }, [items, search]);

  async function toggleActive(j: JobDTO) {
    setBusyId(j.id);
    try {
      await api(`/api/jobs/${j.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !j.isActive }),
      });
      toast.success(j.isActive ? "Paused." : "Activated.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      await api(`/api/jobs/${id}`, { method: "DELETE" });
      toast.success("Job deleted.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusyId(null);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          {t("admin.jobs")}
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("common.search")}
              className="pl-8 h-9 w-[200px]"
            />
          </div>
          <ExportCsvButton resource="jobs" />
          <Button
            size="sm"
            className="bg-brand-gradient text-white hover:opacity-90 font-semibold"
            onClick={() => setEditorState({ mode: "create", job: null })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Post Job
          </Button>
        </div>
      </div>

      {loading ? (
        <CardSkeleton lines={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description={search ? "Try a different search." : undefined}
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="max-h-[70vh] overflow-y-auto scroll-area">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">Title</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">JLPT</TableHead>
                  <TableHead>Apps</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right pr-5 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="pl-5 sm:pl-6">
                      <p className="font-semibold text-sm">{j.title}</p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {j.company.companyName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelative(j.postedAt, locale)}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {j.company.companyName}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
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
                      <Switch
                        checked={j.isActive}
                        onCheckedChange={() => toggleActive(j)}
                        disabled={busyId === j.id}
                        aria-label="Toggle active"
                      />
                    </TableCell>
                    <TableCell className="text-right pr-5 sm:pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-crimson"
                          aria-label="Edit job"
                          onClick={() =>
                            setEditorState({ mode: "edit", job: j })
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" />
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
                              "{j.title}" by {j.company.companyName} will be removed.
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

      {editorState && (
        <JobEditorSheet
          mode={editorState.mode}
          job={editorState.job}
          onClose={() => setEditorState(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}

/* ============== Job Editor Sheet (admin) ============== */

interface JobFormState {
  companyId: string;
  title: string;
  titleJa: string;
  description: string;
  descriptionJa: string;
  location: string;
  jobType: string;
  jlptRequired: string;
  salaryMin: string;
  salaryMax: string;
  salaryType: string;
  skillsInput: string;
  deadline: string;
  isActive: boolean;
}

export function JobEditorSheet({
  mode,
  job,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  job: JobDTO | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [companies, setCompanies] = useState<
    { id: string; companyName: string }[]
  >([]);
  const [form, setForm] = useState<JobFormState>({
    companyId: "",
    title: "",
    titleJa: "",
    description: "",
    descriptionJa: "",
    location: "",
    jobType: "FULL_TIME",
    jlptRequired: "NONE",
    salaryMin: "",
    salaryMax: "",
    salaryType: "MONTHLY",
    skillsInput: "",
    deadline: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Pre-fill form in edit mode
    if (job) {
      setForm({
        companyId: job.companyId,
        title: job.title,
        titleJa: job.titleJa ?? "",
        description: job.description,
        descriptionJa: job.descriptionJa ?? "",
        location: job.location,
        jobType: job.jobType,
        jlptRequired: job.jlptRequired,
        salaryMin: job.salaryMin ? String(job.salaryMin) : "",
        salaryMax: job.salaryMax ? String(job.salaryMax) : "",
        salaryType: job.salaryType,
        skillsInput: job.skillsRequired.join(", "),
        deadline: job.deadline
          ? new Date(job.deadline).toISOString().slice(0, 10)
          : "",
        isActive: job.isActive,
      });
    }
  }, [job]);

  // Load companies for create mode
  useEffect(() => {
    if (mode === "create") {
      api<{ items: CompanyProfileDTO[] }>(
        "/api/admin/list/companies",
      )
        .then((res) =>
          setCompanies(
            res.items
              .filter((c) => c.isApproved)
              .map((c) => ({ id: c.id, companyName: c.companyName })),
          ),
        )
        .catch(() => {});
    }
  }, [mode]);

  function update<K extends keyof JobFormState>(
    key: K,
    value: JobFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "create" && !form.companyId) {
      toast.error("Select a company.");
      return;
    }
    if (form.description.length < 50) {
      toast.error("Description must be at least 50 characters.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        titleJa: form.titleJa || undefined,
        description: form.description,
        descriptionJa: form.descriptionJa || undefined,
        location: form.location,
        jobType: form.jobType,
        jlptRequired: form.jlptRequired,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        salaryType: form.salaryType,
        skillsRequired: form.skillsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        deadline: form.deadline || undefined,
        isActive: form.isActive,
      };
      if (mode === "create") {
        payload.companyId = form.companyId;
        await api("/api/admin/jobs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Job created.");
      } else if (job) {
        await api(`/api/admin/jobs/${job.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Job updated.");
      }
      await onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[440px] sm:max-w-[440px] overflow-y-auto scroll-area">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Post New Job" : "Edit Job"}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={submit} className="space-y-4 mt-4 pr-1">
          {mode === "create" && (
            <div>
              <Label className="mb-1.5 block text-xs font-medium">
                Company *
              </Label>
              <Select
                value={form.companyId}
                onValueChange={(v) => update("companyId", v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select approved company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <FormField label="Title *">
            <Input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Senior Backend Engineer"
            />
          </FormField>
          <FormField label="Title (Japanese)">
            <Input
              value={form.titleJa}
              onChange={(e) => update("titleJa", e.target.value)}
              placeholder="シニアバックエンドエンジニア"
            />
          </FormField>
          <FormField label="Description * (min 50 chars)">
            <Textarea
              required
              rows={5}
              minLength={50}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the role, responsibilities, requirements..."
            />
          </FormField>
          <FormField label="Description (Japanese)">
            <Textarea
              rows={4}
              value={form.descriptionJa}
              onChange={(e) => update("descriptionJa", e.target.value)}
            />
          </FormField>
          <FormField label="Location *">
            <Input
              required
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Tokyo, Japan"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Job type">
              <Select
                value={form.jobType}
                onValueChange={(v) => update("jobType", v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((jt) => (
                    <SelectItem key={jt} value={jt}>
                      {jt.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="JLPT required">
              <Select
                value={form.jlptRequired}
                onValueChange={(v) => update("jlptRequired", v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JLPT_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Salary min">
              <Input
                type="number"
                value={form.salaryMin}
                onChange={(e) => update("salaryMin", e.target.value)}
                placeholder="500000"
              />
            </FormField>
            <FormField label="Salary max">
              <Input
                type="number"
                value={form.salaryMax}
                onChange={(e) => update("salaryMax", e.target.value)}
                placeholder="800000"
              />
            </FormField>
            <FormField label="Type">
              <Select
                value={form.salaryType}
                onValueChange={(v) => update("salaryType", v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOURLY">Hourly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <FormField label="Skills (comma-separated)">
            <Input
              value={form.skillsInput}
              onChange={(e) => update("skillsInput", e.target.value)}
              placeholder="React, Go, PostgreSQL"
            />
          </FormField>
          <FormField label="Deadline">
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => update("deadline", e.target.value)}
            />
          </FormField>
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => update("isActive", v)}
            />
            <span className="text-sm">Active</span>
          </label>
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-card pb-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-brand-gradient text-white hover:opacity-90 font-semibold"
            >
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Create Job"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
