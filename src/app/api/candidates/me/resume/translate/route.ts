import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";
import ZAI from "z-ai-web-dev-sdk";
import type { ResumeData } from "@/lib/resume-types";

/**
 * POST /api/candidates/me/resume/translate
 *
 * Loads the candidate's saved English resume from the DB, calls the LLM to
 * translate every free-text field into Japanese, merges the `*Ja` fields
 * back into the full ResumeData, saves it to the DB, and returns the
 * complete updated resume data so the client can replace its state.
 *
 * Personal info (name, email, phone, DOB) is kept as-is — only descriptions,
 * project summaries, self-PR, hobbies, and motivation essays are translated.
 */
export async function POST(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CANDIDATE")
      return err("Candidate access required.", 403);

    // 1. Load the saved resume data from the DB.
    const profile = await db.candidateProfile.findUnique({
      where: { userId: session.id },
      select: { resumeData: true },
    });
    if (!profile?.resumeData)
      return err("No resume data found. Please save your resume first.", 400);

    const data: ResumeData = JSON.parse(profile.resumeData) as ResumeData;

    // 2. Build a slim "English-only" payload of translatable fields.
    const translatable = {
      selfPr: data.selfPr ?? "",
      hobbies: data.hobbies ?? "",
      japanMotivation: {
        whyJapan: data.japanMotivation?.whyJapan ?? "",
        careerInJapan: data.japanMotivation?.careerInJapan ?? "",
        challenges: data.japanMotivation?.challenges ?? "",
      },
      projects: data.projects.map((p) => ({
        name: p.name,
        description: p.description,
      })),
      activities: data.activities.map((a) => ({
        organization: a.organization,
        role: a.role,
        duties: a.duties,
      })),
      awards: data.awards.map((aw) => ({
        title: aw.title,
        description: aw.description,
        organization: aw.organization,
      })),
      education: data.education.map((e) => ({
        degree: e.degree,
        field: e.field,
        institution: e.institution,
      })),
    };

    // 3. Call the LLM with a strict system prompt.
    const zai = await ZAI.create();
    const systemPrompt = `You are a professional Japanese resume (履歴書) translator specializing in career documents for Indian candidates applying to Japanese companies.

Translate the provided JSON fields from English to natural, professional Japanese.

Rules:
- Translate naturally — use formal polite style (丁寧語) for self-PR and motivation essays.
- Names: translate into Katakana (e.g. "Arjun Sharma" → "アルジュン・シャルマ").
- Keep proper nouns (technology names like "React", "Python", "AWS", university names like "SRM University") in their original English form.
- For education degrees, translate the degree level naturally (e.g. "Bachelor of Technology" → "工学学士").
- Keep numeric values (years, months, version numbers) as-is.
- If a field is empty or just whitespace, return it as an empty string "".
- Return ONLY valid JSON — no explanation, no markdown, no code fences.

Return a JSON object with EXACTLY this shape (same array lengths as the input):
{
  "nameJa": "string (Katakana reading of the name)",
  "selfPrJa": "string",
  "hobbiesJa": "string",
  "japanMotivation": { "whyJapan": "string", "careerInJapan": "string", "challenges": "string" },
  "projects": [{ "nameJa": "string", "descriptionJa": "string" }],
  "activities": [{ "organizationJa": "string", "roleJa": "string", "dutiesJa": "string" }],
  "awards": [{ "titleJa": "string", "descriptionJa": "string", "organizationJa": "string" }],
  "education": [{ "degreeJa": "string", "fieldJa": "string", "institutionJa": "string" }]
}`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(translatable, null, 2) },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) return err("AI returned an empty response. Please try again.", 502);

    // Strip any accidental markdown fences.
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    let t: {
      nameJa?: string;
      selfPrJa?: string;
      hobbiesJa?: string;
      japanMotivation?: { whyJapan?: string; careerInJapan?: string; challenges?: string };
      projects?: { nameJa?: string; descriptionJa?: string }[];
      activities?: { organizationJa?: string; roleJa?: string; dutiesJa?: string }[];
      awards?: { titleJa?: string; descriptionJa?: string; organizationJa?: string }[];
      education?: { degreeJa?: string; fieldJa?: string; institutionJa?: string }[];
    };
    try {
      t = JSON.parse(cleaned);
    } catch {
      return err("AI returned invalid JSON. Please try again.", 502);
    }

    // 4. Merge translated fields into the full resume data.
    const updatedData: ResumeData = {
      ...data,
      nameJa: t.nameJa || data.nameJa,
      selfPrJa: t.selfPrJa || data.selfPrJa,
      hobbiesJa: t.hobbiesJa || data.hobbiesJa,
      // Save translated Japan motivation essays in a SEPARATE field so the
      // English resume keeps the English originals.
      japanMotivationJa: {
        whyJapan: t.japanMotivation?.whyJapan || data.japanMotivationJa?.whyJapan || "",
        careerInJapan: t.japanMotivation?.careerInJapan || data.japanMotivationJa?.careerInJapan || "",
        challenges: t.japanMotivation?.challenges || data.japanMotivationJa?.challenges || "",
      },
      projects: data.projects.map((p, i) => ({
        ...p,
        nameJa: t.projects?.[i]?.nameJa || p.nameJa || "",
        descriptionJa: t.projects?.[i]?.descriptionJa || p.descriptionJa || "",
      })),
      activities: data.activities.map((a, i) => ({
        ...a,
        organizationJa: t.activities?.[i]?.organizationJa || a.organizationJa || "",
        roleJa: t.activities?.[i]?.roleJa || a.roleJa || "",
        dutiesJa: t.activities?.[i]?.dutiesJa || a.dutiesJa || "",
      })),
      awards: data.awards.map((aw, i) => ({
        ...aw,
        titleJa: t.awards?.[i]?.titleJa || aw.titleJa || "",
        descriptionJa: t.awards?.[i]?.descriptionJa || aw.descriptionJa || "",
        organizationJa: t.awards?.[i]?.organizationJa || aw.organizationJa || "",
      })),
      education: data.education.map((e, i) => ({
        ...e,
        degreeJa: t.education?.[i]?.degreeJa || e.degreeJa || "",
        fieldJa: t.education?.[i]?.fieldJa || e.fieldJa || "",
        institutionJa: t.education?.[i]?.institutionJa || e.institutionJa || "",
      })),
    };

    // 5. Save the translated data back to the DB.
    await db.candidateProfile.update({
      where: { userId: session.id },
      data: { resumeData: JSON.stringify(updatedData) },
    });

    return ok({ resumeData: updatedData });
  } catch (e) {
    return handleError(e);
  }
}
