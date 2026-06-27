"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { api, formatRelative } from "@/lib/api-client";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { NotificationDTO } from "@/lib/types";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";

export function NotificationsBell() {
  const user = useApp((s) => s.user);
  const { t, locale } = useT();
  const [items, setItems] = useState<NotificationDTO[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  async function load() {
    if (!user) return;
    try {
      const data = await api<{ notifications: NotificationDTO[]; unread: number }>(
        "/api/notifications",
      );
      setItems(data.notifications);
      setUnread(data.unread);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    let active = true;
    // Initial fetch + polling. setState happens after await so it's async,
    // but the linter conservatively flags the call — disable for this line.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const i = setInterval(() => {
      if (active) load();
    }, 30000);
    return () => {
      active = false;
      clearInterval(i);
    };
  }, [user?.id]);

  async function markAllRead() {
    await api("/api/notifications", { method: "PATCH" });
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  }

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative grid place-items-center h-9 w-9 rounded-lg hover:bg-accent transition-colors"
          aria-label={t("nav.notifications")}
        >
          <Bell className="h-[1.15rem] w-[1.15rem]" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 grid place-items-center min-w-[16px] h-4 px-1 rounded-full bg-crimson text-white text-[10px] font-bold">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[22rem] p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="font-semibold">{t("nav.notifications")}</p>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={markAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto scroll-area">
          {items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              You're all caught up 🎉
            </p>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "px-4 py-3 hover:bg-accent/50 transition-colors",
                    !n.isRead && "bg-saffron/5",
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-crimson shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug">
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {formatRelative(n.createdAt, locale)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
