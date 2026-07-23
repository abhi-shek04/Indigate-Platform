import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

export async function GET() {
  try {
    const [
      jobCount, 
      candidateCount, 
      companyCount, 
      placementCount,
      totalApplications,
      interviewCount
    ] = await Promise.all([
      db.job.count({ where: { isActive: true } }),
      db.user.count({ where: { role: "CANDIDATE" } }),
      db.companyProfile.count({ where: { isApproved: true } }),
      db.application.count({ where: { status: "OFFERED" } }),
      db.application.count(),
      db.application.count({ where: { status: { in: ["SHORTLISTED", "INTERVIEWED", "OFFERED"] } } }),
    ]);

    return ok({
      jobCount,
      candidateCount,
      companyCount,
      placementCount,
      pipeline: {
        profilesCreated: candidateCount,
        matchedWithJobs: totalApplications,
        interviewScheduled: interviewCount,
        relocatedToJapan: placementCount,
      }
    });
  } catch (e) {
    return handleError(e);
  }
}
