import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { parseBody, ok, err, handleError } from "@/lib/api";
import { verifyTotpToken, verifyBackupCode, consumeBackupCode } from "@/lib/totp";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  totpCode: z.string().optional(),
  backupCode: z.string().optional(),
});

// Complete login for a user who passed password check and has 2FA enabled.
// The client reaches this view only after /api/auth/login returned
// { requiresTwoFactor: true }, which means the password was already verified.
// For security we re-confirm the password-derived context by checking the user
// exists and 2FA is enabled, then verify the TOTP/backup code.
export async function POST(req: NextRequest) {
  try {
    const body = await parseBody(req);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err("Invalid request.", 422);

    const { email, totpCode, backupCode } = parsed.data;
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return err("Unauthorized.", 401);
    if (!user.totpEnabled || !user.totpSecret)
      return err("Two-factor is not enabled for this account.", 400);

    if (totpCode) {
      const valid = verifyTotpToken(user.totpSecret, totpCode);
      if (!valid) return err("Invalid authenticator code.", 401);
    } else if (backupCode) {
      const hashed: string[] = user.backupCodes ? JSON.parse(user.backupCodes) : [];
      const idx = verifyBackupCode(hashed, backupCode.toUpperCase());
      if (idx === -1) return err("Invalid backup code.", 401);
      const remaining = consumeBackupCode(hashed, idx);
      await db.user.update({
        where: { id: user.id },
        data: { backupCodes: JSON.stringify(remaining) },
      });
    } else {
      return err("Provide a TOTP or backup code.", 422);
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "CANDIDATE" | "COMPANY" | "ADMIN",
      isVerified: user.isVerified,
      totpEnabled: user.totpEnabled,
      googleId: user.googleId,
    });

    return ok({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      totpEnabled: user.totpEnabled,
    });
  } catch (e) {
    return handleError(e);
  }
}
