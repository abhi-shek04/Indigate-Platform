"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { ScrollProgress } from "@/components/brand/motion-primitives";
import { easeInOutQuart } from "@/lib/motion";
import { Logo } from "@/components/brand/logo";

export default function Page() {
  const { view, authLoading, refreshAuth } = useApp();

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  const isAuthView = view === "login" || view === "register" || view === "forgot";
  const isDashboard =
    view === "candidate" || view === "company" || view === "admin";
  const showChrome = !isAuthView && !isDashboard;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ScrollProgress />
      {showChrome && <Navbar />}

      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: easeInOutQuart }}
            className="flex-1 flex flex-col"
          >
            {view === "home" && <LandingPage />}
            {view === "jobs" && <JobsView />}
            {view === "job-detail" && <JobDetailView />}
            {view === "login" && <AuthView initialMode="login" />}
            {view === "register" && <AuthView initialMode="register" />}
            {view === "forgot" && <AuthView initialMode="forgot" />}
            {view === "verify" && <AuthView initialMode="verify" />}
            {view === "candidate" &&
              (authLoading ? <FullScreenLoader /> : <CandidateDashboard />)}
            {view === "company" &&
              (authLoading ? <FullScreenLoader /> : <CompanyDashboard />)}
            {view === "admin" &&
              (authLoading ? <FullScreenLoader /> : <AdminDashboard />)}
            {view === "privacy" && <StaticPage kind="privacy" />}
            {view === "terms" && <StaticPage kind="terms" />}
            {view === "about" && <StaticPage kind="about" />}
            {view === "for-companies" && <StaticPage kind="for-companies" />}
            {view === "companies" && <StaticPage kind="companies" />}
          </motion.div>
        </AnimatePresence>
      </div>

      {showChrome && <Footer />}
    </div>
  );
}

function FullScreenLoader() {
  return (
    <div className="flex-1 grid place-items-center bg-mesh">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Logo size={48} withText={false} />
        </motion.div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-brand-gradient"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </motion.div>
    </div>
  );
}
