import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, toCandidateDTO, toCompanyDTO } from "@/lib/api";
import type { CandidateProfileDTO, CompanyProfileDTO } from "@/lib/types";

export async function GET() {
  const session = await getSession();
  if (!session) return ok({ user: null });
  const user = { ...session };
  let candidate: CandidateProfileDTO | null = null;
  let company: CompanyProfileDTO | null = null;
  if (session.role === "CANDIDATE") {
    const c = await db.candidateProfile.findUnique({
      where: { userId: session.id },
    });
    if (c) candidate = toCandidateDTO(c);
  } else if (session.role === "COMPANY") {
    const c = await db.companyProfile.findUnique({
      where: { userId: session.id },
    });
    if (c) company = toCompanyDTO(c);
  }
  return ok({ user, candidate, company });
}
