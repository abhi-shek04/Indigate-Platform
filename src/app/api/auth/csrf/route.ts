/**
 * CSRF protection using the double-submit Cookie pattern.
 *
 * On any state-changing request (POST/PUT/PATCH/DELETE), the client must send
 * a `X-CSRF-Token` header matching the `indigate_csrf` cookie value.
 *
 * The cookie is set automatically by this endpoint (called on page load).
 * Same-Site=Lax prevents the cookie from being sent on cross-origin requests,
 * so an attacker cannot read it.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const CSRF_COOKIE = "indigate_csrf";

/** Generate a random CSRF token. */
function generateToken(): string {
  return crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
}

/** GET /api/auth/csrf — sets a CSRF cookie + returns the token. */
export async function GET() {
  const store = await cookies();
  let token = store.get(CSRF_COOKIE)?.value;
  if (!token) {
    token = generateToken();
    store.set(CSRF_COOKIE, token, {
      httpOnly: false, // Client JS needs to read this
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }
  return NextResponse.json({ token });
}
