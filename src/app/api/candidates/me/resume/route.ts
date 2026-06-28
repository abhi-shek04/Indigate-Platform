import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";
import { z } from "zod";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "CANDIDATE")
      return err("Unauthorized.", 401);
    const c = await db.candidateProfile.findUnique({
      where: { userId: session.id },
    });
    if (!c) return err("Profile not found.", 404);
    let resumeData = null;
    try {
      resumeData = c.resumeData ? JSON.parse(c.resumeData) : null;
    } catch {
      resumeData = null;
    }
    return ok({ resumeData });
  } catch (e) {
    return handleError(e);
  }
}

const educationSchema = z.object({
  year: z.string(),
  degree: z.string(),
  degreeJa: z.string().optional(),
  field: z.string(),
  fieldJa: z.string().optional(),
  institution: z.string(),
  institutionJa: z.string().optional(),
});

const projectSchema = z.object({
  period: z.string(),
  name: z.string(),
  nameJa: z.string().optional(),
  description: z.string(),
  descriptionJa: z.string().optional(),
  techStack: z.string().optional(),
});

const activitySchema = z.object({
  period: z.string(),
  duration: z.string().optional(),
  organization: z.string(),
  organizationJa: z.string().optional(),
  role: z.string(),
  roleJa: z.string().optional(),
  duties: z.string(),
  dutiesJa: z.string().optional(),
});

const awardSchema = z.object({
  year: z.string(),
  title: z.string(),
  titleJa: z.string().optional(),
  description: z.string(),
  descriptionJa: z.string().optional(),
  organization: z.string(),
  organizationJa: z.string().optional(),
});

const resumeSchema = z.object({
  name: z.string(),
  nameJa: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  email: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  nationality: z.string().optional(),
  placeOfOrigin: z.string().optional(),
  languages: z.array(z.string()).default([]),
  languagesJa: z.array(z.string()).default([]),
  education: z.array(educationSchema).default([]),
  projects: z.array(projectSchema).default([]),
  activities: z.array(activitySchema).default([]),
  awards: z.array(awardSchema).default([]),
  selfPr: z.string().optional(),
  selfPrJa: z.string().optional(),
  hobbies: z.string().optional(),
  hobbiesJa: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CANDIDATE")
      return err("Unauthorized.", 401);
    const body = await req.json().catch(() => null);
    const parsed = resumeSchema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid resume data.", 422);

    await db.candidateProfile.update({
      where: { userId: session.id },
      data: { resumeData: JSON.stringify(parsed.data) },
    });
    return ok({ saved: true });
  } catch (e) {
    return handleError(e);
  }
}
