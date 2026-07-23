# IndiGate — Production Upgrade Prompts
### Based on actual codebase audit · indigate.work
> For Abhishek, Indobox Inc — June 2026

---

## WHAT YOU'VE ALREADY BUILT (DO NOT REGENERATE)

Your codebase is solid. Before every prompt, the AI must understand this:

```
EXISTING ARCHITECTURE — READ THIS BEFORE WRITING ANY CODE:

Stack: Next.js 16, Bun, TypeScript, SQLite via Prisma, shadcn/ui, Framer Motion, Zustand, Zod, Sonner

CRITICAL PATTERN — This is a single-page app. ALL views render at "/".
Navigation is done via Zustand store (src/lib/store.ts), NOT Next.js routing.
The store has a "view" field that controls what renders. Adding new Next.js
pages/routes is only done for SEO/sharing — the main app stays SPA.

Auth: Custom HMAC-signed cookie sessions (src/lib/auth.ts).
NOT NextAuth. Uses getSession(), requireSession(), requireRole() server-side.
Client reads auth via /api/auth/me which refreshAuth() calls on store.

Database: SQLite. Arrays stored as JSON strings. Enums stored as plain strings.
Parse with JSON.parse(), validate in app layer.

Design tokens (CSS vars in globals.css):
--saffron: saffron/gold brand color (primary)
--crimson: red accent
--ink: dark text
Utility classes: bg-brand-gradient, text-gradient-brand, bg-mesh, glass,
shadow-premium, shadow-glow-brand, scroll-area, bg-sidebar

i18n: Custom (src/lib/i18n.ts). Use useT() hook. t("key") returns string.
pick(en, ja) returns locale-appropriate value.
All i18n keys are already in i18n.ts — extend it, don't replace it.

Store: useApp() from src/lib/store.ts — for auth, navigation, tabs, locale.
Add new state here when needed (don't create separate stores).

API calls: Use api() from src/lib/api-client.ts for JSON.
Use raw fetch() for FormData uploads.
API returns { data, error } pattern. ok() and err() helpers in src/lib/api.ts.

Components: All shadcn/ui in src/components/ui/. 
DashboardShell, MetricCard, EmptyState, SectionCard in dashboard/dashboard-shell.tsx.
FileDropZone, SkillsInput in dashboard/widgets.tsx.

EXISTING FILES — DO NOT RECREATE:
src/lib/{auth,types,i18n,api,api-client,store,use-t,utils,motion,resume-types}.ts
src/app/api/auth/{login,logout,me,register,verify,reset-request,reset-confirm}
src/app/api/{jobs,applications,candidates,companies,admin,notifications,contact,testimonials}
src/components/ui/* (all shadcn components)
src/components/{landing,jobs,auth,candidate,company,admin,dashboard,layout,brand}/*

Demo credentials (seeded):
- Candidate: arjun@example.com / candidate123
- Company: hr@technova.jp / company123
- Admin: admin@indigate.work / admin123
```

---

## MILESTONE A — File Upload System (CRITICAL — BLOCKING BUG)
**Problem:** `/api/upload` is called by the resume upload in candidate-dashboard.tsx and company logo upload, but THIS FILE DOES NOT EXIST. Upload fails silently for all users.
**Goal:** Create the upload API using Supabase Storage (free tier works fine).
**Time:** 2–3 hours

```
[PASTE THE EXISTING ARCHITECTURE BLOCK ABOVE]

MILESTONE A: Build the missing /api/upload route + Supabase Storage integration.

CONTEXT:
- src/components/candidate/candidate-dashboard.tsx already calls:
  fetch("/api/upload", { method: "POST", body: formData })
  with fd.append("file", file) and fd.append("kind", "resume")
- src/components/company/company-dashboard.tsx calls the same endpoint
  with fd.append("kind", "logo")
- The route src/app/api/upload/route.ts DOES NOT EXIST — create it.
- candidate-dashboard.tsx also calls /api/candidates/me with { resumeUrl: null }
  to remove a resume — this already works, don't change it.

STEP 1 — Add Supabase client:
npm install @supabase/supabase-js

Add to .env:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key (NOT anon key)
SUPABASE_STORAGE_BUCKET=indigate-uploads

Create src/lib/supabase.ts:
import { createClient } from '@supabase/supabase-js'
// Server-side only client (uses service key — full access)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

STEP 2 — Create src/app/api/upload/route.ts (POST):

Logic:
- Parse FormData: file (File), kind ("resume" | "logo" | "photo")
- Auth: requireSession() — must be logged in
  - If kind="resume": session.role must be CANDIDATE
  - If kind="logo": session.role must be COMPANY
  - If kind="photo": any role
- Validations:
  - kind="resume": file.type must be "application/pdf", max 5MB
  - kind="logo": file.type must start with "image/", max 2MB
  - kind="photo": file.type must start with "image/", max 2MB
- Build storage path:
  - resume: `resumes/${session.id}/${Date.now()}.pdf`
  - logo: `logos/${session.id}/${Date.now()}.${ext}`
  - photo: `photos/${session.id}/${Date.now()}.${ext}`
- Upload to Supabase Storage using supabaseAdmin:
  const { error } = await supabaseAdmin.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET!)
    .upload(path, buffer, { contentType: file.type, upsert: true })
- Get public URL:
  const { data } = supabaseAdmin.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET!)
    .getPublicUrl(path)
  const publicUrl = data.publicUrl
- Save URL to DB based on kind:
  - resume → db.candidateProfile.update({ where: { userId: session.id }, data: { resumeUrl: publicUrl, resumeName: file.name } })
  - logo → db.companyProfile.update({ where: { userId: session.id }, data: { logoUrl: publicUrl } })
  - photo → db.candidateProfile.update({ where: { userId: session.id }, data: { photoUrl: publicUrl } })
- Return ok({ url: publicUrl })

STEP 3 — In Supabase dashboard:
Create a bucket called "indigate-uploads" with public access ON.
Set the following bucket policy (so uploaded files are readable by anyone):
  Allow SELECT (read) for all
  Allow INSERT (upload) for authenticated users only
(We handle auth in the API route, so bucket can be fully public for reads)

STEP 4 — Update next.config.ts to allow Supabase image domain:
import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: { ignoreBuildErrors: false },  // Fix this too — don't hide TS errors
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}
export default nextConfig

STEP 5 — In company-dashboard.tsx, find the logo upload section.
It should already use FileDropZone with kind="logo". 
Confirm it calls /api/upload with fd.append("kind", "logo").
If not, update it to match the same pattern as the resume upload.

STEP 6 — Verify Supabase setup works with a local test:
Create a test file at scripts/test-upload.ts that:
- Reads a sample PDF from the project
- Uploads it to Supabase Storage using supabaseAdmin
- Logs the public URL
Run with: bunx tsx scripts/test-upload.ts

Expected result: Resume upload works. Company logo upload works.
Files appear in Supabase Storage dashboard.
resumeUrl in CandidateProfile DB is a real Supabase URL, not null.
```

---

## MILESTONE B — Email System (Resend)
**Problem:** No emails sent anywhere. Registration is auto-verified. Password reset tokens exist in DB but never emailed. Companies never notified of applications.
**Goal:** Real transactional emails for every important event.
**Time:** 2–3 hours

```
[PASTE THE EXISTING ARCHITECTURE BLOCK ABOVE]

MILESTONE B: Email system using Resend.

IMPORTANT: The reset-request and reset-confirm API routes already exist.
The verify route already exists. We are WIRING UP emails to existing logic,
not rebuilding any auth flows.

STEP 1 — Install Resend:
npm install resend

Add to .env:
RESEND_API_KEY=re_xxxx
EMAIL_FROM=IndiGate <noreply@indigate.work>
ADMIN_EMAIL=admin@indigate.work

STEP 2 — Create src/lib/email.ts:

import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL SKIPPED — no RESEND_API_KEY]', { to, subject })
    return
  }
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'IndiGate <noreply@indigate.work>',
    to,
    subject,
    html,
  })
  if (error) console.error('[EMAIL ERROR]', error)
}

// Email template builder — returns HTML string
// Uses inline styles so email clients render correctly
export function buildEmail(options: {
  title: string
  heading: string
  body: string   // can contain HTML paragraphs
  cta?: { label: string; url: string }
  locale?: 'en' | 'ja'
}): string {
  const { title, heading, body, cta } = options
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:sans-serif;">
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
          ${cta ? `<div style="margin-top:28px;"><a href="${cta.url}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#f59e0b,#dc2626);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">${cta.label}</a></div>` : ''}
        </td></tr>
        <tr><td style="padding:20px 36px;background:#f9f9f9;border-top:1px solid #eee;">
          <p style="margin:0;font-size:12px;color:#999;">© 2025 IndiGate by Indobox Inc · <a href="https://indigate.work" style="color:#f59e0b;">indigate.work</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// Pre-built email templates (call these throughout the app)
export const emails = {

  welcomeCandidate: (name: string, lang: 'en' | 'ja' = 'en') => ({
    subject: lang === 'ja' ? 'IndiGateへようこそ！' : 'Welcome to IndiGate!',
    html: buildEmail({
      title: 'Welcome to IndiGate',
      heading: lang === 'ja' ? `ようこそ、${name}さん！` : `Welcome, ${name}!`,
      body: lang === 'ja'
        ? '<p>IndiGateへの登録ありがとうございます。プロフィールを完成させて、日本の求人に応募しましょう。</p>'
        : '<p>Thank you for joining IndiGate. Complete your profile, upload your resume, and start applying to top jobs in Japan.</p>',
      cta: { label: lang === 'ja' ? '求人を探す' : 'Browse Jobs', url: 'https://indigate.work' },
    }),
  }),

  welcomeCompany: (companyName: string) => ({
    subject: 'IndiGate — Company account under review',
    html: buildEmail({
      title: 'Account Under Review',
      heading: `Welcome, ${companyName}!`,
      body: `<p>Your company account has been submitted and is being reviewed by our team. You'll be able to post jobs once approved — typically within 1-2 business days.</p><p>Questions? Email us at <a href="mailto:contact@indigate.work">contact@indigate.work</a></p>`,
    }),
  }),

  companyApproved: (companyName: string) => ({
    subject: 'Your IndiGate company account is approved!',
    html: buildEmail({
      title: 'Account Approved',
      heading: `${companyName} — You're approved!`,
      body: '<p>Your company account has been approved. You can now post jobs and start connecting with top Indian talent for your Japan operations.</p>',
      cta: { label: 'Post Your First Job', url: 'https://indigate.work' },
    }),
  }),

  applicationSubmitted: (candidateName: string, jobTitle: string, companyName: string) => ({
    subject: `Application submitted — ${jobTitle} at ${companyName}`,
    html: buildEmail({
      title: 'Application Submitted',
      heading: 'Your application was sent!',
      body: `<p>Hi ${candidateName},</p><p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been submitted successfully.</p><p>The company will review your profile and reach out if you're a good fit. You can track your application status on your dashboard.</p>`,
      cta: { label: 'View My Applications', url: 'https://indigate.work' },
    }),
  }),

  statusUpdate: (candidateName: string, jobTitle: string, companyName: string, status: string) => {
    const statusMessages: Record<string, { subject: string; heading: string; body: string }> = {
      SHORTLISTED: {
        subject: `You've been shortlisted! — ${jobTitle} at ${companyName}`,
        heading: '🎉 You\'ve been shortlisted!',
        body: `<p>Hi ${candidateName},</p><p>Great news! <strong>${companyName}</strong> has shortlisted your application for <strong>${jobTitle}</strong>. They'll be in touch soon about next steps.</p>`,
      },
      INTERVIEWED: {
        subject: `Interview invitation — ${jobTitle} at ${companyName}`,
        heading: 'Interview invitation',
        body: `<p>Hi ${candidateName},</p><p><strong>${companyName}</strong> would like to schedule an interview for <strong>${jobTitle}</strong>. Please check your dashboard for details and respond promptly.</p>`,
      },
      OFFERED: {
        subject: `Job offer received! — ${jobTitle} at ${companyName}`,
        heading: '🎊 You received a job offer!',
        body: `<p>Hi ${candidateName},</p><p>Congratulations! <strong>${companyName}</strong> has extended a job offer for <strong>${jobTitle}</strong>. Please log in to review and respond to your offer.</p>`,
      },
      REJECTED: {
        subject: `Update on your application — ${jobTitle}`,
        heading: 'Application update',
        body: `<p>Hi ${candidateName},</p><p>Thank you for your interest in <strong>${jobTitle}</strong> at <strong>${companyName}</strong>. After careful review, they have decided to move forward with other candidates at this time.</p><p>Don't be discouraged — keep applying! There are many more opportunities on IndiGate.</p>`,
      },
    }
    const msg = statusMessages[status] ?? {
      subject: `Application update — ${jobTitle}`,
      heading: 'Application status update',
      body: `<p>Hi ${candidateName}, your application for ${jobTitle} at ${companyName} has been updated. Check your dashboard for details.</p>`,
    }
    return {
      subject: msg.subject,
      html: buildEmail({
        title: msg.subject,
        heading: msg.heading,
        body: msg.body,
        cta: { label: 'View Dashboard', url: 'https://indigate.work' },
      }),
    }
  },

  newApplication: (companyName: string, candidateName: string, jobTitle: string, jlptLevel: string) => ({
    subject: `New application for ${jobTitle}`,
    html: buildEmail({
      title: 'New Applicant',
      heading: 'You have a new applicant!',
      body: `<p><strong>${candidateName}</strong> (JLPT ${jlptLevel}) has applied to <strong>${jobTitle}</strong>. Review their profile and resume on your dashboard.</p>`,
      cta: { label: 'Review Applicant', url: 'https://indigate.work' },
    }),
  }),

  passwordReset: (resetUrl: string) => ({
    subject: 'Reset your IndiGate password',
    html: buildEmail({
      title: 'Password Reset',
      heading: 'Reset your password',
      body: '<p>You requested a password reset. Click the button below to choose a new password. This link expires in 1 hour.</p><p>If you didn\'t request this, ignore this email — your account is safe.</p>',
      cta: { label: 'Reset Password', url: resetUrl },
    }),
  }),

  emailVerification: (verifyUrl: string) => ({
    subject: 'Verify your IndiGate email',
    html: buildEmail({
      title: 'Verify Email',
      heading: 'Verify your email address',
      body: '<p>Click the button below to verify your email address and activate your IndiGate account.</p>',
      cta: { label: 'Verify Email', url: verifyUrl },
    }),
  }),

  adminNewCompany: (companyName: string, email: string) => ({
    subject: `[Admin] New company pending approval — ${companyName}`,
    html: buildEmail({
      title: 'New Company Registration',
      heading: 'New company needs approval',
      body: `<p><strong>${companyName}</strong> (${email}) has registered and is awaiting approval. Log in to the admin panel to review and approve.</p>`,
      cta: { label: 'Open Admin Panel', url: 'https://indigate.work' },
    }),
  }),
}

STEP 3 — Wire emails to existing API routes:

a) src/app/api/auth/register/route.ts — after user creation:
   import { sendEmail, emails } from '@/lib/email'
   // For CANDIDATE: (fire-and-forget, don't await)
   sendEmail({ to: user.email, ...emails.welcomeCandidate(parsed.data.fullName ?? '') })
   // For COMPANY: send welcome + notify admins
   sendEmail({ to: user.email, ...emails.welcomeCompany(parsed.data.companyName ?? '') })
   sendEmail({ to: process.env.ADMIN_EMAIL!, ...emails.adminNewCompany(companyName, email) })

b) src/app/api/auth/reset-request/route.ts — after creating reset token:
   import { sendEmail, emails } from '@/lib/email'
   const resetUrl = `https://indigate.work/?view=reset&token=${resetToken}`
   sendEmail({ to: user.email, ...emails.passwordReset(resetUrl) })
   (IMPORTANT: The token is already being created and saved to DB in this route.
    Just add the sendEmail call — don't change any other logic.)

c) src/app/api/applications/route.ts POST — after creating application:
   import { sendEmail, emails } from '@/lib/email'
   // Get candidate email and company email from DB (already in scope as variables)
   // Send to candidate:
   sendEmail({ to: candidateUser.email, ...emails.applicationSubmitted(candidate.fullName, job.title, company.companyName) })
   // Send to company contact:
   sendEmail({ to: companyUser.email, ...emails.newApplication(company.companyName, candidate.fullName, job.title, candidate.jlptLevel) })
   (Fire-and-forget for both — don't await, don't block the response)

d) src/app/api/applications/[id]/status/route.ts PATCH — after updating status:
   import { sendEmail, emails } from '@/lib/email'
   // Get candidate user email from DB
   sendEmail({ to: candidateEmail, ...emails.statusUpdate(candidate.fullName, job.title, company.companyName, newStatus) })

e) src/app/api/admin/companies/[id]/route.ts PATCH (approve) — after approval:
   import { sendEmail, emails } from '@/lib/email'
   sendEmail({ to: companyUser.email, ...emails.companyApproved(company.companyName) })

STEP 4 — Change registration to not auto-verify:
In src/app/api/auth/register/route.ts, change:
  isVerified: true  →  isVerified: false
Then send verification email. But also add this check to login:
In src/app/api/auth/login/route.ts, after finding user:
  if (!user.isVerified) return err("Please verify your email before logging in.", 403)
NOTE: Keep demo seed accounts as isVerified: true so they still work.

STEP 5 — Add verification email to register route:
After creating user, generate a 6-digit code:
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  await db.user.update({ where: { id: user.id }, data: { verifyToken: code } })
  const verifyUrl = `https://indigate.work/?view=verify&email=${encodeURIComponent(email)}`
  sendEmail({ to: email, ...emails.emailVerification(verifyUrl) })
(The verify route already handles the OTP check — just feed it the code)

Expected result: Every major event sends a real email. Resend dashboard shows logs.
```

---

## MILESTONE C — Resume PDF Export
**Problem:** The resume builder has a `print()` function but it prints the whole page, not just the resume. There's no clean PDF download.
**Goal:** Download button generates a clean PDF of the EN or JP resume.
**Time:** 2–3 hours

```
[PASTE THE EXISTING ARCHITECTURE BLOCK ABOVE]

MILESTONE C: Clean PDF export from the resume builder.

CONTEXT:
- src/components/candidate/resume-builder.tsx has tab state: "edit" | "preview-ja" | "preview-en"
- src/components/candidate/resume-preview.tsx renders <JapaneseResume> and <EnglishResume>
  with className="resume-page" which already has print styles in globals.css
- Current print() button calls window.print() — prints the full page, not just the resume
- We need a server-side PDF generation approach using puppeteer or similar

APPROACH: Use @react-pdf/renderer for pure client-side PDF generation.
This avoids any server dependency and works in the browser.

STEP 1 — Install:
npm install @react-pdf/renderer
npm install -D @types/react-pdf

STEP 2 — Create src/lib/pdf-templates/english-resume-pdf.tsx:
A React PDF Document that mirrors the EnglishResume component.
Use @react-pdf/renderer primitives (Document, Page, View, Text, StyleSheet).
Match the visual layout of the existing resume-preview.tsx EnglishResume component.
Use colors: #1a1a1a for headings, #444 for body, #f59e0b for section accents.
Use fonts: Helvetica for English resume.
Section order: Personal Info → Languages → Education → Work Projects → Activities → Awards → Self-PR → Hobbies

STEP 3 — Create src/lib/pdf-templates/japanese-resume-pdf.tsx:
Japanese 履歴書 PDF Document.
Use @react-pdf/renderer with the same data structure as JapaneseResume.
For Japanese text rendering, register the Noto Sans JP font:
  Font.register({ family: 'NotoSansJP', src: '/fonts/NotoSansJP-Regular.ttf' })
Download Noto Sans JP from Google Fonts and place in public/fonts/.
Layout matches the Japanese table-based resume layout.

STEP 4 — Update src/components/candidate/resume-builder.tsx:
In the toolbar where print() is called, replace the single Print button
with two Download buttons:

import { PDFDownloadLink } from '@react-pdf/renderer'
import { EnglishResumePDF } from '@/lib/pdf-templates/english-resume-pdf'
import { JapaneseResumePDF } from '@/lib/pdf-templates/japanese-resume-pdf'

// In the toolbar JSX (near the existing Save and Printer buttons):
<PDFDownloadLink
  document={<EnglishResumePDF data={data} />}
  fileName={`${data.name || 'resume'}_EN.pdf`}
>
  {({ loading }) => (
    <Button variant="outline" size="sm" disabled={loading}>
      <Download className="h-4 w-4 mr-1.5" />
      {loading ? 'Generating...' : 'Download EN'}
    </Button>
  )}
</PDFDownloadLink>

<PDFDownloadLink
  document={<JapaneseResumePDF data={data} />}
  fileName={`${data.nameJa || data.name || 'resume'}_JP.pdf`}
>
  {({ loading }) => (
    <Button variant="outline" size="sm" disabled={loading}>
      <Download className="h-4 w-4 mr-1.5" />
      {loading ? '生成中...' : '履歴書 PDF'}
    </Button>
  )}
</PDFDownloadLink>

// Keep the existing window.print() button for print-to-PDF fallback

STEP 5 — Remove the old Printer button that called window.print()
OR keep it as "Print Preview" — user's choice. 
If kept, add @media print CSS to globals.css to hide everything except .resume-page.

Expected result: Clicking "Download EN" or "履歴書 PDF" downloads a clean,
formatted PDF of the resume data. No page chrome, no navbar, just the resume.
```

---

## MILESTONE D — Candidate Search for Companies
**Problem:** Companies can only see people who applied to THEIR jobs. There's no way to proactively find candidates.
**Goal:** New "Find Talent" tab in company dashboard — search all candidates by JLPT, skills, experience.
**Time:** 2–3 hours

```
[PASTE THE EXISTING ARCHITECTURE BLOCK ABOVE]

MILESTONE D: Candidate talent pool search for companies.

STEP 1 — Create src/app/api/candidates/search/route.ts (GET):
Auth: session must be COMPANY or ADMIN.
Query params:
  - jlptLevel: "N1"|"N2"|"N3"|"N4"|"N5"|"NONE"|"" (filter by JLPT)
  - skills: "React,Go,SQL" (comma-separated — match any)
  - minExp: number (minimum years experience)
  - search: string (searches fullName, bio, skills)
  - page: number (default 1), limit: number (default 12)

Query logic (Prisma):
  - Only return candidates where: user.isVerified = true AND resumeUrl IS NOT NULL
  - If jlptLevel: where.jlptLevel = jlptLevel
  - If minExp: where.experienceYears = { gte: minExp }
  - If search: where.OR = [{ fullName: { contains: search }}, { bio: { contains: search }}, { skills: { contains: search }}]
  - For skills filter (JSON string field): use SQLite's LIKE '%skill%' for each skill

Return CandidateProfileDTO[] with these fields ONLY (never expose user.email or auth data):
  id, fullName, jlptLevel, skills, experienceYears, bio, location, resumeUrl, photoUrl,
  education (first entry only), createdAt
DO NOT return: phone, linkedinUrl, email, userId, savedJobIds, resumeData, resumeName

Response: { candidates: CandidateDTO[], total, page, totalPages }

STEP 2 — Add new View to store:
In src/lib/store.ts, the companyTab type currently has:
  "overview" | "jobs" | "new" | "applicants" | "profile"
Add "talent" to this union:
  "overview" | "jobs" | "new" | "applicants" | "talent" | "profile"

STEP 3 — Add i18n keys to src/lib/i18n.ts (both en and ja sections):
en: {
  "dash.company.talent": "Find Talent",
  "dash.company.talent.search": "Search candidates",
  "dash.company.talent.jlpt": "JLPT Level",
  "dash.company.talent.exp": "Min. experience",
  "dash.company.talent.skills": "Skills",
  "dash.company.talent.empty": "No candidates match your filters.",
  "dash.company.talent.resume": "View Resume",
  "dash.company.talent.years": "yrs experience",
  "dash.company.talent.invite": "Invite to Apply",
}
ja: {
  "dash.company.talent": "人材を探す",
  "dash.company.talent.search": "候補者を検索",
  "dash.company.talent.jlpt": "JLPTレベル",
  "dash.company.talent.exp": "最低経験年数",
  "dash.company.talent.skills": "スキル",
  "dash.company.talent.empty": "条件に合う候補者が見つかりません。",
  "dash.company.talent.resume": "履歴書を見る",
  "dash.company.talent.years": "年の経験",
  "dash.company.talent.invite": "求人に招待",
}

STEP 4 — Update src/components/company/company-dashboard.tsx:
(This file is ~1600 lines. Add ONLY what's described — do not rewrite the file.)

a) Find the NavItem list array at the top of CompanyDashboard.
   Add after the "applicants" entry:
   { id: "talent", label: t("dash.company.talent"), icon: Users2 }
   (Import Users2 from lucide-react if not already imported)

b) Add the "talent" case in the tab switch/render section.
   Render a new <TalentSearch /> component (defined in same file or separate).

c) Create the TalentSearch component (can be in same file at the bottom):

function TalentSearch() {
  const { t, locale } = useT()
  const [search, setSearch] = useState("")
  const [jlpt, setJlpt] = useState("")
  const [minExp, setMinExp] = useState("")
  const [skills, setSkills] = useState("")
  const [page, setPage] = useState(1)
  const [results, setResults] = useState<CandidateDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<CandidateDTO | null>(null)

  async function fetchCandidates() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (jlpt) params.set("jlptLevel", jlpt)
      if (minExp) params.set("minExp", minExp)
      if (skills) params.set("skills", skills)
      params.set("page", String(page))
      const res = await api<{ candidates: CandidateDTO[]; total: number }>(`/api/candidates/search?${params}`)
      setResults(res.candidates)
      setTotal(res.total)
    } catch {
      toast.error("Failed to load candidates.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCandidates() }, [page, jlpt, minExp])

  // Debounced search on text input
  useEffect(() => {
    const t = setTimeout(fetchCandidates, 400)
    return () => clearTimeout(t)
  }, [search, skills])

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder={t("dash.company.talent.search")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={jlpt} onValueChange={setJlpt}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t("dash.company.talent.jlpt")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any JLPT</SelectItem>
            {JLPT_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={minExp} onValueChange={setMinExp}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("dash.company.talent.exp")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any experience</SelectItem>
            {[1,2,3,5,8].map(y => <SelectItem key={y} value={String(y)}>{y}+ years</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          placeholder="Skills (React, Go...)"
          value={skills}
          onChange={e => setSkills(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Results */}
      <div className="text-sm text-muted-foreground">{total} candidates found</div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : results.length === 0 ? (
        <EmptyState icon={Users2} title={t("dash.company.talent.empty")} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(c => (
            <CandidateCard key={c.id} candidate={c} onView={() => setSelected(c)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      {/* Candidate detail Sheet */}
      <Sheet open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          {selected && <CandidateDetailPanel candidate={selected} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function CandidateCard({ candidate, onView }: { candidate: CandidateDTO; onView: () => void }) {
  // Card showing: avatar (initials), name, JLPT badge, top 3 skills, experience, bio (truncated), "View Profile" button
  // Use same design as MetricCard / existing card styles (shadow-premium, rounded-xl, glass)
}

function CandidateDetailPanel({ candidate }: { candidate: CandidateDTO }) {
  // Full profile: name, JLPT, all skills, experience, bio, education, "View Resume" link
  // Resume link opens in new tab (candidate.resumeUrl)
}

STEP 5 — Define CandidateDTO type in src/lib/types.ts (add to existing types):
(Safe subset of CandidateProfileDTO — no private fields)
export interface CandidateTalentDTO {
  id: string
  fullName: string
  jlptLevel: JLPTLevel
  skills: string[]
  experienceYears: number
  bio: string | null
  location: string | null
  photoUrl: string | null
  resumeUrl: string | null
  education: EducationEntry[] | null
  createdAt: string
}

Expected result: Company dashboard has a "Find Talent" tab.
Companies can search 200+ candidates by JLPT, skills, experience.
Clicking a candidate shows their full profile in a slide-over panel.
```

---

## MILESTONE E — SEO, Security & Production Hardening
**Problem:** next.config.ts ignores TypeScript errors, no security headers, no sitemap, no OpenGraph. Not production-safe.
**Goal:** Fix all production blockers and add SEO infrastructure.
**Time:** 2 hours

```
[PASTE THE EXISTING ARCHITECTURE BLOCK ABOVE]

MILESTONE E: Security hardening, SEO, and production config.

STEP 1 — Fix next.config.ts:
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: { ignoreBuildErrors: false },  // CHANGED: fix all TS errors now
  reactStrictMode: true,                     // CHANGED: enable strict mode
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // needed for Next.js
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co",
              "connect-src 'self' https://*.supabase.co https://api.resend.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
export default nextConfig

STEP 2 — Add rate limiting to auth routes.
Create src/lib/rate-limit.ts:

const store = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const record = store.get(key)
  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true // allowed
  }
  if (record.count >= maxRequests) return false // blocked
  record.count++
  return true // allowed
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of store.entries()) {
    if (now > val.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

Add to src/app/api/auth/login/route.ts (top of POST handler):
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
    return err('Too many login attempts. Try again in 15 minutes.', 429)
  }

Add to src/app/api/auth/register/route.ts (top of POST handler):
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(`register:${ip}`, 3, 60 * 60 * 1000)) {
    return err('Too many registration attempts. Try again later.', 429)
  }

STEP 3 — Add SEO: sitemap and robots.

Create src/app/sitemap.ts:
import { db } from '@/lib/db'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await db.job.findMany({
    where: { isActive: true },
    select: { id: true, postedAt: true },
    orderBy: { postedAt: 'desc' },
  })
  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://indigate.work', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://indigate.work/?view=jobs', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://indigate.work/?view=about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://indigate.work/?view=for-companies', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://indigate.work/?view=contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]
  // NOTE: Since jobs are in SPA, we link to the root with a view param.
  // Google can crawl these if JavaScript rendering is enabled (Vercel handles this).
  const jobPages: MetadataRoute.Sitemap = jobs.map(job => ({
    url: `https://indigate.work/?view=job-detail&jobId=${job.id}`,
    lastModified: job.postedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))
  return [...staticPages, ...jobPages]
}

Update public/robots.txt:
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://indigate.work/sitemap.xml

STEP 4 — Update src/app/layout.tsx metadata:
In the existing layout.tsx, find the metadata export and upgrade it:
export const metadata: Metadata = {
  title: {
    default: 'IndiGate | India–Japan Talent Platform',
    template: '%s | IndiGate',
  },
  description: 'IndiGate connects Indian professionals with top Japanese companies. Browse jobs with visa sponsorship, JLPT-matched roles, and relocation support.',
  keywords: ['India Japan jobs', 'work in Japan', 'JLPT jobs', 'Indian talent Japan', 'IndiGate'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://indigate.work',
    siteName: 'IndiGate',
    title: 'IndiGate | India–Japan Talent Platform',
    description: 'Bridge your career to Japan. Find JLPT-matched jobs with visa sponsorship.',
    images: [{ url: 'https://indigate.work/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IndiGate | India–Japan Talent Platform',
    description: 'Bridge your career to Japan.',
    images: ['https://indigate.work/og-image.png'],
  },
  robots: { index: true, follow: true },
}

STEP 5 — Create public/og-image.png:
A 1200×630 OG image with:
- Saffron/crimson gradient background
- IndiGate logo text
- Tagline: "India × Japan Talent Platform"
- India and Japan flag emojis or icons
Create this as an SVG first, convert to PNG:
Create public/og-image.svg with the design above.
Then: bunx sharp public/og-image.svg -o public/og-image.png
(sharp is already a dependency)

STEP 6 — Fix TypeScript errors:
After changing ignoreBuildErrors to false, run:
  bunx tsc --noEmit
Fix any errors that appear. Common ones:
- bcryptjs types (already noted in worklog): add to devDeps or use @types/bcryptjs which is already installed
- Any 'any' types: replace with proper types from src/lib/types.ts

Expected result: Security headers in all responses, rate-limited auth, 
sitemap.xml accessible, OG image shows when shared on social media,
TypeScript compiles cleanly.
```

---

## MILESTONE F — Job Analytics for Companies
**Problem:** Companies have no insight into how their job listings perform. No view counts, no application rate, no time-to-hire.
**Goal:** Real job analytics in company dashboard — views, applies, funnel.
**Time:** 2 hours

```
[PASTE THE EXISTING ARCHITECTURE BLOCK ABOVE]

MILESTONE F: Job view tracking and analytics for companies.

STEP 1 — Add JobView model to prisma/schema.prisma:
model JobView {
  id        String   @id @default(cuid())
  jobId     String
  job       Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  sessionId String   // anonymous session ID (cookie), not user ID
  viewedAt  DateTime @default(now())

  @@index([jobId])
  @@index([sessionId])
  @@index([viewedAt])
}

Also add to Job model: views JobView[]
Then run: bun run db:push

STEP 2 — Create src/app/api/jobs/[id]/view/route.ts (POST):
- No auth required (anonymous views)
- Get or create anonymous session ID from cookie "ig_session_anon"
  If cookie doesn't exist, generate one: crypto.randomUUID()
  Set cookie with 1-year expiry
- Check if this sessionId already viewed this job in last 24 hours:
  const existing = await db.jobView.findFirst({
    where: { jobId: id, sessionId, viewedAt: { gte: new Date(Date.now() - 86400000) } }
  })
  If existing: return ok({ counted: false }) (deduplication)
- Create JobView record
- Return ok({ counted: true })

STEP 3 — Track job views: In src/components/jobs/job-detail-view.tsx,
find the useEffect or on-mount logic. Add:
  useEffect(() => {
    if (jobId) fetch(`/api/jobs/${jobId}/view`, { method: 'POST' }).catch(() => {})
  }, [jobId])
(Fire-and-forget, never block rendering)

STEP 4 — Create src/app/api/companies/me/analytics/route.ts (GET):
Auth: COMPANY role required.
Fetches analytics for all jobs belonging to this company:

For each job:
  - viewCount: db.jobView.count({ where: { jobId: job.id } })
  - viewsThisWeek: count where viewedAt >= 7 days ago
  - applicationCount: (already in job DTO)
  - conversionRate: (applicationCount / viewCount * 100).toFixed(1) + "%"
  - statusBreakdown: count by application status

Return:
{
  totalViews: number,
  totalApplications: number,
  averageConversion: string,
  jobs: Array<{
    id, title, isActive,
    viewCount, viewsThisWeek, applicationCount, conversionRate,
    statusBreakdown: { APPLIED, SHORTLISTED, INTERVIEWED, OFFERED, REJECTED }
  }>
}

STEP 5 — Add "Analytics" tab to company dashboard.
In src/components/company/company-dashboard.tsx:

a) Add to companyTab type in store (src/lib/store.ts):
   "overview" | "jobs" | "new" | "applicants" | "talent" | "analytics" | "profile"

b) Add NavItem: { id: "analytics", label: "Analytics", icon: BarChart2 }

c) Create Analytics component inside company-dashboard.tsx:

function Analytics() {
  // Fetch /api/companies/me/analytics
  // Show:
  // 1. Three top metric cards: Total Views, Total Applications, Avg. Conversion Rate
  // 2. BarChart (recharts) showing views vs applications per job (horizontal bar chart)
  // 3. Table: per-job breakdown with columns:
  //    Job Title | Views | Views/Week | Applications | Conversion | Status
  // Use the same MetricCard component from dashboard-shell.tsx
  // Use recharts BarChart with the same ChartContainer pattern as admin dashboard
}

Add i18n keys:
en: {
  "dash.company.analytics": "Analytics",
  "dash.company.analytics.views": "Total views",
  "dash.company.analytics.conversion": "Avg. conversion",
  "dash.company.analytics.thisweek": "Views this week",
  "dash.company.analytics.empty": "Analytics will appear once your jobs get views.",
}
ja: {
  "dash.company.analytics": "アナリティクス",
  "dash.company.analytics.views": "総閲覧数",
  "dash.company.analytics.conversion": "平均転換率",
  "dash.company.analytics.thisweek": "今週の閲覧数",
  "dash.company.analytics.empty": "求人が閲覧されるとアナリティクスが表示されます。",
}

Expected result: Every job detail view is counted. Company dashboard shows
a real analytics tab with view counts, applications, conversion rates per job.
```

---

## MILESTONE G — PostgreSQL Migration (Production Database)
**Problem:** SQLite is in-process and can't scale beyond a single server. Not suitable for Vercel's serverless architecture. Arrays/enums stored as strings.
**Goal:** Migrate to PostgreSQL on Supabase. Use native Postgres arrays and enums.
**Time:** 3–4 hours (mostly careful migration)

```
[PASTE THE EXISTING ARCHITECTURE BLOCK ABOVE]

MILESTONE G: Migrate database from SQLite to PostgreSQL (Supabase).

IMPORTANT: This is a careful migration. Read every step before executing.
The schema uses JSON strings for arrays because SQLite doesn't support arrays.
PostgreSQL supports native arrays — we upgrade them.

STEP 1 — Add Supabase PostgreSQL connection:
In Supabase dashboard → Settings → Database → Connection strings
Copy:
- Transaction mode URL (port 6543) → DATABASE_URL in .env
- Direct URL (port 5432) → DIRECT_URL in .env

Update .env:
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

STEP 2 — Update prisma/schema.prisma:
Change datasource:
  datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")
    directUrl = env("DIRECT_URL")
  }

Upgrade String[] fields to native Postgres arrays:
- CandidateProfile.skills:     String   @default("[]")  →  String[]  @default([])
- CandidateProfile.savedJobIds: String  @default("[]")  →  String[]  @default([])
- Job.skillsRequired:           String  @default("[]")  →  String[]  @default([])

Add native Postgres enums (optional but cleaner):
enum Role { CANDIDATE COMPANY ADMIN }
enum JLPTLevel { N1 N2 N3 N4 N5 NONE }
enum JobType { FULL_TIME PART_TIME INTERNSHIP CONTRACT }
enum SalaryType { HOURLY MONTHLY YEARLY }
enum ApplicationStatus { APPLIED SHORTLISTED INTERVIEWED OFFERED REJECTED WITHDRAWN }

Update all String fields that were enums:
  User.role: String → Role
  CandidateProfile.jlptLevel: String → JLPTLevel
  Job.jobType: String → JobType
  Job.jlptRequired: String → JLPTLevel
  Job.salaryType: String → SalaryType
  Application.status: String → ApplicationStatus

STEP 3 — Fix all JSON.parse() calls throughout the codebase.
Since skills, savedJobIds, skillsRequired are now native arrays, remove JSON.parse():
Search for: JSON.parse(candidate.skills) → candidate.skills (already an array)
Search for: JSON.parse(job.skillsRequired) → job.skillsRequired
Search for: JSON.stringify(skills) when saving → just pass the array directly

In src/lib/api.ts, find toCandidateDTO(), toJobDTO() mappers.
Update the JSON.parse() calls for array fields to direct use.
In Prisma queries that filter by skills (SQLite LIKE) → use Postgres containment:
  { skills: { hasSome: skillsArray } }   // Prisma Postgres array filter

STEP 4 — Run migration:
  npx prisma generate
  npx prisma db push
(This creates all tables on the Postgres DB)

STEP 5 — Re-seed the production Postgres DB:
  npx prisma db seed
(Run this once to create the demo data + admin account)

STEP 6 — Test locally connecting to Supabase:
  bun run dev
Test: login, browse jobs, apply, check admin panel — everything should work.
Fix any runtime errors from the array/enum type changes.

STEP 7 — Update Vercel environment variables:
In Vercel dashboard → your project → Settings → Environment Variables:
Set DATABASE_URL to the Transaction mode URL (port 6543)
Set DIRECT_URL to the Direct URL (port 5432)
Set all other env vars from .env

STEP 8 — Deploy to Vercel:
  bun run build
  vercel --prod
After deploy: verify at https://indigate.work

Expected result: Platform runs on PostgreSQL. Native arrays for skills.
Data persists across deploys. Multiple Vercel instances work simultaneously.
```

---

## MILESTONE H — Interview Scheduling + Visa Guide
**Problem:** When a company changes status to INTERVIEWED, there's no way to set an actual date/time. And the platform doesn't help candidates understand Japan's visa process — a key differentiator for IndiGate.
**Goal:** Interview date picker when shortlisting. Visa guide section on landing page.
**Time:** 3–4 hours

```
[PASTE THE EXISTING ARCHITECTURE BLOCK ABOVE]

MILESTONE H: Interview scheduling and Visa Guide resources.

PART 1: INTERVIEW SCHEDULING

STEP 1 — Add interviewDate and interviewNotes to Application model in schema.prisma:
model Application {
  ... (existing fields)
  interviewDate  DateTime?
  interviewNotes String?   // notes visible to candidate
}
Run: bun run db:push

STEP 2 — Update src/app/api/applications/[id]/status/route.ts:
When status is changed to INTERVIEWED, accept optional body fields:
  interviewDate: string (ISO date)
  interviewNotes: string (e.g. "Google Meet link: ...")
Update the Application record with these fields.

STEP 3 — In company-dashboard.tsx, in the applicants section:
When clicking "Schedule Interview" (status → INTERVIEWED), instead of
immediately updating, open a small Dialog/Popover first:

Dialog content:
  - DatePicker for interview date/time (use existing Calendar from shadcn/ui)
  - Textarea: "Interview notes (shared with candidate)"
    placeholder: "Include meeting link, format (video/in-person), duration..."
  - Confirm button → updates status to INTERVIEWED with date and notes

STEP 4 — In candidate-dashboard.tsx, in the Applications tab:
When an application has status=INTERVIEWED and interviewDate is set, show:
  - Interview date formatted: "Interview: [Day], [Date] at [Time] JST"
  - Interview notes in a light info box
  - Calendar icon button that adds to Google Calendar:
    href="https://www.google.com/calendar/event?action=TEMPLATE
          &text=Interview at [Company]
          &dates=[startTime]/[endTime]
          &details=[interviewNotes]"

STEP 5 — Update ApplicationDTO in src/lib/types.ts:
  interviewDate: string | null
  interviewNotes: string | null

Add i18n keys:
en: {
  "dash.apps.interview.date": "Interview scheduled",
  "dash.apps.interview.notes": "Interview details",
  "dash.apps.interview.calendar": "Add to Calendar",
  "dash.company.schedule.date": "Interview date & time",
  "dash.company.schedule.notes": "Notes for candidate",
  "dash.company.schedule.confirm": "Schedule Interview",
}
ja: {
  "dash.apps.interview.date": "面接日程",
  "dash.apps.interview.notes": "面接詳細",
  "dash.apps.interview.calendar": "カレンダーに追加",
  "dash.company.schedule.date": "面接日時",
  "dash.company.schedule.notes": "候補者へのメモ",
  "dash.company.schedule.confirm": "面接を設定",
}

---

PART 2: VISA GUIDE SECTION

STEP 6 — Create a new "Visa Guide" section on the landing page.
In src/components/landing/landing-page.tsx, add a new section after "How It Works":

The section should explain the 3 most common visa paths for Indian workers in Japan:
  a) Specified Skilled Worker (特定技能) Visa
     - Level: SSW Type 1 (1-4 years) or Type 2 (indefinite renewable)
     - Requires: JLPT N4+ and skills test for the specific industry
     - Industries: Manufacturing, Construction, Food service, Agriculture
     - Used for: Factory workers, production line staff
     
  b) Engineer / Specialist in Humanities Visa (技術・人文知識・国際業務)
     - Level: White-collar, highly educated
     - Requires: Bachelor's degree OR 10 years experience in the field
     - Industries: IT, Finance, Engineering, Translation/Interpretation
     - Used for: Software engineers, finance analysts, interpreters
     
  c) Intra-company Transfer Visa (企業内転勤)
     - For: Employees transferred from India office to Japan office
     - Requires: Working at the same company ≥ 1 year
     - Sponsored by: The Japanese company in the IndiGate network

Design: Use an expandable Accordion (shadcn Accordion is already installed).
Each visa type is one accordion item.
Inside each: brief description, requirements list, typical JLPT needed, IndiGate's role.
Add a "We handle all visa paperwork" callout box at the bottom.

i18n: Add all visa guide strings to both en and ja in src/lib/i18n.ts:
en: {
  "visa.title": "Understanding Japan Visa Types",
  "visa.subtitle": "IndiGate guides you through the right visa path for your career",
  "visa.ssw.title": "Specified Skilled Worker (SSW)",
  "visa.ssw.desc": "For skilled workers in manufacturing, construction, agriculture, and hospitality. Requires JLPT N4+ and a skills test.",
  "visa.engineer.title": "Engineer / Specialist Visa",
  "visa.engineer.desc": "For IT professionals, engineers, and business specialists. Requires a degree or 10 years experience.",
  "visa.transfer.title": "Intra-Company Transfer",
  "visa.transfer.desc": "For professionals transferring within a company from India to Japan.",
  "visa.support": "IndiGate handles all documentation, coordination with the Japanese Immigration Bureau, and pre-departure guidance.",
  "visa.cta": "Talk to our visa specialist",
}
ja: {
  "visa.title": "日本のビザの種類を理解する",
  "visa.subtitle": "IndiGateがあなたのキャリアに合ったビザ申請をサポートします",
  "visa.ssw.title": "特定技能ビザ",
  "visa.ssw.desc": "製造業、建設業、農業、飲食業などの技能労働者向け。JLPT N4以上と技能試験が必要。",
  "visa.engineer.title": "技術・人文知識・国際業務ビザ",
  "visa.engineer.desc": "ITエンジニア、専門家、ビジネス職向け。学士号または10年以上の経験が必要。",
  "visa.transfer.title": "企業内転勤ビザ",
  "visa.transfer.desc": "インドから日本の同一企業に転勤するプロフェッショナル向け。",
  "visa.support": "IndiGateは書類作成、出入国在留管理局との調整、渡航前ガイダンスをすべてサポートします。",
  "visa.cta": "ビザ専門家に相談する",
}

Expected result: When a company schedules an interview, the candidate sees
the date, notes, and can add it to Google Calendar.
Landing page has a professional visa guide section that differentiates
IndiGate from generic job boards.
```

---

## QUICK REFERENCE — What You've Built vs What's Left

### ✅ Already complete (don't regenerate):
- SPA architecture with Zustand view navigation
- Custom HMAC cookie auth + all auth flows
- SQLite Prisma schema (8 models, seed data)
- Bilingual i18n (EN + JA) — complete
- Landing page + all static pages
- Jobs listing with full filtering
- Job detail view + apply dialog
- Candidate dashboard: overview, profile, applications, saved jobs, resume upload UI
- Resume builder with EN/JP preview (print exists)
- Company dashboard: overview, post job, manage applicants, profile
- Admin panel: stats+charts, approve companies, manage all entities, CSV export
- Notification bell
- Framer Motion animations throughout
- Full shadcn/ui component library

### ❌ Gaps found in audit (fix these in order):
1. **MILESTONE A** — `/api/upload` route missing → file uploads broken for ALL users
2. **MILESTONE B** — No emails sent anywhere → silent failures, no password reset
3. **MILESTONE C** — Resume builder can't export clean PDFs
4. **MILESTONE D** — Companies can't proactively search candidates
5. **MILESTONE E** — Security headers, rate limiting, TypeScript errors hidden
6. **MILESTONE F** — No job view tracking or analytics
7. **MILESTONE G** — SQLite not suitable for production Vercel deployment
8. **MILESTONE H** — No interview scheduling, no visa guide (key differentiator)

### Priority order:
**This week:** A (upload) → B (email) → E (security)
**Next week:** C (PDF export) → D (talent search)
**Before launch:** G (PostgreSQL) → F (analytics) → H (interview + visa)

---

*IndiGate Production Upgrade Guide · Indobox Inc · Abhishek · June 2026*
