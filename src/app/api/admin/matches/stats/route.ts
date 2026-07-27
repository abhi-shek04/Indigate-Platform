import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, err, handleError } from "@/lib/api";

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN")
      return err("Admin access required", 403);

    const [totalScores, avgAggregate, topScores] = await Promise.all([
      db.matchScore.count(),
      db.matchScore.aggregate({
        _avg: { score: true },
      }),
      db.matchScore.findMany({
        orderBy: { score: "desc" },
        take: 10,
        include: {
          candidate: { select: { id: true, fullName: true } },
          job: {
            select: {
              id: true,
              title: true,
              company: { select: { companyName: true } },
            },
          },
        },
      }),
    ]);

    const avgScore = Math.round(avgAggregate._avg.score ?? 0);

    const topMatches = topScores.map((s) => ({
      id: s.id,
      candidateId: s.candidateId,
      candidateName: s.candidate.fullName,
      jobId: s.jobId,
      jobTitle: s.job.title,
      company: s.job.company.companyName,
      score: s.score,
      computedAt: s.computedAt.toISOString(),
    }));

    return ok({
      totalScores,
      avgScore,
      topMatches,
    });
  } catch (e) {
    return handleError(e);
  }
}
