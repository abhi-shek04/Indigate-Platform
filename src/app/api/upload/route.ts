import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";
import { getSupabase, isSupabaseConfigured, SUPABASE_BUCKET } from "@/lib/supabase";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/**
 * File upload endpoint.
 * - kind="resume": CANDIDATE only, PDF, max 5MB → candidateProfile.resumeUrl
 * - kind="logo":  COMPANY only, image, max 2MB → companyProfile.logoUrl
 * - kind="photo": any role, image, max 2MB → candidateProfile.photoUrl
 *
 * Uses Supabase Storage when configured, otherwise falls back to local
 * /public/uploads/ storage (for dev/sandbox).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const formData = await req.formData();
    const file = formData.get("file");
    const kind = (formData.get("kind") as string) || "resume";
    if (!(file instanceof File)) return err("No file provided.", 422);

    // Size limits
    const maxBytes = kind === "resume" ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxBytes) return err("File too large.", 413);

    // Type checks
    if (kind === "resume") {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf"))
        return err("Resume must be a PDF.", 422);
    } else {
      if (!file.type.startsWith("image/"))
        return err("Logo/photo must be an image.", 422);
    }

    // Role check
    if (kind === "resume" && session.role !== "CANDIDATE")
      return err("Only candidates can upload resumes.", 403);
    if (kind === "logo" && session.role !== "COMPANY")
      return err("Only companies can upload logos.", 403);

    const ext =
      file.name.split(".").pop() ||
      (kind === "resume" ? "pdf" : "png");
    const filename = `${session.id}-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    let publicUrl: string;

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      // --- Supabase Storage path ---
      const storagePath = `${kind === "resume" ? "resumes" : kind === "logo" ? "logos" : "photos"}/${session.id}/${filename}`;
      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: true,
        });
      if (uploadError) {
        console.error("[upload] supabase error:", uploadError);
        return err("Upload failed. Please try again.", 500);
      }
      const { data } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(storagePath);
      publicUrl = data.publicUrl;
    } else {
      // --- Local storage fallback (dev/sandbox) ---
      const dir = path.join(process.cwd(), "public", "uploads");
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, filename), buffer);
      publicUrl = `/uploads/${filename}`;
    }

    // Save URL to DB
    if (kind === "resume" && session.role === "CANDIDATE") {
      await db.candidateProfile.update({
        where: { userId: session.id },
        data: { resumeUrl: publicUrl, resumeName: file.name },
      });
    } else if (kind === "logo" && session.role === "COMPANY") {
      await db.companyProfile.update({
        where: { userId: session.id },
        data: { logoUrl: publicUrl },
      });
    } else if (kind === "photo" && session.role === "CANDIDATE") {
      await db.candidateProfile.update({
        where: { userId: session.id },
        data: { photoUrl: publicUrl },
      });
    }

    return ok({ url: publicUrl, name: file.name }, 201);
  } catch (e) {
    return handleError(e);
  }
}
