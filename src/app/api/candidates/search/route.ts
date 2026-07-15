import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";

/**
 * Candidate talent-pool search — COMPANY or ADMIN only.
 * Returns a safe subset of candidate profiles (no private fields).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);
    if (session.role !== "COMPANY" && session.role !== "ADMIN")
      return err("Only companies and admins can search candidates.", 403);

    const { searchParams } = new URL(req.url);
    const jlptLevel = searchParams.get("jlptLevel") || "";
    const skillsParam = searchParams.get("skills") || "";
    const minExp = Number(searchParams.get("minExp") || 0);
    const search = searchParams.get("search")?.trim() || "";
    const openToWorkOnly = searchParams.get("openToWork") === "true";
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 12)));

    // Build where clause — only show verified candidates with EITHER an
    // uploaded PDF resume OR a resume-builder JSON resume.
    const where: Record<string, unknown> = {
      user: { isVerified: true },
      OR: [
        { resumeUrl: { not: null } },
        { resumeData: { not: null } },
      ],
    };

    if (openToWorkOnly) where.openToWork = true;

    if (jlptLevel) where.jlptLevel = jlptLevel;
    if (minExp) where.experienceYears = { gte: minExp };

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { bio: { contains: search } },
        { skills: { contains: search } },
        { location: { contains: search } },
      ];
    }

    // Skills filter — JSON string field, use LIKE for each skill
    const skills = skillsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (skills.length > 0) {
      // SQLite: combine with AND on skills containing each skill string
      where.AND = skills.map((s) => ({ skills: { contains: s } }));
    }

    const [total, rows] = await Promise.all([
      db.candidateProfile.count({ where }),
      db.candidateProfile.findMany({
        where,
        orderBy: [{ experienceYears: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          fullName: true,
          jlptLevel: true,
          skills: true,
          experienceYears: true,
          bio: true,
          location: true,
          photoUrl: true,
          resumeUrl: true,
          resumeData: true,
          education: true,
          openToWork: true,
          createdAt: true,
        },
      }),
    ]);

    // Map to safe DTO — NEVER expose resumeUrl, phone, email, userId
    const candidates = rows.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      jlptLevel: c.jlptLevel,
      skills: safeParseArray(c.skills),
      experienceYears: c.experienceYears,
      bio: c.bio,
      location: c.location,
      photoUrl: c.photoUrl,
      hasResume: Boolean(c.resumeUrl || c.resumeData), // builder OR uploaded PDF
      educationCount: c.education ? safeParseArray(c.education).length : 0,
      openToWork: c.openToWork,
      createdAt: c.createdAt.toISOString(),
    }));

    return ok({
      candidates,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (e) {
    return handleError(e);
  }
}

function safeParseArray(v: string): string[] {
  try {
    const arr = JSON.parse(v);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
