"use client";

import { useState, useEffect } from "react";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { EmptyState, SectionCard } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CandidateAvatar } from "@/components/brand/logo";
import { toast } from "sonner";
import { Users2, Search, Eye } from "lucide-react";
import type { CandidateTalentDTO } from "@/lib/types";
import { JLPT_LEVELS, JLPT_BADGE } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TalentSearch() {
  const { t, pick } = useT();
  const [search, setSearch] = useState("");
  const [jlpt, setJlpt] = useState("");
  const [minExp, setMinExp] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [results, setResults] = useState<CandidateTalentDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<CandidateTalentDTO | null>(null);

  async function fetchCandidates() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (jlpt) params.set("jlptLevel", jlpt);
      if (minExp) params.set("minExp", minExp);
      if (skillsInput) params.set("skills", skillsInput);
      const res = await api<{ candidates: CandidateTalentDTO[]; total: number }>(
        `/api/candidates/search?${params.toString()}`,
      );
      setResults(res.candidates);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  }

  // initial load + refetch on filter change (debounced for text)
  useEffect(() => {
    const tm = setTimeout(fetchCandidates, 400);
    return () => clearTimeout(tm);
  }, [search, skillsInput, jlpt, minExp]);

  return (
    <div className="space-y-5">
      <SectionCard title={pick("Find Talent", "タレントを探す")} action={null}>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("dash.company.talent.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={jlpt || "all"} onValueChange={(v) => setJlpt(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("dash.company.talent.jlpt")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{pick("Any JLPT", "すべてのJLPT")}</SelectItem>
              {JLPT_LEVELS.filter((l) => l !== "NONE").map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={minExp || "all"} onValueChange={(v) => setMinExp(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("dash.company.talent.exp")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{pick("Any experience", "すべての経験年数")}</SelectItem>
              {[1, 2, 3, 5, 8].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}+ years</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder={pick("Skills (React, Go...)", "スキル (React, Go...)")}
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="w-[180px]"
          />
        </div>
      </SectionCard>

      <p className="text-sm text-muted-foreground">
        {loading ? "Searching…" : t("dash.company.talent.found", { count: String(total) })}
      </p>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      ) : results.length === 0 ? (
        <EmptyState icon={Users2} title={t("dash.company.talent.empty")} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((c) => (
            <CandidateTalentCard key={c.id} candidate={c} onView={() => setSelected(c)} />
          ))}
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto scroll-area">
          {selected && <CandidateDetailPanel candidate={selected} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CandidateTalentCard({
  candidate,
  onView,
}: {
  candidate: CandidateTalentDTO;
  onView: () => void;
}) {
  const { t, pick } = useT();
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-premium hover:-translate-y-0.5 transition-transform">
      <div className="flex items-start gap-3">
        <CandidateAvatar name={candidate.fullName} photoUrl={candidate.photoUrl} size={48} />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold truncate">{candidate.fullName}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {candidate.location || "—"}
          </p>
        </div>
        <Badge variant="outline" className={cn("font-semibold shrink-0", JLPT_BADGE[candidate.jlptLevel])}>
          {candidate.jlptLevel}
        </Badge>
      </div>
      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
        {candidate.bio || "No bio provided."}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {candidate.skills.slice(0, 4).map((s) => (
          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
        ))}
        {candidate.skills.length > 4 && (
          <span className="text-xs text-muted-foreground">+{candidate.skills.length - 4}</span>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {candidate.experienceYears} {t("dash.company.talent.years")}
          {candidate.hasResume && (
            <span className="text-emerald-600 font-medium ml-2">✓ {pick("Resume", "履歴書")}</span>
          )}
        </span>
        <Button size="sm" variant="outline" onClick={onView}>
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          {pick("View profile", "プロフィールを表示")}
        </Button>
      </div>
    </div>
  );
}

function CandidateDetailPanel({ candidate }: { candidate: CandidateTalentDTO }) {
  const { t, pick } = useT();
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-3">
        <CandidateAvatar name={candidate.fullName} photoUrl={candidate.photoUrl} size={56} />
        <div>
          <h2 className="font-display text-xl font-bold">{candidate.fullName}</h2>
          <p className="text-sm text-muted-foreground">{candidate.location || "—"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className={cn("font-semibold", JLPT_BADGE[candidate.jlptLevel])}>
          JLPT {candidate.jlptLevel}
        </Badge>
        <Badge variant="secondary">{candidate.experienceYears} {t("dash.company.talent.years")}</Badge>
      </div>
      {candidate.bio && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-1">{pick("About", "概要")}</h3>
          <p className="text-sm leading-relaxed">{candidate.bio}</p>
        </div>
      )}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">{pick("Skills", "スキル")}</h3>
        <div className="flex flex-wrap gap-1.5">
          {candidate.skills.map((s) => (
            <Badge key={s} variant="secondary">{s}</Badge>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{pick("Experience", "経験")}</p>
          <p className="font-medium">{candidate.experienceYears} years</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{pick("Education records", "学歴")}</p>
          <p className="font-medium">{candidate.educationCount}</p>
        </div>
        {candidate.hasResume && (
          <div>
            <p className="text-xs text-muted-foreground">{pick("Resume", "履歴書")}</p>
            <p className="font-medium text-emerald-600">✓ {pick("Uploaded", "アップロード済み")}</p>
          </div>
        )}
      </div>
      <div className="pt-3 border-t text-xs text-muted-foreground leading-relaxed">
        {pick(
          "Contact details (email, phone, resume) are shared only after this candidate applies to your job. Use your job postings to attract them.",
          "連絡先（メール、電話、履歴書）は、この候補者があなたの求人に応募した後にのみ共有されます。求人を投稿してアピールしましょう。"
        )}
      </div>
    </div>
  );
}
