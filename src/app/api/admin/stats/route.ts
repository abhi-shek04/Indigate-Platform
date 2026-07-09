import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN")
      return err("Admin access required.", 403);

    const [
      candidates,
      companies,
      pendingCompanies,
      activeJobs,
      totalJobs,
      totalApps,
      appsThisMonth,
      placements,
      companiesList,
    ] = await Promise.all([
      db.user.count({ where: { role: "CANDIDATE" } }),
      db.companyProfile.count(),
      db.companyProfile.count({ where: { isApproved: false } }),
      db.job.count({ where: { isActive: true } }),
      db.job.count(),
      db.application.count(),
      db.application.count({
        where: { appliedAt: { gte: new Date(new Date().setDate(1)) } },
      }),
      db.application.count({ where: { status: "OFFERED" } }),
      db.companyProfile.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, isVerified: true } } },
      }),
    ]);

    // applications per week (last 8 weeks)
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    const recentApps = await db.application.findMany({
      where: { appliedAt: { gte: eightWeeksAgo } },
      select: { appliedAt: true, status: true },
    });
    const weeks: { label: string; count: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i * 7 - 7);
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const count = recentApps.filter(
        (a) => a.appliedAt >= start && a.appliedAt < end,
      ).length;
      weeks.push({
        label: `${start.getMonth() + 1}/${start.getDate()}`,
        count,
      });
    }

    // applications by status
    const statusCounts = await Promise.all(
      ["APPLIED", "SHORTLISTED", "INTERVIEWED", "OFFERED", "REJECTED", "WITHDRAWN"].map(
        async (status) => ({
          status,
          count: await db.application.count({ where: { status } }),
        }),
      ),
    );

    return ok({
      metrics: {
        candidates,
        companies,
        pendingCompanies,
        activeJobs,
        totalJobs,
        totalApps,
        appsThisMonth,
        placements,
      },
      appsPerWeek: weeks,
      appsByStatus: statusCounts,
      companiesList: companiesList.map((c) => ({
        id: c.id,
        companyName: c.companyName,
        industry: c.industry,
        locationJapan: c.locationJapan,
        isApproved: c.isApproved,
        email: c.user.email,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}
