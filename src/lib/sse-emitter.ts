import { EventEmitter } from "events";
import type { MessageDTO, NotificationDTO } from "./types";

// Global singleton event emitter for SSE
const globalForSse = globalThis as unknown as {
  sseEmitter: EventEmitter | undefined;
};

export const sseEmitter = globalForSse.sseEmitter ?? new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForSse.sseEmitter = sseEmitter;
}

// Increase limit to avoid warnings on many connections
sseEmitter.setMaxListeners(1000);

/**
 * Emit a new message to a specific user's SSE stream.
 */
export function emitMessage(userId: string, message: MessageDTO) {
  sseEmitter.emit(`user:${userId}:message`, message);
}

/**
 * Emit a new notification to a specific user's SSE stream.
 */
export function emitNotification(userId: string, notification: NotificationDTO) {
  sseEmitter.emit(`user:${userId}:notification`, notification);
}
