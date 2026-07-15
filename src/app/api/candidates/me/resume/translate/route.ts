import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";
import ZAI from "z-ai-web-dev-sdk";
import type { ResumeData } from "@/lib/resume-types";

/**
 * POST /api/candidates/me/resume/translate
 *
 * Takes the candidate's English resume data and uses the LLM to translate
 * every free-text field into Japanese, returning the `*Ja` fields that the
 * Japanese 履歴書 PDF template consumes. The English data is NOT modified —
 * only the Japanese-side fields are returned so the client can merge them.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CANDIDATE")
      return err("Candidate access required.", 403);

    // Accept an inline body OR fall back to the stored resumeData.
    let data: ResumeData | null = null;
    try {
      const body = await req.json();
      data = body as ResumeData;
    } catch {
      // no body — load from DB
    }
    if (!data) {
      const c = await db.candidateProfile.findUnique({
        where: { userId: session.id },
        select: { resumeData: true },
      });
      if (!c?.resumeData) return err("No resume data to translate.", 400);
      data = JSON.parse(c.resumeData) as ResumeData;
    }

    // Build a slim "English-only" payload so we don't waste tokens on Ja fields
    // or on fields the JP template doesn't use.
    const englishPayload = {
      name: data.name,
      currentDegree: data.currentDegree,
      expectedGraduation: data.expectedGraduation,
      address: data.address,
      education: data.education.map((e) => ({
        degree: e.degree,
        field: e.field,
        institution: e.institution,
      })),
      projects: data.projects.map((p) => ({
        name: p.name,
        description: p.description,
        techStack: p.techStack,
      })),
      activities: data.activities.map((a) => ({
        organization: a.organization,
        role: a.role,
        duties: a.duties,
        duration: a.duration,
      })),
      awards: data.awards.map((a) => ({
        title: a.title,
        description: a.description,
        organization: a.organization,
      })),
      skills: data.skills.map((s) => ({ name: s.name })),
      skillsExcelSummary: data.skillsExcelSummary,
      selfPr: data.selfPr,
      hobbies: data.hobbies,
    };

    const zai = await ZAI.create();

    const systemPrompt = `You are a professional Japanese resume (履歴書) translator. You translate English resume content into natural, professional Japanese suitable for a Japanese job application.

Rules:
1. Translate names into Katakana (e.g. "Abhishek" → "アビシェーク", "Arjun Sharma" → "アルジュン・シャルマ").
2. Translate institutions, degrees, fields, organizations, roles, project names, tech stacks, and descriptions into natural Japanese. Keep well-known proper nouns (AWS, React, MongoDB, etc.) in English.
3. Translate self-PR and hobbies into natural Japanese.
4. For tech stacks and skill names, keep technology names in English/Katakana but translate surrounding context.
5. Return ONLY a valid JSON object — no markdown, no explanation, no code fences.
6. The JSON object must have EXACTLY this shape (same array lengths as the input):
{
  "nameJa": "string (Katakana)",
  "currentDegreeJa": "string",
  "expectedGraduationJa": "string",
  "addressJa": "string",
  "education": [{ "degreeJa": "string", "fieldJa": "string", "institutionJa": "string" }],
  "projects": [{ "nameJa": "string", "descriptionJa": "string", "techStackJa": "string" }],
  "activities": [{ "organizationJa": "string", "roleJa": "string", "dutiesJa": "string", "durationJa": "string" }],
  "awards": [{ "titleJa": "string", "descriptionJa": "string", "organizationJa": "string" }],
  "skillsJa": ["string"],
  "skillsExcelSummaryJa": ["string"],
  "selfPrJa": "string",
  "hobbiesJa": "string"
}`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(englishPayload) },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) return err("Translation returned empty.", 502);

    // Strip any accidental markdown fences.
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    let translated: Record<string, unknown>;
    try {
      translated = JSON.parse(cleaned);
    } catch {
      return err("Translation returned invalid JSON.", 502);
    }

    return ok(translated);
  } catch (e) {
    return handleError(e);
  }
}
