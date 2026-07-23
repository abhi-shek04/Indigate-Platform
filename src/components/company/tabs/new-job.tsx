"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { SkillsInput } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  FileUp,
  MapPin,
  Building2,
  Sparkles,
} from "lucide-react";
import { useCompletion } from "@ai-sdk/react";
import type { JobDTO, JobType, JLPTLevel, SalaryType } from "@/lib/types";
import { JLPT_LEVELS, JOB_TYPES, SALARY_TYPES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion";

const STEPS = [
  { key: "basic", label: "Basics" },
  { key: "details", label: "Details" },
  { key: "compensation", label: "Compensation" },
  { key: "review", label: "Review" },
] as const;

const CURRENCIES = ["JPY", "USD", "INR", "EUR"] as const;

interface FormState {
  title: string;
  titleJa: string;
  description: string;
  descriptionJa: string;
  location: string;
  jobType: JobType;
  jlptRequired: JLPTLevel;
  salaryMin: string;
  salaryMax: string;
  salaryType: SalaryType;
  currency: string;
  skills: string[];
  deadline: string;
}

export function NewJob() {
  const { t, locale, pick } = useT();
  const setTab = useApp((s) => s.setCompanyTab);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    titleJa: "",
    description: "",
    descriptionJa: "",
    location: "",
    jobType: "FULL_TIME",
    jlptRequired: "N3",
    salaryMin: "",
    salaryMax: "",
    salaryType: "MONTHLY",
    currency: "JPY",
    skills: [],
    deadline: "",
  });

  const onFinishRef = useRef((prompt: string, completion: string) => {});
  useEffect(() => {
    onFinishRef.current = (prompt: string, completion: string) => {
      set("description", completion);
    };
  });

  const handleFinish = useCallback((prompt: string, completion: string) => {
    onFinishRef.current(prompt, completion);
  }, []);

  const { complete: completeDesc, isLoading: isGeneratingDesc } = useCompletion({
    api: "/api/ai/generate-job",
    onFinish: handleFinish,
  });

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
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
      if (form.title.trim().length < 3)
        return "Job title must be at least 3 characters.";
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
        set("description", text);
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function submit() {
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
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        titleJa: form.titleJa.trim() || undefined,
        description: form.description.trim(),
        descriptionJa: form.descriptionJa.trim() || undefined,
        location: form.location.trim(),
        jobType: form.jobType,
        jlptRequired: form.jlptRequired,
        salaryType: form.salaryType,
        currency: form.currency,
        skillsRequired: form.skills,
      };
      if (form.salaryMin) body.salaryMin = Number(form.salaryMin);
      if (form.salaryMax) body.salaryMax = Number(form.salaryMax);
      if (form.deadline) body.deadline = form.deadline;
      const res = await api<JobDTO>("/api/jobs", {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast.success("Job posted! 🎉");
      setTab("applicants", { jobId: res.id });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to post job.");
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
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="grid place-items-center h-9 w-9 rounded-xl bg-brand-gradient text-white shadow-premium">
          <Briefcase className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display font-extrabold text-xl leading-tight">
            {t("dash.company.post")}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pick("Build a premium job listing in 4 quick steps.", "4つの簡単なステップでプレミアムな求人を作成します。")}
          </p>
        </div>
      </div>

      {/* Premium multi-step card */}
      <div className="card-premium overflow-hidden">
        {/* Step indicator header */}
        <div className="px-6 pt-5 pb-4 border-b border-border bg-muted/20">
          <StepIndicator
            steps={[pick("Basics", "基本情報"), pick("Details", "詳細"), pick("Compensation", "給与・条件"), pick("Review", "確認")]}
            current={step}
            onJump={(i) => {
              if (i < step) {
                setDirection(i > step ? 1 : -1);
                setStep(i);
              }
            }}
          />
        </div>

        {/* Animated step content */}
        <div className="px-6 py-6 min-h-[380px]">
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
                    title={pick("Basic Information", "基本情報")}
                    subtitle={pick("Tell candidates what the role is and where it's located.", "役職と勤務地について候補者に伝えます。")}
                  />

                  <Field
                    label={t("dash.company.post.title")}
                    required
                    hint={`${form.title.length}/120`}
                  >
                    <Input
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      placeholder={pick("e.g. Senior Frontend Engineer (React)", "例：シニアフロントエンドエンジニア (React)")}
                      required
                      minLength={3}
                      maxLength={120}
                      className="h-11 rounded-xl text-base font-medium"
                    />
                  </Field>

                  <Field
                    label={pick("Job Title (Japanese)", "求人タイトル (日本語)")}
                    hint={`${form.titleJa.length}/120`}
                  >
                    <Input
                      value={form.titleJa}
                      onChange={(e) => set("titleJa", e.target.value)}
                      placeholder="例: シニアフロントエンドエンジニア"
                      maxLength={120}
                      className="h-11 rounded-xl"
                    />
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field
                      label={t("dash.company.post.location")}
                      required
                    >
                      <Input
                        value={form.location}
                        onChange={(e) => set("location", e.target.value)}
                        placeholder={pick("e.g. Tokyo, Japan", "例：東京都")}
                        required
                        minLength={2}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                    <Field label={t("dash.company.post.type")}>
                      <Select
                        value={form.jobType}
                        onValueChange={(v) => set("jobType", v as JobType)}
                      >
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {JOB_TYPES.map((jt) => (
                            <SelectItem key={jt} value={jt}>
                              {t(`jobtype.${jt}`)}
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
                    title={pick("Role Details", "役職の詳細")}
                    subtitle={pick("Describe responsibilities and required skills.", "職務内容と必要なスキルを説明します。")}
                  />

                  <Field
                    label={
                      <div className="flex items-center justify-between w-full">
                        <span>{t("dash.company.post.desc")} <span className="text-destructive">*</span></span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-saffron hover:text-saffron/80 hover:bg-saffron/10 px-2"
                          disabled={isGeneratingDesc || form.title.length < 3}
                          onClick={() => {
                            completeDesc("", {
                              body: {
                                title: form.title,
                                companyName: "our company", // Handled by API auth if empty
                              },
                            });
                          }}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {isGeneratingDesc ? "Generating..." : "Auto-Generate"}
                        </Button>
                      </div>
                    }
                    hint={`${form.description.trim().length}/50 min`}
                  >
                    <Textarea
                      rows={6}
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder={pick("Describe responsibilities, requirements, and what makes this role exciting...", "職務内容、要件、この役職の魅力について記載してください...")}
                      required
                      minLength={50}
                      className="rounded-xl resize-none"
                    />
                    <Progress value={descProgress} className="h-1 mt-1.5" />
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
                    label={pick("Description (Japanese)", "職務内容 (日本語)")}
                    hint={`${form.descriptionJa.length} chars`}
                  >
                    <Textarea
                      rows={4}
                      value={form.descriptionJa}
                      onChange={(e) => set("descriptionJa", e.target.value)}
                      placeholder="役割の詳細を日本語で入力..."
                      className="rounded-xl resize-none"
                    />
                  </Field>

                  <div className="section-rule" />

                  <Field
                    label={t("dash.company.post.jlpt")}
                  >
                    <Select
                      value={form.jlptRequired}
                      onValueChange={(v) => set("jlptRequired", v as JLPTLevel)}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JLPT_LEVELS.map((lvl) => (
                          <SelectItem key={lvl} value={lvl}>
                            {lvl === "NONE" ? "Any JLPT" : `JLPT ${lvl}+`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field
                    label={t("dash.company.post.skill")}
                    hint={`${form.skills.length}/20`}
                  >
                    <SkillsInput
                      value={form.skills}
                      onChange={(next) => set("skills", next)}
                      placeholder={t("dash.company.post.skill.placeholder")}
                    />
                  </Field>
                </div>
              )}

              {/* ============ STEP 3: Compensation ============ */}
              {step === 2 && (
                <div className="space-y-5">
                  <StepHeader
                    index={3}
                    title={pick("Compensation & Timeline", "給与と期限")}
                    subtitle={pick("Set salary range and application deadline.", "給与範囲と応募の締め切りを設定します。")}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t("dash.company.post.salary.min")}>
                      <Input
                        type="number"
                        min={0}
                        value={form.salaryMin}
                        onChange={(e) => set("salaryMin", e.target.value)}
                        placeholder={pick("e.g. 250000", "例：250000")}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                    <Field label={t("dash.company.post.salary.max")}>
                      <Input
                        type="number"
                        min={0}
                        value={form.salaryMax}
                        onChange={(e) => set("salaryMax", e.target.value)}
                        placeholder={pick("e.g. 400000", "例：400000")}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t("dash.company.post.salary.type")}>
                      <Select
                        value={form.salaryType}
                        onValueChange={(v) => set("salaryType", v as SalaryType)}
                      >
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SALARY_TYPES.map((st) => (
                            <SelectItem key={st} value={st}>
                              {t(`salarytype.${st}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label={pick("Currency", "通貨")}>
                      <Select
                        value={form.currency}
                        onValueChange={(v) => set("currency", v)}
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
                    label={t("dash.company.post.deadline")}
                    hint={form.deadline ? "" : "No deadline = open until filled"}
                  >
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={form.deadline}
                        onChange={(e) => set("deadline", e.target.value)}
                        className="h-11 rounded-xl flex-1"
                      />
                      {form.deadline && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-11 px-3 rounded-xl"
                          onClick={() => set("deadline", "")}
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
                <div className="space-y-4">
                  <StepHeader
                    index={4}
                    title={pick("Review & Publish", "確認と公開")}
                    subtitle={pick("Confirm the details before publishing.", "公開前に詳細を確認してください。")}
                  />

                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 px-4 py-3 flex items-center gap-3">
                    <span className="grid place-items-center h-7 w-7 rounded-full bg-emerald-500 text-white text-xs font-bold">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      Your job will go live immediately after publishing. You can
                      pause it anytime from the Jobs tab.
                    </p>
                  </div>

                  <ReviewRow
                    icon={<Building2 className="h-3.5 w-3.5" />}
                    label={pick("Title", "タイトル")}
                    value={form.title || "—"}
                    sub={form.titleJa || undefined}
                  />
                  <ReviewRow
                    icon={<MapPin className="h-3.5 w-3.5" />}
                    label={pick("Location", "勤務地")}
                    value={form.location || "—"}
                  />
                  <ReviewRow
                    label={pick("Job Type", "雇用形態")}
                    value={t(`jobtype.${form.jobType}`)}
                  />
                  <ReviewRow
                    label={pick("JLPT Required", "必須JLPT")}
                    value={
                      form.jlptRequired === "NONE"
                        ? "Any JLPT"
                        : `JLPT ${form.jlptRequired}+`
                    }
                  />
                  <ReviewRow
                    label={pick("Salary", "給与")}
                    value={
                      form.salaryMin || form.salaryMax
                        ? `${form.salaryMin || "—"} – ${form.salaryMax || "—"} ${form.currency} / ${form.salaryType.toLowerCase()}`
                        : "Not specified"
                    }
                  />
                  <ReviewRow
                    label={pick("Skills", "スキル")}
                    value={
                      form.skills.length > 0
                        ? form.skills.join(", ")
                        : "None specified"
                    }
                  />
                  <ReviewRow
                    label={pick("Deadline", "締め切り")}
                    value={
                      form.deadline
                        ? new Date(form.deadline).toLocaleDateString(
                            locale === "ja" ? "ja-JP" : "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
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

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/20 px-6 py-3.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setTab("jobs")}
            disabled={saving}
            className="text-muted-foreground"
          >
            {t("common.cancel")}
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
                {saving ? t("common.loading") : t("dash.company.post.submit")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
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
    <div className="flex items-center gap-1.5">
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
                  status === "upcoming" && "bg-muted text-muted-foreground",
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
  label: React.ReactNode;
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
