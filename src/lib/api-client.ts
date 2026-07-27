// Thin fetch wrapper for JSON APIs with error handling + CSRF protection.

let _csrfToken: string | null = null;

/** Fetch (or return cached) CSRF token for state-changing requests. */
async function getCsrfToken(): Promise<string | null> {
  if (_csrfToken) return _csrfToken;
  try {
    const res = await fetch("/api/auth/csrf");
    const data = await res.json();
    _csrfToken = data.token ?? null;
  } catch {
    _csrfToken = null;
  }
  return _csrfToken;
}

export async function api<T = unknown>(
  url: string,
  opts?: RequestInit,
): Promise<T> {
  const method = (opts?.method ?? "GET").toUpperCase();
  const isFormData = opts?.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(opts?.headers as Record<string, string> || {}),
  };

  // Attach CSRF token to all state-changing requests
  if (method !== "GET" && method !== "HEAD") {
    const token = await getCsrfToken();
    if (token) headers["X-CSRF-Token"] = token;
  }

  const res = await fetch(url, { ...opts, headers });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? String((data as { error: unknown }).error)
        : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export function formatRelative(date: string | Date, locale: string = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (locale === "ja") {
    if (mins < 60) return `${Math.max(1, mins)}分前`;
    if (hrs < 24) return `${hrs}時間前`;
    if (days < 7) return `${days}日前`;
    return d.toLocaleDateString("ja-JP");
  }
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US");
}

export function formatDate(date: string | Date | null, locale: string = "en"): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
