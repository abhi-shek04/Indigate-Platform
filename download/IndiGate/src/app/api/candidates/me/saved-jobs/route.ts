import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError, toJobDTO } from "@/lib/api";
import { z } from "zod";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "CANDIDATE")
      return err("Unauthorized.", 401);
    const c = await db.candidateProfile.findUnique({
      where: { userId: session.id },
    });
    if (!c) return err("Profile not found.", 404);
    let saved: string[] = [];
    try {
      saved = JSON.parse(c.savedJobIds || "[]");
    } catch {
      saved = [];
    }
    if (saved.length === 0) return ok({ jobs: [] });
    const jobs = await db.job.findMany({
      where: { id: { in: saved } },
      include: { company: true, applications: { select: { id: true } } },
      orderBy: { postedAt: "desc" },
    });
    return ok({
      jobs: jobs.map((j) => toJobDTO(j, j.applications.length)),
    });
  } catch (e) {
    return handleError(e);
  }
}

const schema = z.object({ jobId: z.string() });

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CANDIDATE")
      return err("Unauthorized.", 401);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err("Invalid job id.", 422);

    const c = await db.candidateProfile.findUnique({
      where: { userId: session.id },
    });
    if (!c) return err("Profile not found.", 404);
    let saved: string[] = [];
    try {
      saved = JSON.parse(c.savedJobIds || "[]");
    } catch {
      saved = [];
    }
    if (!saved.includes(parsed.data.jobId)) saved.push(parsed.data.jobId);
    const updated = await db.candidateProfile.update({
      where: { userId: session.id },
      data: { savedJobIds: JSON.stringify(saved) },
    });
    return ok({ savedJobIds: JSON.parse(updated.savedJobIds || "[]") });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CANDIDATE")
      return err("Unauthorized.", 401);
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    if (!jobId) return err("jobId is required.", 422);

    const c = await db.candidateProfile.findUnique({
      where: { userId: session.id },
    });
    if (!c) return err("Profile not found.", 404);
    let saved: string[] = [];
    try {
      saved = JSON.parse(c.savedJobIds || "[]");
    } catch {
      saved = [];
    }
    saved = saved.filter((id) => id !== jobId);
    const updated = await db.candidateProfile.update({
      where: { userId: session.id },
      data: { savedJobIds: JSON.stringify(saved) },
    });
    return ok({ savedJobIds: JSON.parse(updated.savedJobIds || "[]") });
  } catch (e) {
    return handleError(e);
  }
}
