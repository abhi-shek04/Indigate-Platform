import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { err, handleError } from "@/lib/api";

export const runtime = "nodejs";

/**
 * GET /api/candidates/me/resume/pdf
 * Candidates are restricted from downloading PDFs directly.
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    if (session.role === "CANDIDATE") {
      return err(
        "PDF download is handled by IndiGate admin support. Please open a support ticket to request your PDF.",
        403
      );
    }

    return err("Admin role should use /api/candidates/[id]/resume/pdf", 400);
  } catch (e) {
    return handleError(e);
  }
}
