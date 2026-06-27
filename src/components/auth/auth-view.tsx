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
        const res = await api<{ verifyToken: string }>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        await refreshAuth();
        setReturnedCode(res.verifyToken);
        setMode("verify");
        toast.success("Account created! Check your email for a code.");
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
      } else if (mode === "forgot") {
        const res = await api<{ sent: boolean; token?: string }>(
          "/api/auth/reset-request",
          {
            method: "POST",
            body: JSON.stringify({ email: form.email }),
          },
        );
        setResetEmail(form.email);
        if (res.token) setReturnedCode(res.token);
        setMode("reset");
        toast.success("Reset code sent to your email.");
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
      <div className="hidden lg:flex relative bg-mesh items-center justify-center p-12 border-r border-border">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-saffron/20 blur-3xl animate-float-slow" />
          <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-crimson/15 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
        </div>
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
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate("home")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
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
                  className="pl-10"
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
                  className="pl-10"
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
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                  className="pl-10 text-center text-2xl tracking-[0.5em] font-bold"
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
                  className="pl-10 text-center text-2xl tracking-[0.5em] font-bold"
                  inputMode="numeric"
                />
              </Field>
            )}

            <motion.div variants={staggerItem}>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-gradient text-white hover:opacity-90 font-semibold h-11"
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
          </motion.form>
          </AnimatePresence>

          {/* Demo codes / helpers */}
          {returnedCode && (mode === "verify" || mode === "reset") && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-4 py-3 text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                Demo code
              </p>
              <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                Use <span className="font-mono font-bold">{returnedCode}</span> to verify.
              </p>
            </div>
          )}

          {/* Switch modes */}
          <div className="mt-6 space-y-3 text-sm text-center">
            {mode === "login" && (
              <>
                <button
                  onClick={() => setMode("forgot")}
                  className="text-muted-foreground hover:text-foreground"
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
            {mode === "verify" && (
              <button
                onClick={async () => {
                  const res = await api<{ code: string }>("/api/auth/verify", {
                    method: "PUT",
                  });
                  setReturnedCode(res.code);
                  toast.success("New code sent.");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                {t("auth.verify.resend")}
              </button>
            )}
            {mode === "forgot" && (
              <button
                onClick={() => setMode("login")}
                className="text-muted-foreground hover:text-foreground"
              >
                {t("common.back")} to login
              </button>
            )}
            {mode === "reset" && (
              <button
                onClick={() => setMode("login")}
                className="text-muted-foreground hover:text-foreground"
              >
                {t("common.back")} to login
              </button>
            )}
          </div>

          {/* Demo accounts */}
          {mode === "login" && (
            <div className="mt-8 rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2.5">
                {t("auth.demo")}
              </p>
              <div className="space-y-1.5 text-xs">
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
      <Label className="mb-1.5 block">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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
        "text-left rounded-xl border-2 p-4 transition-all",
        active
          ? "border-saffron bg-saffron/5 shadow-premium"
          : "border-border hover:border-saffron/40",
      )}
    >
      <div
        className={cn(
          "grid place-items-center h-9 w-9 rounded-lg mb-2",
          active ? "bg-brand-gradient text-white" : "bg-muted text-muted-foreground",
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
      className="w-full flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-background transition-colors"
    >
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground font-mono">
        {email} · {pw}
      </span>
    </button>
  );
}
