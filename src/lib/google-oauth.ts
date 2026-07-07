/**
 * Google OAuth helper — generates authorization URLs and exchanges codes for
 * tokens using the standard Google Identity OAuth 2.0 flow.
 *
 * Requires these env vars (all optional in dev — Google login just 503s4):
 *  - GOOGLE_CLIENT_ID
 *  - GOOGLE_CLIENT_SECRET
 *  - GOOGLE_REDIRECT_URI (e.g. https://indigate.work/api/auth/google/callback)
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

/** Scopes: email + profile (name + avatar) */
const SCOPES = ["openid", "email", "profile"].join(" ");

export function isGoogleConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI
  );
}

/** Build the Google consent-screen URL we redirect the user to. */
export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: SCOPES,
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

/** Exchange the authorization code for an access token, then fetch the user profile. */
export async function exchangeGoogleCode(code: string): Promise<GoogleUser | null> {
  // 1. Exchange code → tokens
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return null;
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) return null;

  // 2. Fetch user profile
  const userRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userRes.ok) return null;
  const profile = (await userRes.json()) as {
    id: string;
    email: string;
    name?: string;
    picture?: string;
    verified_email?: boolean;
  };
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name ?? profile.email.split("@")[0],
    picture: profile.picture ?? "",
  };
}
