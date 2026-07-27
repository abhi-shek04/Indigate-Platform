"use client";

import { useEffect, useState, useCallback } from "react";
import { api, formatRelative } from "@/lib/api-client";
import { useT } from "@/lib/use-t";
import { SectionCard, MetricCard, MetricSkeleton } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sparkles, RefreshCw, Layers, Trophy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MatchStatsResponse {
  totalScores: number;
  avgScore: number;
  topMatches: Array<{
    id: string;
    candidateId: string;
    candidateName: string;
    jobId: string;
    jobTitle: string;
    company: string;
    score: number;
    computedAt: string;
  }>;
}

export function MatchingTab() {
  const { pick, locale } = useT();
  const [data, setData] = useState<MatchStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<MatchStatsResponse>("/api/admin/matches/stats");
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function triggerRecompute() {
    setRecomputing(true);
    try {
      await api("/api/admin/matches/recompute", {
        method: "POST",
        body: JSON.stringify({ type: "candidate", id: "all" }),
      });
      toast.success("AI match scoring job queued successfully.", {
        description: "Pre-computed scores are being updated in the background.",
      });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to trigger recompute.");
    } finally {
      setRecomputing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-saffron fill-saffron" />
            AI Match Insights & Scoring Engine
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time pre-computed match scores between candidate profiles and active jobs.
          </p>
        </div>
        <Button
          onClick={triggerRecompute}
          disabled={recomputing}
          className="bg-brand-gradient text-white font-semibold shadow-glow-brand gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={cn("h-4 w-4", recomputing && "animate-spin")} />
          Recompute AI Scores
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              label="Total Pre-computed Scores"
              value={data?.totalScores ?? 0}
              icon={Layers}
              accent="saffron"
            />
            <MetricCard
              label="Average Match Score"
              value={`${data?.avgScore ?? 0}%`}
              icon={Sparkles}
              accent="amber"
            />
            <MetricCard
              label="Scoring Engine Status"
              value="ACTIVE (Score-on-Write)"
              icon={Trophy}
              accent="emerald"
            />
          </>
        )}
      </div>

      {/* Top Matches Table */}
      <SectionCard
        title="Top AI Candidate-Job Pairs"
        action={
          <Button variant="ghost" size="sm" onClick={load} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
        bodyClassName="p-0"
      >
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading match insights…</div>
        ) : !data || data.topMatches.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No pre-computed scores found. Trigger candidate profile save or re-compute scores above.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Candidate</TableHead>
                <TableHead>Job Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>AI Match Score</TableHead>
                <TableHead className="pr-6 text-right">Computed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topMatches.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="pl-6 font-semibold text-sm">
                    {m.candidateName}
                  </TableCell>
                  <TableCell className="font-medium text-sm text-foreground/90">
                    {m.jobTitle}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {m.company}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "font-display font-extrabold text-xs px-2.5 py-1 rounded-full border shadow-sm inline-flex items-center gap-1",
                        m.score >= 85
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : m.score >= 70
                          ? "bg-saffron/10 text-saffron border-saffron/30"
                          : "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                      {m.score}% Match
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-right text-xs text-muted-foreground">
                    {formatRelative(m.computedAt, locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
