import { ok } from "@/lib/api";

// Public endpoint: tells the UI whether Google OAuth is configured.
export async function GET() {
  return ok({
    configured: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
  });
}
