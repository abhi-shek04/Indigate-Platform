import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

export async function GET() {
  try {
    const [jobCount, candidateCount, companyCount, placementCount] =
      await Promise.all([
        db.job.count({ where: { isActive: true } }),
        db.user.count({ where: { role: "CANDIDATE" } }),
        db.companyProfile.count({ where: { isApproved: true } }),
        db.application.count({ where: { status: "OFFERED" } }),
      ]);

    return ok({
      jobCount,
      candidateCount,
      companyCount,
      placementCount,
    });
  } catch (e) {
    return handleError(e);
  }
}
