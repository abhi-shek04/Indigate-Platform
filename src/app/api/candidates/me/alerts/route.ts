import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";
import { z } from "zod";

/** GET — list all job alerts for the current candidate */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "CANDIDATE")
      return err("Unauthorized.", 401);

    const alerts = await db.jobAlert.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });
    return ok({ alerts });
  } catch (e) {
    return handleError(e);
  }
}

const createSchema = z.object({
  name: z.string().min(2).max(100),
  search: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"]).optional(),
  jlptLevel: z.enum(["N1", "N2", "N3", "N4", "N5", "NONE"]).optional(),
  salaryMin: z.number().int().min(0).optional(),
});

/** POST — create a new job alert */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CANDIDATE")
      return err("Unauthorized.", 401);

    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const alert = await db.jobAlert.create({
      data: { ...parsed.data, userId: session.id },
    });
    return ok(alert, 201);
  } catch (e) {
    return handleError(e);
  }
}

/** DELETE — delete a job alert by id (query param) */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CANDIDATE")
      return err("Unauthorized.", 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return err("Missing alert id.", 400);

    const existing = await db.jobAlert.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.id)
      return err("Alert not found.", 404);

    await db.jobAlert.delete({ where: { id } });
    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
