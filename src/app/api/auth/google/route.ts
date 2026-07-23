import { NextResponse } from "next/server";
import { getGoogleAuthUrl, isGoogleConfigured } from "@/lib/google-oauth";

/**
 * GET /api/auth/google?role=CANDIDATE
 * Redirects the user to Google's consent screen. The `role` query param is
 * carried through the OAuth `state` so we know which profile to create on
 * callback.
 */
export async function GET(req: Request) {
  if (!isGoogleConfigured()) {
    return NextResponse.json(
      {
        error:
          "Google login is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.",
      },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") === "COMPANY" ? "COMPANY" : "CANDIDATE";

  // Simple state: role + random nonce, base64-encoded. Prevents CSRF.
  const nonce = crypto.randomUUID();
  const state = Buffer.from(JSON.stringify({ role, nonce })).toString("base64url");

  return NextResponse.redirect(getGoogleAuthUrl(state));
}
