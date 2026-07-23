import { getSession } from "@/lib/auth";
import { sseEmitter } from "@/lib/sse-emitter";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.id;

  const stream = new ReadableStream({
    start(controller) {
      const enqueue = (event: string, data: any) => {
        try {
          controller.enqueue(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        } catch (e) {
          // stream closed
        }
      };

      const onMessage = (data: any) => enqueue("message", data);
      const onNotification = (data: any) => enqueue("notification", data);

      sseEmitter.on(`user:${userId}:message`, onMessage);
      sseEmitter.on(`user:${userId}:notification`, onNotification);

      // Keep-alive ping every 30s to prevent connection drop
      const interval = setInterval(() => {
        try {
          controller.enqueue(`: keep-alive\n\n`);
        } catch (e) {
          clearInterval(interval);
        }
      }, 30000);

      req.signal.addEventListener("abort", () => {
        sseEmitter.off(`user:${userId}:message`, onMessage);
        sseEmitter.off(`user:${userId}:notification`, onNotification);
        clearInterval(interval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
