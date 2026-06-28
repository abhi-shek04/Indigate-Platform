import { cookies } from "next/headers";
import { db } from "@/lib/db";
import type { Role, SessionUser } from "@/lib/types";

const SESSION_COOKIE = "indigate_session";
const SECRET =
  process.env.SESSION_SECRET ?? "indigate-dev-secret-change-in-dotenv";

if (
  process.env.NODE_ENV === "production" &&
  !process.env.SESSION_SECRET
) {
  throw new Error(
    "SESSION_SECRET env var must be set in production. Generate one with: openssl rand -base64 32",
  );
}

// Simple HMAC-signed JSON session token (no external deps).
async function hmac(
  data: string,
  secret: string,
): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Buffer.from(new Uint8Array(sig)).toString("base64url");
}

async function sign(payload: object): Promise<string> {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = await hmac(body, SECRET);
  return `${body}.${sig}`;
}

async function verify(token: string): Promise<Record<string, unknown> | null> {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = await hmac(body, SECRET);
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await sign({
    uid: user.id,
    email: user.email,
    role: user.role,
    iat: Date.now(),
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verify(token);
  if (!payload || typeof payload.uid !== "string") return null;

  const user = await db.user.findUnique({
    where: { id: payload.uid as string },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
    },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    isVerified: user.isVerified,
  };
}

export async function requireSession(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) {
    throw new Error("UNAUTHORIZED");
  }
  return s;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const s = await requireSession();
  if (!roles.includes(s.role)) {
    throw new Error("FORBIDDEN");
  }
  return s;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
