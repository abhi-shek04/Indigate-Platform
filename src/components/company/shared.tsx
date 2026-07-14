"use client";

import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import {
  LayoutDashboard,
  Briefcase,
  Plus,
  Users,
  Users2,
  Building2,
  BarChart2,
  Clock,
  MessageSquare,
} from "lucide-react";
import type { NavItem } from "@/components/dashboard/dashboard-shell";
import type { ApplicationDTO, JobDTO } from "@/lib/types";

/** Company sidebar navigation config. The `messages` entry uses a static
 *  English label here for module-level constancy; the orchestrator
 *  (company-dashboard.tsx) overlays the i18n label + unread badge at runtime. */
export const NAV: NavItem[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "jobs", label: "My Jobs", icon: Briefcase },
  { key: "new", label: "Post New Job", icon: Plus },
  { key: "applicants", label: "Applicants", icon: Users },
  { key: "talent", label: "Find Talent", icon: Users2 },
  { key: "analytics", label: "Analytics", icon: BarChart2 },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "profile", label: "Company Profile", icon: Building2 },
];

/** Loads the current company's jobs (including inactive ones they own). */
export function useCompanyJobs() {
  const user = useApp((s) => s.user);
  const [jobs, setJobs] = useState<JobDTO[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ jobs: JobDTO[] }>(`/api/jobs?limit=50`);
      // Filter to this company's jobs (including inactive ones we own)
      const mine = (res.jobs || []).filter(
        (j) => j.company?.userId === user?.id,
      );
      setJobs(mine);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return { jobs, loading, reload: load };
}

/** Loads all applications for the current company (server already scopes). */
export function useCompanyApps() {
  const [apps, setApps] = useState<ApplicationDTO[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ applications: ApplicationDTO[] }>(
        "/api/applications",
      );
      setApps(res.applications);
    } catch {
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { apps, loading, reload: load };
}

/** Pending-approval banner shown when a not-yet-approved company tries to use a gated tab. */
export function PendingState() {
  const { t } = useT();
  return (
    <div className="grid place-items-center py-12">
      <div className="max-w-md w-full rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-8 text-center">
        <div className="mx-auto mb-5 grid place-items-center h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
          <Clock className="h-7 w-7" />
        </div>
        <h2 className="font-display font-extrabold text-xl">
          {t("dash.company.pending")}
        </h2>
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
          {t("dash.company.pending.desc")}
        </p>
      </div>
    </div>
  );
}
