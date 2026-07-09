import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseBody, ok, err, handleError, notify } from "@/lib/api";
import { verifyTotpToken, verifyBackupCode } from "@/lib/totp";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(6),
});

// Disable 2FA — requires a valid TOTP or backup code to prevent accidental lockout.
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const body = await parseBody(req);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err("Enter a valid code to confirm.", 422);

    const user = await db.user.findUnique({ where: { id: session.id } });
    if (!user) return err("User not found.", 404);
    if (!user.totpEnabled) return err("Two-factor is not enabled.", 400);

    const code = parsed.data.code.toUpperCase();
    let verified = false;

    // Try TOTP first (6 digits)
    if (user.totpSecret && /^\d{6}$/.test(code)) {
      verified = verifyTotpToken(user.totpSecret, code);
    }
    // Then try backup codes (8 chars)
    if (!verified && user.backupCodes) {
      const hashed: string[] = JSON.parse(user.backupCodes);
      if (verifyBackupCode(hashed, code) !== -1) verified = true;
    }

    if (!verified) return err("Invalid code. Cannot disable 2FA without verification.", 400);

    await db.user.update({
      where: { id: session.id },
      data: {
        totpEnabled: false,
        totpSecret: null,
        backupCodes: null,
      },
    });

    await notify(
      session.id,
      "Two-factor authentication disabled",
      "Your account no longer requires an authenticator code at login.",
    );

    return ok({ enabled: false });
  } catch (e) {
    return handleError(e);
  }
}
