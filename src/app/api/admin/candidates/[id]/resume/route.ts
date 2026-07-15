import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";

/**
 * GET /api/admin/candidates/[id]/resume
 * Admin-only. Returns a single candidate's resume builder JSON + uploaded
 * PDF metadata. `[id]` is the CandidateProfile.id (NOT the userId).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN")
      return err("Admin access required.", 403);

    const { id } = await params;

    const candidate = await db.candidateProfile.findUnique({
      where: { id },
      select: { resumeData: true, resumeUrl: true, resumeName: true },
    });
    if (!candidate) return err("Candidate not found.", 404);

    const resumeData = candidate.resumeData
      ? JSON.parse(candidate.resumeData)
      : null;

    return ok({
      resumeData,
      resumeUrl: candidate.resumeUrl,
      resumeName: candidate.resumeName,
    });
  } catch (e) {
    return handleError(e);
  }
}
