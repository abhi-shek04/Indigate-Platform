"use client";

import { useApp } from "@/lib/store";
import { Logo } from "@/components/brand/logo";
import { Mail, MapPin, ExternalLink, ArrowRight } from "lucide-react";

export function Footer() {
  const navigate = useApp((s) => s.navigate);

  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Connecting exceptional talent with opportunities across India and
              Japan through technology and cultural understanding.
            </p>
            <p className="mt-3 text-sm font-medium text-foreground">
              🇯🇵 x 🇮🇳 Connecting two nations through work.
            </p>
          </div>

          {/* Indobox section */}
          <div>
            <p className="text-sm font-semibold mb-3">Indobox Inc</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Indobox is a bridge between Japan and India, born from the belief
              that collaboration between these two vibrant nations can create
              unprecedented value.
            </p>
            <a
              href="https://indobox.jp"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-saffron hover:text-saffron/80 transition-colors"
            >
              Visit Indobox Inc
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-sm font-semibold mb-3">Quick Links</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button
                  onClick={() => navigate("how-it-works")}
                  className="hover:text-foreground transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("about")}
                  className="hover:text-foreground transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("for-companies")}
                  className="hover:text-foreground transition-colors"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("jobs")}
                  className="hover:text-foreground transition-colors"
                >
                  For Candidates
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("for-companies")}
                  className="hover:text-foreground transition-colors"
                >
                  For Companies
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("contact")}
                  className="hover:text-foreground transition-colors"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("home")}
                  className="hover:text-foreground transition-colors"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <p className="text-sm font-semibold mb-3">Contact Info</p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">JAPAN</p>
                <p className="mt-1 leading-relaxed">
                  1-2-32 Tsurumai, Showa-ku, Nagoya, Aichi 466-0064 JAPAN
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">INDIA</p>
                <p className="mt-1 leading-relaxed">
                  1/C, 83/1, Raidurg, Panmaktha Near HiTec City, Cyberabad,
                  Shaikpet, Hyderabad, 500081, Telangana, India
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <a
                  href="mailto:contact@indigate.work"
                  className="hover:text-foreground transition-colors"
                >
                  contact@indigate.work
                </a>
              </div>
              <p className="text-xs text-muted-foreground/80">
                Employment Placement License No.: 23-ユ-303072
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © 2026 IndiGate . All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Licensed under Indobox Inc
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("privacy")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate("terms")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
