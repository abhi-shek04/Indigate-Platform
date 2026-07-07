"use client";

import { useState, useEffect } from "react";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import {
  EmptyState,
  MetricCard,
  SectionCard,
} from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Eye, Send, BarChart2 } from "lucide-react";

export function Analytics() {
  const { t } = useT();
  const [data, setData] = useState<{
    totalViews: number;
    totalApplications: number;
    averageConversion: string;
    jobs: Array<{
      id: string;
      title: string;
      isActive: boolean;
      viewCount: number;
      viewsThisWeek: number;
      applicationCount: number;
      conversionRate: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{
      totalViews: number;
      totalApplications: number;
      averageConversion: string;
      jobs: Array<{
        id: string;
        title: string;
        isActive: boolean;
        viewCount: number;
        viewsThisWeek: number;
        applicationCount: number;
        conversionRate: string;
      }>;
    }>("/api/companies/me/analytics")
      .then(setData)
      .catch(() => toast.error("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    );
  }

  if (!data || data.jobs.length === 0) {
    return <EmptyState icon={BarChart2} title={t("dash.company.analytics.empty")} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <MetricCard label={t("dash.company.analytics.views")} value={data.totalViews} icon={Eye} accent="saffron" />
        <MetricCard label="Total applications" value={data.totalApplications} icon={Send} accent="crimson" />
        <MetricCard label={t("dash.company.analytics.conversion")} value={data.averageConversion} icon={BarChart2} accent="emerald" />
      </div>

      <SectionCard title="Per-job breakdown">
        <div className="overflow-x-auto scroll-area">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground uppercase">
                <th className="py-2 pr-4">Job Title</th>
                <th className="py-2 px-4">Views</th>
                <th className="py-2 px-4">{t("dash.company.analytics.thisweek")}</th>
                <th className="py-2 px-4">Applications</th>
                <th className="py-2 px-4">Conversion</th>
                <th className="py-2 pl-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.jobs.map((j) => (
                <tr key={j.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">{j.title}</td>
                  <td className="py-3 px-4">{j.viewCount}</td>
                  <td className="py-3 px-4">{j.viewsThisWeek}</td>
                  <td className="py-3 px-4">{j.applicationCount}</td>
                  <td className="py-3 px-4 font-semibold">{j.conversionRate}</td>
                  <td className="py-3 pl-4">
                    <Badge variant={j.isActive ? "default" : "secondary"}>
                      {j.isActive ? "Active" : "Paused"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
