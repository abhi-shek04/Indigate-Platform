/**
 * Environment variable validation.
 *
 * Called once at startup (from the health/ready middleware boundary or any
 * server entry). In production, hard-fails on missing required vars. In
 * development, logs a warning so the app still runs with fallbacks.
 */

type VarSpec = {
  name: string;
  required: boolean;
  description: string;
  /** Only meaningful for optional vars — the fallback already used in code. */
  devDefault?: string;
};

const SPECS: VarSpec[] = [
  {
    name: "DATABASE_URL",
    required: true,
    description: "Database connection string (SQLite file or PostgreSQL URL)",
  },
  {
    name: "SESSION_SECRET",
    required: true,
    description: "HMAC signing secret for session cookies",
    devDefault: "indigate-dev-secret-change-in-dotenv",
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    required: false,
    description: "Public-facing URL for SEO, email links, sitemap",
    devDefault: "https://indigate.work",
  },
  {
    name: "RESEND_API_KEY",
    required: false,
    description: "Resend API key for transactional email (optional in dev)",
  },
  {
    name: "EMAIL_FROM",
    required: false,
    description: "From address for outgoing email",
    devDefault: "IndiGate <noreply@indigate.work>",
  },
  {
    name: "ADMIN_EMAIL",
    required: false,
    description: "Optional override for admin notification recipient",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    required: false,
    description: "Supabase project URL for file storage (optional in dev)",
  },
  {
    name: "SUPABASE_SERVICE_KEY",
    required: false,
    description: "Supabase service-role key for server-side storage access",
  },
  {
    name: "SUPABASE_STORAGE_BUCKET",
    required: false,
    description: "Supabase storage bucket name",
    devDefault: "indigate-uploads",
  },
];

let validated = false;
let validationError: string | null = null;

/**
 * Validate environment variables. Safe to call multiple times — only runs
 * once. In production, throws if a required var is missing. In development,
 * logs warnings but continues with fallbacks.
 */
export function validateEnv(): void {
  if (validated) return;
  validated = true;

  const isProd = process.env.NODE_ENV === "production";
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const spec of SPECS) {
    const value = process.env[spec.name];
    if (!value) {
      if (spec.required && isProd) {
        missing.push(`${spec.name} — ${spec.description}`);
      } else if (spec.required) {
        warnings.push(
          `Missing required env var ${spec.name} (${spec.description}). Using dev fallback. This will FAIL in production.`,
        );
      } else {
        warnings.push(
          `Optional env var ${spec.name} not set (${spec.description}). ${
            spec.devDefault ? `Using default: ${spec.devDefault}` : "Feature disabled."
          }`,
        );
      }
    }
  }

  for (const w of warnings) {
    console.warn(`[env] ${w}`);
  }

  if (missing.length > 0) {
    validationError = `Missing required environment variables:\n${missing.map((m) => `  - ${m}`).join("\n")}`;
    throw new Error(validationError);
  }

  if (isProd && !process.env.RESEND_API_KEY) {
    console.warn("\n" + "=".repeat(60));
    console.warn("⚠️  WARNING: RESEND_API_KEY is not set.");
    console.warn("   All transactional emails (verification, reset, alerts)");
    console.warn("   will ONLY be logged to the console and NOT delivered.");
    console.warn("=".repeat(60) + "\n");
  }
}

/** True if validateEnv() has been called and succeeded. */
export function envValidated(): boolean {
  return validated && validationError === null;
}
