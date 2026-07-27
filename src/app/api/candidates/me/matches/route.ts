import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, err, handleError } from "@/lib/api";
import { getTopJobMatchesForCandidate } from "@/lib/ai-matching";

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CANDIDATE")
      return err("Candidate access required", 403);

    const profile = await db.candidateProfile.findUnique({
      where: { userId: session.id },
      select: { id: true },
    });
    if (!profile) return err("Profile not found", 404);

    // Get pre-computed scores (instant — reads from MatchScore table)
    const matches = await getTopJobMatchesForCandidate(profile.id, 10);

    if (matches.length === 0) {
      return ok({ matches: [], hasScores: false });
    }

    // Fetch full job details for the matched job IDs
    const jobIds = matches.map((m) => m.jobId);
    const jobs = await db.job.findMany({
      where: { id: { in: jobIds }, isActive: true },
      include: {
        company: { select: { companyName: true, logoUrl: true, industry: true } },
      },
    });

    // Build response — merge job data with match scores
    const jobMap = new Map(jobs.map((j) => [j.id, j]));
    const result = matches
      .map((m) => {
        const job = jobMap.get(m.jobId);
        if (!job) return null;
        return {
          jobId: job.id,
          title: job.title,
          company: job.company.companyName,
          companyLogo: job.company.logoUrl,
          location: job.location,
          jobType: job.jobType,
          jlptRequired: job.jlptRequired,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          skillsRequired: (() => {
            try {
              return JSON.parse(job.skillsRequired || "[]") as string[];
            } catch {
              return [];
            }
          })(),
          postedAt: job.postedAt.toISOString(),
          matchScore: m.score,
          matchReasons: m.reasons,
        };
      })
      .filter(Boolean);

    return ok({ matches: result, hasScores: true });
  } catch (e) {
    return handleError(e);
  }
}
