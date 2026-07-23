import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseBody, ok, err, handleError, toApplicationDTO, notify } from "@/lib/api";
import { sendEmail, emails } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  status: z.enum([
    "APPLIED",
    "SHORTLISTED",
    "INTERVIEWED",
    "OFFERED",
    "REJECTED",
    "WITHDRAWN",
  ]),
  notes: z.string().optional(),
  interviewDate: z.string().optional(),
  interviewNotes: z.string().optional(),
});

const STATUS_MESSAGE: Record<string, string> = {
  APPLIED: "Your application was received.",
  SHORTLISTED: "Congratulations! You've been shortlisted.",
  INTERVIEWED: "An interview has been scheduled.",
  OFFERED: "Great news — you've received an offer!",
  REJECTED: "The company has moved forward with other candidates.",
  WITHDRAWN: "Your application was withdrawn.",
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const body = await parseBody(req);
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const app = await db.application.findUnique({
      where: { id },
      include: { job: { include: { company: true } }, candidate: true },
    });
    if (!app) return err("Application not found.", 404);

    const canUpdate =
      session.role === "ADMIN" ||
      (session.role === "COMPANY" && app.job.company.userId === session.id) ||
      (session.role === "CANDIDATE" &&
        app.candidate.userId === session.id &&
        parsed.data.status === "WITHDRAWN");
    if (!canUpdate) return err("Forbidden.", 403);

    const updateData: Record<string, unknown> = {
      status: parsed.data.status,
      notes: parsed.data.notes ?? app.notes,
    };
    // Interview scheduling (Milestone H)
    if (parsed.data.status === "INTERVIEWED") {
      if (parsed.data.interviewDate)
        updateData.interviewDate = new Date(parsed.data.interviewDate);
      if (parsed.data.interviewNotes !== undefined)
        updateData.interviewNotes = parsed.data.interviewNotes;
    }
    const updated = await db.application.update({
      where: { id },
      data: updateData,
      include: { job: { include: { company: true } }, candidate: true },
    });

    // Notify the candidate (except when they withdrew themselves)
    if (session.role !== "CANDIDATE") {
      await notify(
        app.candidate.userId,
        `Application ${parsed.data.status.toLowerCase()}`,
        `${STATUS_MESSAGE[parsed.data.status]} Role: ${app.job.title} at ${app.job.company.companyName}.`,
      );
      // Fire-and-forget status email to candidate
      const candidateUser = await db.user.findUnique({
        where: { id: app.candidate.userId },
        select: { email: true },
      });
      if (candidateUser) {
        // For INTERVIEWED with a date, send the dedicated interview email
        if (
          parsed.data.status === "INTERVIEWED" &&
          parsed.data.interviewDate
        ) {
          const formattedDate = new Date(
            parsed.data.interviewDate,
          ).toLocaleString("en-US", {
            dateStyle: "full",
            timeStyle: "short",
            timeZone: "Asia/Tokyo",
          }) + " JST";
          void sendEmail({
            to: candidateUser.email,
            ...emails.interviewScheduled(
              app.candidate.fullName,
              app.job.title,
              app.job.company.companyName,
              formattedDate,
              parsed.data.interviewNotes ?? "",
            ),
          });
        } else {
          void sendEmail({
            to: candidateUser.email,
            ...emails.statusUpdate(
              app.candidate.fullName,
              app.job.title,
              app.job.company.companyName,
              parsed.data.status,
            ),
          });
        }
      }
    }

    return ok(toApplicationDTO(updated));
  } catch (e) {
    return handleError(e);
  }
}
