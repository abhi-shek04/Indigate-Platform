"use client";

import { useApp } from "@/lib/store";
import { Logo } from "@/components/brand/logo";
import { motion } from "framer-motion";
import {
  Mail,
  ExternalLink,
  MapPin,
  Shield,
  ArrowUpRight,
  Globe,
  type LucideIcon,
} from "lucide-react";

export function Footer() {
  const navigate = useApp((s) => s.navigate);

  const quickLinks: { label: string; view: Parameters<typeof navigate>[0] }[] = [
    { label: "How It Works", view: "how-it-works" },
    { label: "Find Jobs", view: "jobs" },
    { label: "About Us", view: "about" },
    { label: "For Companies", view: "for-companies" },
    { label: "Contact", view: "contact" },
  ];

  const legalLinks: { label: string; view: Parameters<typeof navigate>[0] }[] = [
    { label: "Privacy Policy", view: "privacy" },
    { label: "Terms of Service", view: "terms" },
  ];

  return (
    <footer className="mt-auto relative border-t border-border bg-sidebar text-sidebar-foreground overflow-hidden">
      {/* Subtle mesh background */}
      <div aria-hidden className="absolute inset-0 bg-mesh opacity-30" />
      {/* Saffron glow accent */}
      <div
        aria-hidden
        className="absolute -top-24 left-1/4 h-48 w-48 rounded-full bg-saffron/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -top-16 right-1/4 h-40 w-40 rounded-full bg-crimson/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        {/* Top: Brand + CTA */}
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-12">
          {/* Brand */}
          <div>
            <Logo
              textClassName="text-sidebar-foreground text-[1.35rem]"
            />
            <p className="mt-4 text-sm text-sidebar-foreground/70 leading-relaxed max-w-sm">
              Connecting exceptional talent with opportunities across India and
              Japan through technology and cultural understanding.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1.5 text-xs font-semibold text-saffron">
              <Globe className="h-3.5 w-3.5" />
              India × Japan Talent Platform
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sidebar-foreground/50 mb-4">
              Explore
            </p>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.view)}
                    className="group inline-flex items-center gap-1.5 text-sm text-sidebar-foreground/70 hover:text-saffron transition-colors"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Indobox + Contact */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sidebar-foreground/50 mb-4">
              Indobox Inc
            </p>
            <p className="text-sm text-sidebar-foreground/70 leading-relaxed mb-4">
              A bridge between Japan and India, born from the belief that
              collaboration creates unprecedented value.
            </p>
            <a
              href="https://indobox.jp"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-saffron hover:text-saffron/80 transition-colors"
            >
              Visit Indobox Inc
              <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        {/* Offices */}
        <div className="mt-10 pt-8 border-t border-sidebar-border/40 grid gap-6 sm:grid-cols-2">
          <OfficeInfo
            icon={MapPin}
            title="Japan Office"
            lines={["Indobox Inc.", "1-2-32 Tsurumai, Showa-ku", "Nagoya, Aichi 466-0064, Japan"]}
          />
          <OfficeInfo
            icon={MapPin}
            title="India Office"
            lines={["Indobox India Pvt. Ltd.", "1/C, 83/1, Raidurg, Panmaktha", "HiTec City, Hyderabad, 500081, India"]}
          />
        </div>

        {/* Contact bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <a
            href="mailto:contact@indigate.work"
            className="group inline-flex items-center gap-2 text-sm font-medium text-sidebar-foreground hover:text-saffron transition-colors"
          >
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-saffron/10 border border-saffron/20 text-saffron group-hover:scale-110 transition-transform">
              <Mail className="h-4 w-4" />
            </span>
            contact@indigate.work
          </a>
          <span className="inline-flex items-center gap-1.5 text-xs text-sidebar-foreground/50">
            <Shield className="h-3.5 w-3.5" />
            Employment Placement License No.: 23-ユ-303072
          </span>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-sidebar-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-sidebar-foreground/50">
            © 2026 IndiGate. All rights reserved. Licensed under Indobox Inc.
          </p>
          <div className="flex items-center gap-5">
            {legalLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.view)}
                className="text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function OfficeInfo({
  icon: Icon,
  title,
  lines,
}: {
  icon: LucideIcon;
  title: string;
  lines: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex items-start gap-3"
    >
      <span className="grid place-items-center h-9 w-9 rounded-lg bg-saffron/10 border border-saffron/20 text-saffron shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-sidebar-foreground/50 mb-1">
          {title}
        </p>
        {lines.map((line, i) => (
          <p key={i} className="text-sm text-sidebar-foreground/70 leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  );
}
