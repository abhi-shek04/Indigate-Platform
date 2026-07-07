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
    <main>
      {/* Mesh header with title + full-width search */}
      <div className="bg-mesh border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="font-display text-3xl font-extrabold text-gradient-brand mb-1">
            {t("jobs.title")}
          </h1>
          <p className="text-muted-foreground text-[15px]">{t("jobs.subtitle")}</p>
          <div className="mt-6 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("jobs.search.placeholder")}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-[14px] focus:outline-none focus:ring-2 focus:ring-saffron/40 focus:border-saffron/60 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8 items-start">
          {/* FILTER SIDEBAR — sticky, desktop only */}
          <aside className="hidden lg:block w-[260px] shrink-0 sticky top-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-premium">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                </h2>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[12px] text-crimson hover:text-crimson/70 font-medium"
                  >
                    {t("jobs.filter.clear")}
                  </button>
                )}
              </div>
              {/* Location filter */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                  {t("jobs.filter.location")}
                </label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-full h-9 text-[13px] rounded-lg">
                    <SelectValue placeholder={t("jobs.alllocations")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("jobs.alllocations")}</SelectItem>
                    {LOCATIONS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Job Type filter */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                  {t("jobs.filter.type")}
                </label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className="w-full h-9 text-[13px] rounded-lg">
                    <SelectValue placeholder={t("jobs.alltypes")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("jobs.alltypes")}</SelectItem>
                    {JOB_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`jobtype.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* JLPT Level filter — button chips */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                  {t("jobs.filter.jlpt")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {["all", "N1", "N2", "N3", "N4", "N5"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setJlptLevel(level)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all",
                        jlptLevel === level
                          ? "bg-brand-gradient text-white border-transparent"
                          : "bg-muted border-border text-muted-foreground hover:border-saffron/50",
                      )}
                    >
                      {level === "all" ? "Any" : level}
                    </button>
                  ))}
                </div>
              </div>
              {/* Min salary filter */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                  {t("jobs.filter.salary")}
                </label>
                <Select value={salaryMin} onValueChange={setSalaryMin}>
                  <SelectTrigger className="w-full h-9 text-[13px] rounded-lg">
                    <SelectValue placeholder={t("jobs.allsalary")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("jobs.allsalary")}</SelectItem>
                    <SelectItem value="300000">¥300k+ /mo</SelectItem>
                    <SelectItem value="500000">¥500k+ /mo</SelectItem>
                    <SelectItem value="700000">¥700k+ /mo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          {/* JOB RESULTS */}
          <div className="flex-1 min-w-0">
            {/* Results bar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-[13px] text-muted-foreground">
                {loading
                  ? "Loading..."
                  : t("jobs.found", { count: String(data?.total ?? 0) })}
              </p>
            </div>

            {/* Mobile filters — horizontal scroll */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-3 mb-4">
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
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  {t("jobs.filter.clear")}
                </Button>
              )}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-2xl" />
                ))}
              </div>
            ) : data && data.jobs.length > 0 ? (
              <RevealGroup
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                stagger={0.06}
              >
                {data.jobs.map((job) => (
                  <motion.div key={job.id} variants={staggerItem}>
                    <JobCard job={job} />
                  </motion.div>
                ))}
              </RevealGroup>
            ) : (
              <div className="rounded-2xl border border-dashed border-border py-20 text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground/40 mx-auto animate-bob" />
                <p className="mt-3 text-muted-foreground">{t("jobs.empty")}</p>
                {hasFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="mt-4"
                  >
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
                  className="font-semibold"
                >
                  {t("common.viewall")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
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
  const triggerCls =
    "h-9 rounded-lg border-border bg-card text-sm font-medium data-[size=default]:h-9";
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
