"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { CompanyAvatar } from "@/components/brand/logo";
import { JobCard } from "@/components/jobs/job-card";
import { useCountUp } from "@/components/brand/use-count-up";
import {
  Reveal,
  RevealGroup,
  staggerItem,
  fadeUp,
  scaleIn,
  slideInRight,
  motion,
  easeOutExpo,
} from "@/lib/motion";
import {
  MagneticButton,
  SpotlightCard,
  TiltCard,
} from "@/components/brand/motion-primitives";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  FileText,
  Plane,
  PlaneTakeoff,
  LayoutDashboard,
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
  MapPin,
  TrendingUp,
  Compass,
  Calendar,
  Clock,
  Send,
  MessageCircle,
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
      <span className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-crimson">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
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
          "section-rule mt-5 max-w-xs" +
          (align === "center" ? " mx-auto" : "")
        }
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bento stat cards                                                          */
/* -------------------------------------------------------------------------- */

function useInView(threshold = 0.3) {
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
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function BentoStat({
  value,
  suffix,
  label,
  delay,
  icon: Icon,
  accent = "saffron",
  className,
}: {
  value: number;
  suffix?: string;
  label: string;
  delay: number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "saffron" | "crimson";
  className?: string;
}) {
  const count = useCountUp(value, 1800);
  const { ref, visible } = useInView(0.3);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: easeOutExpo, delay: delay / 1000 }}
      whileHover={{ y: -4 }}
      className={
        "hero-stat group relative h-full p-5 sm:p-6 flex flex-col justify-between " +
        (className ?? "")
      }
    >
      <div className="flex items-start justify-between">
        <motion.div
          whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
          transition={{ duration: 0.5 }}
          className={
            "grid place-items-center h-10 w-10 rounded-xl ring-1 ring-inset " +
            (accent === "saffron"
              ? "bg-saffron/10 text-saffron ring-saffron/20"
              : "bg-crimson/10 text-crimson ring-crimson/20")
          }
        >
          <Icon className="h-5 w-5" />
        </motion.div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-saffron group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="mt-4">
        <div className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">
          <span className="text-gradient-brand">
            {count.toLocaleString()}
            {suffix}
          </span>
        </div>
        <p className="mt-1.5 text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

function BentoFeatured({
  value,
  suffix,
  label,
  subLabel,
  delay,
  className,
}: {
  value: number;
  suffix?: string;
  label: string;
  subLabel: string;
  delay: number;
  className?: string;
}) {
  const count = useCountUp(value, 2000);
  const { ref, visible } = useInView(0.25);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: easeOutExpo, delay: delay / 1000 }}
      className={
        "hero-stat group relative h-full p-6 sm:p-8 overflow-hidden flex flex-col justify-between " +
        (className ?? "")
      }
    >
      {/* Mesh background + glow */}
      <div aria-hidden className="absolute inset-0 bg-mesh opacity-40" />
      <div
        aria-hidden
        className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-crimson/15 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-saffron/20 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full border border-crimson/30 bg-crimson/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-crimson">
            <Award className="h-3 w-3" />
            {label}
          </span>
        </div>
        <div className="mt-6">
          <div className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none">
            <span className="text-gradient-brand">
              {count.toLocaleString()}
              {suffix}
            </span>
          </div>
          <p className="mt-3 text-sm sm:text-base font-semibold text-foreground uppercase tracking-wide">
            {subLabel}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero journey visual (right column of hero)                                */
/* -------------------------------------------------------------------------- */

function HeroJourneyVisual({ featured }: { featured: JobDTO[] }) {
  const job = featured[0];

  return (
    <TiltCard max={5} className="relative">
      <div className="card-premium rounded-3xl p-6 sm:p-7 relative overflow-hidden">
        {/* Background mesh + glows */}
        <div aria-hidden className="absolute inset-0 bg-mesh opacity-30" />
        <div
          aria-hidden
          className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-crimson/15 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-saffron/20 blur-3xl"
        />

        {/* Header */}
        <div className="relative flex items-center justify-between mb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-70 animate-ping-soft" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Live journey
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">
            India → Japan
          </span>
        </div>

        {/* Route visualization */}
        <div className="relative h-36 mb-1">
          <svg
            viewBox="0 0 320 140"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="hero-route" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--saffron)" />
                <stop offset="100%" stopColor="var(--crimson)" />
              </linearGradient>
            </defs>
            {/* Faded dotted base path */}
            <path
              d="M 32 100 Q 160 10 288 60"
              fill="none"
              stroke="url(#hero-route)"
              strokeWidth="2"
              strokeDasharray="3 7"
              strokeLinecap="round"
              opacity="0.25"
            />
            {/* Animated solid drawing path */}
            <motion.path
              d="M 32 100 Q 160 10 288 60"
              fill="none"
              stroke="url(#hero-route)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.9 }}
              transition={{ duration: 1.8, ease: easeOutExpo, delay: 0.6 }}
            />
          </svg>

          {/* India pin */}
          <div className="absolute left-[6%] bottom-[18%] flex flex-col items-center">
            <div className="grid place-items-center h-9 w-9 rounded-full bg-saffron/15 ring-2 ring-saffron/40 text-saffron backdrop-blur-sm">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="mt-1.5 text-[10px] font-bold uppercase tracking-wider">
              India
            </span>
          </div>

          {/* Japan pin */}
          <div className="absolute right-[4%] top-[22%] flex flex-col items-center">
            <div className="grid place-items-center h-9 w-9 rounded-full bg-crimson/15 ring-2 ring-crimson/40 text-crimson backdrop-blur-sm">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="mt-1.5 text-[10px] font-bold uppercase tracking-wider">
              Japan
            </span>
          </div>

          {/* Animated plane traveling along the route */}
          <motion.div
            className="absolute"
            initial={{ left: "8%", bottom: "22%", opacity: 0 }}
            animate={{
              left: ["8%", "50%", "92%", "92%"],
              bottom: ["22%", "62%", "38%", "38%"],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1,
              delay: 1.2,
            }}
          >
            <div className="grid place-items-center h-8 w-8 -ml-4 -mt-4 rounded-full bg-brand-gradient text-white shadow-glow-brand ring-2 ring-background">
              <Plane className="h-3.5 w-3.5 -rotate-12" />
            </div>
          </motion.div>

          {/* Floating mini job card peeking out top-right */}
          {job && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 1.4,
                type: "spring",
                stiffness: 200,
                damping: 18,
              }}
              className="absolute -top-3 -right-2 sm:-right-4 w-44 sm:w-52 rounded-xl glass border border-border/70 shadow-premium p-3 hidden sm:block"
            >
              <div className="flex items-center gap-2 mb-2">
                <CompanyAvatar
                  name={job.company.companyName}
                  color={job.company.logoUrl}
                  size={28}
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold truncate leading-tight">
                    {job.title}
                  </p>
                  <p className="text-[9px] text-muted-foreground truncate">
                    {job.company.companyName}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="skill-tag text-[9px] font-semibold py-0 px-1.5">
                  {job.jlptRequired}
                </span>
                <span className="text-[9px] text-saffron font-bold uppercase tracking-wide">
                  Featured
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Pipeline stages */}
        <div className="relative grid grid-cols-4 gap-1.5 pt-4 mt-3 border-t border-border/60">
          {[
            { icon: FileText, label: "Profile" },
            { icon: Search, label: "Matched" },
            { icon: Calendar, label: "Interview" },
            { icon: PlaneTakeoff, label: "Relocate" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + i * 0.15, duration: 0.5 }}
              className="text-center"
            >
              <div className="relative grid place-items-center h-8 w-8 rounded-lg bg-card border border-border mx-auto mb-1.5">
                <s.icon className="h-3.5 w-3.5 text-crimson" />
              </div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide truncate">
                {s.label}
              </p>
            </motion.div>
          ))}
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
      }>("/api/jobs/stats"),
      api<{ jobs: JobDTO[] }>("/api/jobs?limit=3"),
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
                  className="bg-brand-gradient text-white hover:opacity-90 font-semibold text-base h-12 px-7 rounded-xl shadow-glow-brand inline-flex items-center gap-2 cursor-pointer"
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
                    className="bg-background border-2 border-border hover:border-saffron/50 hover:bg-saffron/5 font-semibold text-base h-12 px-7 rounded-xl inline-flex items-center gap-2 cursor-pointer group transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4 text-saffron transition-transform group-hover:scale-110" />
                    {pick("Go to Dashboard", "ダッシュボードへ")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </MagneticButton>
                ) : (
                  <MagneticButton
                    onClick={() => navigate("register")}
                    className="bg-background border-2 border-border hover:border-saffron/50 font-semibold text-base h-12 px-7 rounded-xl inline-flex items-center gap-2 cursor-pointer"
                  >
                    {t("hero.cta.hire")}
                  </MagneticButton>
                )}
              </motion.div>

              <motion.p
                variants={staggerItem}
                className="mt-7 text-xs text-muted-foreground"
              >
                {t("hero.trusted")}
              </motion.p>
            </RevealGroup>

            {/* Right: career journey visual */}
            <Reveal
              variants={slideInRight}
              delay={0.3}
              className="relative lg:pt-4"
            >
              <HeroJourneyVisual featured={featured} />
            </Reveal>
          </div>

          {/* Company strip */}
          <Reveal variants={fadeUp} delay={0.5} className="mt-12 lg:mt-16">
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
                    <span className="font-display font-bold text-sm">
                      {name}
                    </span>
                  </motion.div>
                ),
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== STATS (bento grid) ===================== */}
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
                <span className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-crimson">
                  <TrendingUp className="h-3 w-3" />
                  By the numbers
                </span>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                  A network built on{" "}
                  <span className="text-gradient-brand">real outcomes</span>
                </h2>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                Every number reflects a candidate, a company, or a successful
                relocation — never vanity metrics.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 lg:auto-rows-[160px] gap-4 sm:gap-5">
            <BentoFeatured
              value={stats?.placementCount ?? 312}
              suffix="+"
              label={t("stats.placements")}
              subLabel={pick("Successful placements", "内定成立")}
              delay={0}
              className="col-span-2 lg:row-span-2"
            />
            <BentoStat
              value={stats?.jobCount ?? 12}
              suffix="+"
              label={t("stats.jobs")}
              delay={120}
              icon={Briefcase}
              accent="saffron"
            />
            <BentoStat
              value={stats?.candidateCount ?? 1900}
              suffix="+"
              label={t("stats.candidates")}
              delay={240}
              icon={Users}
              accent="crimson"
            />
            <BentoStat
              value={stats?.companyCount ?? 5}
              suffix="+"
              label={t("stats.companies")}
              delay={360}
              icon={Building2}
              accent="saffron"
              className="col-span-2"
            />
          </div>
        </div>
      </section>

      {/* ===================== FEATURED JOBS (premium cards) ===================== */}
      {featured.length > 0 && (
        <section className="relative py-16 sm:py-20 bg-card/30 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal variants={fadeUp}>
              <SectionHeader
                icon={Briefcase}
                label="Featured"
                title={t("jobs.title")}
                subtitle={t("jobs.subtitle")}
              />
            </Reveal>
            <RevealGroup
              className="grid gap-6 sm:gap-7 sm:grid-cols-2 lg:grid-cols-3"
              stagger={0.1}
            >
              {featured.map((job) => (
                <motion.div
                  key={job.id}
                  variants={staggerItem}
                  className="relative h-full group"
                >
                  {/* Top accent bar — grows on hover */}
                  <div className="absolute -top-px left-6 right-6 h-0.5 bg-brand-gradient origin-left scale-x-50 opacity-30 group-hover:scale-x-100 group-hover:opacity-100 transition-all duration-500 rounded-full z-20" />
                  {/* Featured ribbon */}
                  <span className="absolute -top-2.5 left-5 z-20 inline-flex items-center gap-1 rounded-full bg-brand-gradient px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-glow-brand">
                    <Sparkles className="h-2.5 w-2.5" />
                    Featured
                  </span>
                  <JobCard job={job} />
                </motion.div>
              ))}
            </RevealGroup>
            <Reveal variants={fadeUp} delay={0.1} className="mt-12 text-center">
              <Button
                variant="outline"
                onClick={() => navigate("jobs")}
                className="font-semibold group h-11 px-6 rounded-xl border-saffron/30 hover:border-saffron/60 hover:bg-saffron/5"
              >
                {t("jobs.viewall")}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Reveal>
          </div>
        </section>
      )}

      {/* ===================== HOW IT WORKS (connected timeline) ===================== */}
      <section className="relative py-16 sm:py-20 bg-background overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variants={fadeUp}>
            <SectionHeader
              icon={Compass}
              label="Process"
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
      <section className="relative py-16 sm:py-20 bg-card/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variants={fadeUp}>
            <SectionHeader
              icon={Plane}
              label="Visa Guide"
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

      {/* ===================== WHY INDIGATE (value props + pipeline) ===================== */}
      <section className="relative py-16 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variants={fadeUp}>
            <SectionHeader
              icon={ShieldCheck}
              label="Why IndiGate"
              title="Built for the cross-border journey"
              subtitle="From India to Japan — we handle the friction so you can focus on what you do best: great work."
            />
          </Reveal>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <Reveal variants={fadeUp}>
              <ul className="space-y-3">
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
                    title: "End-to-end support",
                    desc: "From job matching to visa application and relocation — we support you at every step.",
                  },
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: easeOutExpo, delay: i * 0.08 }}
                    whileHover={{ x: 4 }}
                    className="group flex gap-4 rounded-xl border border-transparent hover:border-saffron/30 hover:bg-card hover:shadow-premium p-3 -m-3 transition-all"
                  >
                    <div className="shrink-0 grid place-items-center h-10 w-10 rounded-lg bg-saffron/10 text-saffron ring-1 ring-inset ring-saffron/15 group-hover:bg-brand-gradient group-hover:text-white group-hover:ring-transparent transition-all">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </Reveal>

            <Reveal variants={fadeUp}>
              <div className="relative">
                <div className="absolute inset-0 -z-10 bg-mesh rounded-3xl" />
                <div className="rounded-3xl border border-border bg-card p-6 shadow-premium relative overflow-hidden">
                  {/* Subtle dot pattern overlay (India × Japan motif) */}
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.06] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div className="relative flex items-center gap-3 pb-4 border-b">
                    <motion.div
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="grid place-items-center h-10 w-10 rounded-lg bg-brand-gradient text-white"
                    >
                      <Globe2 className="h-5 w-5" />
                    </motion.div>
                    <div>
                      <p className="font-semibold text-sm">
                        India → Japan pipeline
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Real-time placement flow
                      </p>
                    </div>
                  </div>
                  <div className="relative mt-6 space-y-4">
                    {[
                      { icon: FileText, label: pick("Profile created", "プロフィール作成"), desc: pick("Complete your resume", "履歴書を完成") },
                      { icon: Search, label: pick("Matched with jobs", "求人とマッチング"), desc: pick("Apply to roles", "求人に応募") },
                      { icon: Calendar, label: pick("Interview scheduled", "面接調整"), desc: pick("Company reviews", "企業審査") },
                      { icon: PlaneTakeoff, label: pick("Relocated to Japan", "日本へ移住"), desc: pick("Visa + onboarding", "ビザ＋オンボーディング") },
                    ].map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="flex items-center gap-3"
                      >
                        <div className="grid place-items-center h-9 w-9 rounded-lg bg-saffron/10 border border-saffron/20 text-saffron shrink-0">
                          <step.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{step.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{step.desc}</p>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground/50">{String(i + 1).padStart(2, "0")}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS (featured + supporting) ===================== */}
      {testimonials.length > 0 && (
        <section className="relative py-16 sm:py-20 bg-card/30 border-y border-border overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal variants={fadeUp}>
              <SectionHeader
                icon={Quote}
                label="Testimonials"
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
                    className="border border-border rounded-xl px-6 bg-card hover:border-saffron/30 hover:shadow-premium transition-all"
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

            <Reveal variants={fadeUp} delay={0.2} className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Still have questions?{" "}
                <button
                  onClick={() =>
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="font-semibold text-crimson hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Talk to our team{" "}
                  <ArrowRight className="h-3 w-3" />
                </button>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== CTA (auth-aware) ===================== */}
      <section className="relative py-16 sm:py-20 bg-card/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variants={fadeUp}>
            <div className="card-premium relative overflow-hidden rounded-3xl bg-sidebar text-sidebar-foreground px-8 py-14 sm:px-16 sm:py-18 text-center">
              {/* Mesh overlay with saffron/crimson aurora */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-mesh opacity-60 mix-blend-screen"
              />
              {/* Glow blobs */}
              <div className="pointer-events-none absolute inset-0 opacity-50">
                <div className="absolute top-0 left-1/4 h-40 w-40 rounded-full bg-saffron/30 blur-3xl animate-aurora" />
                <div
                  className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-crimson/30 blur-3xl animate-aurora"
                  style={{ animationDelay: "3s" }}
                />
              </div>
              {/* Dot pattern overlay */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.08] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="relative">
                <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                  {user
                    ? pick("Welcome back!", "おかえりなさい！")
                    : t("cta.title")}
                </h2>
                <p className="mt-4 text-white/90 text-lg max-w-2xl mx-auto">
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
                  className="mt-8 bg-white text-crimson hover:bg-white/90 font-bold text-base h-12 px-8 rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  {user
                    ? pick("Go to Dashboard", "ダッシュボードへ")
                    : t("cta.button")}
                  <ArrowRight className="h-4 w-4" />
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
  const { t } = useT();
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
            label="Contact"
            title={t("contact.title")}
            subtitle={t("contact.subtitle")}
          />
        </Reveal>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Left: contact info sidebar */}
          <Reveal variants={fadeUp} className="lg:col-span-2">
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-xl font-bold">
                  Talk to a real human
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Questions about visas, job eligibility, or company
                  partnerships? Our team reads every message.
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  {
                    icon: Clock,
                    title: "Response within 24 hours",
                    desc: "Monday–Friday, IST business hours.",
                  },
                  {
                    icon: MapPin,
                    title: "Hyderabad, India",
                    desc: "With partners across Japan.",
                  },
                  {
                    icon: MessageCircle,
                    title: "What happens next",
                    desc: "We review your note and route it to the right specialist.",
                  },
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      ease: easeOutExpo,
                      delay: 0.1 + i * 0.1,
                    }}
                    className="flex items-start gap-3"
                  >
                    <div className="grid place-items-center h-9 w-9 rounded-lg bg-saffron/10 text-saffron ring-1 ring-inset ring-saffron/15 shrink-0">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Right: form / success */}
          <Reveal variants={fadeUp} delay={0.15} className="lg:col-span-3">
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
                      placeholder="Arjun Sharma"
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
                      placeholder="you@example.com"
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
                    placeholder="How can we help?"
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
                    placeholder="Tell us a bit about what you need..."
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
          </Reveal>
        </div>
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
