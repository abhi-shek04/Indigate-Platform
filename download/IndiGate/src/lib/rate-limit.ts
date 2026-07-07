// Simple in-memory rate limiter (per-server-instance).
// For production with multiple instances, use Redis or Upstash.

const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key Unique key (e.g. `login:${ip}`)
 * @param maxRequests Max requests in the window
 * @param windowMs Window size in milliseconds
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
