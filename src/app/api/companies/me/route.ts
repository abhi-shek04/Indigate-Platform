import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseBody, ok, err, handleError, toCompanyDTO } from "@/lib/api";
import { z } from "zod";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "COMPANY")
      return err("Unauthorized.", 401);
    const c = await db.companyProfile.findUnique({
      where: { userId: session.id },
    });
    if (!c) return err("Profile not found.", 404);
    return ok(toCompanyDTO(c));
  } catch (e) {
    return handleError(e);
  }
}

const schema = z.object({
  companyName: z.string().min(2).optional(),
  industry: z.string().nullable().optional(),
  locationJapan: z.string().nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  website: z.string().nullable().optional(),
  employeeCount: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "COMPANY")
      return err("Unauthorized.", 401);
    const body = await parseBody(req);
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const updated = await db.companyProfile.update({
      where: { userId: session.id },
      data: parsed.data,
    });
    return ok(toCompanyDTO(updated));
  } catch (e) {
    return handleError(e);
  }
}
