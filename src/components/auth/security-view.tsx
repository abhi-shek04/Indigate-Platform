"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Smartphone,
  KeyRound,
  Lock,
  CheckCircle2,
  Copy,
  Download,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Step = "idle" | "qr" | "backup" | "done";

export function SecurityView() {
  const { t } = useT();
  const { user, candidate, company, navigate, refreshAuth } = useApp();
  const [step, setStep] = useState<Step>("idle");
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [googleLinked, setGoogleLinked] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Password change
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    // Determine current 2FA state from user (we refetch /api/auth/me)
    setTotpEnabled(!!(user as unknown as { totpEnabled?: boolean })?.totpEnabled);
    setGoogleLinked(!!(user as unknown as { googleId?: string })?.googleId);
    // Fetch google config
    api<{ configured: boolean }>("/api/auth/google/status")
      .then((r) => setGoogleConfigured(r.configured))
      .catch(() => {});
  }, [user]);

  async function startSetup() {
    setLoading(true);
    try {
      const res = await api<{ qr: string; secret: string; uri: string }>(
        "/api/auth/totp/setup",
        { method: "POST" },
      );
      setQr(res.qr);
      setSecret(res.secret);
      setStep("qr");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start setup.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmEnable() {
    if (verifyCode.length !== 6) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setLoading(true);
    try {
      const res = await api<{ enabled: boolean; backupCodes: string[] }>(
        "/api/auth/totp/verify",
        { method: "POST", body: JSON.stringify({ code: verifyCode }) },
      );
      setBackupCodes(res.backupCodes);
      setTotpEnabled(true);
      setStep("backup");
      toast.success("Two-factor authentication enabled! 🎉");
      await refreshAuth();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  async function disableTotp() {
    if (!disableCode) {
      toast.error("Enter a code to confirm disabling.");
      return;
    }
    setLoading(true);
    try {
      await api("/api/auth/totp/disable", {
        method: "POST",
        body: JSON.stringify({ code: disableCode }),
      });
      setTotpEnabled(false);
      setDisableCode("");
      setStep("idle");
      toast.success("Two-factor authentication disabled.");
      await refreshAuth();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword() {
    if (pw.next.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (pw.next !== pw.confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setPwLoading(true);
    try {
      await api("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: pw.current,
          newPassword: pw.next,
        }),
      });
      setPw({ current: "", next: "", confirm: "" });
      toast.success("Password changed successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate(user?.role === "CANDIDATE" ? "candidate" : user?.role === "COMPANY" ? "company" : "admin")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </button>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-crimson mb-2">
          <Shield className="h-4 w-4" />
          Security
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          Account security
        </h1>
        <p className="mt-2 text-muted-foreground">
          Protect your IndiGate account with two-factor authentication and a strong password.
        </p>
      </div>

      <div className="space-y-6">
        {/* 2FA Section */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-premium">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="grid place-items-center h-11 w-11 rounded-xl bg-saffron/10 text-saffron shrink-0">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  Two-factor authentication
                  {totpEnabled ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Not enabled
                    </Badge>
                  )}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-md">
                  Use an authenticator app (Google Authenticator, Authy, 1Password) to generate a 6-digit code at every login. This is real RFC 6238 TOTP — works offline, no email or SMS needed.
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!totpEnabled && step === "idle" && (
              <motion.div
                key="enable"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Button
                  onClick={startSetup}
                  disabled={loading}
                  className="mt-5 bg-brand-gradient text-white hover:opacity-90 font-semibold"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Enable 2FA
                </Button>
              </motion.div>
            )}

            {!totpEnabled && step === "qr" && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-6 grid sm:grid-cols-[auto_1fr] gap-6 items-start"
              >
                {qr && (
                  <div className="rounded-xl border border-border bg-white p-3">
                    <img src={qr} alt="QR code for authenticator app" width={200} height={200} />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold mb-1">1. Scan this QR code</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Open Google Authenticator, Authy, or 1Password → Add account → Scan QR.
                  </p>
                  {secret && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">
                        Can&apos;t scan? Enter this secret manually:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-xs font-mono break-all">
                          {secret}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard?.writeText(secret);
                            toast.success("Secret copied.");
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <h3 className="font-semibold mb-1 mt-4">2. Enter the 6-digit code</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    From your authenticator app
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      inputMode="numeric"
                      className="w-32 rounded-lg border border-input bg-background px-3 py-2 text-center text-xl tracking-[0.3em] font-bold focus:outline-none focus:ring-2 focus:ring-saffron/40"
                    />
                    <Button
                      onClick={confirmEnable}
                      disabled={loading || verifyCode.length !== 6}
                      className="bg-brand-gradient text-white hover:opacity-90 font-semibold"
                    >
                      {loading ? "Verifying…" : "Verify & enable"}
                    </Button>
                  </div>
                  <button
                    onClick={() => setStep("idle")}
                    className="mt-3 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {!totpEnabled && step === "backup" && (
              <motion.div
                key="backup"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                        Save your backup codes
                      </h3>
                      <p className="text-sm text-amber-700 dark:text-amber-400 mt-1 mb-3">
                        Use these if you lose your authenticator device. Each code works once. Store them somewhere safe — they won&apos;t be shown again.
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {backupCodes.map((c, i) => (
                          <code
                            key={i}
                            className="rounded-lg bg-white dark:bg-black/30 px-3 py-2 text-sm font-mono text-center border border-amber-200 dark:border-amber-900"
                          >
                            {c}
                          </code>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const text = backupCodes.join("\n");
                            navigator.clipboard?.writeText(text);
                            toast.success("All codes copied.");
                          }}
                        >
                          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy all
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const text = `IndiGate backup codes for ${user?.email}\n\n${backupCodes.join("\n")}\n\nGenerated ${new Date().toLocaleString()}`;
                            const blob = new Blob([text], { type: "text/plain" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "indigate-backup-codes.txt";
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setStep("done")}
                          className="bg-brand-gradient text-white hover:opacity-90 font-semibold"
                        >
                          I&apos;ve saved them
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {totpEnabled && (
              <motion.div
                key="disable"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-5 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">
                    To disable 2FA, enter a current code from your authenticator app or a backup code.
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value.toUpperCase().slice(0, 8))}
                      placeholder="Code or backup"
                      className="w-40 rounded-lg border border-input bg-background px-3 py-2 text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-saffron/40"
                    />
                    <Button
                      variant="outline"
                      onClick={disableTotp}
                      disabled={loading || disableCode.length < 6}
                      className="text-destructive hover:text-destructive hover:bg-destructive/5"
                    >
                      {loading ? "Disabling…" : "Disable 2FA"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Google OAuth Section */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-premium">
          <div className="flex items-start gap-3">
            <div className="grid place-items-center h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 shrink-0">
              <GoogleIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                Google account
                {googleLinked ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Linked
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Not linked
                  </Badge>
                )}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                Sign in faster with Google. Linking your Google account lets you log in with one click.
              </p>
              <div className="mt-4">
                {googleConfigured ? (
                  <a href="/api/auth/google">
                    <Button className="bg-white border border-border text-foreground hover:bg-accent font-semibold">
                      <GoogleIcon className="mr-2 h-4 w-4" />
                      {googleLinked ? "Reconnect Google" : "Link Google account"}
                    </Button>
                  </a>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> Coming soon
                    </p>
                    <p className="mt-0.5">
                      Google OAuth is wired up but waiting on credentials. Add <code className="font-mono">GOOGLE_CLIENT_ID</code> and <code className="font-mono">GOOGLE_CLIENT_SECRET</code> to enable.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Password Section */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-premium">
          <div className="flex items-start gap-3 mb-4">
            <div className="grid place-items-center h-11 w-11 rounded-xl bg-crimson/10 text-crimson shrink-0">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">Password</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Use at least 6 characters. Mix letters, numbers, and symbols for strength.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Current password">
              <input
                type="password"
                value={pw.current}
                onChange={(e) => setPw({ ...pw, current: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40"
              />
            </Field>
            <Field label="New password">
              <input
                type="password"
                value={pw.next}
                onChange={(e) => setPw({ ...pw, next: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40"
              />
            </Field>
            <Field label="Confirm new">
              <input
                type="password"
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40"
              />
            </Field>
          </div>
          <Button
            onClick={changePassword}
            disabled={pwLoading || !pw.current || !pw.next || !pw.confirm}
            className="mt-4 bg-brand-gradient text-white hover:opacity-90 font-semibold"
          >
            <Lock className="mr-2 h-4 w-4" />
            {pwLoading ? "Updating…" : "Update password"}
          </Button>
        </section>
      </div>
    </main>
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}
