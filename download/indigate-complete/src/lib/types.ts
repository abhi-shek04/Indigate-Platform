// Shared types & constants for IndiGate

export type Role = "CANDIDATE" | "COMPANY" | "ADMIN";
export type JLPTLevel = "N1" | "N2" | "N3" | "N4" | "N5" | "NONE";
export type JobType = "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";
export type SalaryType = "HOURLY" | "MONTHLY" | "YEARLY";
export type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEWED"
  | "OFFERED"
  | "REJECTED"
  | "WITHDRAWN";

export type Locale = "en" | "ja";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isVerified: boolean;
}

export type PublicUser = SessionUser;

export interface CandidateProfileDTO {
  id: string;
  userId: string;
  fullName: string;
  phone: string | null;
  bio: string | null;
  location: string | null;
  photoUrl: string | null;
  linkedinUrl: string | null;
  jlptLevel: JLPTLevel;
  skills: string[];
  resumeUrl: string | null;
  resumeName: string | null;
  experienceYears: number;
  education: EducationEntry[] | null;
  savedJobIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Safe subset for company talent search — no private fields
// NOTE: never expose resumeUrl, phone, linkedinUrl, userId, email
export interface CandidateTalentDTO {
  id: string;
  fullName: string;
  jlptLevel: JLPTLevel;
  skills: string[];
  experienceYears: number;
  bio: string | null;
  location: string | null;
  photoUrl: string | null;
  hasResume: boolean; // boolean only — never the actual URL
  educationCount: number; // count only — no details exposed
  createdAt: string;
}

export interface CompanyProfileDTO {
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
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobDTO {
  id: string;
  companyId: string;
  company: CompanyProfileDTO;
  title: string;
  titleJa: string | null;
  description: string;
  descriptionJa: string | null;
  location: string;
  jobType: JobType;
  jlptRequired: JLPTLevel;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryType: SalaryType;
  currency: string;
  skillsRequired: string[];
  isActive: boolean;
  deadline: string | null;
  postedAt: string;
  updatedAt: string;
  applicationCount?: number;
}

export interface ApplicationDTO {
  id: string;
  candidateId: string;
  candidate?: CandidateProfileDTO;
  jobId: string;
  job?: JobDTO;
  status: ApplicationStatus;
  coverNote: string | null;
  resumeUrlSnapshot: string | null;
  notes: string | null;
  interviewDate: string | null;
  interviewNotes: string | null;
  appliedAt: string;
  updatedAt: string;
}

export interface NotificationDTO {
  id: string;
  userId: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface TestimonialDTO {
  id: string;
  name: string;
  role: string;
  company: string | null;
  content: string;
  contentJa: string | null;
  photoUrl: string | null;
  order: number;
}

export interface EducationEntry {
  degree: string;
  field: string;
  institution: string;
  year: string;
}

export const JLPT_LEVELS: JLPTLevel[] = ["N1", "N2", "N3", "N4", "N5", "NONE"];
export const JOB_TYPES: JobType[] = [
  "FULL_TIME",
  "PART_TIME",
  "INTERNSHIP",
  "CONTRACT",
];
export const SALARY_TYPES: SalaryType[] = ["HOURLY", "MONTHLY", "YEARLY"];
export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEWED",
  "OFFERED",
  "REJECTED",
  "WITHDRAWN",
];

export const JLPT_BADGE: Record<JLPTLevel, string> = {
  N1: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-900",
  N2: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900",
  N3: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  N4: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  N5: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900",
  NONE: "bg-muted text-muted-foreground border-border",
};

export const STATUS_BADGE: Record<ApplicationStatus, string> = {
  APPLIED:
    "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900",
  SHORTLISTED:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  INTERVIEWED:
    "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-900",
  OFFERED:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  REJECTED:
    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900",
  WITHDRAWN:
    "bg-muted text-muted-foreground border-border",
};
