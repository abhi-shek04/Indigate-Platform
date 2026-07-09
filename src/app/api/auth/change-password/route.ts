import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

/** POST /api/auth/change-password — change the current user's password */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { passwordHash: true, googleId: true },
    });
    if (!user) return err("User not found.", 404);
    if (!user.passwordHash)
      return err("Your account uses Google login. Set a password first.", 400);

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return err("Current password is incorrect.", 401);

    const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await db.user.update({
      where: { id: session.id },
      data: { passwordHash: newHash },
    });

    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
