import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";
import { generateText } from "ai";
import { getAIModel } from "@/lib/ai-provider";

/**
 * POST /api/candidates/me/resume/polish
 *
 * Takes a single text field from the resume and returns an AI-polished version.
 * Does NOT save to DB — the client decides whether to accept or discard.
 *
 * Body: { field: string, content: string, context?: string }
 * Returns: { polished: string }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CANDIDATE")
      return err("Candidate access required.", 403);

    const body = await req.json() as {
      field: string;
      content: string;
      context?: string;
    };

    if (!body.content?.trim()) return err("No content provided.", 400);
    if (body.content.trim().length < 10)
      return err("Content too short to polish.", 400);

    const fieldDescriptions: Record<string, string> = {
      selfPr:       "Self-PR / professional introduction for a resume",
      hobbies:      "Hobbies and personal interests section of a resume",
      projectDesc:  "Project description on a resume",
      activityDesc: "Work experience / internship description on a resume",
      awardDesc:    "Certification or achievement description on a resume",
      whyJapan:     "Motivation essay answering 'Why do you want to work in Japan?'",
      careerInJapan:"Career goal essay for working in Japan",
      challenges:   "Essay on challenges of adjusting to life in Japan",
      skillExcel:   "Description of skills I excel in",
    };

    const fieldDesc = fieldDescriptions[body.field] ?? "resume text";

    const systemPrompt = `You are an expert resume writer helping Indian candidates apply for jobs in Japan.
Your job is to polish and improve a specific text field from a resume.

Rules:
- Make the text more professional, concise, and impactful
- Use strong action verbs (Engineered, Developed, Designed, Led, Built, Achieved...)
- Remove filler words and redundancy
- Keep it in English (the candidate will translate to Japanese separately)
- Keep the same core facts — do NOT invent new achievements or skills
- Keep roughly the same length (±20% words) — do NOT add fluff to pad it
- Match the tone of a professional resume targeting Japanese multinational companies
- Return ONLY the polished text — no explanation, no quotes, no prefix like "Here is..."`;

    const userPrompt = `Polish this "${fieldDesc}":

---
${body.content.trim()}
---

${body.context ? `Context about the candidate: ${body.context}` : ""}`;

    const { text: polished } = await generateText({
      model: getAIModel(),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.4,
    });
    if (!polished) return err("AI returned empty response. Please try again.", 500);

    return ok({ polished });

  } catch (e) {
    return handleError(e);
  }
}
