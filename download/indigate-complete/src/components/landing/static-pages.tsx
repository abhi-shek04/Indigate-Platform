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
  GraduationCap,
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
  const user = useApp((s) => s.user);
  const dashView = user
    ? user.role === "CANDIDATE"
      ? "candidate"
      : user.role === "COMPANY"
        ? "company"
        : "admin"
    : "register";
  return (
    <PageShell
      title="About Indobox Inc."
      subtitle="India × Japan Talent Platform — Making the impossible possible through the fusion of India and Japan"
    >
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4 not-prose">
          <div className="rounded-xl border border-border p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Mission</p>
            <p className="text-sm font-medium">To make India&apos;s diversity an essential element of business</p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Vision</p>
            <p className="text-sm font-medium">Through the fusion of Japan and India, turn what does not yet exist into reality</p>
          </div>
        </div>

        <P>
          Indobox Inc. (インドボックス株式会社) is a licensed employment agency
          connecting Indian talent with Japanese companies. Founded in May 2023
          in Nagoya, Japan, and with an India office in Hyderabad since
          December 2024, we provide end-to-end support from both countries.
        </P>
        <P>
          With staff experienced in India business and partners spread
          throughout India, we provide thorough support from both Japan and
          India — from candidate screening to visa, relocation, and post-arrival
          life support.
        </P>

        <H2>Our Values</H2>
        <div className="grid sm:grid-cols-2 gap-3 not-prose">
          {[
            "Be energetic in both Japan and India",
            "Be a creator",
            "Pursue fusion",
            "Read ahead and act",
            "Embrace change",
          ].map((v, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
              <div className="grid place-items-center h-8 w-8 rounded-lg bg-saffron/10 text-saffron shrink-0 text-sm font-bold">
                {i + 1}
              </div>
              <span className="text-sm text-foreground/80 pt-1">{v}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground italic pt-1">
          Drive through challenge and benefit. Become a pioneer of diversity.
        </p>

        <H2>Our Offices</H2>
        <div className="grid sm:grid-cols-2 gap-4 not-prose">
          <div className="rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🇯🇵</span>
              <p className="font-display font-bold">Japan Office</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Indobox Inc. (株式会社)<br />
              Founded: May 2023<br />
              Station Ai, 1-2-32 Tsuruma, Showa-ku,<br />
              Nagoya, Aichi 466-0064<br />
              <span className="text-xs">Japan&apos;s largest startup support / open innovation hub</span><br />
              <span className="text-xs">Licensed employment agency: 23-ユ-303072</span>
            </p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🇮🇳</span>
              <p className="font-display font-bold">India Office</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Indobox India Private Limited<br />
              Founded: December 2024<br />
              1/C, 83/1, Raidurg, Panmaktha Near HiTec City,<br />
              Cyberabad, Shaikpet, Hyderabad, 500081<br />
              Telangana, India<br />
              <span className="text-xs">T-Hub — India&apos;s largest startup support &amp; innovation hub</span>
            </p>
          </div>
        </div>

        <H2>India Network</H2>
        <P>With staff and partners spread throughout India across 14 cities:</P>
        <div className="flex flex-wrap gap-2 not-prose">
          {["Jammu", "Dehradun", "New Delhi", "Varanasi", "Assam", "Ahmedabad", "Mumbai", "Nagpur", "Kolkata", "Goa", "Hyderabad (HQ)", "Bengaluru", "Chennai", "Coimbatore"].map((city) => (
            <Badge key={city} variant="secondary" className="text-xs">{city}</Badge>
          ))}
        </div>

        <H2>Contact</H2>
        <div className="grid sm:grid-cols-2 gap-4 not-prose">
          <div className="rounded-xl border border-border p-5">
            <p className="text-sm">
              <strong>Contact person:</strong> Skanda<br />
              <span className="text-xs text-muted-foreground">Japan-based, Japanese language support available</span><br />
              <strong>Phone:</strong> 090-4251-7331<br />
              <strong>Email:</strong> skanda@indobox.co.jp
            </p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <p className="text-sm">
              <strong>General enquiries:</strong><br />
              hello@indigate.work
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={() => navigate(dashView as never)}
            className="bg-brand-gradient text-white hover:opacity-90 font-semibold"
          >
            {user ? "Go to dashboard" : "Join IndiGate"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </PageShell>
  );
}

function ForCompanies() {
  const navigate = useApp((s) => s.navigate);
  const user = useApp((s) => s.user);
  const dashView = user
    ? user.role === "CANDIDATE"
      ? "candidate"
      : user.role === "COMPANY"
        ? "company"
        : "admin"
    : "register";
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center max-w-3xl mx-auto">
        <Badge variant="outline" className="mb-3 border-saffron/40 text-crimson">
          <Building2 className="mr-1 h-3 w-3" />
          For Companies
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
          Hiring Indian talent — end to end
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Indobox provides comprehensive support from candidate screening to
          visa, relocation, and post-arrival life support.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={() => navigate(dashView as never)}
            className="bg-brand-gradient text-white hover:opacity-90 font-semibold h-12 px-7"
          >
            {user ? "Go to dashboard" : "Post your first job"}
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

      {/* 3 Services */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-center mb-8">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              num: "01",
              icon: Users,
              title: "India Talent Utilization Seminar",
              desc: "A seminar to deepen understanding of India — covering India basics, the differences in business customs between Japan and India, and the advantages of hiring Indian talent.",
            },
            {
              num: "02",
              icon: GraduationCap,
              title: "Japanese Language Education & Business Manner Training",
              desc: "Japanese language classes at partner universities, customized Japanese education services, and professional Japanese business manner training.",
            },
            {
              num: "03",
              icon: Heart,
              title: '"Working with Indians" Support Training',
              desc: "An 18–24 month accompaniment program walking through the phases: Conflict → Behavioral Change → Culture Reform → Talent Activation. Leadership mindset consulting and organizational restructuring.",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-6 hover:shadow-premium transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="grid place-items-center h-11 w-11 rounded-xl bg-brand-gradient text-white shadow-glow-brand">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="font-display text-3xl font-extrabold text-saffron/15">{s.num}</span>
              </div>
              <h3 className="font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Hybrid Success Model */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-center mb-8">The Hybrid Success Model</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🇯🇵</span>
              <h3 className="font-display font-bold">Japanese Companies</h3>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Current Situation</p>
            <p className="text-sm text-muted-foreground mb-3">
              Stagnant Japan market · China risk · Want to expand unique technology and services to a huge market
            </p>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Challenge</p>
            <p className="text-sm text-muted-foreground">
              Don&apos;t understand India at all (complex, diverse, language barrier) · No one internally with India experience
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🇮🇳</span>
              <h3 className="font-display font-bold">India Market</h3>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Current Situation</p>
            <p className="text-sm text-muted-foreground mb-3">
              1.4 billion market · Growing middle class · IT &amp; digital powerhouse · Japan is premium (friendly nation, anime) · Want to connect
            </p>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Challenge</p>
            <p className="text-sm text-muted-foreground">
              Want technology · Inefficient management · Lack of employment opportunities · Don&apos;t understand Japan at all
            </p>
          </div>
        </div>

        {/* 4 Effects */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Deeper India understanding", desc: "More India-aware internally" },
            { title: "Solve labor shortages", desc: "Securing talented people" },
            { title: "Expand global business", desc: "English ability, negotiation skills" },
            { title: "Strengthen IT & systems", desc: "Offshore development, innovation talent" },
          ].map((e, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="grid place-items-center h-8 w-8 rounded-lg bg-saffron/10 text-saffron mx-auto mb-2 text-sm font-bold">
                {i + 1}
              </div>
              <p className="font-semibold text-sm">{e.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-3xl bg-brand-gradient p-8 sm:p-12 text-center shadow-glow-brand">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
          Ready to hire?
        </h2>
        <p className="mt-2 text-white/90">
          Create a company account — our team reviews and
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
