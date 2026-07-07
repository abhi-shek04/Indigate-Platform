import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { ok, err, handleError, notify } from "@/lib/api";
import { sendEmail, emails } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
  role: z.enum(["CANDIDATE", "COMPANY"]),
  fullName: z.string().optional(),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  locationJapan: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    if (!rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
      return err("Too many registration attempts. Try again later.", 429);
    }
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return err(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }
    const {
      email,
      password,
      name,
      role,
      fullName,
      companyName,
      industry,
      locationJapan,
    } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing)
      return err("An account with this email already exists.", 409);

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate a real 6-digit verification code (emailed, not shown as demo)
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        role,
        name:
          role === "CANDIDATE" ? fullName ?? name : companyName ?? name,
        isVerified: false, // requires email verification
        verifyToken: verifyCode,
      },
    });

    if (role === "CANDIDATE") {
      await db.candidateProfile.create({
        data: {
          userId: user.id,
          fullName: fullName ?? name ?? email.split("@")[0],
        },
      });
      // Fire-and-forget welcome email + verification email
      void sendEmail({
        to: email,
        ...emails.welcomeCandidate(fullName ?? name ?? ""),
      });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://indigate.work";
      const verifyUrl = `${appUrl}/?view=verify&email=${encodeURIComponent(email)}`;
      void sendEmail({
        to: email,
        ...emails.emailVerification(verifyUrl),
      });
      // Log the code for dev/testing (in production, only email is sent)
      console.log(`[Email verification] Code for ${email}: ${verifyCode}`);
    } else {
      await db.companyProfile.create({
        data: {
          userId: user.id,
          companyName: companyName ?? name ?? email.split("@")[0],
          industry: industry ?? null,
          locationJapan: locationJapan ?? null,
          isApproved: false,
        },
      });
      // Welcome the company + notify admins (fire-and-forget)
      void sendEmail({
        to: email,
        ...emails.welcomeCompany(companyName ?? ""),
      });
      if (process.env.ADMIN_EMAIL) {
        void sendEmail({
          to: process.env.ADMIN_EMAIL,
          ...emails.adminNewCompany(companyName ?? "", email),
        });
      }
      const admins = await db.user.findMany({ where: { role: "ADMIN" } });
      await Promise.all(
        admins.map((a) =>
          notify(
            a.id,
            "New company pending approval",
            `${companyName} registered and is awaiting approval.`,
          ),
        ),
      );
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "CANDIDATE" | "COMPANY" | "ADMIN",
      isVerified: user.isVerified,
    });

    return ok(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
      201,
    );
  } catch (e) {
    return handleError(e);
  }
}
