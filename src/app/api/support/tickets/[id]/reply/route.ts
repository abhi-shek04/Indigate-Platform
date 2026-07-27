import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseBody, ok, err, handleError, notify } from "@/lib/api";
import { z } from "zod";

const replySchema = z.object({
  body: z.string().min(1).max(3000),
});

/**
 * POST /api/support/tickets/[id]/reply
 * Reply to a support ticket thread.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const { id } = await params;
    const body = await parseBody(req);
    const parsed = replySchema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const ticket = await db.supportTicket.findUnique({
      where: { id },
      include: {
        candidate: { select: { id: true, userId: true, fullName: true } },
      },
    });

    if (!ticket) return err("Ticket not found.", 404);

    let senderRole: "CANDIDATE" | "ADMIN" = "CANDIDATE";
    let newStatus = ticket.status;

    if (session.role === "CANDIDATE") {
      if (ticket.candidate.userId !== session.id) return err("Forbidden.", 403);
      senderRole = "CANDIDATE";
      newStatus = "WAITING";
    } else if (session.role === "ADMIN") {
      senderRole = "ADMIN";
      if (ticket.status === "NEW") {
        newStatus = "OPEN";
      }
    } else {
      return err("Forbidden.", 403);
    }

    const message = await db.supportMessage.create({
      data: {
        ticketId: id,
        senderId: session.id,
        senderRole,
        body: parsed.data.body,
        isRead: false,
      },
    });

    await db.supportTicket.update({
      where: { id },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    // Send in-app notification to candidate if admin replied
    if (senderRole === "ADMIN") {
      void notify(
        ticket.candidate.userId,
        `New reply from Admin Support regarding "${ticket.subject}"`,
        parsed.data.body.slice(0, 100)
      );
    }

    return ok({ messageId: message.id, status: newStatus });
  } catch (e) {
    return handleError(e);
  }
}
