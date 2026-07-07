import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const COOKIE = "ig_session_anon";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get or create anonymous session ID
    let sessionId = req.cookies.get(COOKIE)?.value;
    let setCookie: string | null = null;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      const secure = process.env.NODE_ENV === "production";
      setCookie = `${COOKIE}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ONE_YEAR}${secure ? "; Secure" : ""}`;
    }

    // Verify job exists
    const job = await db.job.findUnique({ where: { id }, select: { id: true } });
    if (!job) return NextResponse.json({ counted: false }, { status: 404 });

    // Deduplicate: one view per session per job per 24h
    const existing = await db.jobView.findFirst({
      where: {
        jobId: id,
        sessionId: sessionId!,
        viewedAt: { gte: new Date(Date.now() - 86400000) },
      },
      select: { id: true },
    });
    if (!existing) {
      await db.jobView.create({
        data: { jobId: id, sessionId: sessionId! },
      });
    }

    const res = NextResponse.json({ counted: !existing });
    if (setCookie) res.headers.set("Set-Cookie", setCookie);
    return res;
  } catch {
    return NextResponse.json({ counted: false }, { status: 500 });
  }
}
