import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseBody, ok, err, handleError, toCandidateDTO } from "@/lib/api";
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
    return ok(toCandidateDTO(c));
  } catch (e) {
    return handleError(e);
  }
}

const schema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  location: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  jlptLevel: z.enum(["N1", "N2", "N3", "N4", "N5", "NONE"]).optional(),
  skills: z.array(z.string()).optional(),
  experienceYears: z.number().int().min(0).optional(),
  education: z
    .array(
      z.object({
        degree: z.string(),
        field: z.string(),
        institution: z.string(),
        year: z.string(),
      }),
    )
    .nullable()
    .optional(),
  photoUrl: z.string().nullable().optional(),
  resumeUrl: z.string().nullable().optional(),
  resumeName: z.string().nullable().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CANDIDATE")
      return err("Unauthorized.", 401);
    const body = await parseBody(req);
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const data: Record<string, unknown> = {};
    const d = parsed.data;
    if (d.fullName !== undefined) data.fullName = d.fullName;
    if (d.phone !== undefined) data.phone = d.phone;
    if (d.bio !== undefined) data.bio = d.bio;
    if (d.location !== undefined) data.location = d.location;
    if (d.linkedinUrl !== undefined) data.linkedinUrl = d.linkedinUrl;
    if (d.jlptLevel !== undefined) data.jlptLevel = d.jlptLevel;
    if (d.skills !== undefined) data.skills = JSON.stringify(d.skills);
    if (d.experienceYears !== undefined) data.experienceYears = d.experienceYears;
    if (d.education !== undefined) data.education = d.education ? JSON.stringify(d.education) : null;
    if (d.photoUrl !== undefined) data.photoUrl = d.photoUrl;
    if (d.resumeUrl !== undefined) data.resumeUrl = d.resumeUrl;
    if (d.resumeName !== undefined) data.resumeName = d.resumeName;

    const updated = await db.candidateProfile.update({
      where: { userId: session.id },
      data,
    });
    return ok(toCandidateDTO(updated));
  } catch (e) {
    return handleError(e);
  }
}
