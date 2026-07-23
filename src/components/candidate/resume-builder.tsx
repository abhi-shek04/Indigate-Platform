"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

function getSectionCompletion(data: ResumeData): Record<string, boolean> {
  return {
    "section-personal":       !!(data.name?.trim() && data.email?.trim()),
    "section-education":      data.education.length > 0,
    "section-experience":     data.activities.length > 0,
    "section-certifications": data.awards.length > 0,
    "section-projects":       data.projects.length > 0,
    "section-skills":         data.skills.length > 0,
    "section-excel":          (data.skillsExcelSummary?.length ?? 0) > 0,
    "section-jlpt":           !!(data.currentJlpt || data.otherLanguages?.trim()),
    "section-japan":          !!(data.japanMotivation?.whyJapan?.trim()),
    "section-selfpr":         !!(data.selfPr?.trim() || data.hobbies?.trim()),
  };
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
  const sectionCompletion = getSectionCompletion(data);
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
          education: res.resumeData.education ?? EMPTY_RESUME.education,
          activities: res.resumeData.activities ?? EMPTY_RESUME.activities,
          projects: res.resumeData.projects ?? EMPTY_RESUME.projects,
          awards: res.resumeData.awards ?? EMPTY_RESUME.awards,
          skills: res.resumeData.skills ?? EMPTY_RESUME.skills,
          languages: res.resumeData.languages ?? EMPTY_RESUME.languages,
          languagesJa: res.resumeData.languagesJa ?? EMPTY_RESUME.languagesJa,
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
    <div className="min-h-screen bg-background pb-12 print:p-0 print:bg-white">
      {/* Premium Sticky Action Header */}
      <div className="print:hidden sticky top-0 z-50 w-full backdrop-blur-xl bg-background/85 border-b border-border shadow-sm mb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("candidate")}
              className="grid place-items-center h-9 w-9 rounded-full bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <FileText className="h-6 w-6 text-saffron" />
                Resume Builder
              </h1>
              <p className="text-[13px] text-muted-foreground hidden sm:block">
                Auto-saves as you type • English first, AI translation to Japanese
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={print} variant="outline" size="sm" className="font-semibold h-10 px-4 rounded-xl border-border hover:bg-accent">
                <Printer className="h-4 w-4 mr-2" />
                Print PDF
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={save} disabled={saving} className="bg-brand-gradient text-white h-10 px-5 rounded-xl font-bold shadow-glow-brand hover:opacity-90 transition-opacity border-none">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Draft
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 print:max-w-none print:px-0">
        {/* Premium 4-step Stepper */}
        <div className="print:hidden flex items-center justify-center mb-10 overflow-x-auto pb-4">
          <div className="flex items-center bg-muted/40 p-1.5 rounded-2xl border border-border/50">
            {[
              { key: "edit" as const, step: 1, label: "Fill English Form", icon: FileText },
              { key: "preview-en" as const, step: 2, label: "Preview EN", icon: Eye },
              { key: "translate" as const, step: 3, label: "AI Translate to 日本語", icon: Sparkles },
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
                <div key={s.key} className="relative flex items-center">
                  <button
                    onClick={() => !isDisabled && setTab(s.key)}
                    disabled={isDisabled}
                    className={cn(
                      "relative z-10 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors duration-200",
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                      isDisabled && "text-muted-foreground/30 cursor-not-allowed"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 bg-background rounded-xl border border-border/60 shadow-sm"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                    <div className="relative z-20 flex items-center gap-2.5">
                      <span className={cn(
                        "grid place-items-center h-6 w-6 rounded-full text-[11px] font-bold shrink-0 transition-colors duration-300",
                        isActive && "bg-saffron text-white shadow-[0_0_12px_rgba(var(--saffron-rgb,245,158,11),0.4)]",
                        isDone && !isActive && "bg-saffron/15 text-saffron",
                        !isActive && !isDone && "bg-muted-foreground/15 text-muted-foreground",
                        isDisabled && "bg-muted/50 text-muted-foreground/30"
                      )}>
                        {isDone ? "✓" : s.step}
                      </span>
                      <span>{s.label}</span>
                    </div>
                  </button>
                  {i < arr.length - 1 && (
                    <div className="w-8 h-[2px] bg-border/40 mx-1 shrink-0 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">

      {/* Edit form */}
      {tab === "edit" && (
        <motion.div
          key="edit"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="print:hidden space-y-6"
        >
          {/* AI Polish banner — only show if at least one prose section is partially filled */}
          {(data.selfPr?.trim() || data.projects.some(p => p.description) || data.activities.some(a => a.duties)) && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl border border-saffron/25 bg-saffron/5 px-4 py-3 flex items-center gap-3"
            >
              <div className="grid place-items-center h-8 w-8 rounded-lg bg-saffron/15 text-saffron shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground">
                  AI Polish is available
                </p>
                <p className="text-[11.5px] text-muted-foreground">
                  Look for the <span className="text-saffron font-semibold">✨ AI Polish</span> button
                  below any text field to improve it instantly.
                </p>
              </div>
            </motion.div>
          )}

          <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6 xl:gap-8 items-start">
            {/* Sidebar — sticky nav (lg+ only; mobile keeps single column) */}
            <aside className="hidden lg:block print:hidden">
              <div className="sticky top-6 space-y-3">
                {/* Progress card */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-premium relative overflow-hidden">
                  {/* Subtle glow behind the number */}
                  <span
                    className="absolute -top-4 -right-4 h-16 w-16 rounded-full blur-2xl pointer-events-none"
                    style={{ background: "color-mix(in oklch, var(--saffron) 20%, transparent)" }}
                  />
                  <div className="relative flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70 mb-0.5">
                        Profile Strength
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {progress === 100
                          ? "🎉 All sections complete!"
                          : `${SECTIONS.length - Object.values(sectionCompletion).filter(Boolean).length} sections remaining`}
                      </p>
                    </div>
                  </div>
                  {/* Segmented bar — 10 segments */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-all duration-500",
                          i < Math.round(progress / 10) ? "bg-brand-gradient" : "bg-muted",
                        )}
                        style={{ transitionDelay: `${i * 50}ms` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Section nav */}
                <nav aria-label="Resume sections" className="rounded-2xl border border-border bg-card overflow-hidden shadow-premium">
                  {/* Nav header */}
                  <div className="px-3 pt-3 pb-2 border-b border-border/60">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
                      Sections
                    </p>
                  </div>

                  <ul className="p-2 space-y-0.5">
                    {SECTIONS.map((s, idx) => {
                      const active = activeSection === s.id;
                      const done = sectionCompletion[s.id] ?? false;
                      const Icon = s.icon;
                      const stepNum = String(idx + 1).padStart(2, "0");

                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => scrollToSection(s.id)}
                            aria-current={active ? "true" : undefined}
                            className={cn(
                              // Base
                              "group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                              "text-left transition-all duration-150",
                              // Active
                              active && [
                                "bg-saffron/10 shadow-sm",
                                "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                                "before:h-[60%] before:w-[3px] before:rounded-r-full before:bg-saffron",
                                "before:shadow-[0_0_8px_rgba(var(--saffron-rgb,245,158,11),0.6)]",
                              ],
                              // Inactive
                              !active && "hover:bg-accent/40",
                            )}
                          >
                            {/* Step number — shows as faded watermark */}
                            <span className={cn(
                              "shrink-0 font-mono text-[10px] font-bold tracking-tight w-5 text-right leading-none",
                              active ? "text-saffron" : "text-muted-foreground/35",
                            )}>
                              {stepNum}
                            </span>

                            {/* Icon badge */}
                            <span className={cn(
                              "shrink-0 grid place-items-center h-7 w-7 rounded-lg transition-colors",
                              active
                                ? "bg-saffron/15 text-saffron"
                                : "bg-muted/60 text-muted-foreground group-hover:bg-accent group-hover:text-foreground",
                            )}>
                              <Icon className="h-3.5 w-3.5" />
                            </span>

                            {/* Label */}
                            <span className={cn(
                              "flex-1 truncate text-[13px] transition-colors font-medium",
                              active ? "text-saffron font-semibold" : "text-muted-foreground group-hover:text-foreground",
                            )}>
                              {s.label}
                            </span>

                            {/* Completion indicator */}
                            {done ? (
                              <span className={cn(
                                "shrink-0 grid place-items-center h-4 w-4 rounded-full",
                                active ? "bg-saffron/20 text-saffron" : "bg-emerald-500/15 text-emerald-500",
                              )}>
                                {/* Checkmark SVG — small enough to fit in h-4 w-4 */}
                                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8"
                                    strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            ) : (
                              <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Completion summary footer */}
                  <div className="px-3 py-2.5 border-t border-border/60 bg-muted/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                        Complete
                      </span>
                      <span className="text-[11px] font-bold text-gradient-brand font-display">
                        {Object.values(sectionCompletion).filter(Boolean).length} / {SECTIONS.length}
                      </span>
                    </div>
                    <div className="flex gap-0.5">
                      {SECTIONS.map((s, i) => (
                        <div
                          key={s.id}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors duration-500",
                            sectionCompletion[s.id] ? "bg-brand-gradient" : "bg-muted",
                          )}
                          style={{ transitionDelay: `${i * 40}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Content — form sections (English only) */}
            <div className="space-y-6 lg:min-w-0">
          {/* Personal Info */}
          <Section id="section-personal" icon={User} title="Personal Information" desc="Your basic details — selectable fields make it faster">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name">
                <Input value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g., John Doe" />
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
                <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="e.g., you@example.com" />
              </Field>
              <Field label="Phone">
                <Input value={data.phone ?? ""} onChange={(e) => update("phone", e.target.value)} placeholder="e.g., +1 234 567 8900" />
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
                <Input value={data.address ?? ""} onChange={(e) => update("address", e.target.value)} placeholder="e.g., 123 Example Street, City, Country" />
              </Field>
              <Field label="Current degree being pursued" className="sm:col-span-2">
                <Input value={data.currentDegree ?? ""} onChange={(e) => update("currentDegree", e.target.value)} placeholder="e.g., Bachelors in Technology, Computer Science Engineering" />
              </Field>
              <Field label="Expected time of graduation" className="sm:col-span-2">
                <Input value={data.expectedGraduation ?? ""} onChange={(e) => update("expectedGraduation", e.target.value)} placeholder="e.g., 06/2026" />
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
            <motion.div layout className="space-y-5">
              <AnimatePresence initial={false}>
                {data.education.length === 0 && <EmptyHint key="empty-edu" text="No education entries yet. Click Add to start." />}
                {data.education.map((edu, i) => (
                <Card key={i} onRemove={() => removeEducation(i)}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Year (graduation)">
                      <Input value={edu.year} onChange={(e) => updateEducation(i, { year: e.target.value })} placeholder="e.g., 2026" />
                    </Field>
                    <Field label="Month">
                      <Input value={edu.month ?? ""} onChange={(e) => updateEducation(i, { month: e.target.value })} placeholder="e.g., 6" />
                    </Field>
                    <Field label="Institution (School / University)" className="sm:col-span-2">
                      <Input value={edu.institution} onChange={(e) => updateEducation(i, { institution: e.target.value })} placeholder="e.g., Tokyo University" />
                    </Field>
                    <Field label="Degree (combined text shown in PDF)" className="sm:col-span-2">
                      <Input value={edu.degree} onChange={(e) => updateEducation(i, { degree: e.target.value })} placeholder="e.g., Bachelor of Engineering" />
                    </Field>
                    <Field label="Field / Specialization" className="sm:col-span-2">
                      <Input value={edu.field} onChange={(e) => updateEducation(i, { field: e.target.value })} placeholder="e.g., Information Technology" />
                    </Field>
                  </div>
                </Card>
                ))}
              </AnimatePresence>
            </motion.div>
          </Section>

          {/* Work Experience */}
          <Section id="section-experience" icon={Briefcase} title="Work Experience (Apprenticeship/Internship)" desc="Internships, apprenticeships, and other work experience" action={<AddButton onClick={addActivity} />}>
            <motion.div layout className="space-y-5">
              <AnimatePresence initial={false}>
                {data.activities.length === 0 && <EmptyHint key="empty-act" text="No work experience yet. Click Add to start." />}
                {data.activities.map((act, i) => (
                <Card key={i} onRemove={() => removeActivity(i)}>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Field label="Year">
                      <Input value={act.year ?? ""} onChange={(e) => updateActivity(i, { year: e.target.value })} placeholder="e.g., 2025" />
                    </Field>
                    <Field label="Month (range)">
                      <Input value={act.period} onChange={(e) => updateActivity(i, { period: e.target.value })} placeholder="e.g., 1-5" />
                    </Field>
                    <Field label="Duration (for JP resume, e.g. '9 months')">
                      <Input value={act.duration ?? ""} onChange={(e) => updateActivity(i, { duration: e.target.value })} placeholder="e.g., 9 months" />
                    </Field>
                    <Field label="Role">
                      <Input value={act.role} onChange={(e) => updateActivity(i, { role: e.target.value })} placeholder="e.g., Software Engineering Intern" />
                    </Field>
                    <Field label="Organization" className="sm:col-span-2">
                      <Input value={act.organization} onChange={(e) => updateActivity(i, { organization: e.target.value })} placeholder="e.g., Tech Corp" />
                    </Field>
                  </div>
                  <Field label="Description (what you did)" className="mt-3">
                    <Textarea rows={3} value={act.duties} onChange={(e) => updateActivity(i, { duties: e.target.value })} placeholder="e.g., Developed an automated data processing pipeline..." />
                    <PolishButton field="activityDesc" current={act.duties} onAccept={(v) => updateActivity(i, { duties: v })} context={act.role ? `Role: ${act.role} at ${act.organization}` : undefined} />
                  </Field>
                </Card>
                ))}
              </AnimatePresence>
            </motion.div>
          </Section>

          {/* Certifications / Awards */}
          <Section id="section-certifications" icon={Award} title="Certifications / Achievements" desc="Professional certifications and honors" action={<AddButton onClick={addAward} />}>
            <motion.div layout className="space-y-5">
              <AnimatePresence initial={false}>
                {data.awards.length === 0 && <EmptyHint key="empty-awa" text="No certifications yet. Click Add to start." />}
                {data.awards.map((aw, i) => (
                <Card key={i} onRemove={() => removeAward(i)}>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Field label="Year">
                      <Input value={aw.year} onChange={(e) => updateAward(i, { year: e.target.value })} placeholder="e.g., 2025" />
                    </Field>
                    <Field label="Month">
                      <Input value={aw.month ?? ""} onChange={(e) => updateAward(i, { month: e.target.value })} placeholder="e.g., 4" />
                    </Field>
                    <Field label="Organization / Issuer">
                      <Input value={aw.organization} onChange={(e) => updateAward(i, { organization: e.target.value })} placeholder="e.g., Tech Certification Board" />
                    </Field>
                    <Field label="Title" className="sm:col-span-3">
                      <Input value={aw.title} onChange={(e) => updateAward(i, { title: e.target.value })} placeholder="e.g., Certified Developer" />
                    </Field>
                  </div>
                  <Field label="Description (details / credential ID / tasks)" className="mt-3">
                    <Textarea rows={2} value={aw.description} onChange={(e) => updateAward(i, { description: e.target.value })} placeholder="e.g., Issued: April 2024. Credential ID: 123456" />
                    <PolishButton field="awardDesc" current={aw.description} onAccept={(v) => updateAward(i, { description: v })} context={aw.title ? `Certification: ${aw.title}` : undefined} />
                  </Field>
                </Card>
                ))}
              </AnimatePresence>
            </motion.div>
          </Section>

          {/* Projects */}
          <Section id="section-projects" icon={Code2} title="Projects / Co-Curricular Activities" desc="Technical projects and co-curricular work" action={<AddButton onClick={addProject} />}>
            <motion.div layout className="space-y-5">
              <AnimatePresence initial={false}>
                {data.projects.length === 0 && <EmptyHint key="empty-proj" text="No projects yet. Click Add to start." />}
                {data.projects.map((proj, i) => (
                <Card key={i} onRemove={() => removeProject(i)}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Year">
                      <Input value={proj.year ?? ""} onChange={(e) => updateProject(i, { year: e.target.value })} placeholder="e.g., 2025" />
                    </Field>
                    <Field label="Month (range)">
                      <Input value={proj.period} onChange={(e) => updateProject(i, { period: e.target.value })} placeholder="e.g., 2-5" />
                    </Field>
                    <Field label="Project name" className="sm:col-span-2">
                      <Input value={proj.name} onChange={(e) => updateProject(i, { name: e.target.value })} placeholder="e.g., E-commerce Web Application" />
                    </Field>
                    <Field label="Tech stack" className="sm:col-span-2">
                      <Input value={proj.techStack ?? ""} onChange={(e) => updateProject(i, { techStack: e.target.value })} placeholder="e.g., React, Node.js, TypeScript" />
                    </Field>
                  </div>
                  <Field label="Description" className="mt-3">
                    <Textarea rows={3} value={proj.description} onChange={(e) => updateProject(i, { description: e.target.value })} placeholder="e.g., Built a full-stack application with user authentication..." />
                    <PolishButton field="projectDesc" current={proj.description} onAccept={(v) => updateProject(i, { description: v })} context={proj.name ? `Project: ${proj.name}, Stack: ${proj.techStack}` : undefined} />
                  </Field>
                </Card>
                ))}
              </AnimatePresence>
            </motion.div>
          </Section>

          {/* Skills */}
          <Section id="section-skills" icon={Code2} title="Skills" desc="Mark your proficiency for each skill" action={<AddButton onClick={addSkill} />}>
            <motion.div layout className="space-y-5">
              <AnimatePresence initial={false}>
                {data.skills.length === 0 && <EmptyHint key="empty-skills" text="No skills yet. Click Add to start." />}
                {data.skills.map((s, i) => (
                  <Card key={i} onRemove={() => removeSkill(i)}>
                    <Field label="Skill name">
                      <Input value={s.name} onChange={(e) => updateSkill(i, { name: e.target.value })} placeholder="e.g., Python, Java, React..." />
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
                  </Card>
                ))}
              </AnimatePresence>
            </motion.div>
          </Section>

          {/* Skills in Which I Excel */}
          <Section id="section-excel" icon={ListChecks} title="Skills in Which I Excel" desc="Numbered summary of strengths and growth areas" action={<AddButton onClick={addExcelItem} />}>
            <motion.div layout className="space-y-5">
              <AnimatePresence initial={false}>
                {(data.skillsExcelSummary ?? []).length === 0 && <EmptyHint key="empty-excel" text="No summary points yet. Click Add to start." />}
                {(data.skillsExcelSummary ?? []).map((line, i) => (
                  <Card key={i} onRemove={() => removeExcelItem(i)}>
                    <div className="flex gap-4">
                      <span className="grid place-items-center h-8 w-8 rounded-full bg-saffron/10 text-saffron font-bold text-sm shrink-0 border border-saffron/20 shadow-sm">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <Textarea
                          rows={2}
                          value={line}
                          onChange={(e) => updateExcelItem(i, e.target.value)}
                          placeholder="e.g., Experienced in building scalable web applications..."
                          className="w-full"
                        />
                        <PolishButton field="skillExcel" current={line} onAccept={(v) => updateExcelItem(i, v)} />
                      </div>
                    </div>
                  </Card>
                ))}
              </AnimatePresence>
            </motion.div>
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
                  placeholder="e.g., English, Spanish, French"
                />
              </Field>
            </div>
          </Section>

          {/* Why Japan? */}
          <Section id="section-japan" icon={MapPin} title="More About Why You Want to Work in Japan" desc="Three short essays — these appear on the English resume only">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-foreground/90 leading-relaxed">
                  1. Why do you want to work in Japan? <br/>
                  <span className="text-muted-foreground font-medium text-[12px]">(日本で働きたい理由は何ですか？)</span>
                </label>
                <Textarea
                  rows={4}
                  value={data.japanMotivation?.whyJapan ?? ""}
                  onChange={(e) => updateJapan("whyJapan", e.target.value)}
                  placeholder="e.g., I admire Japan's dedication to quality and innovation..."
                  className="bg-muted/30 focus:bg-background transition-colors"
                />
                <PolishButton field="whyJapan" current={data.japanMotivation?.whyJapan ?? ""} onAccept={(v) => updateJapan("whyJapan", v)} />
              </div>
              
              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-foreground/90 leading-relaxed">
                  2. What kind of career would you like to create in Japan? <br/>
                  <span className="text-muted-foreground font-medium text-[12px]">(日本でどのようなキャリアを作りたいと思いますか？)</span>
                </label>
                <Textarea
                  rows={4}
                  value={data.japanMotivation?.careerInJapan ?? ""}
                  onChange={(e) => updateJapan("careerInJapan", e.target.value)}
                  placeholder="e.g., I want to contribute my skills to impactful projects in Japan..."
                  className="bg-muted/30 focus:bg-background transition-colors"
                />
                <PolishButton field="careerInJapan" current={data.japanMotivation?.careerInJapan ?? ""} onAccept={(v) => updateJapan("careerInJapan", v)} />
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-foreground/90 leading-relaxed">
                  3. What challenges do you foresee in adjusting to life in Japan, and how would you address them? <br/>
                  <span className="text-muted-foreground font-medium text-[12px]">(日本生活への適応において、どのような課題を予想し、どう対処しますか？)</span>
                </label>
                <Textarea
                  rows={4}
                  value={data.japanMotivation?.challenges ?? ""}
                  onChange={(e) => updateJapan("challenges", e.target.value)}
                  placeholder="e.g., Challenges: Adapting to new business practices..."
                  className="bg-muted/30 focus:bg-background transition-colors"
                />
                <PolishButton field="challenges" current={data.japanMotivation?.challenges ?? ""} onAccept={(v) => updateJapan("challenges", v)} />
              </div>
            </div>
          </Section>

          {/* Self-PR & Hobbies */}
          <Section id="section-selfpr" icon={Sparkles} title="Self-PR & Hobbies" desc="Personal statement and interests (shown on the JP resume)">
            <Field label="Self-PR (English)">
              <Textarea rows={5} value={data.selfPr ?? ""} onChange={(e) => update("selfPr", e.target.value)} placeholder="e.g., I am a software engineer passionate about building scalable solutions..." />
              <PolishButton field="selfPr" current={data.selfPr ?? ""} onAccept={(v) => update("selfPr", v)} />
            </Field>
            <Field label="Hobbies" className="mt-3">
              <Textarea rows={2} value={data.hobbies ?? ""} onChange={(e) => update("hobbies", e.target.value)} placeholder="e.g., Reading, Traveling, Photography" />
              <PolishButton field="hobbies" current={data.hobbies ?? ""} onAccept={(v) => update("hobbies", v)} />
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
        <motion.div
          key="preview-en"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="print:hidden flex items-center justify-between gap-4 mb-6 p-4 rounded-2xl border border-border bg-card flex-wrap">
            <div>
              <p className="font-display font-bold text-[15px]">English Resume Preview</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                This is exactly what employers will see. Download or continue to Japanese translation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="font-semibold"
                onClick={() => {
                  window.open("/api/candidates/me/resume/pdf?lang=en", "_blank");
                }}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Download EN PDF
              </Button>
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
        <motion.div
          key="translate"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
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
        <motion.div
          key="preview-ja"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
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
              <Button
                className="bg-brand-gradient text-white font-semibold"
                onClick={() => {
                  window.open("/api/candidates/me/resume/pdf?lang=ja", "_blank");
                }}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Download 履歴書 PDF
              </Button>
            </div>
          </div>
          <div className="bg-muted/60 rounded-2xl p-4 sm:p-8">
            <div className="max-w-[860px] mx-auto">
              <ResumePreview data={data} lang="ja" />
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
      </div>
    </div>
  );
}

function Section({
  id, icon: Icon, title, desc, action, children,
}: {
  id?: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      layout
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-premium scroll-mt-6 overflow-hidden"
    >
      {/* Section header with gradient left accent bar */}
      <div className="relative flex items-center justify-between gap-4 px-6 sm:px-8 py-5 border-b border-border/40 bg-muted/10">
        {/* Left accent bar */}
        <span className="absolute left-0 top-0 h-full w-[4px] bg-brand-gradient rounded-r-full" />

        <div className="flex items-center gap-4">
          {/* Icon badge */}
          <div className="grid place-items-center h-10 w-10 rounded-xl bg-saffron/10 text-saffron shrink-0 shadow-sm border border-saffron/20">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-[17px] font-bold leading-snug tracking-tight text-foreground">
              {title}
            </h2>
            {desc && (
              <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug font-medium">
                {desc}
              </p>
            )}
          </div>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Section body */}
      <div className="p-6 sm:p-8">{children}</div>
    </motion.section>
  );
}

function Card({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, height: 0, marginTop: 0, marginBottom: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="relative rounded-2xl border border-border/80 bg-background/50 shadow-sm p-6 group overflow-hidden"
    >
      {/* Subtle top line */}
      <span className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-saffron/40 via-saffron/10 to-transparent rounded-t-xl" />

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRemove}
        className={cn(
          "absolute top-4 right-4 grid place-items-center h-8 w-8 rounded-full",
          "text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10",
          "opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm border border-transparent hover:border-destructive/20 bg-background",
        )}
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </motion.button>
      {children}
    </motion.div>
  );
}

function Field({
  label, children, className, required,
}: {
  label: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="flex items-center gap-1 text-[11.5px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
        {label}
        {required && <span className="text-saffron text-xs">*</span>}
      </span>
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

function AddButton({ onClick, label = "Add" }: { onClick: () => void; label?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
      <Button
        size="sm"
        variant="outline"
        onClick={onClick}
        className="font-semibold rounded-xl border-dashed hover:border-saffron/50 hover:bg-saffron/10 hover:text-saffron transition-all duration-200 shadow-sm"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        {label}
      </Button>
    </motion.div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-border/60 bg-muted/20 gap-2">
      <div className="h-8 w-8 rounded-full bg-muted grid place-items-center">
        <Plus className="h-4 w-4 text-muted-foreground/50" />
      </div>
      <p className="text-[12.5px] text-muted-foreground text-center max-w-[200px] leading-snug">
        {text}
      </p>
    </div>
  );
}

/**
 * PolishButton — "✨ Polish" button that appears below a Textarea.
 * Calls the /api/candidates/me/resume/polish endpoint and shows
 * an accept/discard diff UI inline.
 */
function PolishButton({
  field,
  current,
  onAccept,
  context,
}: {
  field: string;
  current: string;
  onAccept: (v: string) => void;
  context?: string;
}) {
  const [polishing, setPolishing] = useState(false);
  const [polished, setPolished]   = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  async function polish() {
    if (!current.trim() || current.trim().length < 10) {
      toast.error("Write at least a sentence before polishing.");
      return;
    }
    setPolishing(true);
    setPolished(null);
    setError(null);
    try {
      const res = await api<{ polished: string }>(
        "/api/candidates/me/resume/polish",
        {
          method: "POST",
          body: JSON.stringify({ field, content: current, context }),
        },
      );
      setPolished(res.polished);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Polish failed. Try again.");
    } finally {
      setPolishing(false);
    }
  }

  function accept() {
    if (polished) onAccept(polished);
    setPolished(null);
  }

  function discard() {
    setPolished(null);
    setError(null);
  }

  return (
    <div className="mt-1.5">
      {/* Trigger button — only shown when no result yet */}
      {!polished && !error && (
        <button
          type="button"
          onClick={polish}
          disabled={polishing || !current.trim()}
          className={cn(
            "inline-flex items-center gap-1.5 text-[11.5px] font-semibold",
            "px-3 py-1.5 rounded-lg border transition-all duration-150",
            polishing
              ? "border-saffron/30 bg-saffron/5 text-saffron cursor-not-allowed"
              : "border-border text-muted-foreground hover:border-saffron/40 hover:bg-saffron/5 hover:text-saffron",
            !current.trim() && "opacity-40 cursor-not-allowed",
          )}
        >
          {polishing ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Polishing…
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              AI Polish
            </>
          )}
        </button>
      )}

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive flex items-center justify-between gap-2"
          >
            <span>{error}</span>
            <button type="button" onClick={discard} className="shrink-0 hover:underline font-medium">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result — accept / discard */}
      <AnimatePresence>
        {polished && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mt-2 rounded-xl border border-saffron/30 bg-saffron/5 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-saffron/20">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-saffron" />
                <span className="text-[11.5px] font-bold text-saffron">
                  AI suggestion
                </span>
              </div>
              <button
                type="button"
                onClick={discard}
                className="grid place-items-center h-5 w-5 rounded text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Polished text preview */}
            <p className="px-3 py-2.5 text-[13px] leading-relaxed text-foreground whitespace-pre-wrap">
              {polished}
            </p>

            {/* Action row */}
            <div className="flex items-center gap-2 px-3 pb-3">
              <button
                type="button"
                onClick={accept}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-8
                  rounded-lg bg-saffron text-white text-[12px] font-bold
                  hover:bg-saffron/90 transition-colors shadow-glow-brand"
              >
                ✓ Accept
              </button>
              <button
                type="button"
                onClick={discard}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-8
                  rounded-lg border border-border text-[12px] font-medium
                  text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Keep original
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
