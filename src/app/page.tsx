"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/store";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LandingPage } from "@/components/landing/landing-page";
import { JobsView } from "@/components/jobs/jobs-view";
import { JobDetailView } from "@/components/jobs/job-detail-view";
import { AuthView } from "@/components/auth/auth-view";
import { CandidateDashboard } from "@/components/candidate/candidate-dashboard";
import { CompanyDashboard } from "@/components/company/company-dashboard";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { StaticPage } from "@/components/landing/static-pages";

export default function Page() {
  const {
    view,
    authLoading,
    refreshAuth,
  } = useApp();

  // Load session on mount
  useEffect(() => {
    refreshAuth();
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  // Hide chrome (navbar/footer) on auth + dashboard views
  const isAuthView = view === "login" || view === "register" || view === "forgot";
  const isDashboard =
    view === "candidate" || view === "company" || view === "admin";
  const showChrome = !isAuthView && !isDashboard;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showChrome && <Navbar />}

      <div className="flex-1 flex flex-col">
        {view === "home" && <LandingPage />}
        {view === "jobs" && <JobsView />}
        {view === "job-detail" && <JobDetailView />}
        {view === "login" && <AuthView initialMode="login" />}
        {view === "register" && <AuthView initialMode="register" />}
        {view === "forgot" && <AuthView initialMode="forgot" />}
        {view === "verify" && <AuthView initialMode="verify" />}
        {view === "candidate" &&
          (authLoading ? (
            <FullScreenLoader />
          ) : (
            <CandidateDashboard />
          ))}
        {view === "company" &&
          (authLoading ? (
            <FullScreenLoader />
          ) : (
            <CompanyDashboard />
          ))}
        {view === "admin" &&
          (authLoading ? (
            <FullScreenLoader />
          ) : (
            <AdminDashboard />
          ))}
        {view === "privacy" && <StaticPage kind="privacy" />}
        {view === "terms" && <StaticPage kind="terms" />}
        {view === "about" && <StaticPage kind="about" />}
        {view === "for-companies" && <StaticPage kind="for-companies" />}
        {view === "companies" && <StaticPage kind="companies" />}
      </div>

      {showChrome && <Footer />}
    </div>
  );
}

function FullScreenLoader() {
  return (
    <div className="flex-1 grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-saffron border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
