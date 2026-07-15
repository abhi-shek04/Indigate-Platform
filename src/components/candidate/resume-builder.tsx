"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Save,
  Printer,
  FileText,
  Eye,
  User,
  GraduationCap,
  Briefcase,
  Award,
  Globe,
  Sparkles,
  Loader2,
  X,
  Download,
  Code2,
  Languages,
  MapPin,
  ListChecks,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { EnglishResumePDF } from "@/lib/pdf-templates/english-resume-pdf";
import { JapaneseResumePDF } from "@/lib/pdf-templates/japanese-resume-pdf";
import {
  EMPTY_RESUME,
  GENDER_OPTIONS,
  NATIONALITY_OPTIONS,
  INDIAN_STATES,
  LANGUAGE_OPTIONS,
  JLPT_OPTIONS,
  type ResumeData,
  type ResumeEducation,
  type ResumeProject,
  type ResumeActivity,
  type ResumeAward,
  type ResumeSkill,
  type JlptLevel,
} from "@/lib/resume-types";
import { ResumePreview } from "./resume-preview";

type Tab = "edit" | "preview-en" | "translate" | "preview-ja";

/** Sidebar navigation entries — id MUST match the `id` on each <Section>. */
const SECTIONS: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { id: "section-personal", icon: User, label: "Personal Info" },
  { id: "section-education", icon: GraduationCap, label: "Education" },
  { id: "section-experience", icon: Briefcase, label: "Work Experience" },
  { id: "section-certifications", icon: Award, label: "Certifications" },
  { id: "section-projects", icon: Code2, label: "Projects" },
  { id: "section-skills", icon: Code2, label: "Skills" },
  { id: "section-excel", icon: ListChecks, label: "Skills I Excel In" },
  { id: "section-jlpt", icon: Languages, label: "Japanese & Languages" },
  { id: "section-japan", icon: MapPin, label: "Why Japan?" },
  { id: "section-selfpr", icon: Sparkles, label: "Self-PR & Hobbies" },
];

/**
 * Returns a 0–100 percentage of how many resume sections have at least some
 * data filled. Pure function — used to render the sidebar progress bar.
 */
function computeProgress(data: ResumeData): number {
  const filled: boolean[] = [
    !!(data.name?.trim() || data.email?.trim() || data.phone?.trim()),
    data.education.length > 0,
    data.activities.length > 0,
    data.awards.length > 0,
    data.projects.length > 0,
    data.skills.length > 0,
    (data.skillsExcelSummary?.length ?? 0) > 0,
    !!(data.currentJlpt || data.expectedJlpt || data.otherLanguages?.trim()),
    !!(data.japanMotivation?.whyJapan?.trim() ||
      data.japanMotivation?.careerInJapan?.trim() ||
      data.japanMotivation?.challenges?.trim()),
    !!(data.selfPr?.trim() || data.hobbies?.trim()),
  ];
  return Math.round(
    (filled.filter(Boolean).length / filled.length) * 100,
  );
}

export function ResumeBuilder() {
  const { t } = useT();
  const navigate = useApp((s) => s.navigate);
  const candidate = useApp((s) => s.candidate);
  const user = useApp((s) => s.user);
  const [data, setData] = useState<ResumeData>(EMPTY_RESUME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("edit");
  const [langInput, setLangInput] = useState("");
  const [activeSection, setActiveSection] = useState<string>(
    "section-personal",
  );
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState(false);

  // Keep the sidebar active-section indicator in sync with the scroll position.
  // Only runs in the Edit tab (sidebar is hidden in previews / print).
  useEffect(() => {
    if (tab !== "edit") return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tab]);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ resumeData: ResumeData | null }>(
        "/api/candidates/me/resume",
      );
      if (res.resumeData) {
        // Merge with EMPTY_RESUME so new sub-objects (`japanMotivation`,
        // `skills`, …) always exist even on previously-saved resumes.
        setData({
          ...EMPTY_RESUME,
          ...res.resumeData,
          japanMotivation: {
            ...EMPTY_RESUME.japanMotivation,
            ...(res.resumeData.japanMotivation ?? {}),
          },
        });
      } else if (candidate) {
        setData({
          ...EMPTY_RESUME,
          name: candidate.fullName,
          email: user?.email ?? "",
          phone: candidate.phone ?? "",
          nationality: "India",
          languages: ["English"],
          languagesJa: ["英語"],
        });
      }
    } catch {
      toast.error("Failed to load resume data.");
    } finally {
      setLoading(false);
    }
  }, [candidate?.id, user?.email]);

  useEffect(() => {
    load();
  }, [load]);

  // Detect if the resume has already been translated (has *Ja content).
  useEffect(() => {
    if (
      data.selfPrJa?.trim() ||
      data.projects.some((p) => p.descriptionJa?.trim()) ||
      data.activities.some((a) => a.dutiesJa?.trim())
    ) {
      setTranslated(true);
    } else {
      setTranslated(false);
    }
  }, [data]);

  async function save() {
    setSaving(true);
    try {
      await api("/api/candidates/me/resume", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      toast.success("Resume saved!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  /** Calls the translation API — saves first, then AI translates + saves server-side. */
  async function handleTranslate() {
    setTranslating(true);
    try {
      // Save first so the API has the latest data.
      await api("/api/candidates/me/resume", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      // Call the translation API (loads from DB, translates, saves, returns full data).
      const result = await api<{ resumeData: ResumeData }>(
        "/api/candidates/me/resume/translate",
        { method: "POST" },
      );
      // Replace state with the merged translated data.
      setData(result.resumeData);
      setTranslated(true);
      toast.success("Translation complete! Your Japanese resume is ready.");
      setTab("preview-ja");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Translation failed. Please try again.");
    } finally {
      setTranslating(false);
    }
  }

  function print() {
    window.print();
  }

  function update<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  // Language tag management — the JP labels are auto-synced from the EN list
  // via LANGUAGE_OPTIONS so the candidate never types Japanese.
  function addLanguage(lang: string) {
    if (!lang.trim()) return;
    const opt = LANGUAGE_OPTIONS.find((l) => l.value === lang);
    if (data.languages.includes(lang)) return;
    update("languages", [...data.languages, lang]);
    update("languagesJa", [...data.languagesJa, opt?.labelJa ?? lang]);
    setLangInput("");
  }
  function removeLanguage(idx: number) {
    update(
      "languages",
      data.languages.filter((_, i) => i !== idx),
    );
    update(
      "languagesJa",
      data.languagesJa.filter((_, i) => i !== idx),
    );
  }

  // Education
  function addEducation() {
    update("education", [
      ...data.education,
      { year: "", month: "", degree: "", field: "", institution: "" },
    ]);
  }
  function updateEducation(i: number, patch: Partial<ResumeEducation>) {
    update("education", data.education.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  }
  function removeEducation(i: number) {
    update("education", data.education.filter((_, j) => j !== i));
  }

  // Projects
  function addProject() {
    update("projects", [
      ...data.projects,
      { year: "", period: "", name: "", description: "", techStack: "" },
    ]);
  }
  function updateProject(i: number, patch: Partial<ResumeProject>) {
    update("projects", data.projects.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  }
  function removeProject(i: number) {
    update("projects", data.projects.filter((_, j) => j !== i));
  }

  // Activities (Work Experience)
  function addActivity() {
    update("activities", [
      ...data.activities,
      { year: "", period: "", duration: "", organization: "", role: "", duties: "" },
    ]);
  }
  function updateActivity(i: number, patch: Partial<ResumeActivity>) {
    update("activities", data.activities.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  }
  function removeActivity(i: number) {
    update("activities", data.activities.filter((_, j) => j !== i));
  }

  // Awards (Certifications)
  function addAward() {
    update("awards", [
      ...data.awards,
      { year: "", month: "", title: "", description: "", organization: "" },
    ]);
  }
  function updateAward(i: number, patch: Partial<ResumeAward>) {
    update("awards", data.awards.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  }
  function removeAward(i: number) {
    update("awards", data.awards.filter((_, j) => j !== i));
  }

  // Skills
  function addSkill() {
    update("skills", [
      ...data.skills,
      { name: "", learnedInClass: false, canOperate: false, canTeach: false },
    ]);
  }
  function updateSkill(i: number, patch: Partial<ResumeSkill>) {
    update("skills", data.skills.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  }
  function removeSkill(i: number) {
    update("skills", data.skills.filter((_, j) => j !== i));
  }

  // Skills in Which I Excel — dynamic bullet list
  function addExcelItem() {
    update("skillsExcelSummary", [...(data.skillsExcelSummary ?? []), ""]);
  }
  function updateExcelItem(i: number, value: string) {
    update(
      "skillsExcelSummary",
      (data.skillsExcelSummary ?? []).map((s, j) => (j === i ? value : s)),
    );
  }
  function removeExcelItem(i: number) {
    update(
      "skillsExcelSummary",
      (data.skillsExcelSummary ?? []).filter((_, j) => j !== i),
    );
  }

  // Japan motivation
  function updateJapan<K extends keyof NonNullable<ResumeData["japanMotivation"]>>(
    key: K,
    value: string,
  ) {
    setData((prev) => ({
      ...prev,
      japanMotivation: {
        ...EMPTY_RESUME.japanMotivation,
        ...(prev.japanMotivation ?? {}),
        [key]: value,
      },
    }));
  }

  if (loading) {
    return (
      <div className="flex-1 grid place-items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-saffron" />
      </div>
    );
  }

  const progress = computeProgress(data);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 print:max-w-none print:p-0">
      {/* Header */}
      <div className="print:hidden flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <button
            onClick={() => navigate("candidate")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <FileText className="h-7 w-7 text-saffron" />
            Resume Builder
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your resume in English first, then translate to Japanese with AI.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={save} disabled={saving} className="bg-brand-gradient text-white hover:opacity-90 font-semibold">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
          <Button onClick={print} variant="ghost" size="sm" className="font-semibold h-9">
            <Printer className="h-4 w-4 mr-1.5" />
            Print
          </Button>
        </div>
      </div>

      {/* 4-step stepper */}
      <div className="print:hidden flex items-center gap-0 mb-8 overflow-x-auto pb-1">
        {[
          { key: "edit" as const, step: 1, label: "Fill English Form", icon: FileText },
          { key: "preview-en" as const, step: 2, label: "Preview & Download EN", icon: Eye },
          { key: "translate" as const, step: 3, label: "AI Translate to 日本語", icon: Languages },
          { key: "preview-ja" as const, step: 4, label: "Japanese 履歴書", icon: Globe },
        ].map((s, i, arr) => {
          const isActive = tab === s.key;
          const isDone =
            (s.key === "edit" && tab !== "edit") ||
            (s.key === "preview-en" && (tab === "translate" || tab === "preview-ja")) ||
            (s.key === "translate" && tab === "preview-ja" && translated);
          const isDisabled =
            (s.key === "translate" && !data.name) ||
            (s.key === "preview-ja" && !translated);
          return (
            <div key={s.key} className="flex items-center">
              <button
                onClick={() => !isDisabled && setTab(s.key)}
                disabled={isDisabled}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  isActive && "bg-card shadow-premium text-foreground border border-border",
                  isDone && !isActive && "text-saffron hover:text-saffron/80",
                  !isActive && !isDone && !isDisabled && "text-muted-foreground hover:text-foreground",
                  isDisabled && "text-muted-foreground/40 cursor-not-allowed",
                )}
              >
                <span className={cn(
                  "grid place-items-center h-6 w-6 rounded-full text-xs font-bold shrink-0 transition-colors",
                  isActive && "bg-saffron text-white",
                  isDone && !isActive && "bg-saffron/20 text-saffron",
                  !isActive && !isDone && "bg-muted text-muted-foreground",
                )}>
                  {isDone ? "✓" : s.step}
                </span>
                {s.label}
              </button>
              {i < arr.length - 1 && (
                <div className="w-6 h-px bg-border mx-1 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Edit form */}
      {tab === "edit" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="print:hidden space-y-6"
        >
          <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6 xl:gap-8 items-start">
            {/* Sidebar — sticky nav (lg+ only; mobile keeps single column) */}
            <aside className="hidden lg:block print:hidden">
              <div className="sticky top-6 space-y-3">
                {/* Progress card */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-premium">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Progress
                    </span>
                    <span className="font-display text-sm font-bold text-gradient-brand">
                      {progress}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2 bg-muted" />
                  <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                    {progress === 100
                      ? "Looking great — resume is complete!"
                      : "Fill in each section to complete your resume."}
                  </p>
                </div>
                {/* Section nav */}
                <nav
                  aria-label="Resume sections"
                  className="rounded-2xl border border-border bg-card p-2 shadow-premium"
                >
                  <ul className="space-y-0.5">
                    {SECTIONS.map((s) => {
                      const active = activeSection === s.id;
                      const Icon = s.icon;
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => scrollToSection(s.id)}
                            aria-current={active ? "true" : undefined}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                              active
                                ? "bg-saffron/10 text-saffron shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{s.label}</span>
                            {active && (
                              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-saffron shadow-glow-brand" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </aside>

            {/* Content — form sections (English only) */}
            <div className="space-y-6 lg:min-w-0">
          {/* Personal Info */}
          <Section id="section-personal" icon={User} title="Personal Information" desc="Your basic details — selectable fields make it faster">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name">
                <Input value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="Abhishek" />
              </Field>
              <Field label="Date of birth">
                <Input type="date" value={data.dob ?? ""} onChange={(e) => update("dob", e.target.value)} />
              </Field>
              <Field label="Gender">
                <Select value={data.gender ?? ""} onValueChange={(v) => update("gender", v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Email">
                <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
              </Field>
              <Field label="Phone">
                <Input value={data.phone ?? ""} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" />
              </Field>
              <Field label="Nationality">
                <Select value={data.nationality ?? ""} onValueChange={(v) => update("nationality", v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    {NATIONALITY_OPTIONS.map((n) => (
                      <SelectItem key={n.value} value={n.value}>
                        {n.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="State / Place of origin (India)">
                <Select
                  value={data.placeOfOrigin ?? ""}
                  onValueChange={(v) => update("placeOfOrigin", v)}
                  disabled={data.nationality !== "India"}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={data.nationality === "India" ? "Select state" : "Select nationality first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Address" className="sm:col-span-2">
                <Input value={data.address ?? ""} onChange={(e) => update("address", e.target.value)} placeholder="Nellore, Andhra Pradesh, 524344, India" />
              </Field>
              <Field label="Current degree being pursued" className="sm:col-span-2">
                <Input value={data.currentDegree ?? ""} onChange={(e) => update("currentDegree", e.target.value)} placeholder="Bachelors in Technology, Computer Science Engineering" />
              </Field>
              <Field label="Expected time of graduation" className="sm:col-span-2">
                <Input value={data.expectedGraduation ?? ""} onChange={(e) => update("expectedGraduation", e.target.value)} placeholder="06/2026" />
              </Field>
              <Field label="Languages known" className="sm:col-span-2">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Select value={langInput} onValueChange={(v) => { addLanguage(v); }}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Add a language…" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.filter((l) => !data.languages.includes(l.value)).map((l) => (
                          <SelectItem key={l.value} value={l.value}>
                            {l.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {data.languages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {data.languages.map((lang, i) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1.5 gap-1.5">
                          {lang}
                          <button
                            onClick={() => removeLanguage(i)}
                            className="ml-1 hover:text-destructive"
                            aria-label="Remove"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
            </div>
          </Section>

          {/* Education */}
          <Section id="section-education" icon={GraduationCap} title="Education" desc="Academic history" action={<AddButton onClick={addEducation} />}>
            <div className="space-y-4">
              {data.education.length === 0 && <EmptyHint text="No education entries yet. Click Add to start." />}
              {data.education.map((edu, i) => (
                <Card key={i} onRemove={() => removeEducation(i)}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Year (graduation)">
                      <Input value={edu.year} onChange={(e) => updateEducation(i, { year: e.target.value })} placeholder="2026" />
                    </Field>
                    <Field label="Month">
                      <Input value={edu.month ?? ""} onChange={(e) => updateEducation(i, { month: e.target.value })} placeholder="6" />
                    </Field>
                    <Field label="Institution (School / University)" className="sm:col-span-2">
                      <Input value={edu.institution} onChange={(e) => updateEducation(i, { institution: e.target.value })} placeholder="SRM UNIVERSITY AP, India" />
                    </Field>
                    <Field label="Degree (combined text shown in PDF)" className="sm:col-span-2">
                      <Input value={edu.degree} onChange={(e) => updateEducation(i, { degree: e.target.value })} placeholder="Bachelors in Technology with Major in Computer Science." />
                    </Field>
                    <Field label="Field / Specialization" className="sm:col-span-2">
                      <Input value={edu.field} onChange={(e) => updateEducation(i, { field: e.target.value })} placeholder="Computer Science" />
                    </Field>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          {/* Work Experience */}
          <Section id="section-experience" icon={Briefcase} title="Work Experience (Apprenticeship/Internship)" desc="Internships, apprenticeships, and other work experience" action={<AddButton onClick={addActivity} />}>
            <div className="space-y-4">
              {data.activities.length === 0 && <EmptyHint text="No work experience yet. Click Add to start." />}
              {data.activities.map((act, i) => (
                <Card key={i} onRemove={() => removeActivity(i)}>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Field label="Year">
                      <Input value={act.year ?? ""} onChange={(e) => updateActivity(i, { year: e.target.value })} placeholder="2025" />
                    </Field>
                    <Field label="Month (range)">
                      <Input value={act.period} onChange={(e) => updateActivity(i, { period: e.target.value })} placeholder="1-5" />
                    </Field>
                    <Field label="Duration (for JP resume, e.g. '9 months')">
                      <Input value={act.duration ?? ""} onChange={(e) => updateActivity(i, { duration: e.target.value })} placeholder="9 months" />
                    </Field>
                    <Field label="Role">
                      <Input value={act.role} onChange={(e) => updateActivity(i, { role: e.target.value })} placeholder="Research Intern" />
                    </Field>
                    <Field label="Organization" className="sm:col-span-2">
                      <Input value={act.organization} onChange={(e) => updateActivity(i, { organization: e.target.value })} placeholder="SRM University AP" />
                    </Field>
                  </div>
                  <Field label="Description (what you did)" className="mt-3">
                    <Textarea rows={3} value={act.duties} onChange={(e) => updateActivity(i, { duties: e.target.value })} placeholder="Engineered an automated skin disease prediction system using Deep Learning..." />
                  </Field>
                </Card>
              ))}
            </div>
          </Section>

          {/* Certifications / Awards */}
          <Section id="section-certifications" icon={Award} title="Certifications / Achievements" desc="Professional certifications and honors" action={<AddButton onClick={addAward} />}>
            <div className="space-y-4">
              {data.awards.length === 0 && <EmptyHint text="No certifications yet. Click Add to start." />}
              {data.awards.map((aw, i) => (
                <Card key={i} onRemove={() => removeAward(i)}>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Field label="Year">
                      <Input value={aw.year} onChange={(e) => updateAward(i, { year: e.target.value })} placeholder="2025" />
                    </Field>
                    <Field label="Month">
                      <Input value={aw.month ?? ""} onChange={(e) => updateAward(i, { month: e.target.value })} placeholder="4" />
                    </Field>
                    <Field label="Organization / Issuer">
                      <Input value={aw.organization} onChange={(e) => updateAward(i, { organization: e.target.value })} placeholder="MongoDB, Inc." />
                    </Field>
                    <Field label="Title" className="sm:col-span-3">
                      <Input value={aw.title} onChange={(e) => updateAward(i, { title: e.target.value })} placeholder="MongoDB Certified Associate Developer" />
                    </Field>
                  </div>
                  <Field label="Description (details / credential ID / tasks)" className="mt-3">
                    <Textarea rows={2} value={aw.description} onChange={(e) => updateAward(i, { description: e.target.value })} placeholder="Issued: April 2025. Credential ID: MDB4amndwj352" />
                  </Field>
                </Card>
              ))}
            </div>
          </Section>

          {/* Projects */}
          <Section id="section-projects" icon={Code2} title="Projects / Co-Curricular Activities" desc="Technical projects and co-curricular work" action={<AddButton onClick={addProject} />}>
            <div className="space-y-4">
              {data.projects.length === 0 && <EmptyHint text="No projects yet. Click Add to start." />}
              {data.projects.map((proj, i) => (
                <Card key={i} onRemove={() => removeProject(i)}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Year">
                      <Input value={proj.year ?? ""} onChange={(e) => updateProject(i, { year: e.target.value })} placeholder="2025" />
                    </Field>
                    <Field label="Month (range)">
                      <Input value={proj.period} onChange={(e) => updateProject(i, { period: e.target.value })} placeholder="2-5" />
                    </Field>
                    <Field label="Project name" className="sm:col-span-2">
                      <Input value={proj.name} onChange={(e) => updateProject(i, { name: e.target.value })} placeholder="CollabLearn – Online Collaborative Learning Platform" />
                    </Field>
                    <Field label="Tech stack" className="sm:col-span-2">
                      <Input value={proj.techStack ?? ""} onChange={(e) => updateProject(i, { techStack: e.target.value })} placeholder="React.js, Tailwind CSS, Firebase, JavaScript" />
                    </Field>
                  </div>
                  <Field label="Description" className="mt-3">
                    <Textarea rows={3} value={proj.description} onChange={(e) => updateProject(i, { description: e.target.value })} placeholder="Built a real-time learning portal with Firebase authentication..." />
                  </Field>
                </Card>
              ))}
            </div>
          </Section>

          {/* Skills */}
          <Section id="section-skills" icon={Code2} title="Skills" desc="Mark your proficiency for each skill" action={<AddButton onClick={addSkill} />}>
            <div className="space-y-3">
              {data.skills.length === 0 && <EmptyHint text="No skills yet. Click Add to start." />}
              {data.skills.map((s, i) => (
                <div key={i} className="relative rounded-xl border border-border bg-background p-4 pr-12">
                  <button
                    onClick={() => removeSkill(i)}
                    className="absolute top-3 right-3 grid place-items-center h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Field label="Skill name">
                    <Input value={s.name} onChange={(e) => updateSkill(i, { name: e.target.value })} placeholder="HTML, CSS, JavaScript, React..." />
                  </Field>
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 pl-0.5">
                    <CheckboxField
                      label="Learned in class"
                      checked={s.learnedInClass}
                      onChange={(v) => updateSkill(i, { learnedInClass: v })}
                    />
                    <CheckboxField
                      label="Can operate alone"
                      checked={s.canOperate}
                      onChange={(v) => updateSkill(i, { canOperate: v })}
                    />
                    <CheckboxField
                      label="Can teach others"
                      checked={s.canTeach}
                      onChange={(v) => updateSkill(i, { canTeach: v })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Skills in Which I Excel */}
          <Section id="section-excel" icon={ListChecks} title="Skills in Which I Excel" desc="Numbered summary of strengths and growth areas" action={<AddButton onClick={addExcelItem} />}>
            <div className="space-y-3">
              {(data.skillsExcelSummary ?? []).length === 0 && <EmptyHint text="No summary points yet. Click Add to start." />}
              {(data.skillsExcelSummary ?? []).map((line, i) => (
                <div key={i} className="relative rounded-xl border border-border bg-background p-4 pr-12">
                  <button
                    onClick={() => removeExcelItem(i)}
                    className="absolute top-3 right-3 grid place-items-center h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex gap-3">
                    <span className="grid place-items-center h-7 w-7 rounded-full bg-saffron/10 text-saffron font-bold text-sm shrink-0">
                      {i + 1}
                    </span>
                    <Textarea
                      rows={2}
                      value={line}
                      onChange={(e) => updateExcelItem(i, e.target.value)}
                      placeholder="I have developed strong expertise in web development technologies, including HTML, CSS, JavaScript and React..."
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Japanese Proficiency & Other Languages */}
          <Section id="section-jlpt" icon={Languages} title="Japanese Proficiency & Other Languages" desc="JLPT levels and additional languages">
            <div className="space-y-4">
              <Field label="Current Japanese Proficiency Level (JLPT)">
                <Select
                  value={data.currentJlpt ?? ""}
                  onValueChange={(v) => update("currentJlpt", v as JlptLevel)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select current JLPT level" />
                  </SelectTrigger>
                  <SelectContent>
                    {JLPT_OPTIONS.map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Expected JLPT level by graduation time">
                <Select
                  value={data.expectedJlpt ?? ""}
                  onValueChange={(v) => update("expectedJlpt", v as JlptLevel)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select expected JLPT level" />
                  </SelectTrigger>
                  <SelectContent>
                    {JLPT_OPTIONS.map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Other languages (comma-separated, e.g. 'English, Telugu, Hindi')">
                <Input
                  value={data.otherLanguages ?? ""}
                  onChange={(e) => update("otherLanguages", e.target.value)}
                  placeholder="English, Telugu, Hindi"
                />
              </Field>
            </div>
          </Section>

          {/* Why Japan? */}
          <Section id="section-japan" icon={MapPin} title="More About Why You Want to Work in Japan" desc="Three short essays — these appear on the English resume only">
            <Field label="Why do you want to work in Japan? (日本で働きたい理由は何ですか？)">
              <Textarea
                rows={4}
                value={data.japanMotivation?.whyJapan ?? ""}
                onChange={(e) => updateJapan("whyJapan", e.target.value)}
                placeholder="Japan is known for its hard work, focus on quality, and constant improvement..."
              />
            </Field>
            <Field label="What kind of career would you like to create in Japan? (日本でどのようなキャリアを作りたいと思いますか？)" className="mt-4">
              <Textarea
                rows={4}
                value={data.japanMotivation?.careerInJapan ?? ""}
                onChange={(e) => updateJapan("careerInJapan", e.target.value)}
                placeholder="Aspire to build a career in Japan by contributing to innovative, socially impactful projects..."
              />
            </Field>
            <Field label="What challenges do you foresee in adjusting to life in Japan, and how would you address them? (日本生活への適応において、どのような課題を予想し、どう対処しますか？)" className="mt-4">
              <Textarea
                rows={4}
                value={data.japanMotivation?.challenges ?? ""}
                onChange={(e) => updateJapan("challenges", e.target.value)}
                placeholder="Challenges: Adaptation to Work Practices..."
              />
            </Field>
          </Section>

          {/* Self-PR & Hobbies */}
          <Section id="section-selfpr" icon={Sparkles} title="Self-PR & Hobbies" desc="Personal statement and interests (shown on the JP resume)">
            <Field label="Self-PR (English)">
              <Textarea rows={5} value={data.selfPr ?? ""} onChange={(e) => update("selfPr", e.target.value)} placeholder="I am a Computer Science student passionate about full-stack development and AI..." />
            </Field>
            <Field label="Hobbies" className="mt-3">
              <Input value={data.hobbies ?? ""} onChange={(e) => update("hobbies", e.target.value)} placeholder="Badminton, Fitness, Reading" />
            </Field>
          </Section>

            </div>
          </div>

          {/* CTA: Save & Preview English Resume */}
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-muted-foreground">
              Fill in English — we'll handle the Japanese translation next.
            </p>
            <Button
              onClick={async () => { await save(); setTab("preview-en"); }}
              disabled={saving}
              className="bg-brand-gradient text-white font-semibold"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save & Preview English Resume
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Preview EN tab */}
      {tab === "preview-en" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="print:hidden flex items-center justify-between gap-4 mb-6 p-4 rounded-2xl border border-border bg-card flex-wrap">
            <div>
              <p className="font-display font-bold text-[15px]">English Resume Preview</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                This is exactly what employers will see. Download or continue to Japanese translation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PDFDownloadLink
                document={<EnglishResumePDF data={data} />}
                fileName={`${data.name || "resume"}_EN.pdf`}
              >
                {({ loading: pdfLoading }) => (
                  <Button variant="outline" disabled={pdfLoading} className="font-semibold">
                    <Download className="h-4 w-4 mr-1.5" />
                    {pdfLoading ? "Generating…" : "Download EN PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
              <Button
                onClick={() => setTab("translate")}
                disabled={!data.name}
                className="bg-brand-gradient text-white font-semibold"
              >
                <Languages className="h-4 w-4 mr-1.5" />
                Translate to Japanese
              </Button>
            </div>
          </div>
          <div className="bg-muted/60 rounded-2xl p-4 sm:p-8">
            <div className="max-w-[860px] mx-auto">
              <ResumePreview data={data} lang="en" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Translate tab */}
      {tab === "translate" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="max-w-2xl mx-auto py-8">
            <div className="text-center mb-8">
              <div className="grid place-items-center h-16 w-16 rounded-2xl bg-saffron/10 border border-saffron/20 mx-auto mb-4">
                <Languages className="h-8 w-8 text-saffron" />
              </div>
              <h2 className="font-display font-bold text-2xl tracking-tight mb-2">
                AI Japanese Translation
              </h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Our AI will translate your English resume content into professional Japanese.
                Personal details (name, email, phone) stay in English — only descriptions,
                project summaries, and self-PR are translated.
              </p>
            </div>

            <div className="card-premium p-5 mb-6">
              <p className="font-semibold text-sm mb-3">What the AI will translate:</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  "Self-PR / Introduction",
                  "Hobbies & Interests",
                  "Project descriptions",
                  "Work experience duties",
                  "Certification descriptions",
                  "Why Japan motivation answers",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-saffron flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
                Personal info (name, email, phone, DOB) is kept as-is.
                Education institution names and skill names are kept in English.
              </div>
            </div>

            {translated && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 mb-6 flex items-start gap-3">
                <span className="text-emerald-600 text-lg mt-0.5">✓</span>
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                    Translation complete!
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Your resume has been translated. You can re-translate if you updated your English content.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleTranslate}
                disabled={translating}
                className="flex-1 bg-brand-gradient text-white font-semibold h-11 text-[15px]"
              >
                {translating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Translating… (15–30 seconds)
                  </>
                ) : translated ? (
                  <>
                    <Languages className="h-4 w-4 mr-2" />
                    Re-translate (content updated)
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Translate to Japanese with AI
                  </>
                )}
              </Button>
              {translated && (
                <Button
                  variant="outline"
                  onClick={() => setTab("preview-ja")}
                  className="flex-1 font-semibold h-11"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  View Japanese 履歴書
                </Button>
              )}
            </div>

            {translating && (
              <div className="mt-4">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-gradient rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 25, ease: "linear" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  AI is translating your content…
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Preview JP tab */}
      {tab === "preview-ja" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="print:hidden flex items-center justify-between gap-4 mb-6 p-4 rounded-2xl border border-border bg-card flex-wrap">
            <div>
              <p className="font-display font-bold text-[15px]">Japanese 履歴書 Preview</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI-translated Japanese resume. Download the PDF to share with Japanese employers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setTab("translate")}>
                <Languages className="h-4 w-4 mr-1.5" />
                Re-translate
              </Button>
              <PDFDownloadLink
                document={<JapaneseResumePDF data={data} />}
                fileName={`${data.name || "resume"}_JP_履歴書.pdf`}
              >
                {({ loading: pdfLoading }) => (
                  <Button disabled={pdfLoading} className="bg-brand-gradient text-white font-semibold">
                    <Download className="h-4 w-4 mr-1.5" />
                    {pdfLoading ? "生成中…" : "Download 履歴書 PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
          <div className="bg-muted/60 rounded-2xl p-4 sm:p-8">
            <div className="max-w-[860px] mx-auto">
              <ResumePreview data={data} lang="ja" />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  desc,
  action,
  children,
}: {
  id?: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-premium scroll-mt-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="grid place-items-center h-10 w-10 rounded-lg bg-saffron/10 text-saffron shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">{title}</h2>
            {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Card({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="relative rounded-xl border border-border bg-background p-4">
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 grid place-items-center h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-xs font-medium text-muted-foreground mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </label>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <Button size="sm" variant="outline" onClick={onClick} className="font-medium">
      <Plus className="mr-1 h-3.5 w-3.5" />
      Add
    </Button>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
