"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useT } from "@/lib/use-t";
import { api, formatRelative } from "@/lib/api-client";
import {
  EmptyState,
  SectionCard,
  CardSkeleton,
} from "@/components/dashboard/dashboard-shell";
import { SkillsInput } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Briefcase,
  Trash2,
  Search,
  Plus,
  Pencil,
  Power,
  Check,
  ChevronLeft,
  ChevronRight,
  FileUp,
  Building2,
  MapPin,
  Users,
} from "lucide-react";
import type { JobDTO, CompanyProfileDTO } from "@/lib/types";
import { JLPT_LEVELS, JLPT_BADGE, JOB_TYPES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion";
import { ExportCsvButton } from "../shared";

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
        <div>
          <h2 className="font-display font-extrabold text-xl">
            {t("admin.jobs")}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create, edit, and manage job postings across all companies.
          </p>
        </div>
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
            className="bg-brand-gradient text-white hover:opacity-90 font-semibold shadow-premium"
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
          description={
            search
              ? "Try a different search."
              : "Post the first job to get started."
          }
          action={
            !search ? (
              <Button
                className="bg-brand-gradient text-white hover:opacity-90 font-semibold"
                onClick={() => setEditorState({ mode: "create", job: null })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Post Job
              </Button>
            ) : undefined
          }
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="max-h-[70vh] overflow-y-auto scroll-area">
            <Table className="table-premium">
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">Position</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">JLPT</TableHead>
                  <TableHead className="text-center">Apps</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-5 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="pl-5 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 ring-1 ring-border">
                          <AvatarImage
                            src={j.company.logoUrl ?? undefined}
                            alt={j.company.companyName}
                          />
                          <AvatarFallback className="text-[11px] font-bold bg-saffron/15 text-saffron">
                            {j.company.companyName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate max-w-[220px]">
                            {j.title}
                            {j.titleJa && (
                              <span className="ml-1.5 text-muted-foreground font-normal">
                                · {j.titleJa}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground md:hidden">
                            {j.company.companyName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelative(j.postedAt, locale)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm font-medium">
                        {j.company.companyName}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {j.location}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="font-medium text-[11px]">
                        {j.jobType.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={cn("font-semibold", JLPT_BADGE[j.jlptRequired])}
                      >
                        {j.jlptRequired}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {j.applicationCount ?? 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          j.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            j.isActive ? "bg-emerald-500" : "bg-muted-foreground/60",
                          )}
                        />
                        {j.isActive ? "Active" : "Paused"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-5 sm:pr-6">
                      <div className="flex items-center justify-end gap-0.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className={cn(
                                "h-8 w-8",
                                j.isActive
                                  ? "text-muted-foreground hover:text-amber-600"
                                  : "text-muted-foreground hover:text-emerald-600",
                              )}
                              aria-label={j.isActive ? "Pause job" : "Activate job"}
                              onClick={() => toggleActive(j)}
                              disabled={busyId === j.id}
                            >
                              <Power className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {j.isActive ? "Pause" : "Activate"}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
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
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <AlertDialog
                          open={deleteId === j.id}
                          onOpenChange={(o) => setDeleteId(o ? j.id : null)}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
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
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this job?</AlertDialogTitle>
                              <AlertDialogDescription>
                                &ldquo;{j.title}&rdquo; by {j.company.companyName} will be permanently removed.
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

/* ============== Job Editor Sheet (admin) — Multi-step ============== */

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
  currency: string;
  skills: string[];
  deadline: string;
  isActive: boolean;
}

const CURRENCIES = ["JPY", "USD", "INR", "EUR"] as const;

const STEPS = [
  { key: "basic", label: "Basics" },
  { key: "details", label: "Details" },
  { key: "compensation", label: "Compensation" },
  { key: "review", label: "Review" },
] as const;

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
  const { locale } = useT();
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
    currency: "JPY",
    skills: [],
    deadline: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
        currency: job.currency || "JPY",
        skills: job.skillsRequired ?? [],
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
      api<{ items: CompanyProfileDTO[] }>("/api/admin/list/companies")
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

  function goNext() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  function validateStep(s: number): string | null {
    if (s === 0) {
      if (mode === "create" && !form.companyId) return "Select a company.";
      if (form.title.trim().length < 3) return "Title must be at least 3 characters.";
      if (form.location.trim().length < 2) return "Location is required.";
    }
    if (s === 1) {
      if (form.description.trim().length < 50)
        return "Description must be at least 50 characters.";
    }
    if (s === 2) {
      if (form.salaryMin && form.salaryMax) {
        if (Number(form.salaryMin) > Number(form.salaryMax))
          return "Salary min cannot exceed salary max.";
      }
    }
    return null;
  }

  function handleNext() {
    const err = validateStep(step);
    if (err) {
      toast.error(err);
      return;
    }
    goNext();
  }

  // JD file import — reads .txt directly, asks for manual paste on pdf/docx
  async function handleJdImport(file: File) {
    const name = file.name.toLowerCase();
    const isText =
      name.endsWith(".txt") ||
      name.endsWith(".md") ||
      file.type.startsWith("text/");
    if (isText) {
      try {
        const text = await file.text();
        if (text.trim().length < 10) {
          toast.error("File appears to be empty.");
          return;
        }
        update("description", text);
        toast.success(`JD imported from ${file.name}`, {
          description: `${text.length} characters loaded into description.`,
        });
      } catch {
        toast.error("Could not read the file.");
      }
    } else if (name.endsWith(".pdf") || name.endsWith(".docx") || name.endsWith(".doc")) {
      toast.message("File attached — please paste JD text manually", {
        description:
          name.endsWith(".pdf")
            ? "PDF text extraction isn't available client-side."
            : "DOCX text extraction isn't available client-side.",
      });
    } else {
      toast.error("Unsupported file type. Use .txt, .pdf, or .docx");
    }
    // reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function submit() {
    // Final validation across all steps
    for (let i = 0; i < STEPS.length - 1; i++) {
      const err = validateStep(i);
      if (err) {
        setStep(i);
        setDirection(i > step ? 1 : -1);
        toast.error(err);
        return;
      }
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        titleJa: form.titleJa.trim() || undefined,
        description: form.description.trim(),
        descriptionJa: form.descriptionJa.trim() || undefined,
        location: form.location.trim(),
        jobType: form.jobType,
        jlptRequired: form.jlptRequired,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        salaryType: form.salaryType,
        currency: form.currency,
        skillsRequired: form.skills,
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      handleNext();
      return;
    }
    void submit();
  }

  const descProgress = Math.min(
    100,
    (form.description.trim().length / 50) * 100,
  );
  const isLastStep = step === STEPS.length - 1;

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[560px] sm:max-w-[560px] p-0 overflow-y-auto scroll-area">
        <SheetHeader className="px-6 pt-6 pb-3 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-brand-gradient text-white">
              <Briefcase className="h-4 w-4" />
            </span>
            <div>
              <SheetTitle className="font-display font-extrabold text-base">
                {mode === "create" ? "Post New Job" : "Edit Job"}
              </SheetTitle>
              <SheetDescription className="text-xs">
                {mode === "create"
                  ? "Create a premium job listing in 4 quick steps."
                  : "Update the job listing details."}
              </SheetDescription>
            </div>
          </div>

          {/* Step indicator */}
          <StepIndicator
            steps={STEPS.map((s) => s.label)}
            current={step}
            onJump={(i) => {
              if (i < step) {
                setDirection(i > step ? 1 : -1);
                setStep(i);
              }
            }}
          />
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-[calc(100%-180px)]">
          <div className="flex-1 px-6 py-5">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: direction * 36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -36 }}
                transition={{ duration: 0.28, ease: easeOutExpo }}
              >
                {/* ============ STEP 1: Basics ============ */}
                {step === 0 && (
                  <div className="space-y-5">
                    <StepHeader
                      index={1}
                      title="Basic Information"
                      subtitle="Who, what, and where."
                    />

                    {mode === "create" && (
                      <Field label="Company" required>
                        <Select
                          value={form.companyId}
                          onValueChange={(v) => update("companyId", v)}
                        >
                          <SelectTrigger className="h-11 rounded-xl">
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
                      </Field>
                    )}

                    <Field
                      label="Job Title (English)"
                      required
                      hint={`${form.title.length}/120`}
                    >
                      <Input
                        required
                        maxLength={120}
                        value={form.title}
                        onChange={(e) => update("title", e.target.value)}
                        placeholder="Senior Backend Engineer"
                        className="h-11 rounded-xl text-base font-medium"
                      />
                    </Field>

                    <Field
                      label="Job Title (Japanese)"
                      hint={`${form.titleJa.length}/120`}
                    >
                      <Input
                        maxLength={120}
                        value={form.titleJa}
                        onChange={(e) => update("titleJa", e.target.value)}
                        placeholder="シニアバックエンドエンジニア"
                        className="h-11 rounded-xl"
                      />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Location" required>
                        <Input
                          required
                          value={form.location}
                          onChange={(e) => update("location", e.target.value)}
                          placeholder="Tokyo, Japan"
                          className="h-11 rounded-xl"
                        />
                      </Field>
                      <Field label="Job Type">
                        <Select
                          value={form.jobType}
                          onValueChange={(v) => update("jobType", v)}
                        >
                          <SelectTrigger className="h-11 rounded-xl">
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
                      </Field>
                    </div>
                  </div>
                )}

                {/* ============ STEP 2: Details ============ */}
                {step === 1 && (
                  <div className="space-y-5">
                    <StepHeader
                      index={2}
                      title="Role Details"
                      subtitle="Describe the role and required skills."
                    />

                    <Field
                      label="Description (English)"
                      required
                      hint={`${form.description.trim().length}/50 min`}
                    >
                      <Textarea
                        required
                        rows={6}
                        minLength={50}
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                        placeholder="Describe the role, responsibilities, requirements..."
                        className="rounded-xl resize-none"
                      />
                      <Progress
                        value={descProgress}
                        className="h-1 mt-1.5"
                      />
                    </Field>

                    {/* JD file import */}
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.md,.pdf,.docx,.doc,text/plain"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleJdImport(f);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed h-10 rounded-xl text-muted-foreground hover:text-saffron hover:border-saffron/50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FileUp className="h-4 w-4 mr-2" />
                        Import JD from file
                        <span className="ml-1.5 text-[10px] text-muted-foreground/70">
                          .txt / .pdf / .docx
                        </span>
                      </Button>
                    </div>

                    <Field
                      label="Description (Japanese)"
                      hint={`${form.descriptionJa.length} chars`}
                    >
                      <Textarea
                        rows={4}
                        value={form.descriptionJa}
                        onChange={(e) => update("descriptionJa", e.target.value)}
                        placeholder="役割の詳細を日本語で入力..."
                        className="rounded-xl resize-none"
                      />
                    </Field>

                    <div className="section-rule" />

                    <Field
                      label="Required Skills"
                      hint={`${form.skills.length}/20`}
                    >
                      <SkillsInput
                        value={form.skills}
                        onChange={(next) => update("skills", next)}
                        placeholder="React, Go, PostgreSQL..."
                      />
                    </Field>

                    <Field label="JLPT Required">
                      <Select
                        value={form.jlptRequired}
                        onValueChange={(v) => update("jlptRequired", v)}
                      >
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {JLPT_LEVELS.map((l) => (
                            <SelectItem key={l} value={l}>
                              {l === "NONE" ? "Any JLPT" : `JLPT ${l}+`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                )}

                {/* ============ STEP 3: Compensation ============ */}
                {step === 2 && (
                  <div className="space-y-5">
                    <StepHeader
                      index={3}
                      title="Compensation & Timeline"
                      subtitle="Set salary range and application deadline."
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Salary Min">
                        <Input
                          type="number"
                          min={0}
                          value={form.salaryMin}
                          onChange={(e) => update("salaryMin", e.target.value)}
                          placeholder="500000"
                          className="h-11 rounded-xl"
                        />
                      </Field>
                      <Field label="Salary Max">
                        <Input
                          type="number"
                          min={0}
                          value={form.salaryMax}
                          onChange={(e) => update("salaryMax", e.target.value)}
                          placeholder="800000"
                          className="h-11 rounded-xl"
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Salary Type">
                        <Select
                          value={form.salaryType}
                          onValueChange={(v) => update("salaryType", v)}
                        >
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HOURLY">Hourly</SelectItem>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                            <SelectItem value="YEARLY">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Currency">
                        <Select
                          value={form.currency}
                          onValueChange={(v) => update("currency", v)}
                        >
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <div className="section-rule" />

                    <Field
                      label="Application Deadline"
                      hint={form.deadline ? "" : "No deadline = open until filled"}
                    >
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={form.deadline}
                          onChange={(e) => update("deadline", e.target.value)}
                          className="h-11 rounded-xl flex-1"
                        />
                        {form.deadline && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-11 px-3 rounded-xl"
                            onClick={() => update("deadline", "")}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </Field>

                    {form.salaryMin && form.salaryMax && (
                      <div className="rounded-xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          Equivalent range:
                        </span>{" "}
                        {Number(form.salaryMin).toLocaleString()} –{" "}
                        {Number(form.salaryMax).toLocaleString()}{" "}
                        {form.currency} / {form.salaryType.toLowerCase()}
                      </div>
                    )}
                  </div>
                )}

                {/* ============ STEP 4: Review ============ */}
                {step === 3 && (
                  <div className="space-y-5">
                    <StepHeader
                      index={4}
                      title="Review & Publish"
                      subtitle="Confirm the details before publishing."
                    />

                    {/* Active toggle — prominent */}
                    <div className="card-premium p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-display font-bold text-sm">
                          Listing status
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {form.isActive
                            ? "Active — visible to candidates immediately."
                            : "Paused — hidden from candidates until activated."}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            form.isActive ? "text-emerald-600" : "text-muted-foreground",
                          )}
                        >
                          {form.isActive ? "ACTIVE" : "PAUSED"}
                        </span>
                        <Switch
                          checked={form.isActive}
                          onCheckedChange={(v) => update("isActive", v)}
                          aria-label="Toggle active"
                        />
                      </div>
                    </div>

                    <ReviewRow
                      icon={<Building2 className="h-3.5 w-3.5" />}
                      label="Company"
                      value={
                        mode === "edit" && job
                          ? job.company.companyName
                          : companies.find((c) => c.id === form.companyId)
                            ?.companyName ?? "—"
                      }
                    />
                    <ReviewRow
                      label="Title"
                      value={form.title || "—"}
                      sub={form.titleJa || undefined}
                    />
                    <ReviewRow
                      icon={<MapPin className="h-3.5 w-3.5" />}
                      label="Location"
                      value={form.location || "—"}
                    />
                    <ReviewRow
                      label="Job Type"
                      value={form.jobType.replace("_", " ")}
                    />
                    <ReviewRow
                      label="JLPT Required"
                      value={form.jlptRequired === "NONE" ? "Any JLPT" : `JLPT ${form.jlptRequired}+`}
                    />
                    <ReviewRow
                      label="Salary"
                      value={
                        form.salaryMin || form.salaryMax
                          ? `${form.salaryMin || "—"} – ${form.salaryMax || "—"} ${form.currency} / ${form.salaryType.toLowerCase()}`
                          : "Not specified"
                      }
                    />
                    <ReviewRow
                      label="Skills"
                      value={
                        form.skills.length > 0
                          ? form.skills.join(", ")
                          : "None specified"
                      }
                    />
                    <ReviewRow
                      label="Deadline"
                      value={
                        form.deadline
                          ? new Date(form.deadline).toLocaleDateString(
                              locale === "ja" ? "ja-JP" : "en-US",
                              { year: "numeric", month: "short", day: "numeric" },
                            )
                          : "Open until filled"
                      }
                    />

                    {form.description.trim().length > 0 && (
                      <div className="rounded-xl border border-border bg-muted/40 p-3">
                        <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-1.5">
                          Description preview
                        </p>
                        <p className="text-xs text-foreground/80 line-clamp-4 whitespace-pre-wrap">
                          {form.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-border bg-card/95 backdrop-blur px-6 py-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={saving}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={goBack}
                  disabled={saving}
                  className="rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4 mr-0.5" />
                  Back
                </Button>
              )}
              {!isLastStep ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  className="rounded-xl bg-brand-gradient text-white hover:opacity-90 font-semibold shadow-premium"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-0.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-brand-gradient text-white hover:opacity-90 font-semibold shadow-premium px-6"
                >
                  {saving
                    ? "Saving..."
                    : mode === "create"
                      ? "Publish Job"
                      : "Save Changes"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/* ============ Small helper components ============ */

function StepIndicator({
  steps,
  current,
  onJump,
}: {
  steps: string[];
  current: number;
  onJump?: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 mt-3">
      {steps.map((label, i) => {
        const status =
          i < current ? "complete" : i === current ? "current" : "upcoming";
        const clickable = i < current && onJump;
        return (
          <div key={label} className="flex items-center gap-1.5 flex-1">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJump?.(i)}
              className={cn(
                "flex items-center gap-2 group",
                !clickable && "cursor-default",
              )}
            >
              <span
                className={cn(
                  "grid place-items-center h-6 w-6 rounded-full text-[10px] font-bold transition-all flex-shrink-0",
                  status === "current" &&
                    "bg-brand-gradient text-white shadow-premium",
                  status === "complete" &&
                    "bg-saffron/15 text-saffron ring-1 ring-inset ring-saffron/30 group-hover:bg-saffron/25",
                  status === "upcoming" &&
                    "bg-muted text-muted-foreground",
                )}
              >
                {status === "complete" ? (
                  <Check className="h-3 w-3" />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium hidden sm:block transition-colors",
                  status === "current"
                    ? "text-foreground"
                    : status === "complete"
                      ? "text-saffron/80"
                      : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors",
                  i < current ? "bg-saffron/50" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepHeader({
  index,
  title,
  subtitle,
}: {
  index: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid place-items-center h-7 w-7 rounded-lg bg-saffron/12 text-saffron font-display font-bold text-sm flex-shrink-0">
        {index}
      </span>
      <div>
        <h3 className="font-display font-extrabold text-base leading-tight">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        {hint && (
          <span className="text-[10px] text-muted-foreground/80 font-medium">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function ReviewRow({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/60 last:border-0">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <div className="text-right max-w-[60%]">
        <p className="text-sm font-medium text-foreground break-words">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
