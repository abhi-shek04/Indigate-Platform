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
              India × Japan Talent Platform. Making the impossible possible
              through the fusion of India and Japan. End-to-end support from
              screening to visa, relocation, and life support.
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
                <span className="text-base shrink-0">🇯🇵</span>
                <span>
                  Indobox Inc.<br />
                  Station Ai, 1-2-32 Tsuruma, Showa-ku,<br />
                  Nagoya, Aichi 466-0064, Japan<br />
                  <span className="text-xs">Licensed agency: 23-ユ-303072</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-base shrink-0">🇮🇳</span>
                <span>
                  Indobox India Pvt. Ltd.<br />
                  T-Hub, Raidurg, HiTec City,<br />
                  Hyderabad, Telangana 500081
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <a href="mailto:hello@indigate.work" className="hover:text-foreground">
                  hello@indigate.work
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <a href="mailto:skanda@indobox.co.jp" className="hover:text-foreground">
                  skanda@indobox.co.jp
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
          <p className="text-xs text-muted-foreground">© 2025 Indobox Inc. All Rights Reserved.</p>
          <p className="text-xs text-muted-foreground">
            Made with care in Nagoya × Hyderabad
          </p>
        </div>
      </div>
    </footer>
  );
}
