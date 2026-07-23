import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";
import { sendEmail, buildEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN")
      return err("Admin access required.", 403);

    const body = await req.json() as { alertIds: string[] };
    if (!Array.isArray(body.alertIds) || body.alertIds.length === 0)
      return err("No alert IDs provided.", 400);
    if (body.alertIds.length > 50)
      return err("Maximum 50 alerts per bulk send.", 400);

    // Fetch the alerts with user + profile info
    const alerts = await db.jobAlert.findMany({
      where: { id: { in: body.alertIds }, isActive: true },
      include: {
        user: {
          select: {
            email: true,
            candidate: { select: { fullName: true } },
          },
        },
      },
    });

    // Fetch all active jobs once
    const activeJobs = await db.job.findMany({
      where: { isActive: true },
      select: {
        id: true, title: true, location: true,
        jobType: true, jlptRequired: true,
        salaryMin: true, salaryMax: true, currency: true,
        company: { select: { companyName: true } },
      },
      orderBy: { postedAt: "desc" },
    });

    let sent = 0;
    let skipped = 0;

    for (const alert of alerts) {
      const email = alert.user.email;
      const name = alert.user.candidate?.fullName ?? "Candidate";

      // Match jobs to this alert
      const matches = activeJobs.filter((job) => {
        if (alert.jlptLevel && alert.jlptLevel !== "NONE" && job.jlptRequired !== alert.jlptLevel) return false;
        if (alert.jobType && job.jobType !== alert.jobType) return false;
        if (alert.location && !job.location.toLowerCase().includes(alert.location.toLowerCase())) return false;
        if (alert.salaryMin && job.salaryMin && job.salaryMin < alert.salaryMin) return false;
        return true;
      }).slice(0, 5); // max 5 jobs per email

      if (matches.length === 0) {
        skipped++;
        continue;
      }

      // Build email HTML
      const jobListHtml = matches.map((job) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
            <p style="margin:0;font-weight:600;font-size:14px;color:#1a1a1a;">${job.title}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#666;">
              ${job.company.companyName} · ${job.location} · ${job.jlptRequired}
            </p>
          </td>
        </tr>
      `).join("");

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://indigate.work";

      sendEmail({
        to: email,
        subject: `${matches.length} new job${matches.length > 1 ? "s" : ""} matching your alert "${alert.name}"`,
        html: buildEmail({
          title: "Matching Jobs Found",
          heading: `Hi ${name}, we found ${matches.length} match${matches.length > 1 ? "es" : ""} for you!`,
          body: `
            <p style="color:#555;font-size:14px;margin-bottom:16px;">
              Based on your job alert <strong>"${alert.name}"</strong>, here are the latest matching opportunities on IndiGate:
            </p>
            <table style="width:100%;border-collapse:collapse;">
              ${jobListHtml}
            </table>
          `,
          cta: { label: "View All Jobs on IndiGate", url: `${appUrl}/?view=jobs` },
        }),
      });

      sent++;
    }

    return ok({
      sent,
      skipped,
      message: `Sent ${sent} email${sent !== 1 ? "s" : ""}. Skipped ${skipped} (no matching jobs).`,
    });

  } catch (e) {
    return handleError(e);
  }
}
