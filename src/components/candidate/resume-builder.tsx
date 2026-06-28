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
  STATE_JA,
  type ResumeData,
  type ResumeEducation,
  type ResumeProject,
  type ResumeActivity,
  type ResumeAward,
} from "@/lib/resume-types";
import { ResumePreview } from "./resume-preview";

type Tab = "edit" | "preview-ja" | "preview-en";

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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ resumeData: ResumeData | null }>(
        "/api/candidates/me/resume",
      );
      if (res.resumeData) {
        setData({ ...EMPTY_RESUME, ...res.resumeData });
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

  // Language tag management
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
      { year: "", degree: "", field: "", institution: "" },
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
      { period: "", name: "", description: "", techStack: "" },
    ]);
  }
  function updateProject(i: number, patch: Partial<ResumeProject>) {
    update("projects", data.projects.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  }
  function removeProject(i: number) {
    update("projects", data.projects.filter((_, j) => j !== i));
  }

  // Activities
  function addActivity() {
    update("activities", [
      ...data.activities,
      { period: "", organization: "", role: "", duties: "" },
    ]);
  }
  function updateActivity(i: number, patch: Partial<ResumeActivity>) {
    update("activities", data.activities.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  }
  function removeActivity(i: number) {
    update("activities", data.activities.filter((_, j) => j !== i));
  }

  // Awards
  function addAward() {
    update("awards", [
      ...data.awards,
      { year: "", title: "", description: "", organization: "" },
    ]);
  }
  function updateAward(i: number, patch: Partial<ResumeAward>) {
    update("awards", data.awards.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  }
  function removeAward(i: number) {
    update("awards", data.awards.filter((_, j) => j !== i));
  }

  if (loading) {
    return (
      <div className="flex-1 grid place-items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-saffron" />
      </div>
    );
  }

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
            Create a professional resume in both English and Japanese 履歴書 format.
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
            fileName={`${data.nameJa || data.name || "resume"}_JP.pdf`}
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
          {/* Personal Info */}
          <Section icon={User} title="Personal Information" desc="Your basic details — selectable fields make it faster">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name (English)">
                <Input value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="Abhishek" />
              </Field>
              <Field label="氏名 (Katakana reading)">
                <Input value={data.nameJa ?? ""} onChange={(e) => update("nameJa", e.target.value)} placeholder="アビシェーク" />
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
                        {g.labelEn} ({g.labelJa})
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
                        {n.value} ({n.labelJa})
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
                <Input value={data.address ?? ""} onChange={(e) => update("address", e.target.value)} placeholder="Mangalagiri, Andhra Pradesh" />
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
                            {l.value} ({l.labelJa})
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
                          <span className="text-xs text-muted-foreground">
                            {data.languagesJa[i]}
                          </span>
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
          <Section icon={GraduationCap} title="Education" desc="Academic history" action={<AddButton onClick={addEducation} />}>
            <div className="space-y-4">
              {data.education.length === 0 && <EmptyHint text="No education entries yet. Click Add to start." />}
              {data.education.map((edu, i) => (
                <Card key={i} onRemove={() => removeEducation(i)}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Year / Month (graduation)">
                      <Input value={edu.year} onChange={(e) => updateEducation(i, { year: e.target.value })} placeholder="2026" />
                    </Field>
                    <Field label="Degree (English)">
                      <Input value={edu.degree} onChange={(e) => updateEducation(i, { degree: e.target.value })} placeholder="B.Tech" />
                    </Field>
                    <Field label="Degree (Japanese)">
                      <Input value={edu.degreeJa ?? ""} onChange={(e) => updateEducation(i, { degreeJa: e.target.value })} placeholder="理学士" />
                    </Field>
                    <Field label="Field (English)">
                      <Input value={edu.field} onChange={(e) => updateEducation(i, { field: e.target.value })} placeholder="Computer Science" />
                    </Field>
                    <Field label="Field (Japanese)">
                      <Input value={edu.fieldJa ?? ""} onChange={(e) => updateEducation(i, { fieldJa: e.target.value })} placeholder="コンピュータサイエンス" />
                    </Field>
                    <Field label="Institution (English)">
                      <Input value={edu.institution} onChange={(e) => updateEducation(i, { institution: e.target.value })} placeholder="SRM University" />
                    </Field>
                    <Field label="Institution (Japanese)">
                      <Input value={edu.institutionJa ?? ""} onChange={(e) => updateEducation(i, { institutionJa: e.target.value })} placeholder="SRM大学" />
                    </Field>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          {/* Projects */}
          <Section icon={Briefcase} title="Projects" desc="Your technical projects" action={<AddButton onClick={addProject} />}>
            <div className="space-y-4">
              {data.projects.length === 0 && <EmptyHint text="No projects yet. Click Add to start." />}
              {data.projects.map((proj, i) => (
                <Card key={i} onRemove={() => removeProject(i)}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Period">
                      <Input value={proj.period} onChange={(e) => updateProject(i, { period: e.target.value })} placeholder="2024 Sep – 2024 Dec" />
                    </Field>
                    <Field label="Project name (English)">
                      <Input value={proj.name} onChange={(e) => updateProject(i, { name: e.target.value })} placeholder="Collaboration Learning Platform" />
                    </Field>
                    <Field label="Project name (Japanese)">
                      <Input value={proj.nameJa ?? ""} onChange={(e) => updateProject(i, { nameJa: e.target.value })} placeholder="コラボ学習プラットフォーム" />
                    </Field>
                    <Field label="Tech stack">
                      <Input value={proj.techStack ?? ""} onChange={(e) => updateProject(i, { techStack: e.target.value })} placeholder="React.js, Node.js, Firebase, Tailwind CSS" />
                    </Field>
                  </div>
                  <Field label="Description (English)" className="mt-3">
                    <Textarea rows={3} value={proj.description} onChange={(e) => updateProject(i, { description: e.target.value })} placeholder="Developed a real-time learning platform with chat, live sessions, and auth..." />
                  </Field>
                  <Field label="Description (Japanese)" className="mt-2">
                    <Textarea rows={3} value={proj.descriptionJa ?? ""} onChange={(e) => updateProject(i, { descriptionJa: e.target.value })} placeholder="チャット機能やライブセッション、認証機能を実装したリアルタイム学習プラットフォーム..." />
                  </Field>
                </Card>
              ))}
            </div>
          </Section>

          {/* Activities */}
          <Section icon={Heart} title="Activities / Clubs" desc="Extracurricular and volunteer work" action={<AddButton onClick={addActivity} />}>
            <div className="space-y-4">
              {data.activities.length === 0 && <EmptyHint text="No activities yet. Click Add to start." />}
              {data.activities.map((act, i) => (
                <Card key={i} onRemove={() => removeActivity(i)}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Period">
                      <Input value={act.period} onChange={(e) => updateActivity(i, { period: e.target.value })} placeholder="9 months" />
                    </Field>
                    <Field label="Duration (Japanese)">
                      <Input value={act.duration ?? ""} onChange={(e) => updateActivity(i, { duration: e.target.value })} placeholder="9か月" />
                    </Field>
                    <Field label="Organization (English)">
                      <Input value={act.organization} onChange={(e) => updateActivity(i, { organization: e.target.value })} placeholder="Wellness Club" />
                    </Field>
                    <Field label="Organization (Japanese)">
                      <Input value={act.organizationJa ?? ""} onChange={(e) => updateActivity(i, { organizationJa: e.target.value })} placeholder="ウェルネスクラブ" />
                    </Field>
                    <Field label="Role (English)">
                      <Input value={act.role} onChange={(e) => updateActivity(i, { role: e.target.value })} placeholder="Member" />
                    </Field>
                    <Field label="Role (Japanese)">
                      <Input value={act.roleJa ?? ""} onChange={(e) => updateActivity(i, { roleJa: e.target.value })} placeholder="メンバー" />
                    </Field>
                  </div>
                  <Field label="Duties (English)" className="mt-3">
                    <Textarea rows={2} value={act.duties} onChange={(e) => updateActivity(i, { duties: e.target.value })} placeholder="Organized stress-relief activities and fitness workshops..." />
                  </Field>
                  <Field label="Duties (Japanese)" className="mt-2">
                    <Textarea rows={2} value={act.dutiesJa ?? ""} onChange={(e) => updateActivity(i, { dutiesJa: e.target.value })} placeholder="ストレス解消活動を企画・推進..." />
                  </Field>
                </Card>
              ))}
            </div>
          </Section>

          {/* Awards */}
          <Section icon={Award} title="Awards / Achievements" desc="Honors and accomplishments" action={<AddButton onClick={addAward} />}>
            <div className="space-y-4">
              {data.awards.length === 0 && <EmptyHint text="No awards yet. Click Add to start." />}
              {data.awards.map((aw, i) => (
                <Card key={i} onRemove={() => removeAward(i)}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Year">
                      <Input value={aw.year} onChange={(e) => updateAward(i, { year: e.target.value })} placeholder="2025" />
                    </Field>
                    <Field label="Title (English)">
                      <Input value={aw.title} onChange={(e) => updateAward(i, { title: e.target.value })} placeholder="Research Day Participant" />
                    </Field>
                    <Field label="Title (Japanese)">
                      <Input value={aw.titleJa ?? ""} onChange={(e) => updateAward(i, { titleJa: e.target.value })} placeholder="第9回リサーチデイ参加" />
                    </Field>
                    <Field label="Organization (English)">
                      <Input value={aw.organization} onChange={(e) => updateAward(i, { organization: e.target.value })} placeholder="SRM University" />
                    </Field>
                    <Field label="Organization (Japanese)">
                      <Input value={aw.organizationJa ?? ""} onChange={(e) => updateAward(i, { organizationJa: e.target.value })} placeholder="SRM大学" />
                    </Field>
                  </div>
                  <Field label="Description (English)" className="mt-3">
                    <Textarea rows={2} value={aw.description} onChange={(e) => updateAward(i, { description: e.target.value })} placeholder="Participated in the 9th Research Day at SRM University-AP..." />
                  </Field>
                  <Field label="Description (Japanese)" className="mt-2">
                    <Textarea rows={2} value={aw.descriptionJa ?? ""} onChange={(e) => updateAward(i, { descriptionJa: e.target.value })} placeholder="第9回リサーチデイに参加し、学術研究への関心を示した..." />
                  </Field>
                </Card>
              ))}
            </div>
          </Section>

          {/* Self-PR */}
          <Section icon={Sparkles} title="Self-PR & Hobbies" desc="Your personal statement and interests">
            <Field label="Self-PR (English)">
              <Textarea rows={5} value={data.selfPr ?? ""} onChange={(e) => update("selfPr", e.target.value)} placeholder="I am a Computer Science student passionate about full-stack development and AI..." />
            </Field>
            <Field label="自己PR (Japanese)" className="mt-3">
              <Textarea rows={5} value={data.selfPrJa ?? ""} onChange={(e) => update("selfPrJa", e.target.value)} placeholder="コンピュータサイエンスを専攻する学生です。フルスタック開発やAIプロジェクトに取り組む中で..." />
            </Field>
            <Field label="Hobbies (English)" className="mt-3">
              <Input value={data.hobbies ?? ""} onChange={(e) => update("hobbies", e.target.value)} placeholder="Badminton, Fitness, Reading" />
            </Field>
            <Field label="趣味 (Japanese)" className="mt-2">
              <Input value={data.hobbiesJa ?? ""} onChange={(e) => update("hobbiesJa", e.target.value)} placeholder="バドミントン、フィットネス、読書" />
            </Field>
          </Section>

          {/* Save bar */}
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
  icon: Icon,
  title,
  desc,
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-premium">
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
