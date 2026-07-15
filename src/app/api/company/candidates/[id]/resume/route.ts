import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";

/**
 * Company-facing resume fetch — returns a candidate's resume builder data
 * (resumeData JSON) plus any uploaded PDF (resumeUrl/resumeName).
 *
 * Security: the company may ONLY view resumes of candidates who have applied
 * to one of the company's jobs.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);
    if (session.role !== "COMPANY")
      return err("Only companies can view candidate resumes.", 403);

    const { id } = await params;

    // Security check: only allow if this candidate has applied to one of the
    // company's jobs.
    const app = await db.application.findFirst({
      where: {
        candidateId: id,
        job: { company: { userId: session.id } },
      },
      select: { id: true },
    });
    if (!app)
      return err(
        "You can only view resumes of candidates who applied to your jobs.",
        403,
      );

    const candidate = await db.candidateProfile.findUnique({
      where: { id },
      select: { resumeData: true, resumeUrl: true, resumeName: true },
    });
    if (!candidate) return err("Candidate not found.", 404);

    let resumeData: unknown = null;
    try {
      resumeData = candidate.resumeData ? JSON.parse(candidate.resumeData) : null;
    } catch {
      resumeData = null;
    }

    return ok({
      resumeData,
      resumeUrl: candidate.resumeUrl ?? null,
      resumeName: candidate.resumeName ?? null,
    });
  } catch (e) {
    return handleError(e);
  }
}
