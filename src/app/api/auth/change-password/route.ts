import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError, notify } from "@/lib/api";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const user = await db.user.findUnique({ where: { id: session.id } });
    if (!user || !user.passwordHash)
      return err("Your account uses Google sign-in — no password to change.", 400);

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return err("Current password is incorrect.", 400);

    if (parsed.data.currentPassword === parsed.data.newPassword)
      return err("New password must be different from the current one.", 400);

    const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
    await db.user.update({
      where: { id: session.id },
      data: { passwordHash: newHash },
    });

    await notify(
      session.id,
      "Password changed",
      "Your account password was updated. If this wasn't you, please contact support immediately.",
    );

    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
