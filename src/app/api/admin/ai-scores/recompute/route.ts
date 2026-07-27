import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";
import { computeMatchScore } from "@/lib/match-score";
import type { Prisma } from "@prisma/client";

export async function POST() {
  const startTime = Date.now();
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return err("Admin access required.", 403);
    }

    const candidates = await db.candidateProfile.findMany({
      take: 200,
    });

    const jobs = await db.job.findMany({
      where: { isActive: true },
      take: 200,
    });

    let computedCount = 0;

    // Process candidate x job pairs
    for (const candidate of candidates) {
      for (const job of jobs) {
        try {
          const { score, breakdown } = computeMatchScore(candidate, job);
          const breakdownJson = breakdown as unknown as Prisma.InputJsonValue;

          await db.matchScore.upsert({
            where: {
              candidateId_jobId: {
                candidateId: candidate.id,
                jobId: job.id,
              },
            },
            create: {
              candidateId: candidate.id,
              jobId: job.id,
              score,
              breakdown: breakdownJson,
              jlptScore: breakdown.jlpt,
              skillScore: breakdown.skills,
              expScore: breakdown.experience,
              motivScore: breakdown.salary,
              computedAt: new Date(),
            },
            update: {
              score,
              breakdown: breakdownJson,
              jlptScore: breakdown.jlpt,
              skillScore: breakdown.skills,
              expScore: breakdown.experience,
              motivScore: breakdown.salary,
              computedAt: new Date(),
            },
          });

          computedCount++;
        } catch (perPairErr) {
          // Log individual pair error but don't stop the whole batch
          console.error(
            `Error computing score for candidate ${candidate.id} and job ${job.id}:`,
            perPairErr,
          );
        }
      }
    }

    const durationMs = Date.now() - startTime;
    return ok({ computed: computedCount, durationMs });
  } catch (e) {
    return handleError(e);
  }
}
