import type { CandidateProfile, Job } from "@prisma/client";

export interface ScoreBreakdown {
  skills: number; // 0–100
  jlpt: number; // 0–100
  salary: number; // 0–100
  experience: number; // 0–100
}

const JLPT_RANK: Record<string, number> = {
  N5: 1,
  N4: 2,
  N3: 3,
  N2: 4,
  N1: 5,
};

/**
 * Compute a weighted match score (0–100) between a candidate and a job.
 * Weights: skills 55%, JLPT 30%, experience 15%.
 */
export function computeMatchScore(
  candidate: CandidateProfile,
  job: Job,
): { score: number; breakdown: ScoreBreakdown } {
  // 1. Skills — Jaccard similarity between candidate.skills and job.skillsRequired
  let cSkillsList: string[] = [];
  try {
    cSkillsList =
      typeof candidate.skills === "string"
        ? (JSON.parse(candidate.skills || "[]") as string[])
        : (candidate.skills as unknown as string[]) || [];
  } catch {
    cSkillsList = [];
  }
  const cSkills = new Set(
    cSkillsList.map((s) => String(s).toLowerCase().trim()).filter(Boolean),
  );

  let jSkillsList: string[] = [];
  try {
    jSkillsList =
      typeof job.skillsRequired === "string"
        ? (JSON.parse(job.skillsRequired || "[]") as string[])
        : (job.skillsRequired as unknown as string[]) || [];
  } catch {
    jSkillsList = [];
  }
  const jSkills = new Set(
    jSkillsList.map((s) => String(s).toLowerCase().trim()).filter(Boolean),
  );

  let skillsScore = 0;
  if (jSkills.size > 0) {
    const intersection = [...cSkills].filter((s) => jSkills.has(s)).length;
    const union = new Set([...cSkills, ...jSkills]).size;
    skillsScore = union > 0 ? (intersection / union) * 100 : 0;
    if ([...jSkills].every((s) => cSkills.has(s))) skillsScore = 100;
  } else {
    skillsScore = 50; // no skills required — neutral
  }

  // 2. JLPT — candidate level >= job requirement = full score; each level below = -25pts
  const cJlpt = JLPT_RANK[candidate.jlptLevel ?? ""] ?? 0;
  const jJlpt = JLPT_RANK[job.jlptRequired ?? ""] ?? 0;
  const jlptScore =
    jJlpt === 0
      ? 75 // job has no JLPT requirement — partial match
      : cJlpt >= jJlpt
        ? 100
        : Math.max(0, 100 - (jJlpt - cJlpt) * 25);

  // 3. Salary — check if job specifies salary range
  const salaryScore = job.salaryMin || job.salaryMax ? 75 : 70;

  // 4. Experience — no job.minExperience in schema; baseline 70 for all pairs
  // Candidate experienceYears provides mild boost
  const expYears = candidate.experienceYears ?? 0;
  const experienceScore = Math.min(100, Math.max(70, 70 + expYears * 5));

  const breakdown: ScoreBreakdown = {
    skills: Math.round(skillsScore),
    jlpt: Math.round(jlptScore),
    salary: Math.round(salaryScore),
    experience: Math.round(experienceScore),
  };

  const score = Math.round(
    breakdown.skills * 0.55 +
      breakdown.jlpt * 0.30 +
      breakdown.experience * 0.15,
  );

  return { score: Math.min(100, Math.max(0, score)), breakdown };
}
