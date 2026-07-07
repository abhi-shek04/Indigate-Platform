"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { SectionCard } from "@/components/dashboard/dashboard-shell";
import { SkillsInput } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { JobDTO, JobType, JLPTLevel, SalaryType } from "@/lib/types";
import { JLPT_LEVELS, JOB_TYPES, SALARY_TYPES } from "@/lib/types";

export function NewJob() {
  const { t } = useT();
  const setTab = useApp((s) => s.setCompanyTab);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    jobType: "FULL_TIME" as JobType,
    jlptRequired: "N3" as JLPTLevel,
    salaryMin: "",
    salaryMax: "",
    salaryType: "MONTHLY" as SalaryType,
    skills: [] as string[],
    deadline: "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.title.trim().length < 3) {
      toast.error("Job title must be at least 3 characters.");
      return;
    }
    if (form.description.trim().length < 50) {
      toast.error("Description must be at least 50 characters.");
      return;
    }
    if (form.location.trim().length < 2) {
      toast.error("Location is required.");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        jobType: form.jobType,
        jlptRequired: form.jlptRequired,
        salaryType: form.salaryType,
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

  return (
    <form onSubmit={submit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          {t("dash.company.post")}
        </h2>
      </div>

      <SectionCard>
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">
              {t("dash.company.post.title")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Senior Frontend Engineer (React)"
              required
              minLength={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">
              {t("dash.company.post.desc")} <span className="text-destructive">*</span>
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                ({form.description.length}/50 min)
              </span>
            </Label>
            <Textarea
              id="description"
              rows={6}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe responsibilities, requirements, and what makes this role exciting..."
              required
              minLength={50}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="location">
                {t("dash.company.post.location")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Tokyo, Japan"
                required
                minLength={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deadline">
                {t("dash.company.post.deadline")}
              </Label>
              <Input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("dash.company.post.type")}</Label>
              <Select
                value={form.jobType}
                onValueChange={(v) => set("jobType", v as JobType)}
              >
                <SelectTrigger className="w-full">
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
            </div>
            <div className="space-y-1.5">
              <Label>{t("dash.company.post.jlpt")}</Label>
              <Select
                value={form.jlptRequired}
                onValueChange={(v) => set("jlptRequired", v as JLPTLevel)}
              >
                <SelectTrigger className="w-full">
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
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="salaryMin">
                {t("dash.company.post.salary.min")}
              </Label>
              <Input
                id="salaryMin"
                type="number"
                min={0}
                value={form.salaryMin}
                onChange={(e) => set("salaryMin", e.target.value)}
                placeholder="e.g. 250000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salaryMax">
                {t("dash.company.post.salary.max")}
              </Label>
              <Input
                id="salaryMax"
                type="number"
                min={0}
                value={form.salaryMax}
                onChange={(e) => set("salaryMax", e.target.value)}
                placeholder="e.g. 400000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("dash.company.post.salary.type")}</Label>
              <Select
                value={form.salaryType}
                onValueChange={(v) => set("salaryType", v as SalaryType)}
              >
                <SelectTrigger className="w-full">
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
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("dash.company.post.skill")}</Label>
            <SkillsInput
              value={form.skills}
              onChange={(next) => set("skills", next)}
              placeholder={t("dash.company.post.skill.placeholder")}
            />
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center justify-end gap-3 sticky bottom-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setTab("jobs")}
          disabled={saving}
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="bg-brand-gradient text-white shadow-premium hover:opacity-90 px-6"
        >
          {saving ? t("common.loading") : t("dash.company.post.submit")}
        </Button>
      </div>
    </form>
  );
}
