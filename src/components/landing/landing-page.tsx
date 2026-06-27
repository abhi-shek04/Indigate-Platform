"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api, formatRelative } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyAvatar } from "@/components/brand/logo";
import { JobCard } from "@/components/jobs/job-card";
import { useCountUp } from "@/components/brand/use-count-up";
import {
  ArrowRight,
  Search,
  FileText,
  Plane,
  Sparkles,
  CheckCircle2,
  Quote,
  Mail,
  MapPin,
  Briefcase,
  Globe2,
  ShieldCheck,
  Heart,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import type { JobDTO, TestimonialDTO } from "@/lib/types";

interface Stats {
  jobCount: number;
  candidateCount: number;
  companyCount: number;
  placementCount: number;
}

function StatCard({
  value,
  suffix,
  label,
  delay,
}: {
  value: number;
  suffix?: string;
  label: string;
  delay: number;
}) {
  const count = useCountUp(value);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="text-center transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
        <span className="text-gradient-brand">
          {count.toLocaleString()}
          {suffix}
        </span>
      </div>
      <p className="mt-1.5 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function LandingPage() {
  const { t, pick } = useT();
  const navigate = useApp((s) => s.navigate);
  const [stats, setStats] = useState<Stats | null>(null);
  const [featured, setFeatured] = useState<JobDTO[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialDTO[]>([]);

  useEffect(() => {
    Promise.all([
      api<{ jobCount: number; candidateCount: number; companyCount: number; placementCount: number }>(
        "/api/jobs/stats",
      ),
      api<{ jobs: JobDTO[] }>("/api/jobs?limit=3"),
      api<{ testimonials: TestimonialDTO[] }>("/api/testimonials?active=true"),
    ])
      .then(([s, f, te]) => {
        setStats(s);
        setFeatured(f.jobs);
        setTestimonials(te.testimonials);
      })
      .catch(() => {});
  }, []);

  const companyColors = ["#0ea5e9", "#ec4899", "#16a34a", "#f59e0b", "#8b5cf6", "#14b8a6"];

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-mesh">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-saffron/20 blur-3xl animate-float-slow" />
          <div className="absolute top-40 -right-20 h-96 w-96 rounded-full bg-crimson/15 blur-3xl animate-float-slow" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-4 py-1.5 text-sm font-medium text-crimson">
              <Sparkles className="h-3.5 w-3.5" />
              {t("hero.badge")}
            </div>
            <h1 className="mt-6 font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              {t("hero.title")}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => navigate("jobs")}
                className="bg-brand-gradient text-white hover:opacity-90 font-semibold text-base h-12 px-7 shadow-glow-brand group"
              >
                <Search className="mr-2 h-4 w-4" />
                {t("hero.cta.find")}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("register")}
                className="font-semibold text-base h-12 px-7 border-2 hover:bg-accent"
              >
                {t("hero.cta.hire")}
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              {t("hero.trusted")}
            </p>
          </div>

          {/* Hero company strip */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-70">
            {["TechNova", "SakuraSoft", "Mitsui Eng.", "Hikari", "Kintaro"].map(
              (name, i) => (
                <div key={name} className="flex items-center gap-2">
                  <CompanyAvatar
                    name={name}
                    color={companyColors[i % companyColors.length]}
                    size={28}
                  />
                  <span className="font-display font-bold text-sm">{name}</span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-y border-border bg-card/60 glass">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard
                value={stats?.jobCount ?? 12}
                suffix="+"
                label={t("stats.jobs")}
                delay={0}
              />
              <StatCard
                value={stats?.candidateCount ?? 1900}
                suffix="+"
                label={t("stats.candidates")}
                delay={120}
              />
              <StatCard
                value={stats?.companyCount ?? 5}
                suffix="+"
                label={t("stats.companies")}
                delay={240}
              />
              <StatCard
                value={stats?.placementCount ?? 312}
                suffix="+"
                label={t("stats.placements")}
                delay={360}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED JOBS */}
      {featured.length > 0 && (
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <Badge variant="outline" className="mb-3 border-saffron/40 text-crimson">
                  <Briefcase className="mr-1 h-3 w-3" />
                  {t("jobs.title")}
                </Badge>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Latest opportunities
                </h2>
                <p className="mt-2 text-muted-foreground">{t("jobs.subtitle")}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("jobs")}
                className="font-semibold"
              >
                {t("jobs.viewall")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="py-20 sm:py-24 bg-card/40 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="outline" className="mb-3 border-saffron/40 text-crimson">
              <Sparkles className="mr-1 h-3 w-3" />
              Process
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t("how.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("how.subtitle")}</p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: FileText,
                title: t("how.1.title"),
                desc: t("how.1.desc"),
                step: "01",
              },
              {
                icon: Search,
                title: t("how.2.title"),
                desc: t("how.2.desc"),
                step: "02",
              },
              {
                icon: Plane,
                title: t("how.3.title"),
                desc: t("how.3.desc"),
                step: "03",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-border bg-background p-7 hover:shadow-premium hover:-translate-y-1 transition-all"
              >
                <span className="absolute top-5 right-6 font-display text-5xl font-extrabold text-saffron/15">
                  {s.step}
                </span>
                <div className="grid place-items-center h-12 w-12 rounded-xl bg-brand-gradient text-white shadow-glow-brand">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY INDIGATE / VALUE PROPS */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-3 border-saffron/40 text-crimson">
                <ShieldCheck className="mr-1 h-3 w-3" />
                Why IndiGate
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                Built for the cross-border journey
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                From Bengaluru to Tokyo, Hyderabad to Osaka — we handle the
                friction so you can focus on what you do best: great work.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Visa & relocation support",
                    desc: "Every listed job comes with visa sponsorship. Our partners handle paperwork, housing, and onboarding.",
                  },
                  {
                    icon: Globe2,
                    title: "Bilingual by design",
                    desc: "Browse jobs in English or Japanese. Companies can post in both languages.",
                  },
                  {
                    icon: Heart,
                    title: "Human-reviewed employers",
                    desc: "Every company is vetted by the Indobox team before they can post a single role.",
                  },
                  {
                    icon: Star,
                    title: "Real placement outcomes",
                    desc: "300+ professionals placed across IT, engineering, design, and finance in Japan.",
                  },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="shrink-0 grid place-items-center h-10 w-10 rounded-lg bg-saffron/10 text-saffron">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 bg-mesh rounded-3xl" />
              <div className="rounded-3xl border border-border bg-card p-6 shadow-premium">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="grid place-items-center h-10 w-10 rounded-lg bg-brand-gradient text-white">
                    <Globe2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">India → Japan pipeline</p>
                    <p className="text-xs text-muted-foreground">Live placement flow</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { stage: "Profile created", count: "1,947", pct: 100 },
                    { stage: "Shortlisted by companies", count: "612", pct: 62 },
                    { stage: "Interviews scheduled", count: "428", pct: 44 },
                    { stage: "Offers extended", count: "312", pct: 31 },
                    { stage: "Relocated to Japan", count: "287", pct: 28 },
                  ].map((row) => (
                    <div key={row.stage}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium">{row.stage}</span>
                        <span className="text-muted-foreground">{row.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-brand-gradient rounded-full"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-20 sm:py-24 bg-card/40 border-y border-border overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <Badge variant="outline" className="mb-3 border-saffron/40 text-crimson">
                <Quote className="mr-1 h-3 w-3" />
                Testimonials
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                {t("testimonials.title")}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t("testimonials.subtitle")}
              </p>
            </div>
          </div>

          <div className="mt-14 relative">
            <div className="flex gap-5 w-max animate-marquee">
              {[...testimonials, ...testimonials].map((te, i) => (
                <figure
                  key={i}
                  className="w-[340px] sm:w-[400px] shrink-0 rounded-2xl border border-border bg-background p-6 shadow-premium"
                >
                  <Quote className="h-7 w-7 text-saffron/40" />
                  <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">
                    {pick(te.content, te.contentJa)}
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <CompanyAvatar name={te.name} size={40} />
                    <div>
                      <p className="font-semibold text-sm">{te.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {te.role}
                        {te.company ? ` · ${te.company}` : ""}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-16 sm:px-16 sm:py-20 text-center shadow-glow-brand">
            <div className="absolute inset-0 opacity-20 mix-blend-overlay">
              <div className="absolute top-0 left-1/4 h-40 w-40 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-white blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {t("cta.title")}
              </h2>
              <p className="mt-4 text-white/90 text-lg max-w-2xl mx-auto">
                {t("cta.subtitle")}
              </p>
              <Button
                size="lg"
                onClick={() => navigate("register")}
                className="mt-8 bg-white text-crimson hover:bg-white/90 font-bold text-base h-12 px-8"
              >
                {t("cta.button")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <ContactSection />
    </main>
  );
}

function ContactSection() {
  const { t } = useT();
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
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="py-20 sm:py-24 bg-card/40 border-t border-border">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="outline" className="mb-3 border-saffron/40 text-crimson">
            <Mail className="mr-1 h-3 w-3" />
            Contact
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            {t("contact.title")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("contact.subtitle")}</p>
        </div>

        {sent ? (
          <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <p className="mt-3 font-semibold text-emerald-800 dark:text-emerald-300">
              {t("contact.success")}
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-10 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("contact.name")}>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40"
                  placeholder="Arjun Sharma"
                />
              </Field>
              <Field label={t("contact.email")}>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40"
                  placeholder="you@example.com"
                />
              </Field>
            </div>
            <Field label={t("contact.subject")}>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40"
                placeholder="How can we help?"
              />
            </Field>
            <Field label={t("contact.message")}>
              <textarea
                required
                minLength={20}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 resize-none"
                placeholder="Tell us a bit about what you need..."
              />
            </Field>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-gradient text-white hover:opacity-90 font-semibold h-12"
            >
              {loading ? t("common.loading") : t("contact.submit")}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
