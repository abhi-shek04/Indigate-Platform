"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { SectionCard } from "@/components/dashboard/dashboard-shell";
import { SkillsInput } from "@/components/dashboard/widgets";
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
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type {
  EducationEntry,
  JLPTLevel,
} from "@/lib/types";
import {
  JLPT_LEVELS,
  JLPT_BADGE,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function Profile() {
  const candidate = useApp((s) => s.candidate);
  const refreshAuth = useApp((s) => s.refreshAuth);
  const { t, pick } = useT();

  const [form, setForm] = useState({
    fullName: candidate?.fullName ?? "",
    phone: candidate?.phone ?? "",
    location: candidate?.location ?? "",
    bio: candidate?.bio ?? "",
    linkedinUrl: candidate?.linkedinUrl ?? "",
    experienceYears: candidate?.experienceYears ?? 0,
    jlptLevel: (candidate?.jlptLevel ?? "NONE") as JLPTLevel,
    skills: candidate?.skills ?? [],
    education: (candidate?.education ?? []) as EducationEntry[],
  });
  const [saving, setSaving] = useState(false);

  // re-sync when store candidate changes (e.g. after refreshAuth)
  useEffect(() => {
    if (!candidate) return;
    setForm((prev) => ({
      ...prev,
      fullName: candidate.fullName,
      phone: candidate.phone ?? "",
      location: candidate.location ?? "",
      bio: candidate.bio ?? "",
      linkedinUrl: candidate.linkedinUrl ?? "",
      experienceYears: candidate.experienceYears,
      jlptLevel: candidate.jlptLevel,
      skills: candidate.skills,
      education: candidate.education ?? [],
    }));
  }, [candidate?.updatedAt]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function addEducation() {
    set("education", [
      ...form.education,
      { degree: "", field: "", institution: "", year: "" },
    ]);
  }
  function removeEducation(idx: number) {
    set(
      "education",
      form.education.filter((_, i) => i !== idx),
    );
  }
  function setEducation(idx: number, patch: Partial<EducationEntry>) {
    set(
      "education",
      form.education.map((e, i) => (i === idx ? { ...e, ...patch } : e)),
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/api/candidates/me", {
        method: "PUT",
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone: form.phone.trim() || null,
          location: form.location.trim() || null,
          bio: form.bio.trim() || null,
          linkedinUrl: form.linkedinUrl.trim() || null,
          experienceYears: Number(form.experienceYears) || 0,
          jlptLevel: form.jlptLevel,
          skills: form.skills,
          education: form.education.length ? form.education : null,
        }),
      });
      await refreshAuth();
      toast.success(t("dash.profile.saved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Basic info */}
      <SectionCard title={t("dash.profile.basic")}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">{pick("Full name", "氏名")}</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">{pick("Phone", "電話番号")}</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+91 ..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">{pick("Location", "居住地")}</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder={pick("e.g. Bengaluru, India", "例：インド、ベンガルール")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="linkedinUrl">{pick("LinkedIn URL", "LinkedIn URL")}</Label>
            <Input
              id="linkedinUrl"
              value={form.linkedinUrl}
              onChange={(e) => set("linkedinUrl", e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="experienceYears">{pick("Experience (years)", "経験年数")}</Label>
            <Input
              id="experienceYears"
              type="number"
              min={0}
              max={50}
              value={form.experienceYears}
              onChange={(e) =>
                set("experienceYears", Number(e.target.value) || 0)
              }
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="bio">{pick("Bio", "自己紹介")}</Label>
            <Textarea
              id="bio"
              rows={4}
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder={pick("A short professional summary...", "簡単な職務経歴の要約...")}
              maxLength={2000}
            />
          </div>
        </div>
      </SectionCard>

      {/* Japan readiness */}
      <SectionCard title={t("dash.profile.japan")}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{pick("JLPT level", "JLPT レベル")}</Label>
            <Select
              value={form.jlptLevel}
              onValueChange={(v) => set("jlptLevel", v as JLPTLevel)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JLPT_LEVELS.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {lvl === "NONE" ? pick("No certification yet", "資格なし") : `JLPT ${lvl}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{pick("Current badge", "現在のバッジ")}</Label>
            <div className="flex items-center h-9">
              <Badge
                variant="outline"
                className={cn("font-semibold", JLPT_BADGE[form.jlptLevel])}
              >
                {form.jlptLevel}
              </Badge>
            </div>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>{pick("Skills", "スキル")}</Label>
            <SkillsInput
              value={form.skills}
              onChange={(next) => set("skills", next)}
              placeholder={pick("Type a skill and press Enter", "スキルを入力してEnterを押してください")}
            />
            <p className="text-xs text-muted-foreground">
              {pick("Add at least 3 skills for the best visibility.", "見つけやすくするために、少なくとも3つのスキルを追加してください。")}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Education */}
      <SectionCard
        title={t("dash.profile.education")}
        action={
          <Button type="button" size="sm" variant="outline" onClick={addEducation}>
            <Plus className="h-3.5 w-3.5" />
            {pick("Add entry", "追加")}
          </Button>
        }
        bodyClassName="space-y-4"
      >
        {form.education.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            {pick("No education entries yet. Click \"Add entry\" to add one.", "学歴がまだありません。「追加」をクリックして追加してください。")}
          </p>
        ) : (
          form.education.map((ed, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-background/60 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {pick(`Entry #${i + 1}`, `エントリ #${i + 1}`)}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeEducation(i)}
                  aria-label={pick("Remove entry", "エントリを削除")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{pick("Degree", "学位")}</Label>
                  <Input
                    value={ed.degree}
                    onChange={(e) =>
                      setEducation(i, { degree: e.target.value })
                    }
                    placeholder={pick("B.Tech", "例: 学士")}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{pick("Field", "専攻分野")}</Label>
                  <Input
                    value={ed.field}
                    onChange={(e) => setEducation(i, { field: e.target.value })}
                    placeholder={pick("Computer Science", "例: コンピュータサイエンス")}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{pick("Institution", "教育機関")}</Label>
                  <Input
                    value={ed.institution}
                    onChange={(e) =>
                      setEducation(i, { institution: e.target.value })
                    }
                    placeholder={pick("IIT Madras", "例: インド工科大学")}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{pick("Year", "卒業年")}</Label>
                  <Input
                    value={ed.year}
                    onChange={(e) => setEducation(i, { year: e.target.value })}
                    placeholder="2022"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </SectionCard>

      <div className="flex items-center justify-end gap-3 sticky bottom-4">
        <Button
          type="submit"
          disabled={saving}
          className="bg-brand-gradient text-white shadow-premium hover:opacity-90 px-6"
        >
          {saving ? t("common.loading") : t("dash.profile.save")}
        </Button>
      </div>
    </form>
  );
}
