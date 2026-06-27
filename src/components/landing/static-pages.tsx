"use client";

import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyAvatar } from "@/components/brand/logo";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { JobCard } from "@/components/jobs/job-card";
import type { JobDTO } from "@/lib/types";
import {
  ArrowRight,
  CheckCircle2,
  Plane,
  ShieldCheck,
  Globe2,
  Briefcase,
  Users,
  TrendingUp,
  Heart,
  Building2,
} from "lucide-react";

export function StaticPage({ kind }: { kind: "privacy" | "terms" | "about" | "for-companies" | "companies" }) {
  if (kind === "privacy") return <Privacy />;
  if (kind === "terms") return <Terms />;
  if (kind === "about") return <About />;
  if (kind === "for-companies") return <ForCompanies />;
  return <Companies />;
}

function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      <div className="mt-8 space-y-6">{children}</div>
    </main>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xl font-bold mt-2">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-foreground/80 leading-relaxed">{children}</p>;
}

function Privacy() {
  const { t } = useT();
  return (
    <PageShell title={t("footer.privacy")} subtitle="Last updated: January 2025">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
        <P>
          IndiGate (&quot;we&quot;, &quot;us&quot;) operates the platform at indigate.work,
          connecting Indian professionals with Japanese employers. This policy
          explains what data we collect and how we use it.
        </P>
        <H2>1. Data we collect</H2>
        <P>
          Account data (name, email, password hash), candidate profile data
          (resume, skills, JLPT level, education, location), company profile
          data (company name, industry, logo), and application records.
        </P>
        <H2>2. How we use data</H2>
        <P>
          To match candidates with jobs, facilitate applications, communicate
          status updates, and comply with Japanese visa sponsorship
          requirements. We never sell your data.
        </P>
        <H2>3. Data sharing</H2>
        <P>
          We share candidate profiles with companies you apply to. We do not
          share data with third parties for advertising.
        </P>
        <H2>4. Data retention</H2>
        <P>
          We retain your data while your account is active. You may request
          deletion at any time by emailing privacy@indigate.work.
        </P>
        <H2>5. Contact</H2>
        <P>
          Questions? Email privacy@indigate.work or write to Indobox Inc,
          Hyderabad, India.
        </P>
      </div>
    </PageShell>
  );
}

function Terms() {
  const { t } = useT();
  return (
    <PageShell title={t("footer.terms")} subtitle="Last updated: January 2025">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
        <P>
          These terms govern your use of IndiGate. By creating an account you
          agree to them.
        </P>
        <H2>1. Accounts</H2>
        <P>
          You must provide accurate information. Companies require admin
          approval before posting jobs. Candidates must be truthful about
          qualifications and JLPT levels.
        </P>
        <H2>2. Acceptable use</H2>
        <P>
          No spam, fraud, discrimination, or scraping. Violations result in
          account termination.
        </P>
        <H2>3. Jobs & applications</H2>
        <P>
          IndiGate is a platform, not an employer. Hiring decisions are made
          solely by companies. We are not liable for outcomes of applications.
        </P>
        <H2>4. Visa & relocation</H2>
        <P>
          Visa sponsorship is offered by companies, not IndiGate. IndiGate
          provides guidance but cannot guarantee visa approval.
        </P>
        <H2>5. Liability</H2>
        <P>
          IndiGate is provided &quot;as is&quot;. We are not liable for indirect or
          consequential damages.
        </P>
        <H2>6. Contact</H2>
        <P>Questions? Email legal@indigate.work.</P>
      </div>
    </PageShell>
  );
}

function About() {
  const navigate = useApp((s) => s.navigate);
  return (
    <PageShell
      title="About IndiGate"
      subtitle="Building the bridge between Indian talent and Japanese opportunity"
    >
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
        <P>
          IndiGate was founded by Indobox Inc in Hyderabad with a simple
          mission: make it effortless for India&apos;s brightest professionals to
          build careers in Japan — and for Japan&apos;s best companies to hire
          them.
        </P>
        <P>
          Japan faces a serious talent shortage. India has an abundance of
          skilled engineers, designers, and analysts. The gap between them is
          not talent — it&apos;s friction: language, visa paperwork, trust,
          discovery. IndiGate removes that friction.
        </P>
        <H2>What we do</H2>
        <P>
          We vet every employer before they can post a role. We require visa
          sponsorship on every listing. We support candidates in English and
          Japanese, from first application to first day in Tokyo.
        </P>
        <H2>By the numbers</H2>
        <div className="grid sm:grid-cols-3 gap-4 not-prose">
          {[
            { value: "312+", label: "Professionals placed" },
            { value: "1,900+", label: "Candidates registered" },
            { value: "5+", label: "Partner companies" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border p-5 text-center">
              <div className="font-display text-3xl font-extrabold text-gradient-brand">
                {s.value}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <H2>Our values</H2>
        <ul className="space-y-2 not-prose">
          {[
            { icon: ShieldCheck, text: "Vetted employers only — no scams, no noise." },
            { icon: Globe2, text: "Bilingual by design — English & 日本語." },
            { icon: Heart, text: "Human support through every step of the journey." },
          ].map((v, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="grid place-items-center h-9 w-9 rounded-lg bg-saffron/10 text-saffron shrink-0">
                <v.icon className="h-4 w-4" />
              </div>
              <span className="text-foreground/80 pt-1.5">{v.text}</span>
            </li>
          ))}
        </ul>
        <div className="pt-2">
          <Button
            onClick={() => navigate("register")}
            className="bg-brand-gradient text-white hover:opacity-90 font-semibold"
          >
            Join IndiGate
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </PageShell>
  );
}

function ForCompanies() {
  const navigate = useApp((s) => s.navigate);
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center max-w-3xl mx-auto">
        <Badge variant="outline" className="mb-3 border-saffron/40 text-crimson">
          <Building2 className="mr-1 h-3 w-3" />
          For Companies
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
          Hire India&apos;s best, the right way
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Access pre-screened Indian engineers, designers, and analysts — with
          bilingual support and full visa guidance. Posting is free.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={() => navigate("register")}
            className="bg-brand-gradient text-white hover:opacity-90 font-semibold h-12 px-7"
          >
            Post your first job
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("home")}
            className="font-semibold h-12 px-7"
          >
            Talk to our team
          </Button>
        </div>
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-6">
        {[
          {
            icon: Users,
            title: "Pre-screened talent",
            desc: "Every candidate is profiled with verified skills, JLPT levels, and resumes.",
          },
          {
            icon: Globe2,
            title: "Bilingual pipeline",
            desc: "Review candidates in Japanese or English. Post jobs in both languages.",
          },
          {
            icon: ShieldCheck,
            title: "Visa-ready",
            desc: "We guide you and the candidate through Certificate of Eligibility and relocation.",
          },
          {
            icon: TrendingUp,
            title: "Faster hiring",
            desc: "Average time-to-hire drops from 12 weeks to 5 with our curated funnel.",
          },
          {
            icon: Briefcase,
            title: "Manage applicants",
            desc: "A clean kanban pipeline: Applied → Shortlisted → Interviewed → Offered.",
          },
          {
            icon: Heart,
            title: "Human support",
            desc: "The Indobox team supports you and the candidate end-to-end.",
          },
        ].map((f, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-6 hover:shadow-premium transition-all"
          >
            <div className="grid place-items-center h-11 w-11 rounded-xl bg-brand-gradient text-white shadow-glow-brand">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-3xl bg-brand-gradient p-8 sm:p-12 text-center shadow-glow-brand">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
          Ready to hire?
        </h2>
        <p className="mt-2 text-white/90">
          Create a company account — it takes 2 minutes. Our team reviews and
          approves within 1 business day.
        </p>
        <Button
          size="lg"
          onClick={() => navigate("register")}
          className="mt-6 bg-white text-crimson hover:bg-white/90 font-bold h-12 px-8"
        >
          Get started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </main>
  );
}

function Companies() {
  const { t, locale } = useT();
  const navigate = useApp((s) => s.navigate);
  const [jobs, setJobs] = useState<JobDTO[]>([]);
  useEffect(() => {
    api<{ jobs: JobDTO[] }>("/api/jobs?limit=50").then((r) => setJobs(r.jobs)).catch(() => {});
  }, []);

  // group by company
  const companies = Array.from(
    new Map(jobs.map((j) => [j.company.id, j.company])).values(),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="outline" className="mb-3 border-saffron/40 text-crimson">
          <Building2 className="mr-1 h-3 w-3" />
          {locale === "ja" ? "提携企業" : "Partner Companies"}
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
          {t("companies.title")}
        </h1>
        <p className="mt-3 text-muted-foreground">{t("companies.subtitle")}</p>
      </div>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {companies.map((c) => {
          const count = jobs.filter((j) => j.companyId === c.id).length;
          return (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-card p-6 hover:shadow-premium hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-3">
                <CompanyAvatar name={c.companyName} color={c.logoUrl} size={52} />
                <div className="min-w-0">
                  <h3 className="font-display font-bold truncate">{c.companyName}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.industry}
                    {c.locationJapan ? ` · ${c.locationJapan}` : ""}
                  </p>
                </div>
              </div>
              {c.description && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {c.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="secondary" className="font-medium">
                  <Briefcase className="mr-1 h-3 w-3" />
                  {count} {count === 1 ? "job" : "jobs"}
                </Badge>
                <button
                  onClick={() => navigate("jobs")}
                  className="text-sm font-medium text-crimson hover:underline"
                >
                  {t("common.viewall")} →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {companies.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
          No companies yet.
        </div>
      )}
    </main>
  );
}
