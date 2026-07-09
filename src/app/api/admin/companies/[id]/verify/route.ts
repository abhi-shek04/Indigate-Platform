import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseBody, ok, err, handleError, notify } from "@/lib/api";
import { audit } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["VERIFY", "UNVERIFY"]),
});

/**
 * PATCH /api/admin/companies/[id]/verify
 * Admin verifies or un-verifies a company (verified badge for business license).
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

    const company = await db.companyProfile.findUnique({
      where: { id },
      select: { id: true, companyName: true, userId: true },
    });
    if (!company) return err("Company not found.", 404);

    const isVerified = parsed.data.action === "VERIFY";
    await db.companyProfile.update({
      where: { id },
      data: {
        isVerified,
        verifiedAt: isVerified ? new Date() : null,
        verifiedBy: isVerified ? session.id : null,
      },
    });

    await audit({
      actorId: session.id,
      actorEmail: session.email,
      action: isVerified ? "VERIFY_COMPANY" : "UNVERIFY_COMPANY",
      targetType: "Company",
      targetId: company.id,
      targetName: company.companyName,
      req,
    });

    // Notify the company
    await db.notification.create({
      data: {
        userId: company.userId,
        title: isVerified ? "Company Verified ✅" : "Verification Removed",
        message: isVerified
          ? "Your company has been verified. A verified badge now appears on your profile."
          : "Your company verification has been removed. Please contact support.",
      },
    });

    return ok({ ok: true, isVerified });
  } catch (e) {
    return handleError(e);
  }
}
