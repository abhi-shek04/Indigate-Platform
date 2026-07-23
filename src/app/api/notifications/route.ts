import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, err, handleError } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return ok({ notifications: [] });

    const rows = await db.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    const unread = rows.filter((n) => !n.isRead).length;
    return ok({
      notifications: rows.map((n) => ({
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
      unread,
    });
  } catch (e) {
    return handleError(e);
  }
}

// Mark all as read
export async function PATCH() {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized.", 401);
    await db.notification.updateMany({
      where: { userId: session.id, isRead: false },
      data: { isRead: true },
    });
    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
