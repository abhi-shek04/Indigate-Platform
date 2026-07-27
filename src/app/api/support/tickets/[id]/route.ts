import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";

/**
 * GET /api/support/tickets/[id]
 * Retrieves a single ticket and its messages.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const { id } = await params;

    const ticket = await db.supportTicket.findUnique({
      where: { id },
      include: {
        candidate: { select: { id: true, userId: true, fullName: true, user: { select: { email: true } } } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!ticket) return err("Ticket not found.", 404);

    if (session.role === "CANDIDATE") {
      if (ticket.candidate.userId !== session.id) return err("Forbidden.", 403);
      // Mark admin messages as read
      await db.supportMessage.updateMany({
        where: { ticketId: id, senderRole: "ADMIN", isRead: false },
        data: { isRead: true },
      });
    } else if (session.role === "ADMIN") {
      // Mark candidate messages as read
      await db.supportMessage.updateMany({
        where: { ticketId: id, senderRole: "CANDIDATE", isRead: false },
        data: { isRead: true },
      });
    } else {
      return err("Forbidden.", 403);
    }

    const dto = {
      id: ticket.id,
      candidateId: ticket.candidateId,
      candidateName: ticket.candidate.fullName,
      candidateEmail: ticket.candidate.user.email,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      internalNote: session.role === "ADMIN" ? ticket.internalNote : null,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      messages: ticket.messages.map((m) => ({
        id: m.id,
        ticketId: m.ticketId,
        senderId: m.senderId,
        senderRole: m.senderRole as "CANDIDATE" | "ADMIN",
        body: m.body,
        isRead: true,
        createdAt: m.createdAt.toISOString(),
      })),
    };

    return ok({ ticket: dto });
  } catch (e) {
    return handleError(e);
  }
}
