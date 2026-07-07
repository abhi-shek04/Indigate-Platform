import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError, toJobDTO } from "@/lib/api";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 12)));
    const search = searchParams.get("search")?.trim() || "";
    const location = searchParams.get("location") || "";
    const jobType = searchParams.get("jobType") || "";
    const jlptLevel = searchParams.get("jlptLevel") || "";
    const salaryMin = Number(searchParams.get("salaryMin") || 0);
    const companyId = searchParams.get("companyId") || "";

    const where: Record<string, unknown> = { isActive: true };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { titleJa: { contains: search } },
        { description: { contains: search } },
        { skillsRequired: { contains: search } },
      ];
    }
    if (location) where.location = { contains: location };
    if (jobType) where.jobType = jobType;
    if (jlptLevel) where.jlptRequired = jlptLevel;
    if (salaryMin) where.salaryMin = { gte: salaryMin };
    if (companyId) where.companyId = companyId;

    const [total, rows] = await Promise.all([
      db.job.count({ where }),
      db.job.findMany({
        where,
        include: { company: true, applications: { select: { id: true } } },
        orderBy: { postedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const jobs = rows.map((j) => toJobDTO(j, j.applications.length));
    return ok({
      jobs,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (e) {
    return handleError(e);
  }
}

const createSchema = z.object({
  title: z.string().min(3),
  titleJa: z.string().optional(),
  description: z.string().min(50),
  descriptionJa: z.string().optional(),
  location: z.string().min(2),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"]),
  jlptRequired: z.enum(["N1", "N2", "N3", "N4", "N5", "NONE"]),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  salaryType: z.enum(["HOURLY", "MONTHLY", "YEARLY"]),
  skillsRequired: z.array(z.string()).default([]),
  deadline: z.string().optional(),
  companyId: z.string().optional(), // ADMIN only: post on behalf of a company
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);
    if (session.role !== "COMPANY" && session.role !== "ADMIN")
      return err("Only companies and admins can post jobs.", 403);

    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    // Determine which company to post under
    let companyId: string;
    if (session.role === "ADMIN") {
      // Admin can specify any approved company
      if (!parsed.data.companyId)
        return err("Admin must specify a companyId.", 422);
      const targetCompany = await db.companyProfile.findUnique({
        where: { id: parsed.data.companyId },
      });
      if (!targetCompany) return err("Company not found.", 404);
      if (!targetCompany.isApproved)
        return err("Target company is not approved.", 400);
      companyId = targetCompany.id;
    } else {
      // Company posts under their own profile
      const company = await db.companyProfile.findUnique({
        where: { userId: session.id },
      });
      if (!company) return err("Company profile not found.", 404);
      if (!company.isApproved)
        return err("Your company is pending admin approval.", 403);
      companyId = company.id;
    }

    const job = await db.job.create({
      data: {
        companyId,
        title: parsed.data.title,
        titleJa: parsed.data.titleJa || null,
        description: parsed.data.description,
        descriptionJa: parsed.data.descriptionJa || null,
        location: parsed.data.location,
        jobType: parsed.data.jobType,
        jlptRequired: parsed.data.jlptRequired,
        salaryMin: parsed.data.salaryMin ?? null,
        salaryMax: parsed.data.salaryMax ?? null,
        salaryType: parsed.data.salaryType,
        skillsRequired: JSON.stringify(parsed.data.skillsRequired),
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      },
      include: { company: true },
    });

    return ok(toJobDTO({ ...job, applications: [] }), 201);
  } catch (e) {
    return handleError(e);
  }
}
