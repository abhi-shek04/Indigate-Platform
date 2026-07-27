import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return err("Admin access required.", 403);
    }

    const total = await db.matchScore.count();
    const aggregate = await db.matchScore.aggregate({ _avg: { score: true } });
    const average =
      aggregate._avg.score != null
        ? Math.round(aggregate._avg.score * 10) / 10
        : 0;

    const candidatesGroup = await db.matchScore.groupBy({
      by: ["candidateId"],
    });
    const candidatesScored = candidatesGroup.length;

    const jobsGroup = await db.matchScore.groupBy({ by: ["jobId"] });
    const jobsScored = jobsGroup.length;

    const lastMatch = await db.matchScore.findFirst({
      orderBy: { computedAt: "desc" },
      select: { computedAt: true },
    });

    return ok({
      total,
      average,
      candidatesScored,
      jobsScored,
      lastComputedAt: lastMatch?.computedAt
        ? lastMatch.computedAt.toISOString()
        : null,
    });
  } catch (e) {
    return handleError(e);
  }
}
