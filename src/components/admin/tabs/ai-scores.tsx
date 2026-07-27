"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, formatRelative } from "@/lib/api-client";
import { useT } from "@/lib/use-t";
import {
  MetricCard,
  SectionCard,
} from "@/components/dashboard/dashboard-shell";
import { CandidateAvatar, CompanyAvatar } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { easeOutExpo } from "@/lib/motion";
import type { Prisma } from "@prisma/client";
import {
  Sparkles,
  RefreshCw,
  Trophy,
  Info,
  Database,
  Target,
  Zap,
  Code2,
  Languages,
  Banknote,
  Clock,
  ArrowRight,
  Activity,
  Layers,
} from "lucide-react";

export interface ScoreBreakdown {
  skills: number;
  jlpt: number;
  salary: number;
  experience: number;
}

function toBreakdown(v: Prisma.JsonValue): ScoreBreakdown {
  if (typeof v === "object" && v !== null && !Array.isArray(v)) {
    const obj = v as Record<string, unknown>;
    return {
      skills: typeof obj.skills === "number" ? obj.skills : 0,
      jlpt: typeof obj.jlpt === "number" ? obj.jlpt : 0,
      salary: typeof obj.salary === "number" ? obj.salary : 0,
      experience: typeof obj.experience === "number" ? obj.experience : 0,
    };
  }
  return { skills: 0, jlpt: 0, salary: 0, experience: 0 };
}

interface ScoreStats {
  total: number;
  average: number;
  candidatesScored: number;
  jobsScored: number;
  lastComputedAt: string | null;
}

interface ScorePair {
  id: string;
  score: number;
  breakdown: Prisma.JsonValue;
  computedAt: string;
  candidate: {
    fullName: string | null;
    photoUrl: string | null;
    jlptLevel: string | null;
  };
  job: {
    title: string;
    locationJapan: string | null;
    company: { companyName: string; logoUrl: string | null } | null;
  };
}

export function AIScoresTab() {
  const { locale } = useT();
  const [stats, setStats] = useState<ScoreStats | null>(null);
  const [pairs, setPairs] = useState<ScorePair[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pairsLoading, setPairsLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const s = await api<ScoreStats>("/api/admin/ai-scores/stats");
      setStats(s);
    } catch {
      // stats silently fail — leave existing data
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadPairs = useCallback(async () => {
    setPairsLoading(true);
    try {
      const r = await api<{ items: ScorePair[] }>("/api/admin/ai-scores?limit=20");
      setPairs(r.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load scores.");
    } finally {
      setPairsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
    void loadPairs();
  }, [loadStats, loadPairs]);

  async function handleRecompute() {
    setRecomputing(true);
    try {
      const r = await api<{ computed: number; durationMs: number }>(
        "/api/admin/ai-scores/recompute",
        { method: "POST" },
      );
      toast.success(
        `Recomputed ${r.computed} match scores in ${(r.durationMs / 1000).toFixed(1)}s`,
      );
      await Promise.all([loadStats(), loadPairs()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Recompute failed.");
    } finally {
      setRecomputing(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* REGION 1 — ENGINE HEADER BANNER (compact, sleek, Linear style) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOutExpo }}
        className="relative rounded-xl overflow-hidden bg-sidebar border border-sidebar-border shadow-md"
      >
        {/* Subtle ambient glows */}
        <div
          aria-hidden
          className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-saffron/20 blur-2xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -bottom-8 right-8 h-36 w-36 rounded-full bg-crimson/15 blur-2xl pointer-events-none"
        />

        <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap p-5 sm:p-6">
          {/* Left — Title & Meta */}
          <div className="flex items-center gap-3.5 max-w-xl">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-brand-gradient text-white shrink-0 ring-1 ring-saffron/30 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-base sm:text-lg text-sidebar-foreground tracking-tight">
                  AI Match Insights & Scoring Engine
                </h2>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Active (On-Demand)
                </div>
              </div>
              <p className="text-xs text-sidebar-foreground/60 mt-0.5 leading-normal">
                Real-time pre-computed match scores between candidate profiles
                and active jobs using multi-factor vector weighting.
              </p>
              {stats?.lastComputedAt && (
                <p className="mt-1 text-[11px] text-sidebar-foreground/40 font-medium">
                  Last computed {formatRelative(stats.lastComputedAt, locale)}
                </p>
              )}
            </div>
          </div>

          {/* Right — Recompute Action CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={recomputing}
            onClick={handleRecompute}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient text-white font-semibold text-xs h-9 px-4 shadow-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0 cursor-pointer"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", recomputing && "animate-spin")}
            />
            <span>{recomputing ? "Recomputing…" : "Recompute AI Scores"}</span>
          </motion.button>
        </div>

        {/* Bottom stat strip — 3 quick metric figures */}
        <div className="relative z-10 border-t border-sidebar-border/60 grid grid-cols-3 divide-x divide-sidebar-border/60 bg-sidebar/40">
          {[
            {
              label: "Total Pre-computed Scores",
              value: stats?.total ?? 0,
              suffix: "",
            },
            {
              label: "Average Match Score",
              value: stats?.average ?? 0,
              suffix: "%",
            },
            {
              label: "Scored Coverage",
              value: `${stats?.candidatesScored ?? 0}C × ${stats?.jobsScored ?? 0}J`,
              suffix: "",
            },
          ].map((s, i) => (
            <div key={i} className="px-4 py-3 text-center">
              <p className="font-display font-bold text-lg sm:text-xl text-sidebar-foreground tracking-tight">
                {s.value}
                {s.suffix}
              </p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* REGION 2 — METRIC CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <MetricCard
          label="Total Pre-computed Scores"
          value={statsLoading ? "—" : (stats?.total ?? 0).toLocaleString()}
          icon={Database}
          accent="saffron"
          hint="Active Candidate × Job matrix"
        />
        <MetricCard
          label="Average Match Score"
          value={statsLoading ? "—" : `${stats?.average ?? 0}%`}
          icon={Target}
          accent="emerald"
          hint="Platform-wide candidate fit"
        />
        <MetricCard
          label="Score Coverage"
          value={
            statsLoading
              ? "—"
              : stats && stats.total > 0
                ? `${stats.candidatesScored}/${stats.total > 0 ? Math.max(stats.candidatesScored, 1) : 0} cands`
                : "0 candidates"
          }
          icon={Zap}
          accent="violet"
          hint={`${stats?.jobsScored ?? 0} active jobs covered`}
        />
      </div>

      {/* REGION 3 — TOP PAIRS TABLE */}
      <SectionCard
        title="Top AI Candidate-Job Pairs"
        icon={Trophy}
        action={
          <div className="flex items-center gap-2">
            {pairsLoading && (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
            <button
              onClick={loadPairs}
              disabled={pairsLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground hover:border-saffron/40 hover:text-foreground transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>
        }
        bodyClassName="p-0"
      >
        {pairsLoading ? (
          /* Loading skeleton — 5 rows */
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-1/3 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse shrink-0" />
                <div className="w-28 space-y-1.5">
                  <div className="h-3 w-full bg-muted rounded animate-pulse" />
                  <div className="h-2 w-2/3 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : pairs.length === 0 ? (
          /* Compact Empty State */
          <div className="py-12 px-6 text-center">
            <div className="mx-auto mb-4 grid place-items-center h-14 w-14 rounded-2xl bg-saffron/10 border border-saffron/20 text-saffron">
              <Sparkles className="h-6 w-6 animate-bob" />
            </div>
            <h3 className="font-display font-bold text-base">
              No Pre-computed Scores Found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Trigger a recompute to generate match scores between your candidate
              profiles and active job listings.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRecompute}
              disabled={recomputing}
              className="mt-5 inline-flex items-center gap-2 bg-brand-gradient text-white font-semibold rounded-lg h-9 px-5 text-xs shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", recomputing && "animate-spin")}
              />
              <span>{recomputing ? "Recomputing…" : "Recompute AI Scores"}</span>
            </motion.button>
          </div>
        ) : (
          /* Pairs list */
          <ul className="divide-y divide-border/60">
            {pairs.map((pair, idx) => {
              return (
                <motion.li
                  key={pair.id}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.3,
                    delay: idx * 0.03,
                    ease: easeOutExpo,
                  }}
                  className="flex items-center gap-3 sm:gap-4 px-5 py-3.5 group hover:bg-muted/40 transition-colors"
                >
                  {/* Rank */}
                  <div className="text-[11px] font-bold text-muted-foreground/40 w-5 text-center shrink-0 tabular-nums">
                    {idx + 1}
                  </div>

                  {/* Candidate */}
                  <div className="flex items-center gap-2.5 min-w-0 w-[30%]">
                    <CandidateAvatar
                      name={pair.candidate.fullName ?? "?"}
                      photoUrl={pair.candidate.photoUrl}
                      size={34}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate group-hover:text-saffron transition-colors">
                        {pair.candidate.fullName || "Candidate"}
                      </p>
                      {pair.candidate.jlptLevel && (
                        <span className="inline-flex items-center mt-0.5 text-[9px] font-bold rounded bg-crimson/10 border border-crimson/20 text-crimson px-1.5 py-0.2">
                          JLPT {pair.candidate.jlptLevel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="shrink-0 text-muted-foreground/30">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>

                  {/* Job & Company */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <CompanyAvatar
                      name={pair.job.company?.companyName ?? "?"}
                      color={null}
                      size={34}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {pair.job.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {pair.job.company?.companyName}
                        {pair.job.locationJapan &&
                          ` · ${pair.job.locationJapan}`}
                      </p>
                    </div>
                  </div>

                  {/* Score bar & Value */}
                  <div className="shrink-0 flex items-center gap-3 w-[130px]">
                    <span
                      className={cn(
                        "text-sm font-extrabold font-display tabular-nums shrink-0 w-9 text-right",
                        pair.score >= 80
                          ? "text-saffron"
                          : pair.score >= 60
                            ? "text-amber-500"
                            : "text-muted-foreground",
                      )}
                    >
                      {pair.score}%
                    </span>
                    {/* Progress Bar */}
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          pair.score >= 80
                            ? "bg-brand-gradient"
                            : pair.score >= 60
                              ? "bg-amber-400"
                              : "bg-muted-foreground/40",
                        )}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pair.score}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.6,
                          delay: idx * 0.04,
                          ease: easeOutExpo,
                        }}
                      />
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {/* REGION 4 — SCORE BREAKDOWN LEGEND */}
      <SectionCard
        title="How scores are calculated"
        icon={Info}
        bodyClassName="py-4"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Skills Match",
              weight: "55%",
              icon: Code2,
              desc: "Jaccard similarity between candidate skills and job requirements",
            },
            {
              label: "JLPT Level",
              weight: "30%",
              icon: Languages,
              desc: "Candidate's JLPT level vs. job's minimum requirement",
            },
            {
              label: "Experience",
              weight: "15%",
              icon: Clock,
              desc: "Years of experience baseline fit for candidate",
            },
            {
              label: "Salary Range",
              weight: "Info",
              icon: Banknote,
              desc: "Job salary range availability indicator",
            },
          ].map((dim, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/60 bg-muted/30 p-3.5"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="grid place-items-center h-7 w-7 rounded-lg bg-saffron/10 border border-saffron/20 text-saffron">
                  <dim.icon className="h-3.5 w-3.5" />
                </div>
                <span className="font-display font-bold text-base text-gradient-brand">
                  {dim.weight}
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground">{dim.label}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground leading-relaxed">
                {dim.desc}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
