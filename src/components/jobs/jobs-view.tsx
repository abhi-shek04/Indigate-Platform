"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { RevealGroup, staggerItem, motion, Reveal } from "@/lib/motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, X, Briefcase, LayoutGrid, LayoutList, MapPin, Sparkles, Bot, Star, Filter, Clock, TrendingUp } from "lucide-react";
import type { JobDTO } from "@/lib/types";
import { JOB_TYPES, JLPT_LEVELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { matchJob } from "@/lib/ai-matcher";

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
  const candidateProfile = useApp((s) => s.candidate);
  const user = useApp((s) => s.user);
  const navigate = useApp((s) => s.navigate);

  const [data, setData] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [jlptLevel, setJlptLevel] = useState("all");
  const [salaryMin, setSalaryMin] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [matchFilter, setMatchFilter] = useState("all");
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
      if (sortBy !== "newest" && sortBy !== "match") params.set("sort", sortBy);
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

  const [precomputedScores, setPrecomputedScores] = useState<
    Record<string, { score: number; reasons: string[] }>
  >({});

  useEffect(() => {
    if (!user || user.role !== "CANDIDATE" || !data?.jobs) return;
    api<{
      matches: Array<{ jobId: string; matchScore: number; matchReasons: string[] }>;
    }>("/api/candidates/me/matches")
      .then((res) => {
        const map: Record<string, { score: number; reasons: string[] }> = {};
        (res.matches || []).forEach((m) => {
          map[m.jobId] = { score: m.matchScore, reasons: m.matchReasons };
        });
        setPrecomputedScores(map);
      })
      .catch(() => {});
  }, [user, data]);

  const jobsWithMatch = useMemo(() => {
    if (!data?.jobs) return [];
    const profile = candidateProfile
      ? {
          skills:
            typeof candidateProfile.skills === "string"
              ? JSON.parse(candidateProfile.skills || "[]")
              : candidateProfile.skills ?? [],
          jlptLevel: candidateProfile.jlptLevel,
          experienceYears: candidateProfile.experienceYears,
          location: candidateProfile.location,
        }
      : null;
    return data.jobs.map((job) => {
      const fallback = matchJob(job, profile);
      const pre = precomputedScores[job.id];
      if (pre) {
        let badge: string | null = null;
        if (pre.score >= 85) badge = "⭐ Best Match";
        else if (pre.score >= 70) badge = "🔥 Recommended";
        else if (pre.score >= 50) badge = "👍 Good Match";
        return {
          ...job,
          matchScore: pre.score,
          matchBadge: badge,
          matchReasons: pre.reasons,
        };
      }
      return {
        ...job,
        ...fallback,
      };
    });
  }, [data?.jobs, candidateProfile, precomputedScores]);

  const sortedJobs = useMemo(() => {
    let list = [...jobsWithMatch];

    // Filter featured
    if (featuredFilter === "featured") {
      list = list.filter((j) => j.isFeatured);
    } else if (featuredFilter === "standard") {
      list = list.filter((j) => !j.isFeatured);
    }

    // Filter match level
    if (matchFilter === "best") {
      list = list.filter((j) => (j.matchScore ?? 0) >= 85);
    } else if (matchFilter === "recommended") {
      list = list.filter((j) => (j.matchScore ?? 0) >= 70);
    } else if (matchFilter === "good") {
      list = list.filter((j) => (j.matchScore ?? 0) >= 50);
    }

    // Sort
    if (sortBy === "oldest") {
      return list.sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime());
    }
    if (sortBy === "title_asc") {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === "title_desc") {
      return list.sort((a, b) => b.title.localeCompare(a.title));
    }
    return list; // "newest" = default order from API (isFeatured desc, postedAt desc)
  }, [jobsWithMatch, sortBy, featuredFilter, matchFilter]);

  const hasFilters =
    !!debouncedSearch ||
    location !== "all" ||
    jobType !== "all" ||
    jlptLevel !== "all" ||
    salaryMin !== "all" ||
    featuredFilter !== "all" ||
    matchFilter !== "all";

  function clearFilters() {
    setSearch("");
    setLocation("all");
    setJobType("all");
    setJlptLevel("all");
    setSalaryMin("all");
    setFeaturedFilter("all");
    setMatchFilter("all");
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
            className="floating-pill mb-6 mx-auto flex items-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-saffron opacity-80 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-saffron" />
            </span>
            <span className="text-muted-foreground font-medium">
              {!loading && data
                ? `${data.total} open ${data.total === 1 ? "role" : "roles"} in Japan`
                : t("jobs.title")}
            </span>
            {candidateProfile && (
              <span className="ml-1 border-l border-border/60 pl-2 text-xs font-bold text-saffron inline-flex items-center gap-1">
                <Bot className="h-3 w-3" /> AI Matcher Active
              </span>
            )}
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

      {/* SECTION 2 — CITY & QUICK FEATURED PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none -mx-1 px-1">
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

        {/* AI Smart Match Quick Toggle Pill (For Logged-in Candidates) */}
        {candidateProfile && (
          <button
            onClick={() => {
              if (matchFilter === "best" && sortBy === "match") {
                setMatchFilter("all");
                setSortBy("newest");
              } else {
                setMatchFilter("best");
                setSortBy("match");
              }
            }}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold",
              "border transition-all duration-200 whitespace-nowrap inline-flex items-center gap-1.5",
              matchFilter === "best" || sortBy === "match"
                ? "bg-saffron text-white border-transparent shadow-glow-brand"
                : "bg-saffron/10 border-saffron/30 text-saffron hover:bg-saffron/20"
            )}>
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            🤖 AI Smart Match (85%+)
          </button>
        )}

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

      {/* SECTION 3 — PROFESSIONAL FILTER BAR */}
      <div className="mb-6 rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-premium px-4 py-3.5">
        {/* Main filter row */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Label */}
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground pr-1">
            <Filter className="h-3.5 w-3.5 text-saffron" />
            <span className="hidden sm:inline">{pick("Filters", "フィルター")}</span>
          </div>
          <div className="hidden sm:block h-5 w-px bg-border mx-1" />

          {/* Featured Jobs Filter Select */}
          <FilterSelect
            value={featuredFilter}
            onChange={setFeaturedFilter}
            options={[
              { value: "all", label: "⭐ Featured: All Jobs" },
              { value: "featured", label: "⭐ Featured Only" },
              { value: "standard", label: "Standard Jobs Only" },
            ]}
          />

          {/* AI Match Filter Select */}
          <FilterSelect
            value={matchFilter}
            onChange={setMatchFilter}
            options={[
              { value: "all", label: "🤖 AI Match: All Scores" },
              { value: "best", label: "⭐ Best Match (85%+)" },
              { value: "recommended", label: "🔥 Recommended (70%+)" },
              { value: "good", label: "👍 Good Match (50%+)" },
            ]}
          />

          {/* Job Type Select */}
          <FilterSelect
            value={jobType}
            onChange={setJobType}
            options={[
              { value: "all", label: `💼 ${t("jobs.alltypes")}` },
              ...JOB_TYPES.map((j) => ({ value: j, label: t(`jobtype.${j}`) })),
            ]}
          />

          {/* JLPT Select */}
          <FilterSelect
            value={jlptLevel}
            onChange={setJlptLevel}
            options={[
              { value: "all", label: `🎌 ${t("jobs.alljlpt")}` },
              ...JLPT_LEVELS.filter((l) => l !== "NONE").map((l) => ({
                value: l,
                label: `JLPT ${l}`,
              })),
            ]}
          />

          {/* Salary Select */}
          <FilterSelect
            value={salaryMin}
            onChange={setSalaryMin}
            options={[
              { value: "all", label: `💴 ${t("jobs.allsalary")}` },
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
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
                { value: "title_asc", label: "Title (A-Z)" },
                { value: "title_desc", label: "Title (Z-A)" },
              ]}
            />
          </div>
        </div>

        {/* Active filter chips — only when filters are set */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-border/60">
            {featuredFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron/15 border border-saffron/30 text-saffron px-3 py-1 text-xs font-semibold">
                ⭐ {featuredFilter === "featured" ? "Featured Only" : "Standard Only"}
                <button onClick={() => setFeaturedFilter("all")} className="hover:opacity-70">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {matchFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron/15 border border-saffron/30 text-saffron px-3 py-1 text-xs font-semibold">
                🤖 AI Match: {matchFilter.toUpperCase()}
                <button onClick={() => setMatchFilter("all")} className="hover:opacity-70">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
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
                {sortedJobs.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {sortedJobs.length === 1 ? "role" : "roles"} shown
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
      ) : sortedJobs.length > 0 ? (
        <RevealGroup
          className={cn(
            "gap-5 sm:gap-6",
            viewMode === "list" ? "flex flex-col" : "grid sm:grid-cols-2 lg:grid-cols-3"
          )}
          stagger={0.06}>
          {sortedJobs.map((job) => (
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
  options,
  placeholder = "Select...",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const safeValue = options.some((o) => o.value === value) ? value : options[0]?.value || "";
  const isActive = safeValue !== "all" && safeValue !== "newest";

  const triggerCls = cn(
    "h-9 rounded-lg bg-card text-sm font-medium data-[size=default]:h-9 transition-colors",
    isActive
      ? "border-saffron/50 bg-saffron/5 text-crimson"
      : "border-border hover:border-saffron/40 hover:bg-saffron/5",
  );
  return (
    <Select value={safeValue} onValueChange={onChange}>
      <SelectTrigger className={cn(triggerCls, "min-w-[145px]")}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
