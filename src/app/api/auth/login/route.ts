import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err("Invalid email or password.", 422);

    const user = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (!user || !user.passwordHash) return err("Invalid email or password.", 401);

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) return err("Invalid email or password.", 401);

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "CANDIDATE" | "COMPANY" | "ADMIN",
      isVerified: user.isVerified,
    });

    return ok({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
    });
  } catch (e) {
    return handleError(e);
  }
}
