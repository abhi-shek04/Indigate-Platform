"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { CompanyAvatar } from "@/components/brand/logo";
import { Reveal, RevealGroup, staggerItem, fadeUp, scaleIn, slideInRight, motion, easeOutExpo } from "@/lib/motion";
import { MagneticButton, SpotlightCard, TiltCard } from "@/components/brand/motion-primitives";
import { ArrowRight, Search, FileText, Plane, PlaneTakeoff, LayoutDashboard, Sparkles, CheckCircle2, Quote, Mail, Briefcase, Globe2, ShieldCheck, Star, Building2, Wrench, ArrowLeftRight, HelpCircle, Users, MapPin, Compass, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import type { JobDTO, TestimonialDTO } from "@/lib/types";
import { JobCard } from "@/components/jobs/job-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
interface Stats {
  jobCount: number;
  candidateCount: number;
  companyCount: number;
  placementCount: number;
  pipeline?: {
    profilesCreated: number;
    matchedWithJobs: number;
    interviewScheduled: number;
    relocatedToJapan: number;
  };
}

/* -------------------------------------------------------------------------- */
/*  Section header                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Premium section header — saffron pill label + bold headline + muted subtitle,
 * with a subtle saffron→border gradient divider line below.
 * Supports `align` ("center" | "left") for asymmetric layouts.
 */
function SectionHeader({
  icon: Icon,
  label,
  title,
  subtitle,
  align = "center",
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={
        (align === "center" ? "text-center " : "") +
        "mb-12 " +
        (className ?? "")
      }
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-saffron">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1]">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={
            "mt-3 text-muted-foreground max-w-2xl " +
            (align === "center" ? "mx-auto" : "")
          }
        >
          {subtitle}
        </p>
      ) : null}
      <div
        className={
          "section-divider " +
          (align === "center" ? "" : "ml-0")
        }
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bento stat cards                                                          */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
/*  Hero journey visual (right column of hero)                                */
/* -------------------------------------------------------------------------- */

function HeroJourneyVisual() {
  const { pick } = useT();
  return (
    <TiltCard max={3} className="relative h-full">
      <div className="relative h-full min-h-[460px] rounded-[2rem] overflow-hidden shadow-2xl shadow-foreground/5 border border-border/50">
        {/* Full-bleed Editorial Photo */}
        <img
          src="/images/hero-visual.jpg"
          alt="India-Japan professional partnership — bridging talent across borders"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />

        {/* Bottom gradient — just enough for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Bottom Pipeline Bar */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7">
          <div className="backdrop-blur-xl bg-white/[0.07] rounded-2xl border border-white/[0.08] px-5 py-4">
            <div className="flex items-center justify-between">
              {[
                { icon: Users, label: pick("Profile", "プロフィール") },
                { icon: Building2, label: pick("Match", "試合") },
                { icon: PlaneTakeoff, label: pick("Visa", "すべて") },
                { icon: MapPin, label: pick("Relocate", "移転する") },
              ].map((step, i, arr) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 + i * 0.1, duration: 0.4, ease: easeOutExpo }}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-white/10 border border-white/10 grid place-items-center text-white/80">
                      <step.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70 hidden sm:block">
                      {step.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="hidden sm:block h-px w-6 bg-white/15 ml-2" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Testimonials                                                              */
/* -------------------------------------------------------------------------- */

function FeaturedTestimonial({ te }: { te: TestimonialDTO }) {
  const { pick } = useT();
  return (
    <SpotlightCard className="card-premium relative h-full p-7 sm:p-9 overflow-hidden">
      <Quote className="absolute top-4 right-5 h-20 w-20 text-saffron/8" />
      <div className="relative flex flex-col h-full">
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: 5 }).map((_, s) => (
            <Star key={s} className="h-4 w-4 fill-saffron text-saffron" />
          ))}
        </div>
        <blockquote className="font-display text-xl sm:text-2xl font-bold leading-snug tracking-tight text-foreground flex-1">
          &ldquo;{pick(te.content, te.contentJa)}&rdquo;
        </blockquote>
        <figcaption className="mt-6 flex items-center gap-3 pt-5 border-t border-border">
          <CompanyAvatar name={te.name} size={48} />
          <div>
            <p className="font-bold text-sm">{te.name}</p>
            <p className="text-xs text-muted-foreground">
              {te.role}
              {te.company ? ` · ${te.company}` : ""}
            </p>
          </div>
        </figcaption>
      </div>
    </SpotlightCard>
  );
}

function MiniTestimonial({ te }: { te: TestimonialDTO }) {
  const { pick } = useT();
  return (
    <motion.figure
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="card-premium relative h-full p-5 sm:p-6 overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <Quote className="h-6 w-6 text-saffron/40" />
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, s) => (
            <Star key={s} className="h-3 w-3 fill-saffron text-saffron" />
          ))}
        </div>
      </div>
      <blockquote className="text-sm leading-relaxed text-foreground/90 flex-1 line-clamp-4">
        {pick(te.content, te.contentJa)}
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-2.5 pt-3 border-t border-border/60">
        <CompanyAvatar name={te.name} size={32} />
        <div className="min-w-0">
          <p className="font-semibold text-xs truncate">{te.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {te.role}
            {te.company ? ` · ${te.company}` : ""}
          </p>
        </div>
      </figcaption>
    </motion.figure>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main landing page                                                         */
/* -------------------------------------------------------------------------- */

export function LandingPage() {
  const { t, pick } = useT();
  const navigate = useApp((s) => s.navigate);
  const user = useApp((s) => s.user);
  const [stats, setStats] = useState<Stats | null>(null);
  const [featured, setFeatured] = useState<JobDTO[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialDTO[]>([]);

  useEffect(() => {
    Promise.all([
      api<{
        jobCount: number;
        candidateCount: number;
        companyCount: number;
        placementCount: number;
        pipeline?: {
          profilesCreated: number;
          matchedWithJobs: number;
          interviewScheduled: number;
          relocatedToJapan: number;
        };
      }>("/api/jobs/stats"),
      api<{ jobs: JobDTO[] }>("/api/jobs?featured=true&limit=6"),
      api<{ testimonials: TestimonialDTO[] }>(
        "/api/testimonials?active=true",
      ),
    ])
      .then(([s, f, te]) => {
        setStats(s);
        setFeatured(f.jobs);
        setTestimonials(te.testimonials);
      })
      .catch(() => {});
  }, []);

  const companyColors = [
    "#f59e0b", // saffron
    "#dc2626", // crimson
    "#d97706", // amber-dark
    "#b91c1c", // crimson-dark
    "#fbbf24", // amber
    "#7f1d1d", // crimson-deep
  ];

  
  return (
    <main>
      {/* ===================== HERO (asymmetric) ===================== */}
      <section className="relative overflow-hidden bg-mesh">
        {/* Abstract connection background — ultra subtle depth layer */}
        <img
          src="/images/abstract-connection.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.10] pointer-events-none mix-blend-screen"
        />
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

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-20 sm:pb-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left: headline + CTA */}
            <RevealGroup
              className="text-center lg:text-left"
              stagger={0.12}
              delayChildren={0.1}
            >
              <motion.div
                variants={staggerItem}
                className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-4 py-1.5 text-sm font-medium text-crimson shadow-premium"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-saffron opacity-70 animate-ping-soft" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-saffron" />
                </span>
                {t("hero.badge")}
              </motion.div>

              <motion.h1
                variants={staggerItem}
                className="mt-7 font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-gradient-brand"
              >
                {t("hero.title")}
              </motion.h1>

              <motion.p
                variants={staggerItem}
                className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                {t("hero.subtitle")}
              </motion.p>

              <motion.div
                variants={staggerItem}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
              >
                <MagneticButton
                  onClick={() => navigate("jobs")}
                  className="bg-brand-gradient text-white hover:opacity-90 font-bold text-sm h-11 px-5 rounded-xl shadow-glow-brand ring-brand inline-flex items-center gap-2 cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  {t("hero.cta.find")}
                  <ArrowRight className="h-4 w-4" />
                </MagneticButton>
                {user ? (
                  <MagneticButton
                    onClick={() =>
                      navigate(
                        user.role === "CANDIDATE"
                          ? "candidate"
                          : user.role === "COMPANY"
                            ? "company"
                            : "admin",
                      )
                    }
                    className="bg-background border border-border hover:border-saffron/30 hover:bg-saffron/5 shadow-premium font-semibold text-sm h-11 px-5 rounded-xl inline-flex items-center gap-2 cursor-pointer group transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4 text-saffron transition-transform group-hover:scale-110" />
                    {pick("Dashboard", "ダッシュボード")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </MagneticButton>
                ) : (
                  <MagneticButton
                    onClick={() => navigate("register")}
                    className="bg-background border border-border hover:border-saffron/30 hover:bg-saffron/5 shadow-premium font-semibold text-sm h-11 px-5 rounded-xl inline-flex items-center gap-2 cursor-pointer"
                  >
                    {t("hero.cta.hire")}
                  </MagneticButton>
                )}
              </motion.div>

              <motion.p
                variants={staggerItem}
                className="mt-7 text-xs text-muted-foreground"
              >
                {pick("Hiring from IndiGate", "IndiGateからの採用企業")}
              </motion.p>
            </RevealGroup>

            {/* Right: career journey visual */}
            <Reveal
              variants={slideInRight}
              delay={0.3}
              className="relative lg:pt-4"
            >
              <HeroJourneyVisual />
            </Reveal>
          </div>

          {/* Industry Category Marquee */}
          <Reveal variants={fadeUp} delay={0.5} className="mt-14 lg:mt-18 overflow-hidden">
            <div className="flex flex-col items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">{pick("Serving top industries", "主要産業をサポート")}</p>
              <div className="relative w-full max-w-5xl mx-auto flex overflow-hidden group">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
                <div className="flex gap-4 w-max animate-marquee group-hover:![animation-play-state:paused]">
                  {[
                    "AI & Machine Learning", "Robotics & Automation", "FinTech", "E-commerce",
                    "Enterprise Software", "Gaming", "Automotive Tech", "Clean Energy",
                    "AI & Machine Learning", "Robotics & Automation", "FinTech", "E-commerce",
                    "Enterprise Software", "Gaming", "Automotive Tech", "Clean Energy"
                  ].map((name, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 rounded-full border border-border/60 bg-card/60 backdrop-blur-sm px-5 py-2.5 cursor-default hover:border-saffron/30 hover:bg-saffron/5 transition-colors whitespace-nowrap"
                    >
                      <span className="font-display font-semibold text-[13px] text-foreground/80 hover:text-foreground transition-colors">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== STATS GRID ===================== */}
      <section className="relative py-12 sm:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealGroup stagger={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <motion.div variants={staggerItem} className="flex flex-col items-center text-center p-6 rounded-2xl border border-border/50 bg-card/40">
              <span className="stat-hero">
                {(stats?.candidateCount ?? 0) > 1900 ? stats?.candidateCount : "1,900"}+
              </span>
              <span className="mt-2 text-sm font-semibold text-muted-foreground">{pick("Candidates", "候補者")}</span>
            </motion.div>
            <motion.div variants={staggerItem} className="flex flex-col items-center text-center p-6 rounded-2xl border border-border/50 bg-card/40">
              <span className="stat-hero">
                {(stats?.companyCount ?? 0) > 100 ? stats?.companyCount : "100"}+
              </span>
              <span className="mt-2 text-sm font-semibold text-muted-foreground">{pick("Companies", "企業")}</span>
            </motion.div>
            <motion.div variants={staggerItem} className="flex flex-col items-center text-center p-6 rounded-2xl border border-border/50 bg-card/40">
              <span className="stat-hero">
                {(stats?.jobCount ?? 0) > 450 ? stats?.jobCount : "450"}+
              </span>
              <span className="mt-2 text-sm font-semibold text-muted-foreground">{pick("Open Roles", "募集中の職種")}</span>
            </motion.div>
            <motion.div variants={staggerItem} className="flex flex-col items-center text-center p-6 rounded-2xl border border-border/50 bg-card/40">
              <span className="stat-hero">
                {(stats?.placementCount ?? 0) > 85 ? stats?.placementCount : "85"}%
              </span>
              <span className="mt-2 text-sm font-semibold text-muted-foreground">{pick("Match Rate", "マッチング率")}</span>
            </motion.div>
          </RevealGroup>
          <Reveal variants={fadeUp} delay={0.4}>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              {pick("* Reflects cumulative platform activity", "※ プラットフォームの累積アクティビティを反映")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===================== WHY INDIGATE (bento grid) ===================== */}
      <section className="relative py-16 sm:py-20 bg-background overflow-hidden">
        {/* Subtle gradient transition from hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-saffron/5 to-transparent"
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <Reveal variants={fadeUp}>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-saffron">
                  <ShieldCheck className="h-3 w-3" />
                  Why IndiGate
                </span>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                  The <span className="text-gradient-brand">{pick("premier bridge", "最初のブリッジ")}</span> for global talent
                </h2>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                We remove the friction of cross-border hiring with our end-to-end verified pipeline.
              </p>
            </div>
          </Reveal>

          <RevealGroup stagger={0.1} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
             {/* Large card */}
             <motion.div variants={staggerItem} className="md:col-span-2 lg:col-span-2 lg:row-span-2">
               <TiltCard max={3} className="h-full">
                 <SpotlightCard className="card-premium h-full p-8 flex flex-col justify-end min-h-[320px]">
                   <div className="absolute top-8 right-8 text-saffron/20 group-hover:text-saffron/40 transition-colors pointer-events-none">
                     <Users className="w-24 h-24" />
                   </div>
                   <div className="relative z-10 mt-auto">
                     <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-gradient text-white mb-4 shadow-glow-brand ring-brand">
                       <ShieldCheck className="h-6 w-6" />
                     </div>
                     <h3 className="font-display text-2xl font-bold mb-2">{pick("Verified Talent Pool", "認証済み人材プール")}</h3>
                     <p className="text-muted-foreground leading-relaxed">{pick("Every candidate is rigorously pre-screened for technical excellence and Japanese language proficiency (JLPT) before they ever reach your dashboard.", "すべての候補者は、お客様のダッシュボードに表示される前に、技術力と日本語能力（JLPT）について厳格な事前審査を受けています。")}</p>
                     
                     {/* Pipeline illustration block */}
                     <div className="mt-8 rounded-xl bg-background/50 border border-border/50 p-4">
                       <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{pick("Typical Cohort Progression", "一般的なコホートの進行")}</p>
                       <div className="space-y-3">
                         <div className="flex justify-between items-center text-sm">
                           <span className="text-muted-foreground">{pick("Screened", "審査済み")}</span>
                           <span className="font-semibold text-foreground">10,000+</span>
                         </div>
                         <div className="h-1.5 w-full bg-border rounded-full overflow-hidden"><div className="h-full bg-saffron/40 w-full" /></div>
                         <div className="flex justify-between items-center text-sm">
                           <span className="text-muted-foreground">{pick("Shortlisted", "選考通過")}</span>
                           <span className="font-semibold text-foreground">~800</span>
                         </div>
                         <div className="h-1.5 w-full bg-border rounded-full overflow-hidden"><div className="h-full bg-saffron w-[8%]" /></div>
                       </div>
                       <p className="mt-4 text-[10px] text-muted-foreground opacity-60">
                         {pick("* Illustrative of a typical cohort progression", "※ 一般的なコホートの進行例")}
                       </p>
                     </div>
                   </div>
                 </SpotlightCard>
               </TiltCard>
             </motion.div>

             {/* Small card 1 */}
             <motion.div variants={staggerItem} className="md:col-span-1 lg:col-span-2">
               <TiltCard max={5} className="h-full">
                 <SpotlightCard className="card-premium h-full p-6 sm:p-8 flex flex-col justify-center min-h-[160px]">
                   <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                     <div className="shrink-0 inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-crimson/10 text-crimson ring-1 ring-inset ring-crimson/20">
                       <Globe2 className="h-7 w-7" />
                     </div>
                     <div>
                       <h3 className="font-display text-xl font-bold mb-1.5">{pick("Bilingual Platform", "バイリンガル・プラットフォーム")}</h3>
                       <p className="text-sm text-muted-foreground leading-relaxed">{pick("Post jobs, review resumes, and communicate seamlessly in Japanese or English.", "求人情報を掲載し、履歴書を確認し、日本語または英語でスムーズにコミュニケーションをとることができます。")}</p>
                     </div>
                   </div>
                 </SpotlightCard>
               </TiltCard>
             </motion.div>

             {/* Small card 2 */}
             <motion.div variants={staggerItem} className="md:col-span-1 lg:col-span-1">
               <TiltCard max={5} className="h-full">
                 <SpotlightCard className="card-premium h-full p-6 sm:p-8 flex flex-col justify-center min-h-[160px]">
                   <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 mb-4 ring-1 ring-inset ring-emerald-500/20">
                     <Plane className="h-6 w-6" />
                   </div>
                   <h3 className="font-display text-lg font-bold mb-1.5">{pick("Visa & Relocation", "ビザと転居")}</h3>
                   <p className="text-xs text-muted-foreground leading-relaxed">{pick("Full support for COE applications and seamless transition to Japan.", "COE申請の全面的なサポートと、日本へのスムーズな移住を実現します。")}</p>
                 </SpotlightCard>
               </TiltCard>
             </motion.div>

             {/* Small card 3 */}
             <motion.div variants={staggerItem} className="md:col-span-1 lg:col-span-1">
               <TiltCard max={5} className="h-full">
                 <SpotlightCard className="card-premium h-full p-6 sm:p-8 flex flex-col justify-center min-h-[160px]">
                   <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 mb-4 ring-1 ring-inset ring-blue-500/20">
                     <Briefcase className="h-6 w-6" />
                   </div>
                   <h3 className="font-display text-lg font-bold mb-1.5">{pick("Direct Placement", "ダイレクト・プレースメント")}</h3>
                   <p className="text-xs text-muted-foreground leading-relaxed">{pick("Direct hiring with transparent processes and no hidden intermediary layers.", "透明性の高いプロセスを採用し、隠れた仲介層を一切介さない直接採用。")}</p>
                 </SpotlightCard>
               </TiltCard>
             </motion.div>

          </RevealGroup>
        </div>
      </section>



      {/* ===================== HOW IT WORKS (connected timeline) ===================== */}
      <section className="relative py-16 sm:py-20 bg-background overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variants={fadeUp}>
            <SectionHeader
              icon={Compass}
              label={pick("Process", "プロセス")}
              title={t("how.title")}
              subtitle={t("how.subtitle")}
            />
          </Reveal>

          <div className="relative">
            {/* Horizontal connector line on lg+ with animated progress dot */}
            <div
              aria-hidden
              className="hidden lg:block absolute top-[3.5rem] left-[14%] right-[14%] h-px"
            >
              <div className="h-full bg-gradient-to-r from-saffron/20 via-saffron/50 to-crimson/30" />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-brand-gradient shadow-glow-brand"
                animate={{ left: ["0%", "100%"] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            <RevealGroup
              className="grid gap-6 lg:grid-cols-3 relative"
              stagger={0.14}
            >
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
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="relative"
                >
                  <SpotlightCard className="card-premium relative h-full p-7 overflow-hidden">
                    {/* Big step number watermark */}
                    <span className="absolute top-4 right-5 font-display text-6xl font-extrabold text-saffron/8 select-none">
                      {s.step}
                    </span>
                    {/* Numbered badge sitting on the timeline */}
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
                    <h3 className="font-display text-xl font-bold">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {s.desc}
                    </p>
                  </SpotlightCard>
                </motion.div>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ===================== VISA GUIDE ===================== */}
      <section className="relative py-16 sm:py-20 bg-card/30 border-y border-border overflow-hidden">
        {/* Tokyo skyline background */}
        <img
          src="/images/tokyo-skyline.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 via-transparent to-card/80 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <Reveal variants={fadeUp}>
            <SectionHeader
              icon={Plane}
              label={pick("Visa Guide", "Visaガイド")}
              title={t("visa.title")}
              subtitle={t("visa.subtitle")}
            />
          </Reveal>

          <div className="max-w-4xl mx-auto">
            {/* Visa type quick cards */}
            <Reveal variants={fadeUp} delay={0.05}>
              <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                {[
                  {
                    icon: Wrench,
                    title: t("visa.ssw.title"),
                    tag: "JLPT N4+",
                    value: "ssw",
                  },
                  {
                    icon: Building2,
                    title: t("visa.engineer.title"),
                    tag: "Degree / 10y",
                    value: "engineer",
                  },
                  {
                    icon: ArrowLeftRight,
                    title: t("visa.transfer.title"),
                    tag: "1yr+ same co.",
                    value: "transfer",
                  },
                ].map((v, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -4 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 22,
                    }}
                    className="card-premium p-4 flex items-center gap-3"
                  >
                    <div className="grid place-items-center h-11 w-11 rounded-xl bg-saffron/10 text-saffron ring-1 ring-inset ring-saffron/15 shrink-0">
                      <v.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-tight">
                        {v.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {v.tag}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Reveal>

            <Reveal variants={fadeUp} delay={0.15}>
              <Accordion type="single" collapsible className="space-y-3">
                <VisaAccordionItem
                  value="ssw"
                  icon={Wrench}
                  title={t("visa.ssw.title")}
                  desc={t("visa.ssw.desc")}
                  requirements={[
                    "JLPT N4 or higher",
                    "Industry skills test",
                    "Valid passport",
                    "Health certificate",
                  ]}
                />
                <VisaAccordionItem
                  value="engineer"
                  icon={Building2}
                  title={t("visa.engineer.title")}
                  desc={t("visa.engineer.desc")}
                  requirements={[
                    "Bachelor's degree OR 10 years experience",
                    "Job offer from Japanese company",
                    "Relevant field experience",
                    "Valid passport",
                  ]}
                />
                <VisaAccordionItem
                  value="transfer"
                  icon={ArrowLeftRight}
                  title={t("visa.transfer.title")}
                  desc={t("visa.transfer.desc")}
                  requirements={[
                    "1+ year at same company",
                    "Transfer to Japan office",
                    "Valid passport",
                    "Employment contract",
                  ]}
                />
              </Accordion>
            </Reveal>

            {/* Support callout */}
            <Reveal variants={fadeUp} delay={0.3}>
              <div className="mt-8 rounded-2xl bg-brand-gradient p-6 sm:p-8 text-center shadow-glow-brand relative overflow-hidden">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.3) 1px, transparent 1px)",
                    backgroundSize: "32px 32px, 44px 44px",
                  }}
                />
                <ShieldCheck className="h-8 w-8 text-white mx-auto mb-3 relative" />
                <p className="text-white font-semibold text-lg leading-relaxed max-w-2xl mx-auto relative">
                  {t("visa.support")}
                </p>
                <MagneticButton
                  onClick={() => navigate("home")}
                  className="mt-5 bg-white text-crimson hover:bg-white/90 font-bold h-11 px-6 rounded-xl inline-flex items-center gap-2 cursor-pointer relative"
                >
                  {t("visa.cta")}
                  <ArrowRight className="h-4 w-4" />
                </MagneticButton>
              </div>
            </Reveal>
          </div>
        </div>
      </section>


      {/* ===================== FEATURED ROLES CAROUSEL / GRID ===================== */}
      {featured.length > 0 && (
        <section className="relative py-16 sm:py-20 bg-mesh/40 border-t border-border overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal variants={fadeUp}>
              <SectionHeader
                icon={Star}
                label="Featured Roles"
                title="Curated for you"
                subtitle="Hand-picked positions with visa sponsorship — selected by our team for quality and fit."
              />
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {featured.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== TESTIMONIALS (featured + supporting) ===================== */}
      {testimonials.length > 0 && (
        <section className="relative py-16 sm:py-20 bg-card/30 border-y border-border overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal variants={fadeUp}>
              <SectionHeader
                icon={Quote}
                label={pick("Testimonials", "お客様の声")}
                title={t("testimonials.title")}
                subtitle={t("testimonials.subtitle")}
              />
            </Reveal>

            <div className="grid lg:grid-cols-5 gap-5 sm:gap-6">
              <Reveal variants={scaleIn} className="lg:col-span-3">
                <FeaturedTestimonial te={testimonials[0]} />
              </Reveal>
              <div className="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-1 gap-5 sm:gap-6">
                {testimonials.slice(1, 3).map((te, i) => (
                  <Reveal
                    key={te.id}
                    variants={fadeUp}
                    delay={0.1 + i * 0.1}
                  >
                    <MiniTestimonial te={te} />
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Marquee strip for additional testimonials */}
            {testimonials.length > 3 && (
              <div className="relative mt-10">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-32 bg-gradient-to-r from-card/30 to-transparent"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-32 bg-gradient-to-l from-card/30 to-transparent"
                />
                <div className="flex gap-5 w-max animate-marquee">
                  {[...testimonials.slice(3), ...testimonials.slice(3)].map(
                    (te, i) => (
                      <figure
                        key={i}
                        className="w-[300px] sm:w-[360px] shrink-0 rounded-2xl border border-border bg-background p-5 shadow-premium transition-all hover:shadow-glow-brand hover:border-saffron/40 hover:-translate-y-1"
                      >
                        <div className="flex items-start justify-between">
                          <Quote className="h-6 w-6 text-saffron/50" />
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, s) => (
                              <Star
                                key={s}
                                className="h-3 w-3 fill-saffron text-saffron"
                              />
                            ))}
                          </div>
                        </div>
                        <blockquote className="mt-2 text-sm leading-relaxed text-foreground/90 line-clamp-3">
                          {pick(te.content, te.contentJa)}
                        </blockquote>
                        <figcaption className="mt-4 flex items-center gap-2.5 border-t border-border/60 pt-3">
                          <CompanyAvatar name={te.name} size={32} />
                          <div className="min-w-0">
                            <p className="font-semibold text-xs truncate">
                              {te.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {te.role}
                              {te.company ? ` · ${te.company}` : ""}
                            </p>
                          </div>
                        </figcaption>
                      </figure>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===================== FAQ ===================== */}
      <section className="relative py-16 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variants={fadeUp}>
            <SectionHeader
              icon={HelpCircle}
              label={t("faq.badge")}
              title={t("faq.title")}
              subtitle={t("faq.subtitle")}
            />
          </Reveal>
          <div className="max-w-3xl mx-auto">
            <RevealGroup stagger={0.06} className="space-y-2">
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
                  <motion.div key={i} variants={staggerItem}>
                    <AccordionItem key={i} value={`faq-${i}`}
  className="border border-border/80 rounded-xl px-6 bg-card hover:border-saffron/30 hover:shadow-premium transition-all data-[state=open]:border-saffron/40 data-[state=open]:bg-saffron/[0.02]"
>
  <AccordionTrigger className="font-display font-semibold text-left hover:no-underline py-5 text-[15px] hover:text-saffron transition-colors [&[data-state=open]]:text-saffron">
    {item.q}
  </AccordionTrigger>
  <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-[14px]">
    {item.a}
  </AccordionContent>
</AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </RevealGroup>

            <Reveal variants={fadeUp} delay={0.2} className="mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border shadow-sm">
                <span className="text-sm font-semibold">
                  Still have questions?
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="font-semibold text-foreground border-border hover:bg-muted"
                >
                  <Mail className="h-4 w-4 mr-2" />{pick("Talk to our team", "弊社チームまでお問い合わせください")}</Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      {/* ===================== CTA (auth-aware) ===================== */}
      <section className="relative py-12 sm:py-16 border-y border-border overflow-hidden">
        {/* Background gradient specifically for the CTA wrapper */}
        <div className="absolute inset-0 bg-gradient-to-b from-background to-card/50 -z-10" />
        
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal variants={fadeUp}>
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-black px-6 py-12 sm:px-12 sm:py-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 group">
              {/* Mesh overlay with saffron/crimson aurora */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-mesh opacity-40 mix-blend-screen"
              />
              {/* Glow blobs with hover animation */}
              <div className="pointer-events-none absolute inset-0 opacity-60">
                <div className="absolute -top-20 -left-20 h-48 w-48 rounded-full bg-saffron/40 blur-[60px] group-hover:bg-saffron/60 transition-colors duration-700 animate-aurora" />
                <div
                  className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-crimson/40 blur-[60px] group-hover:bg-crimson/60 transition-colors duration-700 animate-aurora"
                  style={{ animationDelay: "3s" }}
                />
              </div>
              {/* Dot pattern overlay */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.15] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="relative z-10 flex flex-col items-center">
                {/* Small premium badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md"
                >
                  <Sparkles className="h-3.5 w-3.5 text-saffron" />
                  Your journey starts here
                </motion.div>

                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {user
                    ? pick("Welcome back!", "おかえりなさい！")
                    : t("cta.title")}
                </h2>
                <p className="mt-4 text-white/80 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-medium">
                  {user
                    ? pick(
                        "Continue your Japan journey from where you left off.",
                        "日本へのキャリアを続けましょう。",
                      )
                    : t("cta.subtitle")}
                </p>
                <MagneticButton
                  onClick={() =>
                    navigate(
                      user
                        ? user.role === "CANDIDATE"
                          ? "candidate"
                          : user.role === "COMPANY"
                            ? "company"
                            : "admin"
                        : "register",
                    )
                  }
                  className="mt-8 bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all duration-300 font-bold text-sm sm:text-base h-12 px-8 rounded-full inline-flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
                >
                  {user
                    ? pick("Go to Dashboard", "ダッシュボードへ")
                    : t("cta.button")}
                  <div className="grid place-items-center h-6 w-6 rounded-full bg-slate-900 text-white shrink-0">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </MagneticButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== CONTACT ===================== */}
      <ContactSection />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Contact section                                                           */
/* -------------------------------------------------------------------------- */

function ContactSection() {
  const { t, pick } = useT();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

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
    <section
      id="contact"
      className="relative py-16 sm:py-20 bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal variants={fadeUp}>
          <SectionHeader
            icon={Mail}
            label={pick("Contact", "お問い合わせ")}
            title={t("contact.title")}
            subtitle={t("contact.subtitle")}
          />
        </Reveal>

        <Reveal variants={fadeUp}>
          <div className="grid lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16 items-start max-w-5xl mx-auto">
            {/* Left: contact info sidebar */}
            <div className="space-y-6">
              <h3 className="font-display font-bold text-xl text-foreground">{pick("Talk to a real human", "実際に担当者と話す")}</h3>
              <ul className="space-y-5">
                {[
                  {
                    icon: Clock,
                    title: pick("Response within 24 hours", "24時間以内にご返信いたします"),
                    desc: pick("Mon–Fri IST", "月～金 IST"),
                  },
                  {
                    icon: MapPin,
                    title: pick("Hyderabad, India", "インド、ハイデラバード"),
                    desc: pick("Partners across Japan", "日本全国のパートナー"),
                  },
                  {
                    icon: ArrowRight,
                    title: pick("We route your message", "お客様からのメッセージを転送いたします"),
                    desc: pick("To the right specialist", "適切な専門家へ"),
                  },
                ].map((item, i) => (
                  <motion.li key={i}
  initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }} transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.1 + i * 0.1 }}
  className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/60 p-4 hover:border-saffron/30 hover:bg-saffron/5 transition-all"
>
  <div className="grid place-items-center h-9 w-9 rounded-lg bg-saffron/10 text-saffron ring-1 ring-inset ring-saffron/15 shrink-0">
    <item.icon className="h-4 w-4" />
  </div>
  <div>
    <p className="font-semibold text-sm">{item.title}</p>
    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
  </div>
</motion.li>
                ))}
              </ul>
              <div className="mt-8 rounded-xl border border-border bg-card p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{pick("Direct Email", "直接メール")}</span>
                <a href="mailto:contact@indigate.work" className="text-saffron hover:underline font-semibold text-sm">{pick("contact@indigate.work", pick("contact@indigate.work", "contact@indigate.work"))}</a>
              </div>
            </div>

            {/* Right: form / success */}
            <div className="w-full">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 14,
                      delay: 0.1,
                    }}
                    className="mx-auto mb-3"
                  >
                    <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
                  </motion.div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                    {t("contact.success")}
                  </p>
                </motion.div>
              ) : (
                <form
                  onSubmit={submit}
                  className="space-y-4 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-premium"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label={t("contact.name")}>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 transition-shadow"
                        placeholder={pick("Arjun Sharma", "アルジュン・シャルマ")}
                      />
                    </Field>
                    <Field label={t("contact.email")}>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 transition-shadow"
                        placeholder={pick("you@example.com", pick("you@example.com", "you@example.com"))}
                      />
                    </Field>
                  </div>
                  <Field label={t("contact.subject")}>
                    <input
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 transition-shadow"
                      placeholder={pick("How can we help?", "何かお手伝いできることはありますか？")}
                    />
                  </Field>
                  <Field label={t("contact.message")}>
                    <textarea
                      required
                      minLength={20}
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      rows={5}
                      className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 resize-none transition-shadow"
                      placeholder={pick("Tell us a bit about what you need...", "ご要望について、少しお聞かせください…")}
                    />
                  </Field>
                  <motion.div
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-brand-gradient text-white hover:opacity-90 font-semibold h-12 inline-flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        t("common.loading")
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {t("contact.submit")}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*  Visa accordion item                                                       */
/* -------------------------------------------------------------------------- */

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
  const { t, pick } = useT();
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
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {desc}
          </p>
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
