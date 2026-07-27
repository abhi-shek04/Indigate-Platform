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
  | "for-companies"
  | "contact"
  | "how-it-works";

export interface AppState {
  // Auth
  user: SessionUser | null;
  candidate: CandidateProfileDTO | null;
  company: CompanyProfileDTO | null;
  authLoading: boolean;
  googleAuthEnabled: boolean;
  // Navigation
  view: View;
  selectedJobId: string | null;
  // candidate dashboard tab
  candidateTab: "overview" | "applications" | "profile" | "resume" | "saved" | "builder" | "alerts" | "messages" | "settings" | "support";
  // company dashboard tab
  companyTab:
    | "overview"
    | "jobs"
    | "new"
    | "applicants"
    | "talent"
    | "analytics"
    | "messages"
    | "profile";
  companyApplicantsJobId: string | null;
  // admin dashboard tab
  adminTab:
    | "overview"
    | "ai-scores"
    | "jobs"
    | "candidates"
    | "companies"
    | "applications"
    | "support"
    | "testimonials"
    | "contacts"
    | "users"
    | "audit"
    | "alerts";
  // locale
  locale: Locale;
  // TOTP 2FA
  pendingTwoFactorEmail: string | null;
  // Messaging
  activeConversationId: string | null;
  messageUnreadCount: number;
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
  setPendingTwoFactorEmail: (email: string | null) => void;
  setActiveConversation: (id: string | null) => void;
  setMessageUnreadCount: (n: number) => void;
}

export const useApp = create<AppState>((set, get) => ({
  user: null,
  candidate: null,
  company: null,
  authLoading: true,
  googleAuthEnabled: false,
  view: "home",
  selectedJobId: null,
  candidateTab: "overview",
  companyTab: "overview",
  companyApplicantsJobId: null,
  adminTab: "overview",
  locale: "en",
  pendingTwoFactorEmail: null,
  activeConversationId: null,
  messageUnreadCount: 0,

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
      const currentState = get();
      // Only auto-redirect to dashboard if we're on the home page (initial load)
      // Don't redirect if user is already on a specific view (e.g. jobs, contact, about)
      if (data.user && currentState.view === "home") {
        const role = data.user.role;
        if (role === "CANDIDATE") {
          set({ user: data.user, candidate: data.candidate ?? null, company: null, authLoading: false, googleAuthEnabled: data.googleAuthEnabled ?? false, view: "candidate" });
          return;
        } else if (role === "COMPANY") {
          set({ user: data.user, candidate: null, company: data.company ?? null, authLoading: false, googleAuthEnabled: data.googleAuthEnabled ?? false, view: "company" });
          return;
        } else if (role === "ADMIN") {
          set({ user: data.user, candidate: null, company: null, authLoading: false, googleAuthEnabled: data.googleAuthEnabled ?? false, view: "admin" });
          return;
        }
      }
      set({
        user: data.user,
        candidate: data.candidate ?? null,
        company: data.company ?? null,
        authLoading: false,
        googleAuthEnabled: data.googleAuthEnabled ?? false,
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
  setPendingTwoFactorEmail: (email) => set({ pendingTwoFactorEmail: email }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setMessageUnreadCount: (n) => set({ messageUnreadCount: n }),
}));
