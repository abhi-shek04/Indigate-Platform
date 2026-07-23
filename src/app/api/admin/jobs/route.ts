import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseBody, ok, err, handleError, toJobDTO } from "@/lib/api";
import { z } from "zod";

// GET — all jobs with company + application count (admin only)
export async function GET() {
  try {
    await requireRole("ADMIN");
    const jobs = await db.job.findMany({
      include: {
        company: true,
        applications: { select: { id: true } },
      },
      orderBy: { postedAt: "desc" },
    });
    return ok({
      jobs: jobs.map((j) => toJobDTO(j, j.applications.length)),
    });
  } catch (e) {
    return handleError(e);
  }
}

const createSchema = z.object({
  companyName: z.string().min(2),
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
  isActive: z.boolean().optional(),
});

// POST — admin creates a job on behalf of any company (auto-creates if needed)
export async function POST(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const body = await parseBody(req);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    let company = await db.companyProfile.findFirst({
      where: { companyName: parsed.data.companyName },
    });

    if (!company) {
      // Auto-create dummy user and company
      const dummyUser = await db.user.create({
        data: {
          email: `system_company_${Date.now()}@indigate.work`,
          role: "COMPANY",
          isVerified: true,
        },
      });
      company = await db.companyProfile.create({
        data: {
          userId: dummyUser.id,
          companyName: parsed.data.companyName,
          isApproved: true,
        },
      });
    } else if (!company.isApproved) {
      company = await db.companyProfile.update({
        where: { id: company.id },
        data: { isApproved: true },
      });
    }

    const job = await db.job.create({
      data: {
        companyId: company.id,
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
        isActive: parsed.data.isActive ?? true,
      },
      include: { company: true, applications: { select: { id: true } } },
    });

    return ok(toJobDTO(job, 0), 201);
  } catch (e) {
    return handleError(e);
  }
}
