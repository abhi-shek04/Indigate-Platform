import type { JobDTO } from "@/lib/types";

const JLPT_RANK: Record<string, number> = {
  N1: 5,
  N2: 4,
  N3: 3,
  N4: 2,
  N5: 1,
  NONE: 0,
};

export interface MatchResult {
  score: number; // 0–100
  badge: string | null; // "⭐ Best Match" | "🔥 Highly Recommended" | "👍 Good Match" | null
  reasons: string[];
  matchedSkills: string[];
  jlptMatched: boolean;
  locationMatched: boolean;
}

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
        // fallback to split
      }
    }
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function matchJob(
  job: JobDTO,
  profile: {
    skills: string[] | string;
    jlptLevel: string;
    experienceYears: number;
    location?: string | null;
  } | null
): MatchResult {
  if (!profile) {
    return {
      score: 0,
      badge: null,
      reasons: [],
      matchedSkills: [],
      jlptMatched: false,
      locationMatched: false,
    };
  }

  const reasons: string[] = [];
  let score = 0;

  // 1. Skill Matching (40 points max)
  const jobSkills = parseSkills(job.skillsRequired);
  const candidateSkills = parseSkills(profile.skills);
  const matchedSkills: string[] = [];

  if (jobSkills.length > 0) {
    const candidateLower = candidateSkills.map((s) => s.toLowerCase());
    for (const js of jobSkills) {
      const jsLower = js.toLowerCase();
      if (candidateLower.some((cs) => cs.includes(jsLower) || jsLower.includes(cs))) {
        matchedSkills.push(js);
      }
    }
    const skillRatio = matchedSkills.length / jobSkills.length;
    const skillScore = Math.round(skillRatio * 40);
    score += skillScore;

    if (matchedSkills.length > 0) {
      reasons.push(`${matchedSkills.length}/${jobSkills.length} required skills matched (${matchedSkills.slice(0, 3).join(", ")})`);
    } else {
      reasons.push(`0/${jobSkills.length} required skills matched`);
    }
  } else {
    score += 30; // Partial credit if no specific skills specified on job
    reasons.push("Flexible skill requirement");
  }

  // 2. JLPT Language Matching (30 points max)
  const candidateRank = JLPT_RANK[profile.jlptLevel?.toUpperCase()] ?? 0;
  const requiredRank = JLPT_RANK[job.jlptRequired?.toUpperCase()] ?? 0;
  let jlptMatched = false;

  if (requiredRank === 0) {
    score += 30;
    jlptMatched = true;
    reasons.push("No Japanese requirement");
  } else if (candidateRank >= requiredRank) {
    score += 30;
    jlptMatched = true;
    reasons.push(`JLPT ${profile.jlptLevel} meets ${job.jlptRequired} requirement`);
  } else if (candidateRank === requiredRank - 1) {
    score += 15;
    reasons.push(`JLPT ${profile.jlptLevel} is 1 level below required ${job.jlptRequired}`);
  } else {
    reasons.push(`JLPT ${profile.jlptLevel} does not meet ${job.jlptRequired} requirement`);
  }

  // 3. Experience Level Matching (20 points max)
  const expYears = Number(profile.experienceYears) || 0;
  const expScore = Math.min(expYears * 4, 20);
  score += expScore;
  if (expYears > 0) {
    reasons.push(`${expYears} year(s) professional experience`);
  }

  // 4. Location Match (10 points max)
  let locationMatched = false;
  const candidateLoc = (profile.location || "").toLowerCase().trim();
  const jobLoc = (job.location || "").toLowerCase().trim();

  if (candidateLoc && jobLoc && (jobLoc.includes(candidateLoc) || candidateLoc.includes(jobLoc))) {
    score += 10;
    locationMatched = true;
    reasons.push(`Target location match (${job.location})`);
  } else {
    score += 5; // Default partial for Japan position
  }

  const finalScore = Math.min(Math.round(score), 100);
  let badge: string | null = null;
  if (finalScore >= 85) badge = "⭐ Best Match";
  else if (finalScore >= 70) badge = "🔥 Recommended";
  else if (finalScore >= 50) badge = "👍 Good Match";

  return {
    score: finalScore,
    badge,
    reasons,
    matchedSkills,
    jlptMatched,
    locationMatched,
  };
}
