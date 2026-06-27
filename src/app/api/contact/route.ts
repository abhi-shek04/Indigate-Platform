import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError, notify } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(20),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const session = await getSession();
    const sub = await db.contactSubmission.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject || null,
        message: parsed.data.message,
        userId: session?.id ?? null,
      },
    });

    // notify admins
    const admins = await db.user.findMany({ where: { role: "ADMIN" } });
    await Promise.all(
      admins.map((a) =>
        notify(
          a.id,
          "New contact submission",
          `${parsed.data.name} (${parsed.data.email}) sent a message.`,
        ),
      ),
    );

    return ok({ id: sub.id }, 201);
  } catch (e) {
    return handleError(e);
  }
}
