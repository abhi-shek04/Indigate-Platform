import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);
    const n = await db.notification.findUnique({ where: { id } });
    if (!n || n.userId !== session.id) return err("Not found.", 404);
    await db.notification.update({ where: { id }, data: { isRead: true } });
    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
