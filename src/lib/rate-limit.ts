// Simple in-memory rate limiter (per-server-instance).
// For production with multiple instances, use Redis or Upstash.

/** One minute in milliseconds — convenience constant for rate-limit windows. */
export const MS_PER_MINUTE = 60 * 1000;
/** One hour in milliseconds — convenience constant for rate-limit windows. */
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;

/**
 * Named rate-limit presets for every protected endpoint.
 */
export const RATE_LIMITS = {
  LOGIN: { max: 10, windowMs: 15 * MS_PER_MINUTE },
  REGISTER: { max: 5, windowMs: MS_PER_HOUR },
  VERIFY: { max: 5, windowMs: 15 * MS_PER_MINUTE },
  RESET: { max: 3, windowMs: MS_PER_HOUR },
  APPLY: { max: 10, windowMs: 15 * MS_PER_MINUTE },
  UPLOAD: { max: 10, windowMs: 15 * MS_PER_MINUTE },
  CONTACT: { max: 5, windowMs: MS_PER_HOUR },
} as const;

const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Extracts the client IP from the x-forwarded-for header.
 * Handles comma-separated proxy chains: "client_ip, proxy1, proxy2"
 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (!xff) return "unknown";
  return xff.split(",")[0].trim();
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const record = store.get(key);
  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) return false;
  record.count++;
  return true;
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of store.entries()) {
      if (now > val.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000).unref?.();
}
