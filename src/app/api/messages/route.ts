import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseBody, ok, err, handleError, notify } from "@/lib/api";
import { sendEmail, buildEmail } from "@/lib/email";
import { z } from "zod";
import type { ConversationDTO } from "@/lib/types";

/** GET /api/messages — list conversations for the current user */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    let conversations;
    if (session.role === "CANDIDATE") {
      const profile = await db.candidateProfile.findUnique({
        where: { userId: session.id },
      });
      if (!profile) return ok({ conversations: [] });

      conversations = await db.conversation.findMany({
        where: { candidateId: profile.id },
        include: {
          company: { select: { companyName: true, logoUrl: true, userId: true } },
          candidate: { select: { fullName: true, photoUrl: true } },
          job: { select: { title: true } },
          messages: { take: 1, orderBy: { createdAt: "desc" } },
        },
        orderBy: { updatedAt: "desc" },
      });
    } else if (session.role === "COMPANY") {
      const profile = await db.companyProfile.findUnique({
        where: { userId: session.id },
      });
      if (!profile) return ok({ conversations: [] });

      conversations = await db.conversation.findMany({
        where: { companyId: profile.id },
        include: {
          company: { select: { companyName: true, logoUrl: true, userId: true } },
          candidate: { select: { fullName: true, photoUrl: true } },
          job: { select: { title: true } },
          messages: { take: 1, orderBy: { createdAt: "desc" } },
        },
        orderBy: { updatedAt: "desc" },
      });
    } else {
      return ok({ conversations: [] });
    }

    // Count unread messages for each conversation
    const conversationDTOs: ConversationDTO[] = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await db.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: session.id },
            isRead: false,
          },
        });

        const lastMsg = conv.messages[0];
        return {
          id: conv.id,
          candidateId: conv.candidateId,
          candidateName: conv.candidate.fullName,
          candidatePhoto: conv.candidate.photoUrl,
          companyId: conv.companyId,
          companyName: conv.company.companyName,
          companyLogo: conv.company.logoUrl,
          jobId: conv.jobId,
          jobTitle: conv.job?.title ?? null,
          lastMessage: lastMsg?.body ?? null,
          lastMessageAt: lastMsg?.createdAt.toISOString() ?? null,
          lastMessageSenderId: lastMsg?.senderId ?? null,
          unreadCount,
          createdAt: conv.createdAt.toISOString(),
        };
      }),
    );

    return ok({ conversations: conversationDTOs });
  } catch (e) {
    return handleError(e);
  }
}

const initiateSchema = z.object({
  candidateId: z.string(),
  jobId: z.string().optional(),
  firstMessage: z.string().min(1).max(2000),
});

/** POST /api/messages — initiate a conversation (COMPANY only) */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);
    if (session.role !== "COMPANY")
      return err("Only companies can start conversations.", 403);

    const body = await parseBody<z.infer<typeof initiateSchema>>(req);
    const parsed = initiateSchema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const company = await db.companyProfile.findUnique({
      where: { userId: session.id },
    });
    if (!company || !company.isApproved)
      return err("Company not found or not approved.", 403);

    const candidate = await db.candidateProfile.findUnique({
      where: { id: parsed.data.candidateId },
      include: { user: true },
    });
    if (!candidate) return err("Candidate not found.", 404);

    if (!candidate.openToWork)
      return err("This candidate is not open to messages.", 403);

    // Upsert conversation
    const conversation = await db.conversation.upsert({
      where: {
        candidateId_companyId_jobId: {
          candidateId: candidate.id,
          companyId: company.id,
          jobId: parsed.data.jobId ?? null as unknown as string,
        },
      },
      create: {
        candidateId: candidate.id,
        companyId: company.id,
        jobId: parsed.data.jobId ?? null,
      },
      update: {},
    });

    // Check if this is a new conversation (no messages yet)
    const existingMessages = await db.message.count({
      where: { conversationId: conversation.id },
    });
    const isNewConversation = existingMessages === 0;

    // Create the first message
    await db.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.id,
        body: parsed.data.firstMessage,
      },
    });

    // Update conversation updatedAt
    await db.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // In-app notification
    void notify(
      candidate.userId,
      `New message from ${company.companyName}`,
      parsed.data.firstMessage.slice(0, 80) +
        (parsed.data.firstMessage.length > 80 ? "…" : ""),
    );

    // Email (only for new conversations)
    if (isNewConversation && candidate.user.email) {
      void sendEmail({
        to: candidate.user.email,
        subject: `New message from ${company.companyName} on IndiGate`,
        html: buildEmail({
          title: "New Message",
          heading: "You have a new message",
          body: `<p>${company.companyName} has sent you a message on IndiGate:</p>
                 <blockquote style="border-left:3px solid #f59e0b;padding-left:12px;color:#555;margin:12px 0;">
                 ${parsed.data.firstMessage.slice(0, 200)}${parsed.data.firstMessage.length > 200 ? "…" : ""}
                 </blockquote>`,
          cta: {
            label: "Read & Reply",
            url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://indigate.work"}/?view=candidate`,
          },
        }),
      });
    }

    return ok({ conversationId: conversation.id });
  } catch (e) {
    return handleError(e);
  }
}
