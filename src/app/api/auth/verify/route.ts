import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError, notify } from "@/lib/api";
import { z } from "zod";

const schema = z.object({ code: z.string().length(6) });

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err("Enter the 6-digit code.", 422);

    const user = await db.user.findUnique({ where: { id: session.id } });
    if (!user) return err("User not found.", 404);
    if (user.verifyToken !== parsed.data.code)
      return err("Invalid verification code.", 400);

    await db.user.update({
      where: { id: user.id },
      data: { isVerified: true, verifyToken: null },
    });

    return ok({ verified: true });
  } catch (e) {
    return handleError(e);
  }
}

// Resend a code
export async function PUT() {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await db.user.update({
      where: { id: session.id },
      data: { verifyToken: code },
    });
    await notify(
      session.id,
      "New verification code",
      `Your new IndiGate verification code is ${code}.`,
    );
    return ok({ code });
  } catch (e) {
    return handleError(e);
  }
}
