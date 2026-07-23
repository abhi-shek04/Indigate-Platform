import { db } from "@/lib/db";
import { validateEnv } from "@/lib/env";

/**
 * Readiness probe — confirms the app is ready to serve traffic by verifying
 * environment configuration + database connectivity. Returns 503 if the DB
 * is unreachable or required env vars are missing.
 * Use for Kubernetes readiness / deployment smoke tests.
 *
 * Does NOT check email/storage — those are optional services with graceful
 * fallback. Only the database is a hard dependency.
 */
export async function GET() {
  try {
    validateEnv();
    // Cheapest possible DB round-trip: select a constant. Works on SQLite +
    // PostgreSQL without touching any table.
    await db.$queryRaw`SELECT 1`;
    return Response.json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return Response.json(
      {
        status: "not_ready",
        database: "disconnected",
        error: e instanceof Error ? e.message : "unknown",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
