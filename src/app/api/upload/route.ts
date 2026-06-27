import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Simple file upload — stores to public/uploads and returns the public URL.
// Used for resume (candidate) and logo (company).
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const formData = await req.formData();
    const file = formData.get("file");
    const kind = (formData.get("kind") as string) || "resume";
    if (!(file instanceof File)) return err("No file provided.", 422);

    // size limits
    const maxBytes = kind === "resume" ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxBytes) return err("File too large.", 413);

    // type checks
    if (kind === "resume") {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf"))
        return err("Resume must be a PDF.", 422);
    } else {
      if (!file.type.startsWith("image/")) return err("Logo must be an image.", 422);
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || (kind === "resume" ? "pdf" : "png");
    const filename = `${session.id}-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buf);
    const url = `/uploads/${filename}`;

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

    return ok({ url, name: file.name }, 201);
  } catch (e) {
    return handleError(e);
  }
}
