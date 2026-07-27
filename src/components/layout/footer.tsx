"use client";
import { useT } from "@/lib/use-t";
import { useApp } from "@/lib/store";
import { Logo } from "@/components/brand/logo";
import {
  Mail,
  ExternalLink,
  MapPin,
  ArrowUpRight,
  Building2
} from "lucide-react";
import { motion } from "framer-motion";

function OfficeInfo({ icon: Icon, title, lines }: { icon: any, title: string, lines: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="w-full rounded-2xl border border-sidebar-border/40 bg-sidebar-accent/30 p-4 flex items-start gap-3.5 hover:border-saffron/20 transition-colors"
    >
      <span className="grid place-items-center h-9 w-9 rounded-xl bg-saffron/10 border border-saffron/20 text-saffron shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-saffron/70 mb-1.5">{title}</p>
        {lines.map((line, i) => (
          <p key={i} className="text-sm text-sidebar-foreground/60 leading-relaxed">{line}</p>
        ))}
      </div>
    </motion.div>
  );
}

export function Footer() {
  const { t, pick } = useT();
  const navigate = useApp((s) => s.navigate);

  return (
    <footer className="mt-auto bg-sidebar text-sidebar-foreground border-t border-border relative overflow-hidden">
      {/* Brand gradient top line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-brand-gradient opacity-60" />

      {/* Subtle aurora glow — bottom-left */}
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-saffron/10 blur-[80px]" />
      
      {/* Subtle aurora glow — top-right */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-crimson/8 blur-[80px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8">
        {/* ── MAIN GRID ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] gap-8 sm:gap-10 lg:gap-12">
          
          {/* COL 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo textClassName="text-sidebar-foreground text-[1.35rem]" />
            <p className="mt-4 text-sm text-sidebar-foreground/60 leading-relaxed max-w-[280px]">
              Connecting exceptional talent with opportunities across India and Japan
              through technology and cultural understanding.
            </p>
            {/* Animated India × Japan badge */}
            <div className="mt-5 inline-flex items-center gap-2.5 rounded-xl border border-saffron/20 bg-saffron/8 px-4 py-2.5">
              <span className="text-base">🇮🇳</span>
              <div className="connector-h flex-none w-8" />
              <span className="text-[11px] font-bold text-saffron uppercase tracking-wider">IndiGate</span>
              <div className="connector-h flex-none w-8" />
              <span className="text-base">🇯🇵</span>
            </div>
          </div>

          {/* COL 2 — Navigation */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sidebar-foreground/40 mb-4">
              {pick("Explore", "探索")}
            </p>
            <ul className="space-y-2.5">
              {[
                { label: pick("Find Jobs", "求人を探す"),     view: "jobs"          },
                { label: pick("How It Works", "仕組み"),  view: "how-it-works"  },
                { label: pick("For Companies", "企業向け"), view: "for-companies" },
                { label: pick("About", "概要"),         view: "about"         },
                { label: pick("Contact", "お問い合わせ"),       view: "contact"       },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.view as any)}
                    className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors hover:translate-x-0.5 transform duration-150 inline-block">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Email — below links */}
            <div className="mt-6 pt-5 border-t border-white/8">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sidebar-foreground/40 mb-2">
                {pick("Email us", "メールでのお問い合わせ")}
              </p>
              <a href="mailto:contact@indigate.work" className="inline-flex items-center gap-1.5 text-sm font-medium text-saffron hover:text-saffron/80 transition-colors">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                contact@indigate.work
              </a>
            </div>
          </div>

          {/* COL 3 - Candidates */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sidebar-foreground/40 mb-4">
              {pick("Candidates", "候補者向け")}
            </p>
            <ul className="space-y-2.5">
              {[
                { label: pick("Find Jobs", "求人を探す"), view: "jobs" },
                { label: pick("Resume Builder", "履歴書ビルダー"), view: "candidate" },
                { label: pick("Visa Guide", "ビザガイド"), view: "home" },
                { label: pick("Academy", "アカデミー"), href: "https://www.indobox-academy.in" },
              ].map((link) => (
                <li key={link.label}>
                  {"href" in link ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 text-sm text-sidebar-foreground/60 hover:text-saffron transition-colors">
                      {link.label}
                      <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <button onClick={() => navigate((link as any).view)}
                      className="group inline-flex items-center gap-1.5 text-sm text-sidebar-foreground/60 hover:text-saffron transition-colors">
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* COL 4 — Offices */}
          <div className="space-y-4">
            <OfficeInfo
              icon={Building2}
              title={pick("Japan Office", "日本オフィス")}
              lines={[
                "1-2-32 Tsurumai, Showa-ku",
                "Nagoya, Aichi 466-0064",
                "Japan"
              ]}
            />
            <OfficeInfo
              icon={Building2}
              title={pick("India Office", "インドオフィス")}
              lines={[
                "T-Hub, Raidurg, HiTec City",
                "Hyderabad, 500081",
                "Telangana, India"
              ]}
            />
          </div>

        </div>

        {/* ── BOTTOM BAR ────────────────────────────────── */}
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
          
          {/* Left: copyright */}
          <p className="text-xs text-sidebar-foreground/40 order-2 sm:order-1">
            © 2026 IndiGate. All rights reserved. Licensed under Indobox Inc.
          </p>

          {/* Center: license — most important legal detail */}
          <p className="text-[10px] font-mono text-sidebar-foreground/30 order-3 sm:order-2 text-center">
            Employment Placement License No.: 23-ユ-303072
          </p>

          {/* Right: legal links */}
          <div className="flex items-center gap-4 order-1 sm:order-3">
            <button
              onClick={() => navigate("privacy" as any)}
              className="text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors">
              Privacy Policy
            </button>
            <div className="h-3 w-px bg-white/10" />
            <button
              onClick={() => navigate("terms" as any)}
              className="text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors">
              Terms of Service
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}
