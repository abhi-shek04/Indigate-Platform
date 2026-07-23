"use client";

import { useEffect, useRef } from "react";

/**
 * Singleton EventSource manager to share one SSE connection across the app.
 */
let eventSource: EventSource | null = null;
let subscribers: Set<(type: string, data: any) => void> = new Set();
let reconnectTimer: NodeJS.Timeout | null = null;

function connect() {
  if (eventSource) return;

  eventSource = new EventSource("/api/events");

  eventSource.onmessage = (e) => {
    // default handler
  };

  eventSource.addEventListener("message", (e) => {
    try {
      const data = JSON.parse(e.data);
      subscribers.forEach((cb) => cb("message", data));
    } catch {}
  });

  eventSource.addEventListener("notification", (e) => {
    try {
      const data = JSON.parse(e.data);
      subscribers.forEach((cb) => cb("notification", data));
    } catch {}
  });

  eventSource.onerror = () => {
    eventSource?.close();
    eventSource = null;
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        if (subscribers.size > 0) connect();
      }, 5000);
    }
  };
}

function subscribe(cb: (type: string, data: any) => void) {
  subscribers.add(cb);
  if (!eventSource && !reconnectTimer) {
    connect();
  }
  return () => {
    subscribers.delete(cb);
    if (subscribers.size === 0) {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = null;
      eventSource?.close();
      eventSource = null;
    }
  };
}

export function useSSE(
  onMessage?: (data: any) => void,
  onNotification?: (data: any) => void,
) {
  const msgRef = useRef(onMessage);
  const notifRef = useRef(onNotification);

  useEffect(() => {
    msgRef.current = onMessage;
    notifRef.current = onNotification;
  });

  useEffect(() => {
    const unsub = subscribe((type, data) => {
      if (type === "message" && msgRef.current) msgRef.current(data);
      if (type === "notification" && notifRef.current) notifRef.current(data);
    });
    return unsub;
  }, []);
}
