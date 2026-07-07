"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import {
  EmptyState,
  CardSkeleton,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import { Bookmark, Briefcase } from "lucide-react";
import type { JobDTO } from "@/lib/types";

export function Saved() {
  const { t } = useT();
  const navigate = useApp((s) => s.navigate);
  const [jobs, setJobs] = useState<JobDTO[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api<{ jobs: JobDTO[] }>(
          "/api/candidates/me/saved-jobs",
        );
        if (mounted) setJobs(res.jobs);
      } catch {
        if (mounted) setJobs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title={t("dash.saved.empty")}
        action={
          <Button
            className="bg-brand-gradient text-white hover:opacity-90"
            onClick={() => navigate("jobs")}
          >
            <Briefcase className="h-4 w-4" />
            {t("dash.candidate.browse")}
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {jobs.map((j) => (
        <JobCard key={j.id} job={j} />
      ))}
    </div>
  );
}
