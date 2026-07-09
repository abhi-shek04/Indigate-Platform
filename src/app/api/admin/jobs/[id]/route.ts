import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseBody, ok, err, handleError, toJobDTO } from "@/lib/api";
import { z } from "zod";

// GET — single job with full details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const job = await db.job.findUnique({
      where: { id },
      include: {
        company: true,
        applications: { select: { id: true } },
      },
    });
    if (!job) return err("Job not found.", 404);
    return ok(toJobDTO(job, job.applications.length));
  } catch (e) {
    return handleError(e);
  }
}

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  titleJa: z.string().optional(),
  description: z.string().min(50).optional(),
  descriptionJa: z.string().optional(),
  location: z.string().min(2).optional(),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"]).optional(),
  jlptRequired: z.enum(["N1", "N2", "N3", "N4", "N5", "NONE"]).optional(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  salaryType: z.enum(["HOURLY", "MONTHLY", "YEARLY"]).optional(),
  skillsRequired: z.array(z.string()).optional(),
  deadline: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// PUT — admin updates any job field
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

    const existing = await db.job.findUnique({ where: { id } });
    if (!existing) return err("Job not found.", 404);

    const data: Record<string, unknown> = {};
    const d = parsed.data;
    if (d.title !== undefined) data.title = d.title;
    if (d.titleJa !== undefined) data.titleJa = d.titleJa || null;
    if (d.description !== undefined) data.description = d.description;
    if (d.descriptionJa !== undefined) data.descriptionJa = d.descriptionJa || null;
    if (d.location !== undefined) data.location = d.location;
    if (d.jobType !== undefined) data.jobType = d.jobType;
    if (d.jlptRequired !== undefined) data.jlptRequired = d.jlptRequired;
    if (d.salaryMin !== undefined) data.salaryMin = d.salaryMin;
    if (d.salaryMax !== undefined) data.salaryMax = d.salaryMax;
    if (d.salaryType !== undefined) data.salaryType = d.salaryType;
    if (d.skillsRequired !== undefined)
      data.skillsRequired = JSON.stringify(d.skillsRequired);
    if (d.isActive !== undefined) data.isActive = d.isActive;
    if (d.deadline !== undefined)
      data.deadline = d.deadline ? new Date(d.deadline) : null;

    const updated = await db.job.update({
      where: { id },
      data,
      include: { company: true, applications: { select: { id: true } } },
    });
    return ok(toJobDTO(updated, updated.applications.length));
  } catch (e) {
    return handleError(e);
  }
}

// DELETE — permanently delete job (cascade deletes applications)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const existing = await db.job.findUnique({ where: { id } });
    if (!existing) return err("Job not found.", 404);
    await db.job.delete({ where: { id } });
    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
