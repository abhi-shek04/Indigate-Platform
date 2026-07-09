import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseBody, ok, err, handleError } from "@/lib/api";
import { audit } from "@/lib/audit";

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
    const session = await requireRole("ADMIN");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return err("Missing user id.", 400);

    const body = await parseBody<{ role?: string; isVerified?: boolean }>(req);
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

    await audit({
      actorId: session.id,
      actorEmail: session.email,
      action: "UPDATE_USER",
      targetType: "User",
      targetId: updated.id,
      targetName: updated.email,
      details: data,
      req,
    });

    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}

/** DELETE /api/admin/users?id=... — delete a user (admin only) */
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireRole("ADMIN");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return err("Missing user id.", 400);

    const user = await db.user.findUnique({
      where: { id },
      select: { email: true },
    });

    await db.user.delete({ where: { id } });

    await audit({
      actorId: session.id,
      actorEmail: session.email,
      action: "DELETE_USER",
      targetType: "User",
      targetId: id,
      targetName: user?.email ?? id,
      req,
    });

    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
