import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSupabase, SUPABASE_BUCKET } from "@/lib/supabase";
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

    // Validate kind
    const ALLOWED_KINDS = ["resume", "logo", "photo", "passport", "jlpt-cert", "degree-cert", "license", "reg-cert"];
    if (!ALLOWED_KINDS.includes(kind)) {
      return NextResponse.json({ error: "Invalid upload kind." }, { status: 400 });
    }

    // Validate by kind
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
    } else if (kind === "logo" || kind === "photo") {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Image files only" }, { status: 400 });
      }
      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 });
      }
      if (kind === "logo" && session.role !== "COMPANY") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      // Document uploads (passport, certs, license) — allow PDF + images
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        return NextResponse.json({ error: "PDF or image files only" }, { status: 400 });
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
      }
    }

    // Sanitize file extension
    const rawExt = file.name.split(".").pop() ?? "";
    const ALLOWED_EXTS = ["pdf", "png", "jpg", "jpeg", "webp", "gif"];
    const ext = ALLOWED_EXTS.includes(rawExt.toLowerCase()) ? rawExt.toLowerCase() : "bin";
    const buffer = Buffer.from(await file.arrayBuffer());

    let url: string;

    // Try Supabase first, fall back to local storage
    const supabase = getSupabase();
    if (supabase) {
      const path = `${kind}s/${session.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(path, buffer, { contentType: file.type, upsert: true });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: pubData } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(path);

      url = pubData.publicUrl;
    } else {
      // Local fallback (dev/sandbox without Supabase)
      const fs = await import("fs/promises");
      const localDir = `public/uploads/${kind}s/${session.id}`;
      await fs.mkdir(localDir, { recursive: true });
      const fileName = `${Date.now()}.${ext}`;
      await fs.writeFile(`${localDir}/${fileName}`, buffer);
      url = `/uploads/${kind}s/${session.id}/${fileName}`;
    }

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
    } else if (kind === "photo") {
      await db.candidateProfile.update({
        where: { userId: session.id },
        data: { photoUrl: url },
      });
    } else if (kind === "passport") {
      await db.candidateProfile.update({
        where: { userId: session.id },
        data: { passportUrl: url, docStatus: "PENDING" },
      });
    } else if (kind === "jlpt-cert") {
      await db.candidateProfile.update({
        where: { userId: session.id },
        data: { jlptCertUrl: url, docStatus: "PENDING" },
      });
    } else if (kind === "degree-cert") {
      await db.candidateProfile.update({
        where: { userId: session.id },
        data: { degreeCertUrl: url, docStatus: "PENDING" },
      });
    } else if (kind === "license") {
      await db.companyProfile.update({
        where: { userId: session.id },
        data: { licenseUrl: url },
      });
    } else if (kind === "reg-cert") {
      await db.companyProfile.update({
        where: { userId: session.id },
        data: { regCertUrl: url },
      });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[UPLOAD ERROR]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
