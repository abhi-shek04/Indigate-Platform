import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err("Invalid input.", 422);

    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (!user) return err("Invalid code.", 400);
    if (user.resetToken !== parsed.data.code) return err("Invalid code.", 400);
    if (!user.resetTokenExp || user.resetTokenExp < new Date())
      return err("Code expired. Please request a new one.", 400);

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExp: null,
        isVerified: true,
      },
    });

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "CANDIDATE" | "COMPANY" | "ADMIN",
      isVerified: true,
    });

    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
