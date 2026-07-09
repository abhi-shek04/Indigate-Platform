import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseBody, ok, err, handleError, toTestimonialDTO } from "@/lib/api";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.string().min(2).optional(),
  company: z.string().optional(),
  content: z.string().min(10).optional(),
  contentJa: z.string().optional(),
  photoUrl: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// PUT — admin updates testimonial
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const body = await parseBody(req);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) return err("Testimonial not found.", 404);

    const data: Record<string, unknown> = {};
    const d = parsed.data;
    if (d.name !== undefined) data.name = d.name;
    if (d.role !== undefined) data.role = d.role;
    if (d.company !== undefined) data.company = d.company || null;
    if (d.content !== undefined) data.content = d.content;
    if (d.contentJa !== undefined) data.contentJa = d.contentJa || null;
    if (d.photoUrl !== undefined) data.photoUrl = d.photoUrl || null;
    if (d.order !== undefined) data.order = d.order;
    if (d.isActive !== undefined) data.isActive = d.isActive;

    const updated = await db.testimonial.update({ where: { id }, data });
    return ok(toTestimonialDTO(updated));
  } catch (e) {
    return handleError(e);
  }
}

// DELETE — admin deletes testimonial
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) return err("Testimonial not found.", 404);
    await db.testimonial.delete({ where: { id } });
    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
