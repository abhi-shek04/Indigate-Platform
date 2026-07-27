import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";

import * as mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return err("Unauthorized", 401);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return err("No file uploaded", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    const name = file.name.toLowerCase();
    
    if (name.endsWith(".pdf") || file.type === "application/pdf") {
      // Use eval to bypass Turbopack static analysis which crashes on pdf-parse
      const pdfParseModule = eval('require("pdf-parse")');
      const PDFParseClass = pdfParseModule.PDFParse;
      const parser = new PDFParseClass({ data: buffer });
      const result = await parser.getText();
      text = result.text;
      await parser.destroy();
    } else if (name.endsWith(".docx") || name.endsWith(".doc")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      text = buffer.toString("utf-8");
    }

    if (!text || text.trim().length < 10) {
      return err("Could not extract meaningful text from the file.", 400);
    }

    return ok({ text });
  } catch (e) {
    console.error("JD Parsing Error:", e);
    return handleError(e);
  }
}
