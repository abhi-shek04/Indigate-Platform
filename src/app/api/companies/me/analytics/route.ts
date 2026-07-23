import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "COMPANY")
      return err("Unauthorized.", 401);

    const company = await db.companyProfile.findUnique({
      where: { userId: session.id },
    });
    if (!company) return err("Company profile not found.", 404);

    const jobs = await db.job.findMany({
      where: { companyId: company.id },
      orderBy: { postedAt: "desc" },
      select: {
        id: true,
        title: true,
        isActive: true,
        _count: { select: { applications: true, views: true } },
      },
    });

    const weekAgo = new Date(Date.now() - 7 * 86400000);

    const jobStats = await Promise.all(
      jobs.map(async (j) => {
        const viewsThisWeek = await db.jobView.count({
          where: { jobId: j.id, viewedAt: { gte: weekAgo } },
        });
        const viewCount = j._count.views;
        const applicationCount = j._count.applications;
        const conversionRate =
          viewCount > 0
            ? ((applicationCount / viewCount) * 100).toFixed(1) + "%"
            : "0%";
        return {
          id: j.id,
          title: j.title,
          isActive: j.isActive,
          viewCount,
          viewsThisWeek,
          applicationCount,
          conversionRate,
        };
      }),
    );

    const totalViews = jobStats.reduce((s, j) => s + j.viewCount, 0);
    const totalApplications = jobStats.reduce(
      (s, j) => s + j.applicationCount,
      0,
    );
    const averageConversion =
      totalViews > 0
        ? ((totalApplications / totalViews) * 100).toFixed(1) + "%"
        : "0%";

    return ok({
      totalViews,
      totalApplications,
      averageConversion,
      jobs: jobStats,
    });
  } catch (e) {
    return handleError(e);
  }
}
