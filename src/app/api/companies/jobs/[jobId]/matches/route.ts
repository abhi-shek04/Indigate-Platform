import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, err, handleError } from "@/lib/api";
import { getTopCandidateMatchesForJob } from "@/lib/ai-matching";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;
    const session = await getSession();
    if (!session || session.role !== "COMPANY")
      return err("Company access required", 403);

    // Verify this job belongs to this company
    const company = await db.companyProfile.findUnique({
      where: { userId: session.id },
      select: { id: true },
    });
    if (!company) return err("Company not found", 404);

    const job = await db.job.findFirst({
      where: { id: jobId, companyId: company.id },
      select: { id: true },
    });
    if (!job) return err("Job not found", 404);

    // Get pre-computed candidate match scores
    const matches = await getTopCandidateMatchesForJob(jobId, 20);

    if (matches.length === 0) {
      return ok({ matches: [], hasScores: false });
    }

    const candidateIds = matches.map((m) => m.candidateId);
    const candidates = await db.candidateProfile.findMany({
      where: { id: { in: candidateIds }, openToWork: true },
      include: { user: { select: { email: true } } },
    });

    const candidateMap = new Map(candidates.map((c) => [c.id, c]));

    const result = matches
      .map((m) => {
        const c = candidateMap.get(m.candidateId);
        if (!c) return null;
        const skills: string[] = (() => {
          try {
            return JSON.parse(c.skills || "[]") as string[];
          } catch {
            return [];
          }
        })();
        return {
          candidateId: c.id,
          fullName: c.fullName,
          photoUrl: c.photoUrl,
          jlptLevel: c.jlptLevel,
          skills: skills.slice(0, 6),
          experienceYears: c.experienceYears,
          location: c.location,
          resumeUrl: c.resumeUrl,
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
