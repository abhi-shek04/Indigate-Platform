/**
 * AI Matching Engine — IndiGate
 *
 * Score-on-write architecture:
 *   • When a candidate profile is saved → scoreJobsForCandidate()
 *   • When a job goes active → scoreCandidatesForJob()
 *   • Scores are stored in MatchScore table and served instantly
 */
import { db } from "@/lib/db";
import { computeMatchScore } from "@/lib/match-score";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CandidateSnapshot {
  id: string;
  fullName: string;
  jlptLevel: string;
  skills: string[];
  experienceYears: number;
  bio: string;
  selfPr?: string;
  whyJapan?: string;
  location?: string;
}

interface JobSnapshot {
  id: string;
  title: string;
  description: string;
  jlptRequired: string;
  skillsRequired: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  location: string;
  jobType: string;
  company: { companyName: string; industry?: string | null };
}

const JLPT_ORDER: Record<string, number> = {
  NONE: 0,
  N5: 1,
  N4: 2,
  N3: 3,
  N2: 4,
  N1: 5,
};

function parseSkills(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((s) => String(s).trim()).filter(Boolean);
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
      } catch {
        /* fallback */
      }
    }
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}



// ─── Upsert a single score ────────────────────────────────────────────────────

async function upsertScore(result: { candidateId: string; jobId: string; score: number; breakdown: any }) {
  await db.matchScore.upsert({
    where: { candidateId_jobId: { candidateId: result.candidateId, jobId: result.jobId } },
    create: {
      candidateId: result.candidateId,
      jobId: result.jobId,
      score: result.score,
      breakdown: result.breakdown,
      jlptScore: result.breakdown.jlpt,
      skillScore: result.breakdown.skills,
      expScore: result.breakdown.experience,
      motivScore: result.breakdown.salary,
      computedAt: new Date(),
    },
    update: {
      score: result.score,
      breakdown: result.breakdown,
      jlptScore: result.breakdown.jlpt,
      skillScore: result.breakdown.skills,
      expScore: result.breakdown.experience,
      motivScore: result.breakdown.salary,
      computedAt: new Date(),
    },
  });
}

// ─── PUBLIC: score all active jobs for one candidate ─────────────────────────
// Called when: candidate saves profile, candidate registers, admin triggers

export async function scoreJobsForCandidate(candidateId: string): Promise<void> {
  const profile = await db.candidateProfile.findUnique({
    where: { id: candidateId },
    include: { user: { select: { email: true } } },
  });
  if (!profile) return;

  // Parse skills and resume data
  const skills: string[] = parseSkills(profile.skills);

  let selfPr: string | undefined;
  let whyJapan: string | undefined;
  try {
    if (profile.resumeData) {
      const rd = JSON.parse(profile.resumeData) as { selfPr?: string; japanMotivation?: { whyJapan?: string } };
      selfPr = rd.selfPr;
      whyJapan = rd.japanMotivation?.whyJapan;
    }
  } catch { /* ignore */ }

  const candidate: CandidateSnapshot = {
    id: candidateId,
    fullName: profile.fullName,
    jlptLevel: profile.jlptLevel,
    skills,
    experienceYears: profile.experienceYears,
    bio: profile.bio ?? "",
    selfPr,
    whyJapan,
    location: profile.location ?? undefined,
  };

  // Fetch top 60 active jobs, JLPT pre-filtered first
  const jobs = await db.job.findMany({
    where: { isActive: true },
    orderBy: { postedAt: "desc" },
    take: 60,
    include: { company: { select: { companyName: true, industry: true } } },
  });

  // Pre-filter: remove jobs where JLPT gap > 2 levels (hopeless mismatch)
  const candidateJlpt = JLPT_ORDER[candidate.jlptLevel] ?? 0;
  const preFiltered = jobs.filter((j) => {
    const req = JLPT_ORDER[j.jlptRequired] ?? 0;
    return req === 0 || candidateJlpt >= req - 2;
  });

  // Score in batches of 5 (rate limiting)
  const BATCH_SIZE = 5;
  for (let i = 0; i < preFiltered.length; i += BATCH_SIZE) {
    const batch = preFiltered.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (job) => {
        const jobSnap: JobSnapshot = {
          id: job.id,
          title: job.title,
          description: job.description,
          jlptRequired: job.jlptRequired,
          skillsRequired: parseSkills(job.skillsRequired),
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          location: job.location,
          jobType: job.jobType,
          company: { companyName: job.company.companyName, industry: job.company.industry },
        };
        try {
          const cProf = await db.candidateProfile.findUnique({ where: { id: candidateId } });
          const jProf = await db.job.findUnique({ where: { id: job.id } });
          if (cProf && jProf) {
            const { score, breakdown } = computeMatchScore(cProf, jProf);
            await upsertScore({ candidateId, jobId: job.id, score, breakdown: breakdown as any });
          }
        } catch { /* individual failure doesn't stop batch */ }
      }),
    );
    // 300ms pause between batches to avoid rate limits
    if (i + BATCH_SIZE < preFiltered.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
}

// ─── PUBLIC: score all active candidates for one job ─────────────────────────
// Called when: job goes active, job description updated

export async function scoreCandidatesForJob(jobId: string): Promise<void> {
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { company: { select: { companyName: true, industry: true } } },
  });
  if (!job || !job.company) return;

  const jobSnap: JobSnapshot = {
    id: jobId,
    title: job.title,
    description: job.description,
    jlptRequired: job.jlptRequired,
    skillsRequired: parseSkills(job.skillsRequired),
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    location: job.location,
    jobType: job.jobType,
    company: { companyName: job.company.companyName, industry: job.company.industry },
  };

  // Fetch top 100 open-to-work candidates
  const jobJlpt = JLPT_ORDER[job.jlptRequired] ?? 0;
  const candidates = await db.candidateProfile.findMany({
    where: { openToWork: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  // Pre-filter: JLPT gap ≤ 2
  const preFiltered = candidates.filter((c) => {
    const cl = JLPT_ORDER[c.jlptLevel] ?? 0;
    return jobJlpt === 0 || cl >= jobJlpt - 2;
  });

  const BATCH_SIZE = 5;
  for (let i = 0; i < preFiltered.length; i += BATCH_SIZE) {
    const batch = preFiltered.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (profile) => {
        const skills: string[] = parseSkills(profile.skills);
        let selfPr: string | undefined;
        let whyJapan: string | undefined;
        try {
          if (profile.resumeData) {
            const rd = JSON.parse(profile.resumeData) as { selfPr?: string; japanMotivation?: { whyJapan?: string } };
            selfPr = rd.selfPr;
            whyJapan = rd.japanMotivation?.whyJapan;
          }
        } catch { /* ignore */ }

        const candidate: CandidateSnapshot = {
          id: profile.id,
          fullName: profile.fullName,
          jlptLevel: profile.jlptLevel,
          skills,
          experienceYears: profile.experienceYears,
          bio: profile.bio ?? "",
          selfPr,
          whyJapan,
          location: profile.location ?? undefined,
        };

        try {
          const jProf = await db.job.findUnique({ where: { id: jobId } });
          if (jProf) {
            const { score, breakdown } = computeMatchScore(profile, jProf);
            await upsertScore({ candidateId: profile.id, jobId, score, breakdown: breakdown as any });
          }
        } catch { /* continue */ }
      }),
    );
    if (i + BATCH_SIZE < preFiltered.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
}

// ─── PUBLIC: get top matches for a candidate (read-path, instant) ─────────────

export async function getTopJobMatchesForCandidate(
  candidateId: string,
  limit = 10,
): Promise<Array<{ jobId: string; score: number; reasons: string[] }>> {
  const scores = await db.matchScore.findMany({
    where: { candidateId, score: { gte: 30 } }, // min 30% match
    orderBy: { score: "desc" },
    take: limit,
    select: { jobId: true, score: true, reasons: true },
  });
  return scores.map((s) => ({
    jobId: s.jobId,
    score: s.score,
    reasons: (() => { try { return JSON.parse(s.reasons) as string[]; } catch { return []; } })(),
  }));
}

// ─── PUBLIC: get top candidates for a job (company ATS read-path) ─────────────

export async function getTopCandidateMatchesForJob(
  jobId: string,
  limit = 20,
): Promise<Array<{ candidateId: string; score: number; reasons: string[] }>> {
  const scores = await db.matchScore.findMany({
    where: { jobId, score: { gte: 25 } },
    orderBy: { score: "desc" },
    take: limit,
    select: { candidateId: true, score: true, reasons: true },
  });
  return scores.map((s) => ({
    candidateId: s.candidateId,
    score: s.score,
    reasons: (() => { try { return JSON.parse(s.reasons) as string[]; } catch { return []; } })(),
  }));
}
