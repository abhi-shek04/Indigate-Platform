import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";
import { z } from "zod";

/**
 * PATCH /api/candidates/me/open-to-work
 * Toggles the LinkedIn-style "Open to Work" flag on the candidate profile.
 * Companies see this badge in talent-search results.
 */
const schema = z.object({ openToWork: z.boolean() });

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CANDIDATE")
      return err("Unauthorized.", 401);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return err("openToWork (boolean) is required.", 422);

    await db.candidateProfile.update({
      where: { userId: session.id },
      data: { openToWork: parsed.data.openToWork },
    });
    return ok({ openToWork: parsed.data.openToWork });
  } catch (e) {
    return handleError(e);
  }
}
