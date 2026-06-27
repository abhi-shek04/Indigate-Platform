"use client";

import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { Logo } from "@/components/brand/logo";
import { Mail, MapPin, Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  const { t } = useT();
  const navigate = useApp((s) => s.navigate);

  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              {t("footer.tagline")} IndiGate connects India's top talent with
              Japan's leading employers, with full visa and relocation support.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid place-items-center h-9 w-9 rounded-lg border border-border hover:border-saffron hover:text-saffron transition-colors"
                  aria-label="social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-3">{t("footer.product")}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate("jobs")} className="hover:text-foreground transition-colors">
                  {t("nav.jobs")}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("for-companies")} className="hover:text-foreground transition-colors">
                  {t("nav.forCompanies")}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("companies")} className="hover:text-foreground transition-colors">
                  {t("companies.title")}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("about")} className="hover:text-foreground transition-colors">
                  {t("footer.about")}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold mb-3">{t("footer.company")}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Indobox Inc, Hyderabad, India</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <a href="mailto:hello@indigate.work" className="hover:text-foreground">
                  hello@indigate.work
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold mb-3">{t("footer.legal")}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate("privacy")} className="hover:text-foreground transition-colors">
                  {t("footer.privacy")}
                </button>
              </li>
              <li>
                <button onClick={() => navigate("terms")} className="hover:text-foreground transition-colors">
                  {t("footer.terms")}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{t("footer.rights")}</p>
          <p className="text-xs text-muted-foreground">
            Made with care in Hyderabad × Tokyo
          </p>
        </div>
      </div>
    </footer>
  );
}
