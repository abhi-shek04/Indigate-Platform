import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";

// PATCH — toggle testimonial active status
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const t = await db.testimonial.findUnique({ where: { id } });
    if (!t) return err("Testimonial not found.", 404);
    const updated = await db.testimonial.update({
      where: { id },
      data: { isActive: !t.isActive },
    });
    return ok({ id: updated.id, isActive: updated.isActive });
  } catch (e) {
    return handleError(e);
  }
}
