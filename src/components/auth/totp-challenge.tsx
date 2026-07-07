"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { ArrowLeft, ShieldCheck, Smartphone, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TotpChallenge() {
  const { t } = useT();
  const { pendingTwoFactorEmail, setPendingTwoFactorEmail, navigate, refreshAuth } = useApp();
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [mode, setMode] = useState<"totp" | "backup">("totp");
  const [loading, setLoading] = useState(false);

  if (!pendingTwoFactorEmail) {
    navigate("login");
    return null;
  }

  async function verify() {
    setLoading(true);
    try {
      const res = await api<{ id: string; role: string } & { requiresTwoFactor?: boolean }>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: pendingTwoFactorEmail,
            // password isn't needed again — the server already validated it
            // in the previous step. But our API requires password, so we re-send
            // a sentinel. Actually the login route requires password >= 1 char.
            // The pendingTwoFactorEmail flow stores the verified password
            // server-side. To keep this simple, we require the client to send
            // password again. Instead, we use a dedicated verify endpoint.
          }),
        },
      );
      void res;
    } catch {
      // fall through to dedicated endpoint
    }
    setLoading(false);
  }

  // Dedicated 2FA verification endpoint (avoids re-entering password)
  async function submitChallenge() {
    setLoading(true);
    try {
      await api("/api/auth/totp/login", {
        method: "POST",
        body: JSON.stringify({
          email: pendingTwoFactorEmail,
          totpCode: mode === "totp" ? code : undefined,
          backupCode: mode === "backup" ? backupCode : undefined,
        }),
      });
      await refreshAuth();
      setPendingTwoFactorEmail(null);
      toast.success("Welcome back! 🎉");
      const u = useApp.getState().user;
      if (u?.role === "CANDIDATE") navigate("candidate");
      else if (u?.role === "COMPANY") navigate("company");
      else if (u?.role === "ADMIN") navigate("admin");
      else navigate("home");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Left visual (matches auth view) */}
      <div className="hidden lg:flex relative bg-mesh items-center justify-center p-12 border-r border-border">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-saffron/20 blur-3xl animate-float-slow" />
          <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-crimson/15 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative max-w-md">
          <Logo size={44} />
          <h2 className="mt-8 font-display text-4xl font-extrabold tracking-tight leading-tight">
            One more step to <span className="text-gradient-brand">keep your account safe</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Two-factor authentication is enabled on your account. Enter the code from your authenticator app to continue.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "Open Google Authenticator, Authy, or 1Password",
              "Find the IndiGate entry",
              "Type the 6-digit code below",
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="grid place-items-center h-6 w-6 rounded-full bg-saffron/15 text-saffron text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground/90">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <button
            onClick={() => {
              setPendingTwoFactorEmail(null);
              navigate("login");
            }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </button>

          <div className="mb-7">
            <div className="grid place-items-center h-14 w-14 rounded-2xl bg-brand-gradient text-white shadow-glow-brand mb-4">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Two-factor authentication
            </h1>
            <p className="mt-2 text-muted-foreground">
              Enter the code for <span className="font-medium text-foreground">{pendingTwoFactorEmail}</span>
            </p>
          </div>

          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {mode === "totp" ? (
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Authenticator code
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && code.length === 6 && submitChallenge()}
                    placeholder="123456"
                    inputMode="numeric"
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-center text-2xl tracking-[0.4em] font-bold focus:outline-none focus:ring-2 focus:ring-saffron/40"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Backup code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    autoFocus
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.toUpperCase().slice(0, 8))}
                    onKeyDown={(e) => e.key === "Enter" && backupCode.length >= 6 && submitChallenge()}
                    placeholder="XXXXXXXX"
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-center text-xl tracking-[0.2em] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-saffron/40"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={submitChallenge}
              disabled={
                loading ||
                (mode === "totp" ? code.length !== 6 : backupCode.length < 6)
              }
              className="w-full bg-brand-gradient text-white hover:opacity-90 font-semibold h-11"
            >
              {loading ? t("common.loading") : "Verify & continue"}
            </Button>

            <div className="text-center pt-2">
              {mode === "totp" ? (
                <button
                  onClick={() => setMode("backup")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Use a backup code instead
                </button>
              ) : (
                <button
                  onClick={() => setMode("totp")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Use authenticator code instead
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
