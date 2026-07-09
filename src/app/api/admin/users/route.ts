import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";

/** GET /api/admin/users — list all users (admin only) */
export async function GET() {
  try {
    await requireRole("ADMIN");
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        googleId: true,
        totpEnabled: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({ users });
  } catch (e) {
    return handleError(e);
  }
}

/** PATCH /api/admin/users?id=... — update a user's role or verified status */
export async function PATCH(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return err("Missing user id.", 400);

    const body = await req.json().catch(() => null);
    if (!body) return err("Invalid body.", 400);

    const data: { role?: string; isVerified?: boolean } = {};
    if (body.role && ["CANDIDATE", "COMPANY", "ADMIN"].includes(body.role))
      data.role = body.role;
    if (typeof body.isVerified === "boolean") data.isVerified = body.isVerified;

    if (Object.keys(data).length === 0)
      return err("No valid fields to update.", 400);

    const updated = await db.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, isVerified: true },
    });
    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}

/** DELETE /api/admin/users?id=... — delete a user (admin only) */
export async function DELETE(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return err("Missing user id.", 400);

    await db.user.delete({ where: { id } });
    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
