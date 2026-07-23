"use client";

import { useEffect, useState, useCallback } from "react";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { RevealGroup, staggerItem, motion, Reveal, fadeUp } from "@/lib/motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, X, Briefcase, LayoutGrid, LayoutList, ArrowRight, MapPin } from "lucide-react";
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
  const { t, pick } = useT();
  const [data, setData] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [jlptLevel, setJlptLevel] = useState("all");
  const [salaryMin, setSalaryMin] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      if (sortBy !== "newest") params.set("sort", sortBy);
      const res = await api<JobsResponse>(`/api/jobs?${params.toString()}`);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, location, jobType, jlptLevel, salaryMin, sortBy]);

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
      {/* SECTION 1 — SEARCH HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-mesh mb-8 px-6 py-12 sm:px-10 sm:py-16 shadow-premium border border-border/40">
        <div aria-hidden className="pointer-events-none absolute inset-0 noise-overlay" />
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-saffron/20 blur-3xl animate-aurora" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-crimson/15 blur-3xl animate-aurora" style={{ animationDelay: "3s" }} />
        </div>
        <div aria-hidden className="absolute inset-0 pointer-events-none grid-pattern" />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Animated badge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="floating-pill mb-6 mx-auto"
          >
            <span className="relative flex h-2 w-2 ml-1">
              <span className="absolute inline-flex h-full w-full rounded-full bg-saffron opacity-80 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-saffron" />
            </span>
            <span className="text-muted-foreground">
              {!loading && data
                ? `${data.total} open ${data.total === 1 ? "role" : "roles"} in Japan`
                : t("jobs.title")}
            </span>
          </motion.div>

          <Reveal>
            <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-gradient-brand leading-[1.1]">
              Find your next role <br className="hidden sm:block"/> in Japan.
            </h1>
          </Reveal>
          
          <Reveal delay={0.1}>
            <p className="mt-4 text-muted-foreground text-sm sm:text-lg max-w-lg mx-auto">
              Premium roles matching your skills, with full visa sponsorship and relocation support.
            </p>
          </Reveal>

          {/* Premium Search Input */}
          <Reveal delay={0.2}>
            <div className="relative mt-10 max-w-2xl mx-auto group z-10">
              <div className="absolute inset-0 bg-brand-gradient opacity-20 blur-xl rounded-2xl group-focus-within:opacity-40 transition-opacity duration-500" />
              <div className="relative bg-background/80 backdrop-blur-xl border border-border/60 rounded-2xl p-1.5 flex items-center shadow-premium glow-border">
                <div className="pl-4 pr-3 text-muted-foreground">
                  <Search className="h-5 w-5 group-focus-within:text-saffron transition-colors" />
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={pick("Search by role, tech stack, or keyword...", "職種、技術スタック、またはキーワードで検索...")}
                  className="flex-1 bg-transparent border-none focus:outline-none text-base py-3 placeholder:text-muted-foreground/60"
                />
                {search ? (
                  <button
                    onClick={() => setSearch("")}
                    className="mr-2 h-8 w-8 rounded-full bg-muted/60 flex items-center justify-center hover:bg-crimson/10 hover:text-crimson transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="mr-3 rounded-lg bg-muted/50 border border-border/40 px-2.5 py-1 text-[11px] font-mono text-muted-foreground font-semibold hidden sm:block pointer-events-none">
                    ⌘K
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 2 — CITY PILLS */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none -mx-1 px-1">
        {/* "All Japan" pill */}
        <button
          onClick={() => setLocation("all")}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold",
            "border transition-all duration-200 whitespace-nowrap",
            location === "all"
              ? "bg-brand-gradient text-white border-transparent shadow-glow-brand"
              : "bg-card border-border text-muted-foreground hover:border-saffron/40 hover:text-foreground"
          )}>
          🗾 All Japan
        </button>

        {/* Divider */}
        <div className="h-9 w-px bg-border/60 shrink-0 self-center mx-1" />

        {/* City pills */}
        {LOCATIONS.map((city) => (
          <button
            key={city}
            onClick={() => setLocation(city)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold",
              "border transition-all duration-200 whitespace-nowrap",
              "inline-flex items-center gap-1.5",
              location === city
                ? "bg-saffron/12 border-saffron/40 text-crimson"
                : "bg-card border-border text-muted-foreground hover:border-saffron/30 hover:text-foreground"
            )}>
            <MapPin className="h-3 w-3 shrink-0" />
            {city}
          </button>
        ))}
      </div>

      {/* SECTION 3 — FILTER BAR */}
      <div className="mb-5 rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-premium px-4 py-3">
        {/* Main filter row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Label */}
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground pr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{pick("Filters", "フィルター")}</span>
          </div>
          <div className="hidden sm:block h-5 w-px bg-border mx-1" />

          {/* Three selects — NO location select (city pills handle location) */}
          <FilterSelect
            value={jobType} onChange={setJobType}
            all={t("jobs.alltypes")}
            options={JOB_TYPES.map((j) => ({ value: j, label: t(`jobtype.${j}`) }))}
          />
          <FilterSelect
            value={jlptLevel} onChange={setJlptLevel}
            all={t("jobs.alljlpt")}
            options={JLPT_LEVELS.filter((l) => l !== "NONE").map((l) => ({
              value: l, label: `JLPT ${l}`,
            }))}
          />
          <FilterSelect
            value={salaryMin} onChange={setSalaryMin}
            all={t("jobs.allsalary")}
            options={[
              { value: "300000", label: pick("¥300k+ /mo", "月額30万円以上") },
              { value: "500000", label: pick("¥500k+ /mo", "月間50万以上") },
              { value: "700000", label: pick("¥700k+ /mo", "月額70万円以上") },
            ]}
          />

          {/* Sort — right-aligned */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Sort:
            </span>
            <FilterSelect
              value={sortBy} onChange={setSortBy}
              all="Newest first"
              options={[
                { value: "salary",    label: pick("Highest salary", "最高給与") },
                { value: "relevance", label: pick("Most relevant", "最も関連性の高いもの")  },
              ]}
            />
          </div>
        </div>

        {/* Active filter chips — only when filters are set */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2.5 border-t border-border/60">
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron/10 border border-saffron/25 text-crimson px-3 py-1 text-xs font-semibold">
                🔍 &quot;{debouncedSearch}&quot;
                <button onClick={() => setSearch("")} className="hover:text-crimson/60">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {jobType !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron/10 border border-saffron/25 text-crimson px-3 py-1 text-xs font-semibold">
                {t(`jobtype.${jobType}`)}
                <button onClick={() => setJobType("all")} className="hover:text-crimson/60">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {jlptLevel !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron/10 border border-saffron/25 text-crimson px-3 py-1 text-xs font-semibold">
                JLPT {jlptLevel}
                <button onClick={() => setJlptLevel("all")} className="hover:text-crimson/60">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {salaryMin !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron/10 border border-saffron/25 text-crimson px-3 py-1 text-xs font-semibold">
                ¥{(+salaryMin / 1000).toFixed(0)}k+/mo
                <button onClick={() => setSalaryMin("all")} className="hover:text-crimson/60">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-crimson ml-1 underline underline-offset-2 transition-colors">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* SECTION 4 — RESULTS BAR */}
      <div className="mb-5 flex items-center justify-between gap-4">
        {/* Count */}
        <div className="flex items-center gap-2 min-h-[28px]">
          {loading ? (
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-saffron animate-ping-soft" />
              Searching…
            </span>
          ) : data ? (
            <>
              <span className="font-display font-extrabold text-2xl text-gradient-brand leading-none">
                {data.total}
              </span>
              <span className="text-sm text-muted-foreground">
                {data.total === 1 ? "role" : "roles"} found
                {debouncedSearch && (
                  <> for{" "}
                    <span className="font-semibold text-foreground">
                      &quot;{debouncedSearch}&quot;
                    </span>
                  </>
                )}
              </span>
            </>
          ) : null}
        </div>

        {/* Grid / List toggle */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded-lg p-2 transition-colors",
              viewMode === "grid"
                ? "bg-saffron/12 text-crimson"
                : "text-muted-foreground hover:text-foreground"
            )}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "rounded-lg p-2 transition-colors",
              viewMode === "list"
                ? "bg-saffron/12 text-crimson"
                : "text-muted-foreground hover:text-foreground"
            )}>
            <LayoutList className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* SECTION 5 — JOB GRID */}
      {loading ? (
        <div className={cn(
          "gap-5 sm:gap-6",
          viewMode === "list" ? "flex flex-col" : "grid sm:grid-cols-2 lg:grid-cols-3"
        )}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={cn("rounded-2xl", viewMode === "grid" ? "h-48" : "h-20")} />
          ))}
        </div>
      ) : data && data.jobs.length > 0 ? (
        <RevealGroup
          className={cn(
            "gap-5 sm:gap-6",
            viewMode === "list" ? "flex flex-col" : "grid sm:grid-cols-2 lg:grid-cols-3"
          )}
          stagger={0.06}>
          {data.jobs.map((job) => (
            <motion.div key={job.id} variants={staggerItem}>
              <JobCard job={job} listMode={viewMode === "list"} />
            </motion.div>
          ))}
        </RevealGroup>
      ) : (
        /* SECTION 6 — EMPTY STATE */
        <div className="py-24 text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-saffron/10 ring-1 ring-saffron/20 mb-6 mx-auto">
            <Briefcase className="h-9 w-9 text-saffron" />
          </div>
          <h3 className="font-display font-bold text-xl">
            No roles match yet
          </h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto text-sm">
            Try adjusting your filters — new roles are added daily.
          </p>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters}
              className="mt-5 border-saffron/30 hover:border-saffron/60 hover:bg-saffron/5">
              <X className="h-3.5 w-3.5 mr-1.5" />
              Clear all filters
            </Button>
          )}
          <p className="mt-6 text-xs text-muted-foreground">
            Want to be notified when a match opens up?{" "}
            <button className="text-saffron underline underline-offset-2 hover:text-saffron/80 transition-colors">
              Set a job alert
            </button>
          </p>
        </div>
      )}

      {/* Load more (paginate) */}
      {data && data.totalPages > 1 && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => void load()}
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
  const isActive = value !== "all" && value !== "newest";
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
