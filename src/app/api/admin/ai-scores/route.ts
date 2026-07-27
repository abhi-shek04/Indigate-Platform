import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return err("Admin access required.", 403);
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
    );

    const items = await db.matchScore.findMany({
      orderBy: { score: "desc" },
      take: limit,
      include: {
        candidate: {
          select: {
            fullName: true,
            photoUrl: true,
            jlptLevel: true,
            skills: true,
          },
        },
        job: {
          select: {
            title: true,
            jlptRequired: true,
            location: true,
            company: {
              select: {
                companyName: true,
                logoUrl: true,
                locationJapan: true,
              },
            },
          },
        },
      },
    });

    // Map location string to locationJapan for UI compatibility
    const formatted = items.map((item) => ({
      ...item,
      job: {
        ...item.job,
        locationJapan: item.job.location || item.job.company?.locationJapan || null,
      },
    }));

    return ok({ items: formatted });
  } catch (e) {
    return handleError(e);
  }
}
