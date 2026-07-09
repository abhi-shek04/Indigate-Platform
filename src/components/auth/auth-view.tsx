"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, Building2, ArrowLeft, Mail, KeyRound, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem, easeOutExpo } from "@/lib/motion";

type Mode = "login" | "register" | "verify" | "forgot" | "reset";

export function AuthView({ initialMode }: { initialMode: Mode }) {
  const { t } = useT();
  const { navigate, refreshAuth } = useApp();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [role, setRole] = useState<"CANDIDATE" | "COMPANY">("CANDIDATE");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    companyName: "",
    code: "",
  });
  const [resetCode, setResetCode] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [returnedCode, setReturnedCode] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        await refreshAuth();
        toast.success("Logged in! 🎉");
        const u = useApp.getState().user;
        if (u?.role === "CANDIDATE") navigate("candidate");
        else if (u?.role === "COMPANY") navigate("company");
        else if (u?.role === "ADMIN") navigate("admin");
        else navigate("home");
      } else if (mode === "register") {
        const payload: Record<string, string> = {
          email: form.email,
          password: form.password,
          role,
        };
        if (role === "CANDIDATE") payload.fullName = form.name;
        else {
          payload.companyName = form.companyName || form.name;
        }
        const res = await api<{ devCode?: string }>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        // Account created with isVerified=false — go to verify mode
        if (res.devCode) {
          // Dev mode — no email configured, show code to user
          toast.success(`Account created! Your verification code is: ${res.devCode}`, { duration: 10000 });
          setForm({ ...form, code: res.devCode });
        } else {
          toast.success("Account created! Check your email for a 6-digit verification code.");
        }
        setMode("verify");
      } else if (mode === "forgot") {
        await api("/api/auth/reset-request", {
          method: "POST",
          body: JSON.stringify({ email: form.email }),
        });
        setResetEmail(form.email);
        setMode("reset");
        toast.success("If an account exists, a reset code was sent to your email.");
      } else if (mode === "reset") {
        await api("/api/auth/reset-confirm", {
          method: "POST",
          body: JSON.stringify({
            email: resetEmail,
            code: resetCode,
            password: form.password,
          }),
        });
        await refreshAuth();
        toast.success("Password reset! You're logged in.");
        const u = useApp.getState().user;
        if (u?.role === "CANDIDATE") navigate("candidate");
        else if (u?.role === "COMPANY") navigate("company");
        else navigate("home");
      } else if (mode === "verify") {
        await api("/api/auth/verify", {
          method: "POST",
          body: JSON.stringify({ code: form.code }),
        });
        await refreshAuth();
        toast.success("Email verified! Welcome to IndiGate.");
        const u = useApp.getState().user;
        if (u?.role === "CANDIDATE") navigate("candidate");
        else if (u?.role === "COMPANY") navigate("company");
        else navigate("home");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<Mode, { title: string; subtitle: string }> = {
    login: { title: t("auth.login.title"), subtitle: t("auth.login.subtitle") },
    register: {
      title: t("auth.register.title"),
      subtitle: t("auth.register.subtitle"),
    },
    verify: { title: t("auth.verify.title"), subtitle: t("auth.verify.subtitle") },
    forgot: { title: t("auth.reset.title"), subtitle: t("auth.reset.subtitle") },
    reset: { title: t("auth.reset.title"), subtitle: t("auth.reset.subtitle") },
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Left visual */}
      <div className="hidden lg:flex relative bg-mesh items-center justify-center p-12 border-r border-border overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-saffron/20 blur-3xl animate-float-slow" />
          <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-crimson/15 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
        </div>
        {/* Fine grid pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklch, var(--foreground) 12%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 12%, transparent) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative max-w-md">
          <Logo size={44} />
          <h2 className="mt-8 font-display text-4xl font-extrabold tracking-tight leading-tight">
            Your bridge to a <span className="text-gradient-brand">career in Japan</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Join 1,900+ Indian professionals building careers at Japan's top
            companies — with visa sponsorship, relocation support, and a human
            team behind you.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "Visa-sponsored roles at vetted Japanese employers",
              "Bilingual platform — English & 日本語",
              "From application to Tokyo in weeks, not months",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 text-saffron shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/90">{line}</span>
              </li>
            ))}
          </ul>
          {/* Trust footer */}
          <div className="mt-10 pt-6 border-t border-border/60 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-saffron" />
              <span>Manual employer vetting</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div>24–48h approval</div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-card/30">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate("home")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            {t("common.back")}
          </button>

          <div className="mb-7">
            <motion.h1
              key={`title-${mode}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
              className="font-display text-3xl font-extrabold tracking-tight"
            >
              {titles[mode].title}
            </motion.h1>
            <motion.p
              key={`sub-${mode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.08 }}
              className="mt-2 text-muted-foreground"
            >
              {titles[mode].subtitle}
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            onSubmit={submit}
            className="space-y-4"
            variants={staggerContainer(0.07, 0.05)}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            {mode === "register" && (
              <div>
                <Label className="mb-2 block">{t("auth.role")}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <RoleCard
                    active={role === "CANDIDATE"}
                    onClick={() => setRole("CANDIDATE")}
                    icon={User}
                    title={t("auth.role.candidate")}
                    desc={t("auth.role.candidate.desc")}
                  />
                  <RoleCard
                    active={role === "COMPANY"}
                    onClick={() => setRole("COMPANY")}
                    icon={Building2}
                    title={t("auth.role.company")}
                    desc={t("auth.role.company.desc")}
                  />
                </div>
              </div>
            )}

            {(mode === "register" || mode === "login" || mode === "forgot") && (
              <Field label={t("auth.email")} icon={Mail}>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="pl-10 h-11 rounded-xl"
                />
              </Field>
            )}

            {mode === "register" && (
              <Field
                label={role === "CANDIDATE" ? t("auth.name") : "Company name"}
                icon={Building2}
              >
                <Input
                  required
                  value={form.name || form.companyName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                      companyName: e.target.value,
                    })
                  }
                  placeholder={
                    role === "CANDIDATE" ? "Arjun Sharma" : "TechNova Japan"
                  }
                  className="pl-10 h-11 rounded-xl"
                />
              </Field>
            )}

            {(mode === "login" ||
              mode === "register" ||
              mode === "reset") && (
              <Field label={t("auth.password")} icon={KeyRound}>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            )}

            {mode === "verify" && (
              <Field label={t("auth.verify.code")} icon={ShieldCheck}>
                <Input
                  required
                  maxLength={6}
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.replace(/\D/g, "") })
                  }
                  placeholder="123456"
                  className="pl-10 text-center text-2xl tracking-[0.5em] font-bold h-14 rounded-xl"
                  inputMode="numeric"
                />
              </Field>
            )}

            {mode === "reset" && (
              <Field label={t("auth.verify.code")} icon={ShieldCheck}>
                <Input
                  required
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) =>
                    setResetCode(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="123456"
                  className="pl-10 text-center text-2xl tracking-[0.5em] font-bold h-14 rounded-xl"
                  inputMode="numeric"
                />
              </Field>
            )}

            <motion.div variants={staggerItem}>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-gradient text-white hover:opacity-90 font-semibold h-12 rounded-xl shadow-glow-brand"
            >
              {loading
                ? t("common.loading")
                : mode === "login"
                  ? t("auth.login.submit")
                  : mode === "register"
                    ? t("auth.register.submit")
                    : mode === "verify"
                      ? t("auth.verify.submit")
                      : mode === "forgot"
                        ? "Send reset code"
                        : "Reset password"}
            </Button>
            </motion.div>

            {/* Google OAuth — only on login + register */}
            {(mode === "login" || mode === "register") && (
              <motion.div variants={staggerItem} className="pt-2">
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider">or</span>
                  </div>
                </div>
                <a
                  href={`/api/auth/google?role=${role}`}
                  className="w-full inline-flex items-center justify-center gap-2.5 h-12 rounded-xl border border-border bg-background hover:bg-accent/50 transition-colors text-sm font-semibold"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </a>
              </motion.div>
            )}
          </motion.form>
          </AnimatePresence>

          {/* Switch modes */}
          <div className="mt-6 space-y-3 text-sm text-center">
            {mode === "login" && (
              <>
                <button
                  onClick={() => setMode("forgot")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("auth.forgot")}
                </button>
                <p>
                  {t("auth.noaccount")}{" "}
                  <button
                    onClick={() => setMode("register")}
                    className="font-semibold text-crimson hover:underline"
                  >
                    {t("nav.signup")}
                  </button>
                </p>
              </>
            )}
            {mode === "register" && (
              <p>
                {t("auth.haveaccount")}{" "}
                <button
                  onClick={() => setMode("login")}
                  className="font-semibold text-crimson hover:underline"
                >
                  {t("nav.login")}
                </button>
              </p>
            )}
            {mode === "forgot" && (
              <button
                onClick={() => setMode("login")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("common.back")} to login
              </button>
            )}
            {mode === "verify" && (
              <button
                onClick={async () => {
                  const res = await api<{ devCode?: string }>("/api/auth/verify", { method: "PUT" });
                  if (res.devCode) {
                    toast.success(`New verification code: ${res.devCode}`, { duration: 10000 });
                    setForm({ ...form, code: res.devCode });
                  } else {
                    toast.success("New code sent to your email.");
                  }
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("auth.verify.resend")}
              </button>
            )}
            {mode === "reset" && (
              <button
                onClick={() => setMode("login")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("common.back")} to login
              </button>
            )}
          </div>

          {/* Demo accounts — subtle, less prominent */}
          {mode === "login" && (
            <div className="mt-8 rounded-xl border border-border/70 bg-muted/30 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-2.5 px-1">
                <ShieldCheck className="h-3 w-3" />
                {t("auth.demo")}
              </div>
              <div className="space-y-1">
                <DemoLine
                  label="Candidate"
                  email="arjun@example.com"
                  pw="candidate123"
                  onPick={() =>
                    setForm({ ...form, email: "arjun@example.com", password: "candidate123" })
                  }
                />
                <DemoLine
                  label="Company"
                  email="hr@technova.jp"
                  pw="company123"
                  onPick={() =>
                    setForm({ ...form, email: "hr@technova.jp", password: "company123" })
                  }
                />
                <DemoLine
                  label="Admin"
                  email="admin@indigate.work"
                  pw="admin123"
                  onPick={() =>
                    setForm({ ...form, email: "admin@indigate.work", password: "admin123" })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium">{label}</Label>
      <div className="relative group">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-saffron" />
        {children}
      </div>
    </div>
  );
}

function RoleCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left rounded-xl border-2 p-4 transition-all relative overflow-hidden",
        active
          ? "border-saffron bg-saffron/5 shadow-premium"
          : "border-border hover:border-saffron/40 hover:bg-saffron/5",
      )}
    >
      {active && (
        <span className="absolute inset-x-0 top-0 h-0.5 bg-brand-gradient" />
      )}
      <div
        className={cn(
          "grid place-items-center h-9 w-9 rounded-lg mb-2 transition-colors",
          active ? "bg-brand-gradient text-white shadow-glow-brand" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </button>
  );
}

function DemoLine({
  label,
  email,
  pw,
  onPick,
}: {
  label: string;
  email: string;
  pw: string;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-background transition-colors group text-left"
    >
      <span className="inline-flex items-center gap-2 font-medium text-xs text-foreground/80">
        <span className="h-1.5 w-1.5 rounded-full bg-saffron/70 group-hover:bg-saffron transition-colors" />
        {label}
      </span>
      <span className="text-[11px] text-muted-foreground font-mono group-hover:text-foreground/80 transition-colors">
        {email} · {pw}
      </span>
    </button>
  );
}
