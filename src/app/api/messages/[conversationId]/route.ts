import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseBody, ok, err, handleError, notify } from "@/lib/api";
import { z } from "zod";
import type { MessageDTO, ConversationDTO } from "@/lib/types";

/** GET /api/messages/[conversationId] — fetch thread + mark as read */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const { conversationId } = await params;

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        candidate: { select: { userId: true, fullName: true, photoUrl: true } },
        company: { select: { userId: true, companyName: true, logoUrl: true } },
        job: { select: { title: true } },
      },
    });

    if (!conversation) return err("Conversation not found.", 404);

    // Verify participant
    const isParticipant =
      session.id === conversation.candidate.userId ||
      session.id === conversation.company.userId;
    if (!isParticipant) return err("Forbidden.", 403);

    // Fetch messages
    const messages = await db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    // Mark unread messages as read
    await db.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    const messageDTOs: MessageDTO[] = messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      body: m.body,
      isRead: m.isRead,
      createdAt: m.createdAt.toISOString(),
    }));

    const conversationDTO: ConversationDTO = {
      id: conversation.id,
      candidateId: conversation.candidateId,
      candidateName: conversation.candidate.fullName,
      candidatePhoto: conversation.candidate.photoUrl,
      companyId: conversation.companyId,
      companyName: conversation.company.companyName,
      companyLogo: conversation.company.logoUrl,
      jobId: conversation.jobId,
      jobTitle: conversation.job?.title ?? null,
      lastMessage: messages[messages.length - 1]?.body ?? null,
      lastMessageAt: messages[messages.length - 1]?.createdAt.toISOString() ?? null,
      lastMessageSenderId: messages[messages.length - 1]?.senderId ?? null,
      unreadCount: 0, // We just marked them as read
      createdAt: conversation.createdAt.toISOString(),
    };

    return ok({ messages: messageDTOs, conversation: conversationDTO });
  } catch (e) {
    return handleError(e);
  }
}

const sendSchema = z.object({
  body: z.string().min(1).max(2000),
});

/** POST /api/messages/[conversationId] — send a message */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);

    const { conversationId } = await params;
    const body = await parseBody<z.infer<typeof sendSchema>>(req);
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Invalid input.", 422);

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        candidate: { select: { userId: true, fullName: true } },
        company: { select: { userId: true, companyName: true } },
      },
    });

    if (!conversation) return err("Conversation not found.", 404);

    // Verify participant
    const isParticipant =
      session.id === conversation.candidate.userId ||
      session.id === conversation.company.userId;
    if (!isParticipant) return err("Forbidden.", 403);

    // Create message
    const message = await db.message.create({
      data: {
        conversationId,
        senderId: session.id,
        body: parsed.data.body,
      },
    });

    // Update conversation updatedAt
    await db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Determine recipient
    const recipientId =
      session.id === conversation.candidate.userId
        ? conversation.company.userId
        : conversation.candidate.userId;

    // Determine sender display name
    const senderName =
      session.role === "CANDIDATE"
        ? conversation.candidate.fullName
        : conversation.company.companyName;

    // In-app notification
    void notify(
      recipientId,
      `${senderName} sent you a message`,
      parsed.data.body.slice(0, 80) +
        (parsed.data.body.length > 80 ? "…" : ""),
    );

    const messageDTO: MessageDTO = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      body: message.body,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
    };

    try {
      const { emitMessage } = await import("@/lib/sse-emitter");
      emitMessage(recipientId, messageDTO);
      // We also emit to the sender so other active sessions of the sender sync up
      emitMessage(session.id, messageDTO);
    } catch {}

    return ok({ message: messageDTO });
  } catch (e) {
    return handleError(e);
  }
}
