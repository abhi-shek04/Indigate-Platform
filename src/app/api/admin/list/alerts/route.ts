import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError, csvEscape } from "@/lib/api";

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

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return err("Unauthorized.", 401);
    }

    const { searchParams } = new URL(req.url);
    const exportCsv = searchParams.get("export") === "csv";

    // Fetch all alerts with candidate info
    const rawAlerts = await db.jobAlert.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            candidate: {
              select: { fullName: true }
            }
          }
        }
      }
    });

    // Fetch all active jobs for gap analysis
    const activeJobs = await db.job.findMany({
      where: { isActive: true },
      select: {
        id: true,
        jlptRequired: true,
        jobType: true,
        location: true,
        salaryMin: true,
      },
    });

    const items: AlertRow[] = rawAlerts.map(alert => {
      // Gap check logic
      const hasMatchingJobs = activeJobs.some((job) => {
        if (alert.jlptLevel && alert.jlptLevel !== "NONE" && job.jlptRequired !== alert.jlptLevel) return false;
        if (alert.jobType && job.jobType !== alert.jobType) return false;
        if (alert.location && !job.location.toLowerCase().includes(alert.location.toLowerCase())) return false;
        if (alert.salaryMin && job.salaryMin && job.salaryMin < alert.salaryMin) return false;
        return true;
      });

      return {
        id: alert.id,
        userId: alert.userId,
        candidateName: alert.user.candidate?.fullName ?? "Unknown",
        candidateEmail: alert.user.email,
        name: alert.name,
        search: alert.search,
        location: alert.location,
        jobType: alert.jobType,
        jlptLevel: alert.jlptLevel,
        salaryMin: alert.salaryMin,
        isActive: alert.isActive,
        createdAt: alert.createdAt.toISOString(),
        hasMatchingJobs
      };
    });

    // CSV Export
    if (exportCsv) {
      let csv = "Candidate,Email,Alert Name,Location,Job Type,JLPT,Min Salary,Has Matching Jobs,Created\n";
      for (const i of items) {
        csv += `${csvEscape(i.candidateName)},${csvEscape(i.candidateEmail)},${csvEscape(i.name)},${csvEscape(i.location ?? "Any")},${csvEscape(i.jobType ?? "Any")},${csvEscape(i.jlptLevel ?? "Any")},${i.salaryMin ?? "Any"},${i.hasMatchingJobs},${i.createdAt}\n`;
      }
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="candidate-alerts.csv"',
        },
      });
    }

    // Stats calculation
    const uniqueCandidates = new Set(items.map((i) => i.userId)).size;

    const jlptCount: Record<string, number> = {};
    items.forEach((i) => { 
      if (i.jlptLevel && i.jlptLevel !== "NONE") jlptCount[i.jlptLevel] = (jlptCount[i.jlptLevel] ?? 0) + 1; 
    });
    const topJlpt = Object.entries(jlptCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    const locCount: Record<string, number> = {};
    items.forEach((i) => { 
      if (i.location?.trim()) locCount[i.location] = (locCount[i.location] ?? 0) + 1; 
    });
    const topLocation = Object.entries(locCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    const gapCount = items.filter((i) => !i.hasMatchingJobs).length;

    return ok({
      items,
      stats: {
        total: items.length,
        uniqueCandidates,
        topJlpt,
        topLocation,
        gapCount,
      },
    });

  } catch (e) {
    return handleError(e);
  }
}
