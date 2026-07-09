/**
 * Audit log helper — records admin actions for APPI compliance.
 * Call audit() at the end of any admin action (approve, delete, verify, etc.)
 */
import { db } from "@/lib/db";
import type { NextRequest } from "next/server";

export async function audit(params: {
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  details?: Record<string, unknown>;
  req?: NextRequest;
}) {
  try {
    await db.auditLog.create({
      data: {
        actorId: params.actorId,
        actorEmail: params.actorEmail,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId ?? null,
        targetName: params.targetName ?? null,
        details: params.details ? JSON.stringify(params.details) : null,
        ipAddress: params.req?.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null,
      },
    });
  } catch (e) {
    console.error("[AUDIT LOG ERROR]", e);
  }
}
