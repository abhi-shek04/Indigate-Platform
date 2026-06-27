import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  ok,
  err,
  handleError,
  toApplicationDTO,
  notify,
} from "@/lib/api";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    let apps;
    if (session.role === "CANDIDATE") {
      apps = await db.application.findMany({
        where: { candidate: { userId: session.id }, ...(jobId ? { jobId } : {}) },
        include: {
          job: { include: { company: true } },
          candidate: true,
        },
        orderBy: { appliedAt: "desc" },
      });
    } else if (session.role === "COMPANY") {
      const company = await db.companyProfile.findUnique({
        where: { userId: session.id },
      });
      if (!company) return err("Company profile not found.", 404);
      apps = await db.application.findMany({
        where: { job: { companyId: company.id }, ...(jobId ? { jobId } : {}) },
        include: {
          job: { include: { company: true } },
          candidate: true,
        },
        orderBy: { appliedAt: "desc" },
      });
    } else {
      apps = await db.application.findMany({
        where: jobId ? { jobId } : {},
        include: {
          job: { include: { company: true } },
          candidate: true,
        },
        orderBy: { appliedAt: "desc" },
        take: 200,
      });
    }

    return ok({ applications: apps.map(toApplicationDTO) });
  } catch (e) {
    return handleError(e);
  }
}

const schema = z.object({
  jobId: z.string(),
  coverNote: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);
    if (session.role !== "CANDIDATE")
      return err("Only candidates can apply to jobs.", 403);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const candidate = await db.candidateProfile.findUnique({
      where: { userId: session.id },
    });
    if (!candidate) return err("Profile not found.", 404);

    const job = await db.job.findUnique({
      where: { id: parsed.data.jobId },
      include: { company: true },
    });
    if (!job || !job.isActive) return err("Job is no longer available.", 404);
    if (job.deadline && job.deadline < new Date())
      return err("Application deadline has passed.", 400);

    const existing = await db.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: candidate.id,
          jobId: job.id,
        },
      },
    });
    if (existing) return err("You've already applied to this job.", 409);

    const app = await db.application.create({
      data: {
        candidateId: candidate.id,
        jobId: job.id,
        coverNote: parsed.data.coverNote || null,
        resumeUrlSnapshot: candidate.resumeUrl,
        status: "APPLIED",
      },
      include: { job: { include: { company: true } }, candidate: true },
    });

    await notify(
      job.company.userId,
      "New application received",
      `${candidate.fullName} applied to ${job.title}.`,
    );

    return ok(toApplicationDTO(app), 201);
  } catch (e) {
    return handleError(e);
  }
}
