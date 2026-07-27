import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseBody, ok, err, handleError } from "@/lib/api";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["NEW", "OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"]).optional(),
  internalNote: z.string().nullable().optional(),
});

/**
 * PATCH /api/support/tickets/[id]/status
 * Admin-only endpoint to update ticket status and internal note.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const body = await parseBody(req);
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const ticket = await db.supportTicket.findUnique({ where: { id } });
    if (!ticket) return err("Ticket not found.", 404);

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.status) updateData.status = parsed.data.status;
    if (parsed.data.internalNote !== undefined)
      updateData.internalNote = parsed.data.internalNote;

    const updated = await db.supportTicket.update({
      where: { id },
      data: updateData,
    });

    return ok({ ticketId: updated.id, status: updated.status });
  } catch (e) {
    return handleError(e);
  }
}
