import { Resend } from "resend";

/**
 * Email system. Uses Resend when RESEND_API_KEY is set; otherwise logs to
 * the server console (dev/sandbox). All email-sending is fire-and-forget
 * — callers should NOT await it.
 */

let _resend: Resend | null = null;

function client(): Resend | null {
  if (_resend !== null) return _resend;
  if (!process.env.RESEND_API_KEY) return null;
  _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const r = client();
  if (!r) {
    console.log("[EMAIL SKIPPED — no RESEND_API_KEY]", { to, subject });
    return;
  }
  const from = process.env.EMAIL_FROM ?? "IndiGate <noreply@indigate.work>";
  const { error } = await r.emails.send({ from, to, subject, html });
  if (error) console.error("[EMAIL ERROR]", error);
}

/**
 * Email template builder — returns an HTML string with IndiGate branding.
 * Uses inline styles for email-client compatibility.
 */
export function buildEmail(opts: {
  title: string;
  heading: string;
  body: string; // can contain HTML paragraphs
  cta?: { label: string; url: string };
}): string {
  const { title, heading, body, cta } = opts;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr style="background:linear-gradient(135deg,#f59e0b,#dc2626);">
          <td style="padding:28px 36px;">
            <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">IndiGate</span>
            <span style="font-size:13px;color:rgba(255,255,255,.75);margin-left:8px;">India × Japan</span>
          </td>
        </tr>
        <tr><td style="padding:36px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;">${heading}</h1>
          <div style="color:#444;line-height:1.7;font-size:15px;">${body}</div>
          ${cta ? `<div style="margin-top:28px;"><a href="${cta.url}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#f59e0b,#dc2626);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">${cta.label}</a></div>` : ""}
        </td></tr>
        <tr><td style="padding:20px 36px;background:#f9f9f9;border-top:1px solid #eee;">
          <p style="margin:0;font-size:12px;color:#999;">© 2025 IndiGate by Indobox Inc · <a href="https://indigate.work" style="color:#f59e0b;">indigate.work</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://indigate.work";

export const emails = {
  welcomeCandidate: (name: string) => ({
    subject: "Welcome to IndiGate!",
    html: buildEmail({
      title: "Welcome to IndiGate",
      heading: `Welcome, ${name}!`,
      body: '<p>Thank you for joining IndiGate. Complete your profile, upload your resume, and start applying to top jobs in Japan with visa sponsorship.</p>',
      cta: { label: "Browse Jobs", url: `${APP_URL}/?view=jobs` },
    }),
  }),

  welcomeCompany: (companyName: string) => ({
    subject: "IndiGate — Company account under review",
    html: buildEmail({
      title: "Account Under Review",
      heading: `Welcome, ${companyName}!`,
      body: `<p>Your company account has been submitted and is being reviewed by our team. You'll be able to post jobs once approved — typically within 1-2 business days.</p><p>Questions? Email us at <a href="mailto:contact@indigate.work">contact@indigate.work</a></p>`,
    }),
  }),

  companyApproved: (companyName: string) => ({
    subject: "Your IndiGate company account is approved!",
    html: buildEmail({
      title: "Account Approved",
      heading: `${companyName} — You're approved!`,
      body: "<p>Your company account has been approved. You can now post jobs and start connecting with top Indian talent for your Japan operations.</p>",
      cta: { label: "Post Your First Job", url: `${APP_URL}/` },
    }),
  }),

  applicationSubmitted: (
    candidateName: string,
    jobTitle: string,
    companyName: string,
  ) => ({
    subject: `Application submitted — ${jobTitle} at ${companyName}`,
    html: buildEmail({
      title: "Application Submitted",
      heading: "Your application was sent!",
      body: `<p>Hi ${candidateName},</p><p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been submitted successfully.</p><p>The company will review your profile and reach out if you're a good fit. You can track your application status on your dashboard.</p>`,
      cta: { label: "View My Applications", url: `${APP_URL}/` },
    }),
  }),

  statusUpdate: (
    candidateName: string,
    jobTitle: string,
    companyName: string,
    status: string,
  ) => {
    const M: Record<string, { subject: string; heading: string; body: string }> = {
      SHORTLISTED: {
        subject: `You've been shortlisted! — ${jobTitle} at ${companyName}`,
        heading: "🎉 You've been shortlisted!",
        body: `<p>Hi ${candidateName},</p><p>Great news! <strong>${companyName}</strong> has shortlisted your application for <strong>${jobTitle}</strong>. They'll be in touch soon about next steps.</p>`,
      },
      INTERVIEWED: {
        subject: `Interview invitation — ${jobTitle} at ${companyName}`,
        heading: "Interview invitation",
        body: `<p>Hi ${candidateName},</p><p><strong>${companyName}</strong> would like to schedule an interview for <strong>${jobTitle}</strong>. Please check your dashboard for details and respond promptly.</p>`,
      },
      OFFERED: {
        subject: `Job offer received! — ${jobTitle} at ${companyName}`,
        heading: "🎊 You received a job offer!",
        body: `<p>Hi ${candidateName},</p><p>Congratulations! <strong>${companyName}</strong> has extended a job offer for <strong>${jobTitle}</strong>. Please log in to review and respond to your offer.</p>`,
      },
      REJECTED: {
        subject: `Update on your application — ${jobTitle}`,
        heading: "Application update",
        body: `<p>Hi ${candidateName},</p><p>Thank you for your interest in <strong>${jobTitle}</strong> at <strong>${companyName}</strong>. After careful review, they have decided to move forward with other candidates at this time.</p><p>Don't be discouraged — keep applying! There are many more opportunities on IndiGate.</p>`,
      },
    };
    const msg = M[status] ?? {
      subject: `Application update — ${jobTitle}`,
      heading: "Application status update",
      body: `<p>Hi ${candidateName}, your application for ${jobTitle} at ${companyName} has been updated. Check your dashboard for details.</p>`,
    };
    return {
      subject: msg.subject,
      html: buildEmail({
        title: msg.subject,
        heading: msg.heading,
        body: msg.body,
        cta: { label: "View Dashboard", url: `${APP_URL}/` },
      }),
    };
  },

  newApplication: (
    companyName: string,
    candidateName: string,
    jobTitle: string,
    jlptLevel: string,
  ) => ({
    subject: `New application for ${jobTitle}`,
    html: buildEmail({
      title: "New Applicant",
      heading: "You have a new applicant!",
      body: `<p><strong>${candidateName}</strong> (JLPT ${jlptLevel}) has applied to <strong>${jobTitle}</strong>. Review their profile and resume on your dashboard.</p>`,
      cta: { label: "Review Applicant", url: `${APP_URL}/` },
    }),
  }),

  passwordReset: (resetUrl: string) => ({
    subject: "Reset your IndiGate password",
    html: buildEmail({
      title: "Password Reset",
      heading: "Reset your password",
      body: "<p>You requested a password reset. Click the button below to choose a new password. This link expires in 30 minutes.</p><p>If you didn't request this, ignore this email — your account is safe.</p>",
      cta: { label: "Reset Password", url: resetUrl },
    }),
  }),

  emailVerification: (verifyUrl: string) => ({
    subject: "Verify your IndiGate email",
    html: buildEmail({
      title: "Verify Email",
      heading: "Verify your email address",
      body: "<p>Click the button below to verify your email address and activate your IndiGate account.</p>",
      cta: { label: "Verify Email", url: verifyUrl },
    }),
  }),

  adminNewCompany: (companyName: string, email: string) => ({
    subject: `[Admin] New company pending approval — ${companyName}`,
    html: buildEmail({
      title: "New Company Registration",
      heading: "New company needs approval",
      body: `<p><strong>${companyName}</strong> (${email}) has registered and is awaiting approval. Log in to the admin panel to review and approve.</p>`,
      cta: { label: "Open Admin Panel", url: `${APP_URL}/` },
    }),
  }),

  interviewScheduled: (
    candidateName: string,
    jobTitle: string,
    companyName: string,
    date: string,
    notes: string,
  ) => ({
    subject: `Interview scheduled — ${jobTitle} at ${companyName}`,
    html: buildEmail({
      title: "Interview Scheduled",
      heading: "Interview scheduled 📅",
      body: `<p>Hi ${candidateName}, <strong>${companyName}</strong> has scheduled an interview for <strong>${jobTitle}</strong>.</p><p><strong>Date &amp; time:</strong> ${date}</p>${notes ? `<p><strong>Details:</strong> ${notes}</p>` : ""}`,
      cta: { label: "View in dashboard", url: `${APP_URL}/` },
    }),
  }),
};
