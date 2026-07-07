"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, staggerItem, motion } from "@/lib/motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, X, Briefcase } from "lucide-react";
import type { JobDTO } from "@/lib/types";
import { JOB_TYPES, JLPT_LEVELS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface JobsResponse {
  jobs: JobDTO[];
  total: number;
  page: number;
  totalPages: number;
}

const LOCATIONS = [
  "Tokyo",
  "Osaka",
  "Nagoya",
  "Yokohama",
  "Kobe",
];

export function JobsView() {
  const { t } = useT();
  const navigate = useApp((s) => s.navigate);
  const [data, setData] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [jlptLevel, setJlptLevel] = useState("all");
  const [salaryMin, setSalaryMin] = useState("all");

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "24" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (location !== "all") params.set("location", location);
      if (jobType !== "all") params.set("jobType", jobType);
      if (jlptLevel !== "all") params.set("jlptLevel", jlptLevel);
      if (salaryMin !== "all") params.set("salaryMin", salaryMin);
      const res = await api<JobsResponse>(`/api/jobs?${params.toString()}`);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, location, jobType, jlptLevel, salaryMin]);

  useEffect(() => {
    load();
  }, [load]);

  const hasFilters =
    !!debouncedSearch ||
    location !== "all" ||
    jobType !== "all" ||
    jlptLevel !== "all" ||
    salaryMin !== "all";

  function clearFilters() {
    setSearch("");
    setLocation("all");
    setJobType("all");
    setJlptLevel("all");
    setSalaryMin("all");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/5 px-3 py-1 text-xs font-semibold text-crimson mb-3">
          <Briefcase className="h-3.5 w-3.5" />
          {t("jobs.title")}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          {t("jobs.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("jobs.subtitle")}</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("jobs.search.placeholder")}
          className="w-full rounded-xl border border-input bg-card pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 focus:border-saffron/40 shadow-premium transition-all"
        />
      </div>

      {/* Filters — card-wrapped with section label + clear action */}
      <div className="mb-6 rounded-2xl border border-border bg-card/60 glass p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1 px-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-border mx-1" />
          <FilterSelect
            value={location}
            onChange={setLocation}
            all={t("jobs.alllocations")}
            options={LOCATIONS}
          />
          <FilterSelect
            value={jobType}
            onChange={setJobType}
            all={t("jobs.alltypes")}
            options={JOB_TYPES.map((j) => ({ value: j, label: t(`jobtype.${j}`) }))}
          />
          <FilterSelect
            value={jlptLevel}
            onChange={setJlptLevel}
            all={t("jobs.alljlpt")}
            options={JLPT_LEVELS.filter((l) => l !== "NONE").map((l) => ({
              value: l,
              label: l,
            }))}
          />
          <FilterSelect
            value={salaryMin}
            onChange={setSalaryMin}
            all={t("jobs.allsalary")}
            options={[
              { value: "300000", label: "¥300k+ /mo" },
              { value: "500000", label: "¥500k+ /mo" },
              { value: "700000", label: "¥700k+ /mo" },
            ]}
          />
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-crimson hover:bg-crimson/5 ml-auto"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              {t("jobs.filter.clear")}
            </Button>
          )}
        </div>
      </div>

      {/* Count */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-crimson animate-pulse" />
              {t("common.loading")}
            </span>
          ) : data ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="grid place-items-center h-5 min-w-5 px-1.5 rounded-md bg-saffron/10 text-crimson font-semibold text-xs">
                {data.total}
              </span>
              <span className="text-muted-foreground">
                {t("jobs.found", { count: "" }).replace(/^\s+/, "")}
              </span>
            </span>
          ) : null}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : data && data.jobs.length > 0 ? (
        <RevealGroup className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
          {data.jobs.map((job) => (
            <motion.div key={job.id} variants={staggerItem}>
              <JobCard job={job} />
            </motion.div>
          ))}
        </RevealGroup>
      ) : (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center bg-card/40">
          <Briefcase className="h-12 w-12 text-muted-foreground/40 mx-auto animate-bob" />
          <p className="mt-4 text-muted-foreground">{t("jobs.empty")}</p>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
              {t("jobs.filter.clear")}
            </Button>
          )}
        </div>
      )}

      {/* Load more (paginate) */}
      {data && data.totalPages > 1 && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => {
              // simple: reload with full set
              void load();
            }}
            className="font-semibold h-11 px-6 rounded-xl"
          >
            {t("common.viewall")}
          </Button>
        </div>
      )}
    </main>
  );
}

function FilterSelect({
  value,
  onChange,
  all,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  all: string;
  options: (string | { value: string; label: string })[];
}) {
  const isActive = value !== "all";
  const triggerCls = cn(
    "h-9 rounded-lg bg-card text-sm font-medium data-[size=default]:h-9 transition-colors",
    isActive
      ? "border-saffron/50 bg-saffron/5 text-crimson"
      : "border-border hover:border-saffron/40 hover:bg-saffron/5",
  );
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn(triggerCls, "min-w-[140px]")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{all}</SelectItem>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          const l = typeof o === "string" ? o : o.label;
          return (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
