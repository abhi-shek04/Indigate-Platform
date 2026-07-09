"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, Briefcase, Users, Building2, FileText, Quote, Mail, Download, ShieldCheck, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/use-t";
import type { NavItem } from "@/components/dashboard/dashboard-shell";
import type { ApplicationStatus, CandidateProfileDTO, CompanyProfileDTO } from "@/lib/types";

/** Admin sidebar navigation config. */
export const NAV: NavItem[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "candidates", label: "Candidates", icon: Users },
  { key: "companies", label: "Companies", icon: Building2 },
  { key: "applications", label: "Applications", icon: FileText },
  { key: "testimonials", label: "Testimonials", icon: Quote },
  { key: "contacts", label: "Enquiries", icon: Mail },
  { key: "users", label: "Users & Roles", icon: ShieldCheck },
  { key: "audit", label: "Audit Log", icon: ScrollText },
];

/** Status → chart color mapping for the Overview donut chart. */
export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPLIED: "var(--chart-3)",
  SHORTLISTED: "var(--chart-2)",
  INTERVIEWED: "var(--chart-5)",
  OFFERED: "var(--chart-4)",
  REJECTED: "var(--crimson)",
  WITHDRAWN: "var(--muted-foreground)",
};

/** Admin stats shape returned by GET /api/admin/stats. */
export interface AdminStats {
  metrics: {
    candidates: number;
    companies: number;
    pendingCompanies: number;
    activeJobs: number;
    totalJobs: number;
    totalApps: number;
    appsThisMonth: number;
    placements: number;
  };
  appsPerWeek: { label: string; count: number }[];
  appsByStatus: { status: ApplicationStatus; count: number }[];
  companiesList: {
    id: string;
    companyName: string;
    industry: string | null;
    locationJapan: string | null;
    isApproved: boolean;
    email: string;
    createdAt: string;
  }[];
}

/** Candidate row with the joined email field from the admin list endpoint. */
export type CandidateRow = CandidateProfileDTO & { email?: string };
/** Company row with the joined email field from the admin list endpoint. */
export type CompanyRow = CompanyProfileDTO & { email?: string };
/** Testimonial row shape used by the admin testimonials table. */
export type TestimonialRow = {
  id: string;
  name: string;
  role: string;
  company: string | null;
  content: string;
  contentJa: string | null;
  photoUrl: string | null;
  order: number;
  isActive?: boolean;
};

/** Small CSV-export link button reused across all admin list tabs. */
export function ExportCsvButton({ resource }: { resource: string }) {
  const { t } = useT();
  return (
    <Button variant="outline" size="sm" asChild>
      <a href={`/api/admin/list/${resource}?export=csv`} download>
        <Download className="h-3.5 w-3.5" />
        {t("admin.export")}
      </a>
    </Button>
  );
}

/** Labelled form field wrapper reused by the Job & Testimonial editor sheets. */
export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
