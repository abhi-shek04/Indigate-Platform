"use client";

import { useEffect, useState, useMemo } from "react";
import { api, formatDate } from "@/lib/api-client";
import {
  SectionCard,
  CardSkeleton,
  EmptyState,
  MetricCard,
} from "@/components/dashboard/dashboard-shell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  BellRing,
  Users,
  Languages,
  MapPin,
  Search,
  AlertTriangle,
  Send,
  Loader2,
} from "lucide-react";
import { JLPT_BADGE } from "@/lib/types";
import { ExportCsvButton } from "@/components/admin/shared";
import { cn } from "@/lib/utils";

export interface AlertRow {
  id: string;
  userId: string;
  candidateName: string;
  candidateEmail: string;
  name: string;
  search: string | null;
  location: string | null;
  jobType: string | null;
  jlptLevel: string | null;
  salaryMin: number | null;
  isActive: boolean;
  createdAt: string;
  hasMatchingJobs: boolean;
}

export function AlertsTab() {
  const [items, setItems] = useState<AlertRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notifying, setNotifying] = useState(false);

  const [jlptFilter, setJlptFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [stats, setStats] = useState<{
    total: number;
    uniqueCandidates: number;
    topJlpt: string;
    topLocation: string;
    gapCount: number;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api<{ items: AlertRow[]; stats: typeof stats }>(
          "/api/admin/list/alerts"
        );
        setItems(res.items);
        setStats(res.stats);
      } catch {
        toast.error("Failed to load alerts.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    const now = Date.now();
    const day = 86_400_000;

    return items.filter((a) => {
      if (
        q &&
        !a.candidateName.toLowerCase().includes(q) &&
        !a.candidateEmail.toLowerCase().includes(q) &&
        !a.name.toLowerCase().includes(q)
      )
        return false;
      if (jlptFilter !== "all" && a.jlptLevel !== jlptFilter) return false;
      if (jobTypeFilter !== "all" && a.jobType !== jobTypeFilter) return false;
      if (
        dateFilter === "7d" &&
        now - new Date(a.createdAt).getTime() > 7 * day
      )
        return false;
      if (
        dateFilter === "30d" &&
        now - new Date(a.createdAt).getTime() > 30 * day
      )
        return false;
      return true;
    });
  }, [items, search, jlptFilter, jobTypeFilter, dateFilter]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  }

  async function handleBulkNotify() {
    if (selected.size === 0) return;
    setNotifying(true);
    try {
      const res = await api<{ sent: number; skipped: number; message: string }>(
        "/api/admin/alerts/notify",
        {
          method: "POST",
          body: JSON.stringify({ alertIds: Array.from(selected) }),
        }
      );
      toast.success(res.message);
      setSelected(new Set());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send emails.");
    } finally {
      setNotifying(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── 4 Metric Cards ──────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Alerts"
            value={stats.total}
            icon={BellRing}
            accent="saffron"
            hint="Active candidate alerts"
          />
          <MetricCard
            label="Unique Candidates"
            value={stats.uniqueCandidates}
            icon={Users}
            accent="sky"
            hint="Candidates with at least 1 alert"
          />
          <MetricCard
            label="Most Wanted JLPT"
            value={stats.topJlpt}
            icon={Languages}
            accent="violet"
            hint="Most requested level"
          />
          <MetricCard
            label="Most Wanted Location"
            value={stats.topLocation}
            icon={MapPin}
            accent="emerald"
            hint={`${stats.gapCount} alert${
              stats.gapCount !== 1 ? "s" : ""
            } have no matching jobs`}
          />
        </div>
      )}

      {/* Gap alert notice — only show if gapCount > 0 */}
      {stats && stats.gapCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/40 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-700/30 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[13px] text-amber-800 dark:text-amber-300">
            <span className="font-bold">
              {stats.gapCount} alert{stats.gapCount !== 1 ? "s" : ""}
            </span>{" "}
            have no matching active jobs — these candidates may churn. Rows are
            highlighted below. Consider posting jobs in those categories.
          </p>
        </div>
      )}

      {/* ── Main Table Card ─────────────────────────────────────────── */}
      <SectionCard
        title="Candidate Job Alerts"
        action={
          <div className="flex items-center gap-2">
            {/* Bulk notify button — only shows when rows are selected */}
            {selected.size > 0 && (
              <Button
                size="sm"
                onClick={handleBulkNotify}
                disabled={notifying}
                className="bg-brand-gradient text-white font-semibold"
              >
                {notifying ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Send Jobs Digest ({selected.size})
                  </>
                )}
              </Button>
            )}
            <ExportCsvButton resource="alerts" />
          </div>
        }
      >
        {/* ── Filters bar ─────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Text search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search candidate or alert…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>

          {/* JLPT filter */}
          <Select value={jlptFilter} onValueChange={setJlptFilter}>
            <SelectTrigger className="h-9 w-[120px] text-sm">
              <SelectValue placeholder="JLPT" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All JLPT</SelectItem>
              {["N1", "N2", "N3", "N4", "N5"].map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Job type filter */}
          <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <SelectValue placeholder="Job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="FULL_TIME">Full-time</SelectItem>
              <SelectItem value="PART_TIME">Part-time</SelectItem>
              <SelectItem value="INTERNSHIP">Internship</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
            </SelectContent>
          </Select>

          {/* Date range filter */}
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="h-9 w-[130px] text-sm">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── Selection hint ──────────────────────────────────────── */}
        {selected.size > 0 && (
          <div className="mb-3 flex items-center gap-2 text-[12.5px] text-muted-foreground">
            <span className="font-semibold text-foreground">
              {selected.size}
            </span>{" "}
            selected
            <button
              onClick={() => setSelected(new Set())}
              className="text-crimson hover:underline font-medium"
            >
              Clear
            </button>
          </div>
        )}

        {/* ── Table ───────────────────────────────────────────────── */}
        {loading ? (
          <CardSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BellRing}
            title="No alerts found"
            description="Candidates haven't set up job alerts yet."
          />
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {/* Select-all checkbox */}
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={
                        selected.size > 0 && selected.size === filtered.length
                      }
                      ref={(el) => {
                        if (el)
                          el.indeterminate =
                            selected.size > 0 && selected.size < filtered.length;
                      }}
                      onChange={toggleSelectAll}
                      className="h-3.5 w-3.5 accent-saffron cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Alert Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>JLPT</TableHead>
                  <TableHead>Min Salary</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((alert) => (
                  <TableRow
                    key={alert.id}
                    className={cn(
                      "transition-colors",
                      // Gap alert highlight — amber tint if no matching jobs
                      !alert.hasMatchingJobs &&
                        "bg-amber-50/40 dark:bg-amber-950/10 hover:bg-amber-50/60 dark:hover:bg-amber-950/20",
                      selected.has(alert.id) && "bg-saffron/5"
                    )}
                  >
                    {/* Checkbox */}
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(alert.id)}
                        onChange={() => toggleSelect(alert.id)}
                        className="h-3.5 w-3.5 accent-saffron cursor-pointer"
                      />
                    </TableCell>

                    {/* Candidate */}
                    <TableCell>
                      <p className="font-medium text-[13px] leading-snug">
                        {alert.candidateName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {alert.candidateEmail}
                      </p>
                    </TableCell>

                    {/* Alert name */}
                    <TableCell>
                      <span className="text-[13px] font-medium">
                        {alert.name}
                      </span>
                      {alert.search && (
                        <p className="text-[11px] text-muted-foreground">
                          "{alert.search}"
                        </p>
                      )}
                    </TableCell>

                    {/* Location */}
                    <TableCell className="text-[13px] text-muted-foreground">
                      {alert.location ?? (
                        <span className="text-muted-foreground/40">Any</span>
                      )}
                    </TableCell>

                    {/* Job type */}
                    <TableCell>
                      {alert.jobType ? (
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium"
                        >
                          {alert.jobType.replace("_", " ")}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/40 text-[12px]">
                          Any
                        </span>
                      )}
                    </TableCell>

                    {/* JLPT */}
                    <TableCell>
                      {alert.jlptLevel && alert.jlptLevel !== "NONE" ? (
                        <Badge
                          className={cn(
                            "text-[11px] font-bold",
                            JLPT_BADGE[alert.jlptLevel as keyof typeof JLPT_BADGE]
                          )}
                        >
                          {alert.jlptLevel}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/40 text-[12px]">
                          Any
                        </span>
                      )}
                    </TableCell>

                    {/* Min salary */}
                    <TableCell className="text-[13px] font-mono">
                      {alert.salaryMin ? (
                        `¥${alert.salaryMin.toLocaleString()}`
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>

                    {/* Match status */}
                    <TableCell>
                      {alert.hasMatchingJobs ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Jobs found
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          No match
                        </span>
                      )}
                    </TableCell>

                    {/* Created date */}
                    <TableCell className="text-[12px] text-muted-foreground whitespace-nowrap">
                      {formatDate(alert.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Result count */}
        {!loading && filtered.length > 0 && (
          <p className="mt-3 text-[11.5px] text-muted-foreground text-right">
            Showing {filtered.length} of {items?.length ?? 0} alerts
            {stats?.gapCount
              ? ` · ${stats.gapCount} with no matching jobs`
              : ""}
          </p>
        )}
      </SectionCard>
    </div>
  );
}
