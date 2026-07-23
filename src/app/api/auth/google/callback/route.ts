import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { exchangeGoogleCode } from "@/lib/google-oauth";

/**
 * GET /api/auth/google/callback?code=...&state=...
 * Google redirects here after the user consents. We exchange the code for
 * the user's Google profile, find-or-create a User, and start a session.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://indigate.work";

  // User declined consent
  if (error === "access_denied" || !code || !state) {
    return NextResponse.redirect(`${appUrl}/?view=login&error=google_denied`);
  }

  // Decode state to get the intended role
  let role: string = "CANDIDATE";
  try {
    const decoded = JSON.parse(
      Buffer.from(state, "base64url").toString("utf-8"),
    ) as { role?: string };
    role = decoded.role === "COMPANY" ? "COMPANY" : "CANDIDATE";
  } catch {
    // malformed state — default to CANDIDATE
  }

  // Exchange code → Google profile
  const googleUser = await exchangeGoogleCode(code);
  if (!googleUser) {
    return NextResponse.redirect(`${appUrl}/?view=login&error=google_failed`);
  }

  // Find-or-create the user by googleId, then by email (link accounts)
  let user = await db.user.findUnique({
    where: { googleId: googleUser.id },
  });

  if (!user) {
    // Check if an account with this email already exists (password-based)
    user = await db.user.findUnique({
      where: { email: googleUser.email },
    });
    if (user) {
      // Link the Google ID to the existing account
      user = await db.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.id,
          image: googleUser.picture || user.image,
          isVerified: true, // Google-verified email
        },
      });
    } else {
      // Create a new account
      user = await db.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.id,
          image: googleUser.picture,
          role,
          isVerified: true, // Google-verified email
        },
      });

      // Create the role-specific profile
      if (role === "CANDIDATE") {
        await db.candidateProfile.create({
          data: { userId: user.id, fullName: googleUser.name },
        });
      } else {
        await db.companyProfile.create({
          data: {
            userId: user.id,
            companyName: googleUser.name,
            isApproved: false,
          },
        });
      }
    }
  }

  // Start session
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "CANDIDATE" | "COMPANY" | "ADMIN",
    isVerified: user.isVerified,
  });

  // Redirect to the appropriate dashboard
  const dest =
    user.role === "CANDIDATE"
      ? "/?view=candidate"
      : user.role === "COMPANY"
        ? "/?view=company"
        : "/?view=admin";
  return NextResponse.redirect(`${appUrl}${dest}`);
}
