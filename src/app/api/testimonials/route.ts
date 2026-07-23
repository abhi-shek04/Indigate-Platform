import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, handleError, toTestimonialDTO } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";
    const rows = await db.testimonial.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return ok({ testimonials: rows.map(toTestimonialDTO) });
  } catch (e) {
    return handleError(e);
  }
}
