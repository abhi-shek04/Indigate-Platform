import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseBody, ok, err, handleError } from "@/lib/api";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { sendEmail, emails } from "@/lib/email";
import { z } from "zod";

const schema = z.object({ code: z.string().length(6) });

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const ip = getClientIp(req.headers);
    if (!rateLimit(`verify:${ip}`, RATE_LIMITS.VERIFY.max, RATE_LIMITS.VERIFY.windowMs)) {
      return err("Too many verification attempts. Try again in 15 minutes.", 429);
    }

    const body = await parseBody(req);
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

    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { email: true },
    });
    if (!user) return err("User not found.", 404);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await db.user.update({
      where: { id: session.id },
      data: { verifyToken: code },
    });

    // ALWAYS send the OTP via email (not website notifications)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://indigate.work";
    const verifyUrl = `${appUrl}/?view=verify`;
    void sendEmail({
      to: user.email,
      ...emails.emailVerification(verifyUrl, code),
    });

    // In dev mode (no RESEND_API_KEY), also return the code so the
    // frontend can display it (since email won't actually be delivered).
    const isDev = !process.env.RESEND_API_KEY;
    if (isDev) {
      return ok({ sent: true, devCode: code });
    }
    return ok({ sent: true });
  } catch (e) {
    return handleError(e);
  }
}
