import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError, toApplicationDTO } from "@/lib/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const app = await db.application.findUnique({
      where: { id },
      include: { job: { include: { company: true } }, candidate: true },
    });
    if (!app) return err("Application not found.", 404);

    const canView =
      session.role === "ADMIN" ||
      (session.role === "CANDIDATE" && app.candidate.userId === session.id) ||
      (session.role === "COMPANY" && app.job.company.userId === session.id);
    if (!canView) return err("Forbidden.", 403);

    return ok(toApplicationDTO(app));
  } catch (e) {
    return handleError(e);
  }
}
