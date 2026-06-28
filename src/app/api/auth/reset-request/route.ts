import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err, handleError } from "@/lib/api";
import { sendEmail, emails } from "@/lib/email";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
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
