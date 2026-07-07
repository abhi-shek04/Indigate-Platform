import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "zip";
  const filePath = format === "zip" 
    ? path.join(process.cwd(), "download", "indigate-complete.zip")
    : path.join(process.cwd(), "download", "indigate-complete.tar.gz");
  
  try {
    const buffer = await readFile(filePath);
    const filename = format === "zip" ? "indigate-complete.zip" : "indigate-complete.tar.gz";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": format === "zip" ? "application/zip" : "application/gzip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
