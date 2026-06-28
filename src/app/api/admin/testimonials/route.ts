import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ok, err, handleError, toTestimonialDTO } from "@/lib/api";
import { z } from "zod";

// GET — all testimonials (admin)
export async function GET() {
  try {
    await requireRole("ADMIN");
    const rows = await db.testimonial.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return ok({ testimonials: rows.map(toTestimonialDTO) });
  } catch (e) {
    return handleError(e);
  }
}

const createSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  company: z.string().optional(),
  content: z.string().min(10),
  contentJa: z.string().optional(),
  photoUrl: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// POST — admin creates a testimonial
export async function POST(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const t = await db.testimonial.create({
      data: {
        name: parsed.data.name,
        role: parsed.data.role,
        company: parsed.data.company || null,
        content: parsed.data.content,
        contentJa: parsed.data.contentJa || null,
        photoUrl: parsed.data.photoUrl || null,
        order: parsed.data.order,
        isActive: parsed.data.isActive,
      },
    });
    return ok(toTestimonialDTO(t), 201);
  } catch (e) {
    return handleError(e);
  }
}
