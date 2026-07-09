import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseBody, ok, err, handleError } from "@/lib/api";
import { audit } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  rejectReason: z.string().optional(),
});

/**
 * PATCH /api/admin/candidates/[id]/verify
 * Admin verifies or rejects candidate documents (passport, JLPT, Degree).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;
    const body = await parseBody<z.infer<typeof schema>>(req);
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const candidate = await db.candidateProfile.findUnique({
      where: { id },
      select: { id: true, fullName: true, userId: true },
    });
    if (!candidate) return err("Candidate not found.", 404);

    await db.candidateProfile.update({
      where: { id },
      data: {
        docStatus: parsed.data.status,
        docRejectReason: parsed.data.status === "REJECTED" ? parsed.data.rejectReason ?? null : null,
        docReviewedAt: new Date(),
        docReviewedBy: session.id,
      },
    });

    await audit({
      actorId: session.id,
      actorEmail: session.email,
      action: `VERIFY_CANDIDATE_${parsed.data.status}`,
      targetType: "Candidate",
      targetId: candidate.id,
      targetName: candidate.fullName,
      details: { rejectReason: parsed.data.rejectReason },
      req,
    });

    // Notify the candidate
    await db.notification.create({
      data: {
        userId: candidate.userId,
        title: parsed.data.status === "VERIFIED" ? "Documents Verified ✅" : "Documents Rejected",
        message:
          parsed.data.status === "VERIFIED"
            ? "Your documents have been verified. You can now apply to jobs."
            : `Your documents were rejected. Reason: ${parsed.data.rejectReason ?? "Please re-upload."}`,
      },
    });

    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
