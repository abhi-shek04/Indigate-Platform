"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyAvatar } from "@/components/brand/logo";
import { JobCard } from "@/components/jobs/job-card";
import { useCountUp } from "@/components/brand/use-count-up";
import {
  Reveal,
  RevealGroup,
  staggerItem,
  fadeUp,
  motion,
  easeOutExpo,
} from "@/lib/motion";
import { MagneticButton, SpotlightCard } from "@/components/brand/motion-primitives";
import {
  ArrowRight,
  Search,
  FileText,
  Plane,
  Sparkles,
  CheckCircle2,
  Quote,
  Mail,
  Briefcase,
  Globe2,
  ShieldCheck,
  Heart,
  Star,
  Building2,
  Wrench,
  ArrowLeftRight,
  HelpCircle,
  Users,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import type { JobDTO, TestimonialDTO } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  icon: Icon,
}: {
  value: number;
  suffix?: string;
  label: string;
  delay: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const count = useCountUp(value, 1800);
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
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: easeOutExpo, delay }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl border border-border bg-card/80 glass px-5 py-6 text-center transition-all hover:border-saffron/40 hover:shadow-premium"
    >
      {/* Saffron accent line on top */}
      <span className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-saffron/60 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex flex-col items-center">
        <motion.div
          whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
          transition={{ duration: 0.5 }}
          className="mb-3 grid place-items-center h-11 w-11 rounded-xl bg-saffron/10 text-saffron ring-1 ring-inset ring-saffron/20"
        >
          <Icon className="h-5 w-5" />
        </motion.div>
        <div className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-none">
          <span className="text-gradient-brand">
            {count.toLocaleString()}
            {suffix}
          </span>
        </div>
        <p className="mt-2 text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

// Animated pipeline bar that fills when scrolled into view
function PipelineBar({
  stage,
  count,
  pct,
  delay,
}: {
  stage: string;
  count: string;
  pct: number;
  delay: number;
}) {
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
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-medium">{stage}</span>
        <span className="text-muted-foreground">{count}</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-brand-gradient rounded-full"
          initial={{ width: 0 }}
          animate={visible ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.1, ease: easeOutExpo, delay }}
        />
      </div>
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
        {/* Fine grid pattern overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklch, var(--foreground) 12%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 12%, transparent) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        {/* Animated aurora blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-saffron/25 blur-3xl animate-aurora" />
          <div
            className="absolute top-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-crimson/18 blur-3xl animate-aurora"
            style={{ animationDelay: "2.5s" }}
          />
          <div
            className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-saffron/12 blur-3xl animate-aurora"
            style={{ animationDelay: "5s" }}
          />
        </div>
        {/* Bottom fade into the page */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background"
        />

        {/* Parallax mouse-follow handled via CSS only for perf */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <RevealGroup className="mx-auto max-w-3xl text-center" stagger={0.12} delayChildren={0.1}>
            <motion.div variants={staggerItem} className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-4 py-1.5 text-sm font-medium text-crimson shadow-premium">
              <Sparkles className="h-3.5 w-3.5" />
              {t("hero.badge")}
            </motion.div>
            <motion.h1
              variants={staggerItem}
              className="mt-7 font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]"
            >
              {t("hero.title")}
            </motion.h1>
            <motion.p
              variants={staggerItem}
              className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              {t("hero.subtitle")}
            </motion.p>
            <motion.div
              variants={staggerItem}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <MagneticButton
                onClick={() => navigate("jobs")}
                className="bg-brand-gradient text-white hover:opacity-90 font-semibold text-base h-12 px-7 rounded-xl shadow-glow-brand inline-flex items-center gap-2 cursor-pointer"
              >
                <Search className="h-4 w-4" />
                {t("hero.cta.find")}
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              <MagneticButton
                onClick={() => navigate("register")}
                className="bg-background border-2 border-border hover:border-saffron/50 font-semibold text-base h-12 px-7 rounded-xl inline-flex items-center gap-2 cursor-pointer"
              >
                {t("hero.cta.hire")}
              </MagneticButton>
            </motion.div>
            <motion.p variants={staggerItem} className="mt-7 text-xs text-muted-foreground">
              {t("hero.trusted")}
            </motion.p>
          </RevealGroup>

          {/* Hero company strip */}
          <Reveal variants={fadeUp} delay={0.5} className="mt-16">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-70">
              {["TechNova", "SakuraSoft", "Mitsui Eng.", "Hikari", "Kintaro"].map(
                (name, i) => (
                  <motion.div
                    key={name}
                    whileHover={{ scale: 1.08, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="flex items-center gap-2 cursor-default"
                  >
                    <CompanyAvatar
                      name={name}
                      color={companyColors[i % companyColors.length]}
                      size={28}
                    />
                    <span className="font-display font-bold text-sm">{name}</span>
                  </motion.div>
                ),
              )}
            </div>
          </Reveal>
        </div>

        {/* Stats bar */}
        <div className="border-y border-border bg-card/60 glass">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <StatCard value={stats?.jobCount ?? 12} suffix="+" label={t("stats.jobs")} delay={0} icon={Briefcase} />
              <StatCard value={stats?.candidateCount ?? 1900} suffix="+" label={t("stats.candidates")} delay={120} icon={Users} />
              <StatCard value={stats?.companyCount ?? 5} suffix="+" label={t("stats.companies")} delay={240} icon={Building2} />
              <StatCard value={stats?.placementCount ?? 312} suffix="+" label={t("stats.placements")} delay={360} icon={Award} />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED JOBS */}
      {featured.length > 0 && (
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal variants={fadeUp}>
              <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
                <div className="max-w-2xl">
                  <Badge variant="outline" className="mb-3 border-saffron/40 text-crimson bg-saffron/5">
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
                  className="font-semibold group h-11 px-5 rounded-xl border-saffron/30 hover:border-saffron/60 hover:bg-saffron/5"
                >
                  {t("jobs.viewall")}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Reveal>
            <RevealGroup className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
              {featured.map((job) => (
                <motion.div key={job.id} variants={staggerItem}>
                  <JobCard job={job} />
                </motion.div>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="py-20 sm:py-24 bg-card/40 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variants={fadeUp} className="text-center max-w-2xl mx-auto">
            <Badge variant="outline" className="mb-3 border-saffron/40 text-crimson">
              <Sparkles className="mr-1 h-3 w-3" />
              Process
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t("how.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("how.subtitle")}</p>
          </Reveal>

          <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3 relative" stagger={0.14}>
            {/* Timeline connector line on md+ */}
            <div
              aria-hidden
              className="hidden md:block absolute top-[3.25rem] left-[16.667%] right-[16.667%] h-px bg-gradient-to-r from-saffron/10 via-saffron/40 to-crimson/10"
            />
            {[
              { icon: FileText, title: t("how.1.title"), desc: t("how.1.desc"), step: "01" },
              { icon: Search, title: t("how.2.title"), desc: t("how.2.desc"), step: "02" },
              { icon: Plane, title: t("how.3.title"), desc: t("how.3.desc"), step: "03" },
            ].map((s, i) => (
              <motion.div key={i} variants={staggerItem} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="relative">
                <SpotlightCard className="relative h-full rounded-2xl border border-border bg-background p-7 hover:shadow-premium transition-shadow overflow-hidden">
                  <span className="absolute top-5 right-6 font-display text-5xl font-extrabold text-saffron/10 select-none">
                    {s.step}
                  </span>
                  {/* Numbered badge — sits on the timeline */}
                  <div className="relative z-10 mb-5 flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: [0, -8, 8, 0], scale: 1.06 }}
                      transition={{ duration: 0.5 }}
                      className="grid place-items-center h-12 w-12 rounded-full bg-brand-gradient text-white shadow-glow-brand ring-4 ring-background"
                    >
                      <s.icon className="h-5 w-5" />
                    </motion.div>
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">
                      Step {s.step}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* VISA GUIDE */}
      <section className="py-20 sm:py-24 bg-card/40 border-y border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal variants={fadeUp} className="text-center max-w-2xl mx-auto">
            <Badge variant="outline" className="mb-3 border-saffron/40 text-crimson">
              <Plane className="mr-1 h-3 w-3" />
              Visa Guide
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t("visa.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("visa.subtitle")}</p>
          </Reveal>

          <Reveal variants={fadeUp} delay={0.15}>
            <Accordion type="single" collapsible className="mt-10 space-y-3">
              <VisaAccordionItem
                value="ssw"
                icon={Wrench}
                title={t("visa.ssw.title")}
                desc={t("visa.ssw.desc")}
                requirements={["JLPT N4 or higher", "Industry skills test", "Valid passport", "Health certificate"]}
              />
              <VisaAccordionItem
                value="engineer"
                icon={Building2}
                title={t("visa.engineer.title")}
                desc={t("visa.engineer.desc")}
                requirements={["Bachelor's degree OR 10 years experience", "Job offer from Japanese company", "Relevant field experience", "Valid passport"]}
              />
              <VisaAccordionItem
                value="transfer"
                icon={ArrowLeftRight}
                title={t("visa.transfer.title")}
                desc={t("visa.transfer.desc")}
                requirements={["1+ year at same company", "Transfer to Japan office", "Valid passport", "Employment contract"]}
              />
            </Accordion>
          </Reveal>

          {/* Support callout */}
          <Reveal variants={fadeUp} delay={0.3}>
            <div className="mt-8 rounded-2xl bg-brand-gradient p-6 sm:p-8 text-center shadow-glow-brand">
              <ShieldCheck className="h-8 w-8 text-white mx-auto mb-3" />
              <p className="text-white font-semibold text-lg leading-relaxed max-w-2xl mx-auto">
                {t("visa.support")}
              </p>
              <MagneticButton
                onClick={() => navigate("home")}
                className="mt-5 bg-white text-crimson hover:bg-white/90 font-bold h-11 px-6 rounded-xl inline-flex items-center gap-2 cursor-pointer"
              >
                {t("visa.cta")}
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHY INDIGATE / VALUE PROPS */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Reveal variants={fadeUp}>
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
              <ul className="mt-6 space-y-3">
                {[
                  { icon: ShieldCheck, title: "Visa & relocation support", desc: "Every listed job comes with visa sponsorship. Our partners handle paperwork, housing, and onboarding." },
                  { icon: Globe2, title: "Bilingual by design", desc: "Browse jobs in English or Japanese. Companies can post in both languages." },
                  { icon: Heart, title: "Human-reviewed employers", desc: "Every company is vetted by the Indobox team before they can post a single role." },
                  { icon: Star, title: "End-to-end support", desc: "From job matching to visa application and relocation — we support you at every step." },
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: easeOutExpo, delay: i * 0.08 }}
                    whileHover={{ x: 4 }}
                    className="group flex gap-4 rounded-xl border border-transparent hover:border-border hover:bg-card/60 p-3 -m-3 transition-all"
                  >
                    <div className="shrink-0 grid place-items-center h-10 w-10 rounded-lg bg-saffron/10 text-saffron ring-1 ring-inset ring-saffron/15 group-hover:bg-brand-gradient group-hover:text-white group-hover:ring-transparent transition-all">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </Reveal>

            <Reveal variants={fadeUp}>
              <div className="relative">
                <div className="absolute inset-0 -z-10 bg-mesh rounded-3xl" />
                <div className="rounded-3xl border border-border bg-card p-6 shadow-premium">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <motion.div
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="grid place-items-center h-10 w-10 rounded-lg bg-brand-gradient text-white"
                    >
                      <Globe2 className="h-5 w-5" />
                    </motion.div>
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
                    ].map((row, i) => (
                      <PipelineBar key={row.stage} {...row} delay={i * 0.12} />
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-20 sm:py-24 bg-card/40 border-y border-border overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal variants={fadeUp} className="text-center max-w-2xl mx-auto">
              <Badge variant="outline" className="mb-3 border-saffron/40 text-crimson">
                <Quote className="mr-1 h-3 w-3" />
                Testimonials
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                {t("testimonials.title")}
              </h2>
              <p className="mt-2 text-muted-foreground">{t("testimonials.subtitle")}</p>
            </Reveal>
          </div>

          <div className="mt-14 relative">
            {/* Edge fade masks */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-32 bg-gradient-to-r from-background to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-32 bg-gradient-to-l from-background to-transparent"
            />
            <div className="flex gap-5 w-max animate-marquee">
              {[...testimonials, ...testimonials].map((te, i) => (
                <figure
                  key={i}
                  className="w-[340px] sm:w-[400px] shrink-0 rounded-2xl border border-border bg-background p-6 shadow-premium transition-all hover:shadow-glow-brand hover:border-saffron/40 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <Quote className="h-8 w-8 text-saffron/50" />
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="h-3.5 w-3.5 fill-saffron text-saffron" />
                      ))}
                    </div>
                  </div>
                  <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">
                    {pick(te.content, te.contentJa)}
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
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

      {/* FAQ */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal variants={fadeUp} className="text-center mb-12">
            <Badge variant="outline" className="mb-3 border-saffron/40 text-crimson">
              <HelpCircle className="mr-1 h-3 w-3" />
              {t("faq.badge")}
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t("faq.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("faq.subtitle")}</p>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.1}>
            <Accordion type="single" collapsible className="space-y-2">
              {[
                { q: t("faq.q1"), a: t("faq.a1") },
                { q: t("faq.q2"), a: t("faq.a2") },
                { q: t("faq.q3"), a: t("faq.a3") },
                { q: t("faq.q4"), a: t("faq.a4") },
                { q: t("faq.q5"), a: t("faq.a5") },
                { q: t("faq.q6"), a: t("faq.a6") },
                { q: t("faq.q7"), a: t("faq.a7") },
                { q: t("faq.q8"), a: t("faq.a8") },
              ].map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-border rounded-xl px-6 bg-background"
                >
                  <AccordionTrigger className="font-display font-semibold text-left hover:no-underline py-5 text-base">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variants={fadeUp}>
            <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-16 sm:px-16 sm:py-20 text-center shadow-glow-brand">
              {/* Shimmer sweep overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay">
                <div className="absolute top-0 left-1/4 h-40 w-40 rounded-full bg-white blur-3xl animate-aurora" />
                <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-white blur-3xl animate-aurora" style={{ animationDelay: "3s" }} />
              </div>
              <div className="relative">
                <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                  {t("cta.title")}
                </h2>
                <p className="mt-4 text-white/90 text-lg max-w-2xl mx-auto">
                  {t("cta.subtitle")}
                </p>
                <MagneticButton
                  onClick={() => navigate("register")}
                  className="mt-8 bg-white text-crimson hover:bg-white/90 font-bold text-base h-12 px-8 rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  {t("cta.button")}
                  <ArrowRight className="h-4 w-4" />
                </MagneticButton>
              </div>
            </div>
          </Reveal>
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
        <Reveal variants={fadeUp} className="text-center">
          <Badge variant="outline" className="mb-3 border-saffron/40 text-crimson">
            <Mail className="mr-1 h-3 w-3" />
            Contact
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            {t("contact.title")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("contact.subtitle")}</p>
        </Reveal>

        <Reveal variants={fadeUp} delay={0.15}>
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
                className="mx-auto mb-3"
              >
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
              </motion.div>
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                {t("contact.success")}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="mt-10 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t("contact.name")}>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 transition-shadow"
                    placeholder="Arjun Sharma"
                  />
                </Field>
                <Field label={t("contact.email")}>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 transition-shadow"
                    placeholder="you@example.com"
                  />
                </Field>
              </div>
              <Field label={t("contact.subject")}>
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 transition-shadow"
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
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 resize-none transition-shadow"
                  placeholder="Tell us a bit about what you need..."
                />
              </Field>
              <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-gradient text-white hover:opacity-90 font-semibold h-12"
                >
                  {loading ? t("common.loading") : t("contact.submit")}
                </Button>
              </motion.div>
            </form>
          )}
        </Reveal>
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

function VisaAccordionItem({
  value,
  icon: Icon,
  title,
  desc,
  requirements,
}: {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  requirements: string[];
}) {
  const { t } = useT();
  return (
    <AccordionItem
      value={value}
      className="group rounded-xl border border-border bg-background px-5 overflow-hidden data-[state=open]:shadow-premium data-[state=open]:border-saffron/40 transition-all"
    >
      <AccordionTrigger className="hover:no-underline py-5">
        <div className="flex items-center gap-4 text-left">
          <div className="grid place-items-center h-11 w-11 rounded-xl bg-saffron/10 text-saffron shrink-0 ring-1 ring-inset ring-saffron/15 group-data-[state=open]:bg-brand-gradient group-data-[state=open]:text-white group-data-[state=open]:ring-transparent transition-all">
            <Icon className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-base">{title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-5 pt-1">
        <div className="sm:pl-[3.75rem]">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5">
            {t("visa.requirements")}
          </p>
          <ul className="grid sm:grid-cols-2 gap-y-1.5 gap-x-4">
            {requirements.map((r) => (
              <li key={r} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
