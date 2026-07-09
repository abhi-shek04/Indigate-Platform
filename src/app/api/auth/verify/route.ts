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

    // In dev mode (no RESEND_API_KEY), send the code via email + return it.
    // In production, only send via email (don't expose in response).
    const isDev = !process.env.RESEND_API_KEY;
    if (isDev) {
      return ok({ sent: true, devCode: code });
    }

    // Production: send the actual email with the OTP code
    const { sendEmail, emails } = await import("@/lib/email");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://indigate.work";
    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { email: true },
    });
    if (user) {
      void sendEmail({
        to: user.email,
        ...emails.emailVerification(
          `${appUrl}/?view=verify`,
          code,
        ),
      });
    }
    return ok({ sent: true });
  } catch (e) {
    return handleError(e);
  }
}
