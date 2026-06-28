// Central app store (Zustand): auth, navigation, locale, toasts.

import { create } from "zustand";
import type {
  CandidateProfileDTO,
  CompanyProfileDTO,
  Locale,
  SessionUser,
} from "@/lib/types";

export type View =
  | "home"
  | "jobs"
  | "job-detail"
  | "login"
  | "register"
  | "forgot"
  | "verify"
  | "candidate"
  | "company"
  | "admin"
  | "privacy"
  | "terms"
  | "about"
  | "companies"
  | "for-companies";

export interface AppState {
  // Auth
  user: SessionUser | null;
  candidate: CandidateProfileDTO | null;
  company: CompanyProfileDTO | null;
  authLoading: boolean;
  // Navigation
  view: View;
  selectedJobId: string | null;
  // candidate dashboard tab
  candidateTab: "overview" | "applications" | "profile" | "resume" | "saved" | "builder";
  // company dashboard tab
  companyTab:
    | "overview"
    | "jobs"
    | "new"
    | "applicants"
    | "profile";
  companyApplicantsJobId: string | null;
  // admin dashboard tab
  adminTab:
    | "overview"
    | "jobs"
    | "candidates"
    | "companies"
    | "applications"
    | "testimonials";
  // locale
  locale: Locale;
  // actions
  setAuth: (data: {
    user: SessionUser | null;
    candidate?: CandidateProfileDTO | null;
    company?: CompanyProfileDTO | null;
  }) => void;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
  navigate: (view: View, opts?: { jobId?: string }) => void;
  setCandidateTab: (t: AppState["candidateTab"]) => void;
  setCompanyTab: (
    t: AppState["companyTab"],
    opts?: { jobId?: string },
  ) => void;
  setAdminTab: (t: AppState["adminTab"]) => void;
  setLocale: (l: Locale) => void;
}

export const useApp = create<AppState>((set, get) => ({
  user: null,
  candidate: null,
  company: null,
  authLoading: true,
  view: "home",
  selectedJobId: null,
  candidateTab: "overview",
  companyTab: "overview",
  companyApplicantsJobId: null,
  adminTab: "overview",
  locale: "en",

  setAuth: ({ user, candidate, company }) =>
    set({
      user,
      candidate: candidate ?? get().candidate,
      company: company ?? get().company,
      authLoading: false,
    }),

  refreshAuth: async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      set({
        user: data.user,
        candidate: data.candidate ?? null,
        company: data.company ?? null,
        authLoading: false,
      });
    } catch {
      set({ authLoading: false });
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({
      user: null,
      candidate: null,
      company: null,
      view: "home",
    });
  },

  navigate: (view, opts) =>
    set({
      view,
      selectedJobId: opts?.jobId ?? get().selectedJobId,
    }),

  setCandidateTab: (t) => set({ candidateTab: t }),
  setCompanyTab: (t, opts) =>
    set({
      companyTab: t,
      companyApplicantsJobId:
        opts?.jobId ?? (t === "applicants" ? get().companyApplicantsJobId : null),
    }),
  setAdminTab: (t) => set({ adminTab: t }),
  setLocale: (l) => set({ locale: l }),
}));
