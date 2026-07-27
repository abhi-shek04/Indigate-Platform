import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseBody, ok, err, handleError, notify } from "@/lib/api";
import { sendEmail, buildEmail } from "@/lib/email";
import { z } from "zod";

const createTicketSchema = z.object({
  subject: z.string().min(3).max(150),
  category: z.enum(["GENERAL", "VISA", "APPLICATION", "INTERVIEW", "TECHNICAL"]).default("GENERAL"),
  firstMessage: z.string().min(5).max(3000),
});

/**
 * GET /api/support/tickets
 * Candidate gets their own support tickets.
 * Admin gets all support tickets (optional ?status= filter).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const statusParam = req.nextUrl.searchParams.get("status");

    if (session.role === "CANDIDATE") {
      const profile = await db.candidateProfile.findUnique({
        where: { userId: session.id },
      });
      if (!profile) return ok({ tickets: [] });

      const tickets = await db.supportTicket.findMany({
        where: { candidateId: profile.id },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
      });

      const dtos = tickets.map((t) => {
        const unreadCount = t.messages.filter(
          (m) => m.senderRole === "ADMIN" && !m.isRead
        ).length;
        return {
          id: t.id,
          candidateId: t.candidateId,
          subject: t.subject,
          category: t.category,
          status: t.status,
          internalNote: null, // Candidates never see internalNote
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          messages: t.messages.map((m) => ({
            id: m.id,
            ticketId: m.ticketId,
            senderId: m.senderId,
            senderRole: m.senderRole as "CANDIDATE" | "ADMIN",
            body: m.body,
            isRead: m.isRead,
            createdAt: m.createdAt.toISOString(),
          })),
          unreadCount,
        };
      });

      return ok({ tickets: dtos });
    }

    if (session.role === "ADMIN") {
      const where: Record<string, unknown> = {};
      if (statusParam && statusParam !== "ALL") {
        where.status = statusParam;
      }

      const tickets = await db.supportTicket.findMany({
        where,
        include: {
          candidate: { select: { fullName: true, user: { select: { email: true } } } },
          messages: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
      });

      const dtos = tickets.map((t) => {
        const unreadCount = t.messages.filter(
          (m) => m.senderRole === "CANDIDATE" && !m.isRead
        ).length;
        return {
          id: t.id,
          candidateId: t.candidateId,
          candidateName: t.candidate.fullName,
          candidateEmail: t.candidate.user.email,
          subject: t.subject,
          category: t.category,
          status: t.status,
          internalNote: t.internalNote,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          messages: t.messages.map((m) => ({
            id: m.id,
            ticketId: m.ticketId,
            senderId: m.senderId,
            senderRole: m.senderRole as "CANDIDATE" | "ADMIN",
            body: m.body,
            isRead: m.isRead,
            createdAt: m.createdAt.toISOString(),
          })),
          unreadCount,
        };
      });

      return ok({ tickets: dtos });
    }

    return err("Forbidden.", 403);
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/support/tickets
 * Candidate creates a new support ticket to Admin Support.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);
    if (session.role !== "CANDIDATE") return err("Only candidates can open support tickets.", 403);

    const body = await parseBody(req);
    const parsed = createTicketSchema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const profile = await db.candidateProfile.findUnique({
      where: { userId: session.id },
      include: { user: true },
    });
    if (!profile) return err("Candidate profile not found.", 404);

    const ticket = await db.supportTicket.create({
      data: {
        candidateId: profile.id,
        subject: parsed.data.subject,
        category: parsed.data.category,
        status: "NEW",
        messages: {
          create: {
            senderId: session.id,
            senderRole: "CANDIDATE",
            body: parsed.data.firstMessage,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    // Notify admins via email
    void sendEmail({
      to: "contact@indigate.work",
      subject: `[Support Ticket #${ticket.id.slice(-6)}] ${parsed.data.subject}`,
      html: buildEmail({
        title: "New Candidate Support Request",
        heading: `New Support Ticket from ${profile.fullName}`,
        body: `<p><strong>Category:</strong> ${parsed.data.category}</p>
               <p><strong>Subject:</strong> ${parsed.data.subject}</p>
               <blockquote style="border-left:3px solid #f59e0b;padding-left:12px;color:#555;margin:12px 0;">
                 ${parsed.data.firstMessage.slice(0, 300)}
               </blockquote>`,
        cta: {
          label: "View in Admin Dashboard",
          url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://indigate.work"}/?view=admin`,
        },
      }),
    });

    return ok({ ticketId: ticket.id }, 201);
  } catch (e) {
    return handleError(e);
  }
}
