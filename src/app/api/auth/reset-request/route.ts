import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { parseBody, ok, err, handleError } from "@/lib/api";
import { sendEmail, emails } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    if (!rateLimit(`reset:${ip}`, 3, 60 * 60 * 1000)) {
      return err("Too many password reset requests. Please try again in 1 hour.", 429);
    }
    const body = await parseBody(req);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err("Enter a valid email.", 422);

    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (!user) {
      // don't leak whether email exists
      return ok({ sent: true });
    }
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const exp = new Date(Date.now() + 1000 * 60 * 30);
    await db.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExp: exp },
    });
    // In production, email the token here via Resend.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://indigate.work";
    const resetUrl = `${appUrl}/?view=reset&email=${encodeURIComponent(user.email)}&token=${token}`;
    void sendEmail({ to: user.email, ...emails.passwordReset(resetUrl) });
    console.log(`[Password reset] Code for ${user.email}: ${token}`);
    return ok({ sent: true });
  } catch (e) {
    return handleError(e);
  }
}
