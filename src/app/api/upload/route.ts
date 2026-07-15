import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const RESUME_MIME = ["application/pdf"];
const LOGO_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_RESUME = 5 * 1024 * 1024; // 5 MB
const MAX_LOGO = 2 * 1024 * 1024; // 2 MB

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return err("No file provided.", 400);

    const kind = (formData.get("kind") as string | null) ?? "resume";

    // Validate by kind
    const allowedMime = kind === "logo" ? LOGO_MIME : RESUME_MIME;
    if (!allowedMime.includes(file.type)) {
      return err(
        kind === "logo"
          ? "Logo must be PNG, JPEG, WebP, or GIF."
          : "Only PDF files are allowed.",
        400,
      );
    }
    const maxSize = kind === "logo" ? MAX_LOGO : MAX_RESUME;
    if (file.size > maxSize) {
      return err(
        kind === "logo"
          ? "Logo too large. Max 2MB."
          : "File too large. Max 5MB.",
        400,
      );
    }

    // Save to public/uploads/<kind>/<uuid>-<name>
    const subdir = kind === "logo" ? "logos" : "resumes";
    const uploadsDir = path.join(process.cwd(), "public", "uploads", subdir);
    await mkdir(uploadsDir, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const ext = kind === "logo" ? path.extname(file.name) || ".png" : "";
    const filename = `${crypto.randomUUID()}-${safeName}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const url = `/uploads/${subdir}/${filename}`;

    // Persist to the right profile record so refreshAuth() picks it up.
    if (kind === "resume" && session.role === "CANDIDATE") {
      await db.candidateProfile.update({
        where: { userId: session.id },
        data: { resumeUrl: url, resumeName: file.name },
      });
    } else if (kind === "logo" && session.role === "COMPANY") {
      await db.companyProfile.update({
        where: { userId: session.id },
        data: { logoUrl: url },
      });
    }

    return ok({ url, name: file.name });
  } catch (e) {
    return handleError(e);
  }
}
