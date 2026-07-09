import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";

/** GET /api/admin/audit-log — list all audit log entries (admin only) */
export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));
    const action = searchParams.get("action");

    const logs = await db.auditLog.findMany({
      where: action ? { action } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return ok({ logs });
  } catch (e) {
    return handleError(e);
  }
}
