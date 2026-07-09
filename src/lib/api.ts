import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import type {
  ApplicationDTO,
  ApplicationStatus,
  CandidateProfileDTO,
  CompanyProfileDTO,
  EducationEntry,
  JobDTO,
  NotificationDTO,
  TestimonialDTO,
} from "@/lib/types";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Map thrown errors to HTTP responses. Recognises sentinel messages
 * "UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND" thrown by `requireSession` /
 * `requireRole` and maps them to the appropriate status codes.
 */
export function handleError(e: unknown) {
  if (e instanceof Error) {
    if (e.message === "UNAUTHORIZED")
      return err("Unauthorized. Please log in.", 401);
    if (e.message === "FORBIDDEN")
      return err("You don't have permission to do that.", 403);
    if (e.message === "NOT_FOUND") return err("Not found.", 404);
    return err(e.message, 400);
  }
  return err("Internal server error", 500);
}

/**
 * Safely parse a request body as JSON. Returns `null` if the body is missing
 * or not valid JSON.
 */
export async function parseBody<T = unknown>(
  req: NextRequest,
): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

function parseJson<T = unknown>(v: string | null, fallback: T): T {
  if (!v) return fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

export function toCompanyDTO(c: {
  id: string;
  userId: string;
  companyName: string;
  industry: string | null;
  locationJapan: string | null;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  employeeCount: string | null;
  isApproved: boolean;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): CompanyProfileDTO {
  return {
    id: c.id,
    userId: c.userId,
    companyName: c.companyName,
    industry: c.industry,
    locationJapan: c.locationJapan,
    description: c.description,
    logoUrl: c.logoUrl,
    website: c.website,
    employeeCount: c.employeeCount,
    isApproved: c.isApproved,
    approvedAt: c.approvedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export function toCandidateDTO(c: {
  id: string;
  userId: string;
  fullName: string;
  phone: string | null;
  bio: string | null;
  location: string | null;
  photoUrl: string | null;
  linkedinUrl: string | null;
  jlptLevel: string;
  skills: string;
  resumeUrl: string | null;
  resumeName: string | null;
  experienceYears: number;
  education: string | null;
  savedJobIds: string;
  openToWork: boolean;
  createdAt: Date;
  updatedAt: Date;
}): CandidateProfileDTO {
  return {
    id: c.id,
    userId: c.userId,
    fullName: c.fullName,
    phone: c.phone,
    bio: c.bio,
    location: c.location,
    photoUrl: c.photoUrl,
    linkedinUrl: c.linkedinUrl,
    jlptLevel: c.jlptLevel as CandidateProfileDTO["jlptLevel"],
    skills: parseJson<string[]>(c.skills, []),
    resumeUrl: c.resumeUrl,
    resumeName: c.resumeName,
    experienceYears: c.experienceYears,
    education: parseJson<EducationEntry[] | null>(c.education, null),
    savedJobIds: parseJson<string[]>(c.savedJobIds, []),
    openToWork: c.openToWork,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export function toJobDTO(j: {
  id: string;
  companyId: string;
  company: ReturnType<typeof toCompanyDTO> extends never ? never : Parameters<typeof toCompanyDTO>[0];
  title: string;
  titleJa: string | null;
  description: string;
  descriptionJa: string | null;
  location: string;
  jobType: string;
  jlptRequired: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryType: string;
  currency: string;
  skillsRequired: string;
  isActive: boolean;
  deadline: Date | null;
  postedAt: Date;
  updatedAt: Date;
  applications?: unknown[];
}, applicationCount?: number): JobDTO {
  return {
    id: j.id,
    companyId: j.companyId,
    company: toCompanyDTO(j.company),
    title: j.title,
    titleJa: j.titleJa,
    description: j.description,
    descriptionJa: j.descriptionJa,
    location: j.location,
    jobType: j.jobType as JobDTO["jobType"],
    jlptRequired: j.jlptRequired as JobDTO["jlptRequired"],
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    salaryType: j.salaryType as JobDTO["salaryType"],
    currency: j.currency,
    skillsRequired: parseJson<string[]>(j.skillsRequired, []),
    isActive: j.isActive,
    deadline: j.deadline?.toISOString() ?? null,
    postedAt: j.postedAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
    applicationCount,
  };
}

export function toApplicationDTO(a: {
  id: string;
  candidateId: string;
  jobId: string;
  status: string;
  coverNote: string | null;
  resumeUrlSnapshot: string | null;
  notes: string | null;
  interviewDate: Date | null;
  interviewNotes: string | null;
  appliedAt: Date;
  updatedAt: Date;
  candidate?: Parameters<typeof toCandidateDTO>[0];
  job?: Parameters<typeof toJobDTO>[0];
}): ApplicationDTO {
  return {
    id: a.id,
    candidateId: a.candidateId,
    jobId: a.jobId,
    status: a.status as ApplicationStatus,
    coverNote: a.coverNote,
    resumeUrlSnapshot: a.resumeUrlSnapshot,
    notes: a.notes,
    interviewDate: a.interviewDate?.toISOString() ?? null,
    interviewNotes: a.interviewNotes,
    appliedAt: a.appliedAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    candidate: a.candidate ? toCandidateDTO(a.candidate) : undefined,
    job: a.job ? toJobDTO(a.job) : undefined,
  };
}

export function toNotificationDTO(n: {
  id: string;
  userId: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}): NotificationDTO {
  return {
    id: n.id,
    userId: n.userId,
    title: n.title,
    message: n.message,
    link: n.link,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  };
}

export function toTestimonialDTO(t: {
  id: string;
  name: string;
  role: string;
  company: string | null;
  content: string;
  contentJa: string | null;
  photoUrl: string | null;
  order: number;
}): TestimonialDTO {
  return {
    id: t.id,
    name: t.name,
    role: t.role,
    company: t.company,
    content: t.content,
    contentJa: t.contentJa,
    photoUrl: t.photoUrl,
    order: t.order,
  };
}

// Formatting helpers
export function formatSalary(job: {
  salaryMin: number | null;
  salaryMax: number | null;
  salaryType: string;
  currency: string;
}): string {
  const { salaryMin, salaryMax, salaryType, currency } = job;
  if (!salaryMin && !salaryMax) return "—";
  const sym = currency === "JPY" ? "¥" : currency + " ";
  const suffix =
    salaryType === "HOURLY" ? "/hr" : salaryType === "YEARLY" ? "/yr" : "/mo";
  if (salaryMin && salaryMax) {
    return `${sym}${formatNum(salaryMin)}–${formatNum(salaryMax)}${suffix}`;
  }
  const v = salaryMin ?? salaryMax!;
  return `${sym}${formatNum(v)}${suffix}`;
}

function formatNum(n: number): string {
  if (n >= 1000) return new Intl.NumberFormat("en-US").format(n);
  return String(n);
}

export function notify(
  userId: string,
  title: string,
  message: string,
  link?: string,
) {
  return db.notification.create({
    data: { userId, title, message, link },
  });
}

export function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
