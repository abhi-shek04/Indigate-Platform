import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req.headers);
    if (!rateLimit(`upload:${ip}`, RATE_LIMITS.UPLOAD.max, RATE_LIMITS.UPLOAD.windowMs)) {
      return NextResponse.json({ error: "Too many uploads. Please try again later." }, { status: 429 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const kind = form.get("kind") as string | null;

    if (!file || !kind) {
      return NextResponse.json({ error: "Missing file or kind" }, { status: 400 });
    }

    if (kind !== "resume" && kind !== "logo") {
      return NextResponse.json({ error: "Invalid upload kind. Only 'resume' and 'logo' are allowed." }, { status: 400 });
    }

    if (kind === "resume") {
      if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") {
        return NextResponse.json({ error: "Resume must be a PDF" }, { status: 400 });
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
      }
      if (session.role !== "CANDIDATE") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (kind === "logo") {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Logo must be an image" }, { status: 400 });
      }
      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 });
      }
      if (session.role !== "COMPANY") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const rawExt = file.name.split(".").pop() ?? "";
    const ALLOWED_EXTS = ["pdf", "png", "jpg", "jpeg", "webp", "gif"];
    const ext = ALLOWED_EXTS.includes(rawExt.toLowerCase()) ? rawExt.toLowerCase() : "bin";
    const buffer = Buffer.from(await file.arrayBuffer());

    // Local file storage (works without Supabase — saves to public/uploads/)
    const fs = await import("fs/promises");
    const localDir = `public/uploads/${kind}s/${session.id}`;
    await fs.mkdir(localDir, { recursive: true });
    const fileName = `${Date.now()}.${ext}`;
    await fs.writeFile(`${localDir}/${fileName}`, buffer);
    const url = `/uploads/${kind}s/${session.id}/${fileName}`;

    // Save the URL back to the database
    if (kind === "resume") {
      await db.candidateProfile.update({
        where: { userId: session.id },
        data: { resumeUrl: url, resumeName: file.name },
      });
    } else if (kind === "logo") {
      await db.companyProfile.update({
        where: { userId: session.id },
        data: { logoUrl: url },
      });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[UPLOAD ERROR]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
