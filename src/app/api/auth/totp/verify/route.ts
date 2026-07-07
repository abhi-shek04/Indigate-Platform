import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError, notify } from "@/lib/api";
import { verifyTotpToken, generateBackupCodes } from "@/lib/totp";
import { z } from "zod";

const schema = z.object({
  code: z.string().length(6),
});

// Verify the TOTP code entered by the user and enable 2FA.
// Returns one-time backup codes on success.
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err("Enter the 6-digit code.", 422);

    const user = await db.user.findUnique({ where: { id: session.id } });
    if (!user) return err("User not found.", 404);
    if (user.totpEnabled)
      return err("Two-factor is already enabled.", 400);
    if (!user.totpSecret)
      return err("No pending TOTP setup. Start setup first.", 400);

    const valid = verifyTotpToken(user.totpSecret, parsed.data.code);
    if (!valid) return err("Invalid code. Make sure your device time is correct.", 400);

    // Generate backup codes
    const { plain, hashed } = generateBackupCodes();
    await db.user.update({
      where: { id: session.id },
      data: {
        totpEnabled: true,
        backupCodes: JSON.stringify(hashed),
      },
    });

    await notify(
      session.id,
      "Two-factor authentication enabled",
      "Your account is now protected with an authenticator app. Save your backup codes in a safe place.",
    );

    return ok({ enabled: true, backupCodes: plain });
  } catch (e) {
    return handleError(e);
  }
}
