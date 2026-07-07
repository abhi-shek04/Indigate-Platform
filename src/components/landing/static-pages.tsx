"use client";

import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyAvatar } from "@/components/brand/logo";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { JobCard } from "@/components/jobs/job-card";
import type { JobDTO } from "@/lib/types";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Plane,
  ShieldCheck,
  Globe2,
  Briefcase,
  Users,
  TrendingUp,
  Heart,
  Building2,
} from "lucide-react";

export function StaticPage({ kind }: { kind: "privacy" | "terms" | "about" | "for-companies" | "companies" | "contact" }) {
  if (kind === "privacy") return <Privacy />;
  if (kind === "terms") return <Terms />;
  if (kind === "about") return <About />;
  if (kind === "for-companies") return <ForCompanies />;
  if (kind === "contact") return <Contact />;
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
function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-foreground/80 leading-relaxed", className)}>{children}</p>;
}

function Privacy() {
  const { t } = useT();
  return (
    <PageShell title={t("footer.privacy")} subtitle="Effective Date: Jan 1, 2026">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
        {/* Meta info box */}
        <div className="space-y-1.5 rounded-xl bg-muted/40 p-4 text-sm">
          <p><span className="font-semibold">Operator:</span> Indobox Inc. (&ldquo;IndiGate&rdquo;)</p>
          <p><span className="font-semibold">Applicable Regions:</span> Japan, India, and global users</p>
        </div>

        <H2>1. Introduction</H2>
        <P>
          IndiGate (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;Indobox Group&rdquo;) operates
          cross-border HR and talent-placement services between India and Japan.
        </P>
        <P>
          This Privacy Policy describes how we collect, use, store, transfer, and
          protect personal information of:
        </P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Job seekers (&ldquo;Candidates&rdquo;)</li>
          <li>Employers / Partner companies (&ldquo;Clients&rdquo;)</li>
          <li>Users of our website (https://indigate.work)</li>
          <li>Participants in IndiGate programs, internships, interviews, or training</li>
        </ul>
        <P>This policy complies with:</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Japan Act on the Protection of Personal Information (APPI / 個人情報保護法)</li>
          <li>India Digital Personal Data Protection Act (DPDP Act, 2023)</li>
          <li>Relevant international standards for HR data management</li>
        </ul>
        <P>
          By accessing or using IndiGate, you consent to the terms of this Privacy Policy.
        </P>

        <H2>2. Data Controller</H2>
        <P>
          <span className="font-semibold">Primary Data Controller (Japan):</span>
          <br />
          Indobox Inc.
          <br />
          Address: 1-2-32 Tsurumai, Showa-ku, Nagoya, Aichi, Japan
          <br />
          License: Employment Placement License No. 23-ユ-303072
        </P>
        <P>
          <span className="font-semibold">Joint Data Controller (India):</span>
          <br />
          Indobox India Private Limited
          <br />
          Hyderabad, Telangana, India
        </P>
        <P>
          Both entities may process your data as part of IndiGate&rsquo;s cross-border HR service.
        </P>

        <H2>3. Information We Collect</H2>
        <P className="font-semibold">3.1 Candidate Information</P>
        <P>We may collect:</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Name, gender, date of birth</li>
          <li>Contact information (email, phone, address)</li>
          <li>Resume / CV (EN &amp; JP)</li>
          <li>Educational background</li>
          <li>Skills and certifications (JLPT, engineering skills, etc.)</li>
          <li>Employment history</li>
          <li>Nationality and visa status</li>
          <li>Interview videos, assessment results</li>
          <li>Preferences (desired job type, location, salary)</li>
          <li>Any other information required for job application</li>
        </ul>
        <P className="font-semibold">3.2 Employer Information</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Company name, address, department</li>
          <li>Contact person details</li>
          <li>Job descriptions, hiring requirements</li>
          <li>Communication history with IndiGate</li>
        </ul>
        <P className="font-semibold">3.3 Website &amp; App Information</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>IP address, device information</li>
          <li>Browser type, access logs</li>
          <li>Form submission content</li>
          <li>Cookies (for session management only)</li>
        </ul>

        <H2>4. Purposes of Use</H2>
        <P>We use personal data for:</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Recruitment and job placement activities</li>
          <li>Matching candidates with employers</li>
          <li>Internship management and coordination</li>
          <li>Japanese language training and pre-employment programs</li>
          <li>Visa application support and relocation assistance</li>
          <li>Communication with users</li>
          <li>Improvement of IndiGate services</li>
          <li>Legal compliance and license obligations</li>
          <li>Preventing fraudulent or harmful activity</li>
        </ul>
        <P className="font-semibold">We do not sell personal data.</P>

        <H2>5. Legal Basis for Processing</H2>
        <P>Under APPI and DPDP, IndiGate processes data under:</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Consent of the individual</li>
          <li>Execution of HR-related services requested by users</li>
          <li>Legal obligations (Japan employment laws)</li>
          <li>Legitimate business interests</li>
          <li>Contractual necessity</li>
        </ul>

        <H2>6. Cross-Border Data Transfer</H2>
        <P>
          Because IndiGate operates in Japan and India, your data may be transferred between:
        </P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Indobox Inc. (Japan)</li>
          <li>Indobox India Pvt. Ltd. (India)</li>
        </ul>
        <P>
          We ensure that both entities follow strict confidentiality rules and appropriate
          security standards.
        </P>

        <H2>7. Data Retention Period</H2>
        <P>We retain personal data for:</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Active candidates: up to 5 years</li>
          <li>Placed candidates: 7 years (legal requirement in Japan)</li>
          <li>Employer records: 7 years</li>
          <li>Website logs: 1 year</li>
        </ul>
        <P>
          You may request deletion at any time unless legal obligations require retention.
        </P>

        <H2>8. Security Measures</H2>
        <P>We implement:</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Access control to candidate databases</li>
          <li>Encryption of stored data</li>
          <li>Secure communication channels (HTTPS)</li>
          <li>Staff confidentiality agreements</li>
          <li>Regular monitoring for unauthorized access</li>
        </ul>

        <H2>9. Sharing of Information</H2>
        <P>We may share candidate data with:</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Potential employers (with consent)</li>
          <li>Japanese and Indian authorities (for visa purposes)</li>
          <li>Training partners (JLPT, onboarding, etc.)</li>
          <li>Background verification vendors (if required)</li>
        </ul>
        <P>We never share data with unrelated third parties.</P>

        <H2>10. Your Rights</H2>
        <P>Candidates and employers may:</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Request access to their data</li>
          <li>Correct inaccuracies</li>
          <li>Request deletion</li>
          <li>Withdraw consent</li>
          <li>Request disclosure of usage purposes</li>
          <li>File a complaint</li>
        </ul>
        <P>
          Contact:{" "}
          <a
            href="mailto:contact@indigate.work"
            className="text-saffron hover:underline"
          >
            contact@indigate.work
          </a>
        </P>

        <H2>11. Changes to This Policy</H2>
        <P>
          We may update this policy. The latest version will always be published on our website.
        </P>
      </div>
    </PageShell>
  );
}

function Terms() {
  const { t } = useT();
  return (
    <PageShell title="Terms of Service" subtitle="Website Terms of Use & Service Conditions">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
        {/* Meta info box */}
        <div className="space-y-1.5 rounded-xl bg-muted/40 p-4 text-sm">
          <p><span className="font-semibold">Effective Date:</span> Jan 1, 2026</p>
          <p><span className="font-semibold">Service Operator:</span> Indobox Inc. (operating IndiGate)</p>
        </div>

        <H2>2A. TERMS OF SERVICE — ENGLISH</H2>

        <H2>1. Scope</H2>
        <P>
          These Terms of Service (&ldquo;Terms&rdquo;) govern the use of the IndiGate
          website and related services operated by Indobox Inc. (&ldquo;IndiGate&rdquo;,
          &ldquo;we&rdquo;, &ldquo;our&rdquo;).
        </P>
        <P>These Terms apply to:</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Candidates (job seekers, interns)</li>
          <li>Employers (companies, organizations)</li>
          <li>Website visitors</li>
        </ul>
        <P>By accessing or using IndiGate, you agree to these Terms.</P>

        <H2>2. Nature of Service</H2>
        <P>IndiGate provides:</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Recruitment and job-matching support</li>
          <li>Internship coordination</li>
          <li>Japanese language and cultural training</li>
          <li>Visa and relocation guidance</li>
          <li>Post-arrival follow-up support</li>
        </ul>
        <P>
          IndiGate does not guarantee job placement, employment, or visa approval.
        </P>

        <H2>3. Candidate Obligations</H2>
        <P>Candidates agree to:</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Provide accurate and truthful information</li>
          <li>Submit authentic resumes and documents</li>
          <li>Comply with interview and selection rules</li>
          <li>Respect Japanese workplace norms and laws</li>
          <li>Notify IndiGate of changes in availability or status</li>
        </ul>
        <P>
          False information may result in removal from the platform.
        </P>

        <H2>4. Employer Obligations</H2>
        <P>Employers agree to:</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Provide accurate job descriptions and conditions</li>
          <li>Comply with Japanese labour and immigration laws</li>
          <li>Use candidate information solely for recruitment purposes</li>
          <li>Maintain confidentiality of candidate data</li>
        </ul>

        <H2>5. Fees</H2>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>IndiGate does not charge candidates for job placement.</li>
          <li>Employers are charged fees based on agreed contracts or quotations.</li>
          <li>Fees are subject to refund policies as separately agreed.</li>
        </ul>

        <H2>6. Intellectual Property</H2>
        <P>
          All website content, logos, text, and materials belong to Indobox Inc.
        </P>
        <P>Unauthorized reproduction or use is prohibited.</P>

        <H2>7. Limitation of Liability</H2>
        <P>IndiGate is not liable for:</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Employment decisions made by companies</li>
          <li>Candidate performance after hiring</li>
          <li>Visa rejection or delays</li>
          <li>Losses caused by inaccurate information provided by users</li>
        </ul>

        <H2>8. Suspension or Termination</H2>
        <P>IndiGate may suspend or terminate access if users:</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>Violate laws or these Terms</li>
          <li>Provide false information</li>
          <li>Engage in fraudulent or harmful activity</li>
        </ul>

        <H2>9. Governing Law and Jurisdiction</H2>
        <P>These Terms are governed by Japanese law.</P>
        <P>
          All disputes shall be resolved under the exclusive jurisdiction of Japanese courts.
        </P>

        <H2>10. Contact</H2>
        <P>
          For questions regarding these Terms:
        </P>
        <P>
          <a
            href="mailto:contact@indigate.work"
            className="text-saffron hover:underline"
          >
            contact@indigate.work
          </a>
        </P>
      </div>
    </PageShell>
  );
}

function About() {
  const navigate = useApp((s) => s.navigate);
  return (
    <PageShell
      title="About IndiGate"
      subtitle="India × Japan Talent Development & Placement Service — operated by Indobox Inc."
    >
      <div className="space-y-6">
        {/* Company overview */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <H2>Indobox Inc.</H2>
          <P>
            IndiGate is operated by Indobox Inc., a cross-border HR and talent-placement
            company building bridges between India and Japan. We believe that collaboration
            between these two vibrant nations can create unprecedented value.
          </P>
          <div className="grid sm:grid-cols-2 gap-4 not-prose">
            <div className="rounded-xl border border-border p-5">
              <p className="font-semibold text-sm">Indobox Inc. (Japan)</p>
              <p className="mt-1 text-xs text-muted-foreground">Founded: May 2023</p>
              <p className="mt-2 text-xs text-foreground/80 leading-relaxed">
                Station Ai — Japan&apos;s largest startup-support &amp; open-innovation hub,
                Nagoya, Aichi
              </p>
              <p className="mt-2 text-xs text-foreground/80">
                Employment Placement License No.: 23-ユ-303072
              </p>
            </div>
            <div className="rounded-xl border border-border p-5">
              <p className="font-semibold text-sm">Indobox India Pvt. Ltd.</p>
              <p className="mt-1 text-xs text-muted-foreground">Founded: December 2024</p>
              <p className="mt-2 text-xs text-foreground/80 leading-relaxed">
                T-Hub — India&apos;s largest startup-support &amp; innovation hub,
                Hyderabad, Telangana
              </p>
            </div>
          </div>
        </div>

        {/* Mission / Vision / Values */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="font-display font-bold text-sm text-saffron uppercase tracking-wide">Mission</p>
              <P>
                Make India&apos;s diversity an essential element of business.
              </P>
            </div>
            <div>
              <p className="font-display font-bold text-sm text-saffron uppercase tracking-wide">Vision</p>
              <P>
                Through the fusion of Japan and India, turn what doesn&apos;t exist yet into
                what does. Energize both nations.
              </P>
            </div>
            <div>
              <p className="font-display font-bold text-sm text-saffron uppercase tracking-wide">Values</p>
              <ul className="text-sm text-foreground/80 leading-relaxed space-y-1">
                <li>Be creators.</li>
                <li>Pursue fusion.</li>
                <li>Anticipate and act.</li>
                <li>Embrace change.</li>
                <li>Challenge &amp; profit as driving force.</li>
                <li>Pioneers of diversity.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Why Indian talent now */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <H2>Why Indian talent — right now?</H2>
          <P>
            India produces some of the world&apos;s top engineering and business talent.
            Indian-origin leaders currently serve as CEOs of Google (Sundar Pichai),
            IBM (Arvind Krishna), YouTube (Neal Mohan), Starbucks (Laxman Narasimhan),
            and Chanel (Leena Nair). Several are graduates of the Indian Institutes of
            Technology (IIT).
          </P>
          <P>
            In Japan too, Indian leaders are making an impact — including the CEO of
            Kameda Seika (Lekh Raj Juneja) and the CTO of Fujitsu (Vivek Mahajan).
          </P>
          <H2>Indian Institutes of Technology (IIT)</H2>
          <P>
            IITs are India&apos;s premier engineering universities (23 campuses nationwide),
            established in 1951 to cultivate scientists and engineers. They are among
            the most competitive universities in the world, with an acceptance rate of
            just 1–1.6%.
          </P>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 not-prose">
            {[
              { value: "1–1.6%", label: "Acceptance rate (world's most selective)" },
              { value: "~70", label: "Indian unicorns with IIT co-founders" },
              { value: "Top 4", label: " globally in unicorn-producing alumni" },
              { value: "~20%", label: "IIT graduates work overseas" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border p-4 text-center">
                <div className="font-display text-xl font-extrabold text-gradient-brand">
                  {s.value}
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
          <H2>Tier 2 Universities — Our Strength</H2>
          <P>
            Beyond IITs and IIMs (Tier 1), India has a growing set of Tier 2 universities
            with excellent facilities, strong industry collaboration, and rising
            international recognition. Indobox has built a strong network with these
            universities — whose students have lower salary expectations, strong desire
            to work for Japanese companies, and are enthusiastic about Japanese language
            learning.
          </P>
        </div>

        {/* Hiring patterns */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <H2>Four hiring patterns</H2>
          <P>
            We match the right hiring pattern to your business model and job requirements:
          </P>
          <div className="grid sm:grid-cols-2 gap-4 not-prose">
            {[
              { num: "01", title: "Internship", desc: "University students in their 3rd–4th year, often leading directly to full-time offers." },
              { num: "02", title: "New graduate hire (conditional offer)", desc: "Conditional offers given as early as 3rd year, e.g. requiring JLPT N4 by graduation." },
              { num: "03", title: "Experienced hire", desc: "Mid-career professionals selected from our wide network, with training as needed." },
              { num: "04", title: "India residents in Japan", desc: "Indian nationals already living, studying, or working in Japan — hireable in 1–2 months." },
            ].map((p) => (
              <div key={p.num} className="rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-display text-2xl font-extrabold text-saffron/30">{p.num}</span>
                  <p className="font-semibold">{p.title}</p>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <H2>Our services — End-to-end support from both Japan &amp; India</H2>
          <P>
            We provide comprehensive support across the entire hiring journey — before,
            during, and after onboarding — from both sides of the bridge.
          </P>
          <div className="grid gap-4 not-prose">
            {[
              { num: "01", title: "Indian Talent Utilization Seminar", desc: "Deepen your understanding of India — from basic overview to business-customs differences and the benefits of hiring Indian talent." },
              { num: "02", title: "Japanese Language & Business Etiquette Training", desc: "Japanese language classes at partner universities, with partner instructors, plus professional Japanese business-etiquette training tailored to hiring companies." },
              { num: "03", title: "Working with Indians — Support Training", desc: "A companion-style program with companies that have successfully hired Indian talent. Covers the 4 phases: Conflict → Behavior Change → Culture Change → Talent Thriving. Duration: 18–24 months." },
            ].map((s) => (
              <div key={s.num} className="rounded-xl border border-border p-5">
                <div className="flex items-start gap-3">
                  <span className="font-display text-xl font-extrabold text-saffron shrink-0">{s.num}</span>
                  <div>
                    <p className="font-semibold mb-1">{s.title}</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Three hurdles */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <H2>Three hurdles in international hiring — and how Indobox solves them</H2>
          <div className="grid gap-4 md:grid-cols-3 not-prose">
            {[
              { hurdle: "Language barrier", solution: "Japanese language education (JLPT N5–N3), online & at partner schools" },
              { hurdle: "Cultural differences", solution: "Japanese culture & business-etiquette training by professionals" },
              { hurdle: "Internal readiness", solution: "Working-with-Indians support training, using methods from companies that already hire Indian talent" },
            ].map((h, i) => (
              <div key={i} className="rounded-xl border border-border p-5">
                <p className="font-semibold text-sm text-crimson mb-2">{i + 1}. {h.hurdle}</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{h.solution}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <H2>Contact</H2>
          <P>
            For consultation on hiring Indian talent, please reach out:
          </P>
          <div className="grid sm:grid-cols-2 gap-4 not-prose text-sm">
            <div>
              <p className="font-semibold">Indobox Inc. (Japan)</p>
              <p className="text-foreground/80 mt-1">
                1-2-32 Tsurumai, Showa-ku, Nagoya, Aichi 466-0064, Japan
              </p>
            </div>
            <div>
              <p className="font-semibold">Indobox India Pvt. Ltd.</p>
              <p className="text-foreground/80 mt-1">
                1/C, 83/1, Raidurg, Panmaktha Near HiTec City, Cyberabad, Shaikpet,
                Hyderabad, 500081, Telangana, India
              </p>
            </div>
          </div>
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

function Contact() {
  const { t } = useT();
  const navigate = useApp((s) => s.navigate);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success(t("contact.success"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="outline" className="mb-3 border-saffron/40 text-crimson">
          <Mail className="mr-1 h-3 w-3" />
          Contact
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          {t("contact.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("contact.subtitle")}</p>
      </div>

      <div className="mt-10 grid lg:grid-cols-5 gap-8">
        {/* Contact info sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div>
              <p className="font-display font-bold text-sm text-saffron uppercase tracking-wide">Japan Office</p>
              <p className="mt-1 font-semibold text-sm">Indobox Inc.</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                1-2-32 Tsurumai, Showa-ku, Nagoya,
                <br />
                Aichi 466-0064, Japan
              </p>
            </div>
            <div>
              <p className="font-display font-bold text-sm text-saffron uppercase tracking-wide">India Office</p>
              <p className="mt-1 font-semibold text-sm">Indobox India Pvt. Ltd.</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                1/C, 83/1, Raidurg, Panmaktha Near HiTec City,
                <br />
                Cyberabad, Shaikpet, Hyderabad,
                <br />
                500081, Telangana, India
              </p>
            </div>
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-saffron shrink-0" />
                <a href="mailto:contact@indigate.work" className="hover:text-foreground transition-colors">
                  contact@indigate.work
                </a>
              </div>
              <p className="text-xs text-muted-foreground/80">
                Employment Placement License No.: 23-ユ-303072
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="font-semibold text-sm mb-2">Consultation inquiry</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For consultation on hiring Indian talent, please use the form or
              reach out directly. Our team responds within 24 hours.
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div className="lg:col-span-3">
          {sent ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                {t("contact.success")}
              </p>
              <Button
                variant="outline"
                className="mt-5"
                onClick={() => {
                  setSent(false);
                  navigate("home");
                }}
              >
                Back to home
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    {t("contact.name")}
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 transition-shadow"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    {t("contact.email")}
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 transition-shadow"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  {t("contact.subject")}
                </label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 transition-shadow"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  {t("contact.message")}
                </label>
                <textarea
                  required
                  minLength={10}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={6}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 resize-none transition-shadow"
                  placeholder="Tell us a bit about what you need..."
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-gradient text-white hover:opacity-90 font-semibold h-11"
              >
                {loading ? "Sending..." : t("contact.submit")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
