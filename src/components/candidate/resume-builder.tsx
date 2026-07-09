"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Plus,
  Trash2,
  Save,
  Printer,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Award,
  Heart,
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

type Tab = "edit" | "preview-ja" | "preview-en";

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
            Create a professional resume in both English and Japanese 履歴書 format. Fill in English — the Japanese PDF is auto-generated.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={save} disabled={saving} className="bg-brand-gradient text-white hover:opacity-90 font-semibold">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
          <PDFDownloadLink
            document={<EnglishResumePDF data={data} />}
            fileName={`${data.name || "resume"}_EN.pdf`}
          >
            {({ loading }) => (
              <Button variant="outline" size="sm" disabled={loading} className="font-semibold h-9">
                <Download className="h-4 w-4 mr-1.5" />
                {loading ? "Generating…" : "EN PDF"}
              </Button>
            )}
          </PDFDownloadLink>
          <PDFDownloadLink
            document={<JapaneseResumePDF data={data} />}
            fileName={`${data.name || "resume"}_JP.pdf`}
          >
            {({ loading }) => (
              <Button variant="outline" size="sm" disabled={loading} className="font-semibold h-9">
                <Download className="h-4 w-4 mr-1.5" />
                {loading ? "生成中…" : "履歴書 PDF"}
              </Button>
            )}
          </PDFDownloadLink>
          <Button onClick={print} variant="ghost" size="sm" className="font-semibold h-9">
            <Printer className="h-4 w-4 mr-1.5" />
            Print
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="print:hidden flex items-center gap-1 mb-6 p-1 rounded-xl bg-muted w-fit">
        {[
          { key: "edit" as const, label: "Edit", icon: User },
          { key: "preview-ja" as const, label: "日本語 履歴書", icon: Globe },
          { key: "preview-en" as const, label: "English Resume", icon: FileText },
        ].map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              tab === tb.key
                ? "bg-card text-foreground shadow-premium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <tb.icon className="h-4 w-4" />
            {tb.label}
          </button>
        ))}
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
                <div key={i} className="relative rounded-xl border border-border bg-background p-4">
                  <button
                    onClick={() => removeSkill(i)}
                    className="absolute top-3 right-3 grid place-items-center h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid sm:grid-cols-[1fr_auto_auto_auto] items-center gap-4">
                    <Field label="Skill name">
                      <Input value={s.name} onChange={(e) => updateSkill(i, { name: e.target.value })} placeholder="HTML, CSS, JavaScript, React..." />
                    </Field>
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

          {/* Save bar (full width across sidebar + content) */}
          <div className="sticky bottom-4 flex justify-end gap-2 print:hidden">
            <Button onClick={save} disabled={saving} className="bg-brand-gradient text-white hover:opacity-90 font-semibold shadow-glow-brand">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Resume
            </Button>
          </div>
        </motion.div>
      )}

      {/* Previews */}
      {tab === "preview-ja" && <ResumePreview data={data} lang="ja" />}
      {tab === "preview-en" && <ResumePreview data={data} lang="en" />}
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
    <label className="flex items-center gap-2 cursor-pointer select-none mt-5">
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
