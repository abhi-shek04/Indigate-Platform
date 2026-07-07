import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";
import { generateTotpSecret, generateQrCodeDataUrl } from "@/lib/totp";

// Generate a new TOTP secret + QR code for the logged-in user.
// The secret is stored provisionally; 2FA only activates after verification.
export async function POST() {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    // Don't regenerate if already enabled
    const user = await db.user.findUnique({ where: { id: session.id } });
    if (user?.totpEnabled)
      return err("Two-factor authentication is already enabled.", 400);

    const { secret, uri } = generateTotpSecret(session.email);
    // Store the secret provisionally (not yet enabled)
    await db.user.update({
      where: { id: session.id },
      data: { totpSecret: secret },
    });

    const qr = await generateQrCodeDataUrl(uri);
    return ok({ qr, secret, uri });
  } catch (e) {
    return handleError(e);
  }
}
