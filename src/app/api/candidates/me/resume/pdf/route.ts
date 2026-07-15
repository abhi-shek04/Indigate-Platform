import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { err, handleError } from "@/lib/api";
import { renderToBuffer, Font } from "@react-pdf/renderer";
import React from "react";
import path from "path";
import fs from "fs";
import { EnglishResumePDF } from "@/lib/pdf-templates/english-resume-pdf";
import { JapaneseResumePDF } from "@/lib/pdf-templates/japanese-resume-pdf";
import type { ResumeData } from "@/lib/resume-types";

// `renderToBuffer` expects a ReactElement<DocumentProps>; our template
// components return a `ReactElement<{ data: ResumeData }>`. The runtime
// content is identical (the template renders a <Document>), so we cast
// here to satisfy TypeScript without changing the template API.
type AnyPdfDocument = React.ReactElement<Record<string, unknown>>;

// Force the Node.js runtime — @react-pdf/renderer needs `fs`, `path`, `Buffer`.
export const runtime = "nodejs";
// PDF generation can take a couple of seconds for large resumes; allow up to 60s.
export const maxDuration = 60;

// Track whether the IPA Gothic font has been registered on this server instance.
let jpFontRegistered = false;

/**
 * Read the IPA Gothic font from the filesystem and register it as a base64
 * data URL with @react-pdf/renderer. Server-side, this is synchronous and
 * reliable — no fetch race condition like the old client-side preloader had.
 */
function ensureJpFontRegistered() {
  if (jpFontRegistered) return;
  // Try multiple paths — process.cwd() can return "/" in some Next.js dev setups.
  const candidates = [
    path.join(process.cwd(), "public", "fonts", "ipag.ttf"),
    path.join(process.env.PWD ?? "", "public", "fonts", "ipag.ttf"),
    "/home/z/my-project/public/fonts/ipag.ttf",
  ];
  let fontBuffer: Buffer | null = null;
  for (const p of candidates) {
    try {
      fontBuffer = fs.readFileSync(p);
      break;
    } catch {
      // try next
    }
  }
  if (!fontBuffer) throw new Error("Could not find ipag.ttf font file.");
  const fontBase64 = fontBuffer.toString("base64");
  Font.register({
    family: "NotoSansJP",
    src: `data:font/ttf;base64,${fontBase64}`,
  });
  jpFontRegistered = true;
}

/**
 * GET /api/candidates/me/resume/pdf?lang=en|ja
 *
 * Generates the candidate's resume PDF server-side and streams it back as a
 * downloadable attachment. Doing this on the server (rather than client-side
 * via `<PDFDownloadLink>`) eliminates the font-loading race condition that
 * caused garbled Japanese text (mojibake) — the font is loaded synchronously
 * from the filesystem before `renderToBuffer` is called.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CANDIDATE")
      return err("Candidate access required.", 403);

    const lang = req.nextUrl.searchParams.get("lang") ?? "en";
    if (lang !== "en" && lang !== "ja")
      return err("Invalid lang. Use ?lang=en or ?lang=ja", 400);

    // Load resume data from DB.
    const profile = await db.candidateProfile.findUnique({
      where: { userId: session.id },
      select: { resumeData: true, fullName: true },
    });
    if (!profile?.resumeData)
      return err("No resume data found. Please save your resume first.", 400);

    const data: ResumeData = JSON.parse(profile.resumeData);

    // Register the JP font from the filesystem — synchronous + reliable.
    // We always register it (even for the EN PDF) so the module-level
    // `Font.register` URL-src call in the JP template doesn't get a chance
    // to race us; the data URL wins because it's registered last.
    ensureJpFontRegistered();

    // Build the PDF document via React.createElement (no JSX needed here).
    const document =
      lang === "ja"
        ? (React.createElement(JapaneseResumePDF, { data }) as unknown as AnyPdfDocument)
        : (React.createElement(EnglishResumePDF, { data }) as unknown as AnyPdfDocument);

    const pdfBuffer = await renderToBuffer(document as never);

    const fileName =
      lang === "ja"
        ? `${profile.fullName || "resume"}_JP_履歴書.pdf`
        : `${profile.fullName || "resume"}_EN.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
