import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError, notify } from "@/lib/api";
import { sendEmail, emails } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== "ADMIN")
      return err("Admin access required.", 403);

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action"); // approve | reject

    const company = await db.companyProfile.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!company) return err("Company not found.", 404);

    if (action === "approve") {
      await db.companyProfile.update({
        where: { id },
        data: { isApproved: true, approvedAt: new Date() },
      });
      await notify(
        company.user.id,
        "Company approved 🎉",
        `Welcome aboard! ${company.companyName} is now approved. You can start posting jobs.`,
      );
      // Fire-and-forget approval email
      void sendEmail({
        to: company.user.email,
        ...emails.companyApproved(company.companyName),
      });
      return ok({ ok: true, approved: true });
    } else if (action === "reject") {
      await db.companyProfile.update({
        where: { id },
        data: { isApproved: false, approvedAt: null },
      });
      await notify(
        company.user.id,
        "Company application update",
        `We're unable to approve ${company.companyName} at this time. Please contact our team for details.`,
      );
      return ok({ ok: true, approved: false });
    }
    return err("Invalid action.", 400);
  } catch (e) {
    return handleError(e);
  }
}
