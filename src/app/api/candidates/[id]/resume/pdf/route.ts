import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { err, handleError } from "@/lib/api";
import { renderToBuffer, Font } from "@react-pdf/renderer";
import React from "react";
import path from "path";
import fs from "fs";
import { EnglishResumePDF } from "@/lib/pdf-templates/english-resume-pdf";
import { JapaneseResumePDF } from "@/lib/pdf-templates/japanese-resume-pdf";
import type { ResumeData } from "@/lib/resume-types";

type AnyPdfDocument = React.ReactElement<Record<string, unknown>>;

export const runtime = "nodejs";
export const maxDuration = 60;

let jpFontRegistered = false;

function ensureJpFontRegistered() {
  if (jpFontRegistered) return;
  const candidates = [
    path.join(process.cwd(), "public", "fonts", "ipag.ttf"),
    path.join(process.env.PWD ?? "", "public", "fonts", "ipag.ttf"),
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
  if (!fontBuffer) return;
  const fontBase64 = fontBuffer.toString("base64");
  Font.register({
    family: "NotoSansJP",
    fonts: [
      { src: `data:font/ttf;base64,${fontBase64}`, fontWeight: "normal" },
      { src: `data:font/ttf;base64,${fontBase64}`, fontWeight: "bold" },
    ],
  });
  jpFontRegistered = true;
}

/**
 * GET /api/candidates/[id]/resume/pdf?lang=en|ja
 * Admin-only route to generate and download ANY candidate's resume PDF.
 * `[id]` can be either CandidateProfile.id or CandidateProfile.userId.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");

    const { id } = await params;
    const lang = req.nextUrl.searchParams.get("lang") ?? "en";
    if (lang !== "en" && lang !== "ja")
      return err("Invalid lang. Use ?lang=en or ?lang=ja", 400);

    // Find candidate by profile ID or user ID
    let profile = await db.candidateProfile.findUnique({
      where: { id },
      select: { resumeData: true, fullName: true },
    });
    if (!profile) {
      profile = await db.candidateProfile.findUnique({
        where: { userId: id },
        select: { resumeData: true, fullName: true },
      });
    }

    if (!profile?.resumeData)
      return err("No resume data found for this candidate.", 404);

    const data: ResumeData = JSON.parse(profile.resumeData);

    ensureJpFontRegistered();

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
