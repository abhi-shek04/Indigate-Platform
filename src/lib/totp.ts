// Real RFC 6238 TOTP (Time-based One-Time Password) implementation.
// Compatible with Google Authenticator, Authy, 1Password, Microsoft Authenticator.
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";

const ISSUER = "IndiGate";

/**
 * Generate a new TOTP secret for a user.
 * Returns the base32 secret + an otpauth:// URI for QR codes.
 */
export function generateTotpSecret(email: string): {
  secret: string;
  uri: string;
} {
  // OTPAuth.Secret generates a cryptographically-random base32 secret.
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });
  return {
    secret: secret.base32,
    uri: totp.toString(),
  };
}

/**
 * Verify a TOTP token against a secret.
 * Allows a ±1 window (30s each side) for clock drift.
 */
export function verifyTotpToken(
  secretBase32: string,
  token: string,
  window = 1,
): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: ISSUER,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });
    const delta = totp.validate({ token, window });
    return delta !== null;
  } catch {
    return false;
  }
}

/**
 * Generate a QR code as a data URL for the given otpauth URI.
 */
export async function generateQrCodeDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 240,
    color: { dark: "#1a1208", light: "#ffffff" },
  });
}

/**
 * Generate 8 single-use backup codes (8 chars each).
 * Returns both plain (to show once) and hashed (to store).
 */
export function generateBackupCodes(): {
  plain: string[];
  hashed: string[];
} {
  const plain: string[] = [];
  const hashed: string[] = [];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  for (let i = 0; i < 8; i++) {
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    plain.push(code);
    hashed.push(bcrypt.hashSync(code, 10));
  }
  return { plain, hashed };
}

/**
 * Verify a backup code against the hashed list.
 * Returns the index of the matched code (so it can be consumed), or -1.
 */
export function verifyBackupCode(
  hashedCodes: string[],
  code: string,
): number {
  for (let i = 0; i < hashedCodes.length; i++) {
    if (bcrypt.compareSync(code, hashedCodes[i])) return i;
  }
  return -1;
}

/**
 * Consume a backup code (remove it from the list).
 */
export function consumeBackupCode(
  hashedCodes: string[],
  index: number,
): string[] {
  return hashedCodes.filter((_, i) => i !== index);
}
