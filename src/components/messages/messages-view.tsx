"use client";

/**
 * MessagesView — shared two-pane messaging UI for candidate + company
 * dashboards.
 *
 * - Left pane: search + scrollable conversation list (280px on md+)
 * - Right pane: chat thread (header + scrollable messages + sticky input)
 * - Mobile: shows list OR thread, with back button on thread view
 *
 * Polling:
 *   - conversation list: every 10s
 *   - active thread:     every 5s
 *   The GET /api/messages/[id] route marks incoming messages as read on the
 *   server, so subsequent conversation-list refreshes drop the unread badge.
 */

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  type KeyboardEvent,
} from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api, formatRelative } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/dashboard/dashboard-shell";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Search,
  Check,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationDTO, MessageDTO, Locale, Role } from "@/lib/types";

type TFunc = (key: string, vars?: Record<string, string | number>) => string;

export function MessagesView() {
  const { t, locale } = useT();
  const user = useApp((s) => s.user);
  const activeId = useApp((s) => s.activeConversationId);
  const setActiveId = useApp((s) => s.setActiveConversation);
  const setUnread = useApp((s) => s.setMessageUnreadCount);
  const role: Role | undefined = user?.role;

  const [conversations, setConversations] = useState<ConversationDTO[] | null>(
    null,
  );
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [search, setSearch] = useState("");
  // Mobile: show thread (true) or list (false)
  const [mobileThread, setMobileThread] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api<{ conversations: ConversationDTO[] }>(
        "/api/messages",
      );
      setConversations(res.conversations ?? []);
      const totalUnread = (res.conversations ?? []).reduce(
        (sum, c) => sum + (c.unreadCount || 0),
        0,
      );
      setUnread(totalUnread);
    } catch {
      setConversations((prev) => prev ?? []);
    } finally {
      setLoadingConvos(false);
    }
  }, [setUnread]);

  useEffect(() => {
    void fetchConversations();
    const id = setInterval(() => void fetchConversations(), 10000);
    return () => clearInterval(id);
  }, [fetchConversations]);

  // When an active conversation is selected, jump to thread view on mobile.
  // When cleared, fall back to the list.
  useEffect(() => {
    setMobileThread(!!activeId);
  }, [activeId]);

  const filtered = useMemo(() => {
    const list = conversations ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      const name = role === "CANDIDATE" ? c.companyName : c.candidateName;
      return (
        name.toLowerCase().includes(q) ||
        (c.lastMessage ?? "").toLowerCase().includes(q) ||
        (c.jobTitle ?? "").toLowerCase().includes(q)
      );
    });
  }, [conversations, search, role]);

  const active =
    (conversations ?? []).find((c) => c.id === activeId) ?? null;

  const handleSelect = (id: string) => {
    setActiveId(id);
  };

  const handleBack = () => setMobileThread(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-8rem)] min-h-[480px]">
      {/* Conversation list pane */}
      <aside
        className={cn(
          "flex flex-col rounded-2xl border border-border bg-card shadow-premium overflow-hidden",
          mobileThread && "hidden md:flex",
        )}
      >
        <div className="px-3 pt-3 pb-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("dash.messages.search")}
              className="pl-8 h-9"
              aria-label={t("dash.messages.search")}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scroll-area">
          {loadingConvos ? (
            <ListSkeleton />
          ) : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={MessageSquare}
                title={t("dash.messages.empty")}
                description={t("dash.messages.empty.sub")}
              />
            </div>
          ) : (
            <ul className="py-1">
              {filtered.map((c) => (
                <ConversationItem
                  key={c.id}
                  conv={c}
                  active={c.id === activeId}
                  onClick={() => handleSelect(c.id)}
                  role={role}
                  locale={locale}
                />
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Chat thread pane */}
      <section
        className={cn(
          "flex flex-col rounded-2xl border border-border bg-card shadow-premium overflow-hidden",
          !mobileThread && "hidden md:flex",
        )}
      >
        {active ? (
          <ChatThread
            conversation={active}
            onBack={handleBack}
            t={t}
            locale={locale}
            role={role}
            currentUserId={user?.id ?? ""}
          />
        ) : (
          <div className="flex-1 grid place-items-center p-6">
            <div className="text-center">
              <div className="mx-auto mb-3 grid place-items-center h-12 w-12 rounded-2xl bg-muted text-muted-foreground">
                <MessageSquare className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("dash.messages.select")}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------------- Conversation list item ---------------- */

function ConversationItem({
  conv,
  active,
  onClick,
  role,
  locale,
}: {
  conv: ConversationDTO;
  active: boolean;
  onClick: () => void;
  role: Role | undefined;
  locale: Locale;
}) {
  const isCandidate = role === "CANDIDATE";
  const name = isCandidate ? conv.companyName : conv.candidateName;
  const photo = isCandidate ? conv.companyLogo : conv.candidatePhoto;
  const unread = conv.unreadCount || 0;
  const raw = conv.lastMessage ?? "";
  const snippet = raw.length > 45 ? raw.slice(0, 45) + "…" : raw;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "true" : undefined}
        className={cn(
          "group w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors border-l-2",
          active
            ? "bg-saffron/10 border-saffron"
            : "border-transparent hover:bg-accent/50",
        )}
      >
        <PartyAvatar
          name={name}
          url={photo}
          isCompany={isCandidate}
          size={40}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                "text-sm truncate",
                unread > 0 ? "font-bold" : "font-medium",
              )}
            >
              {name}
            </p>
            {conv.lastMessageAt && (
              <span className="text-[10px] text-muted-foreground shrink-0">
                {formatRelative(conv.lastMessageAt, locale)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p
              className={cn(
                "text-xs truncate",
                unread > 0
                  ? "text-foreground/80 font-medium"
                  : "text-muted-foreground",
              )}
            >
              {snippet || "—"}
            </p>
            {unread > 0 && (
              <span className="grid place-items-center min-w-[1rem] h-4 px-1 rounded-full bg-saffron text-white text-[10px] font-bold shadow-glow-brand shrink-0">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

/* ---------------- Chat thread ---------------- */

function ChatThread({
  conversation,
  onBack,
  t,
  locale,
  role,
  currentUserId,
}: {
  conversation: ConversationDTO;
  onBack: () => void;
  t: TFunc;
  locale: Locale;
  role: Role | undefined;
  currentUserId: string;
}) {
  const isCandidate = role === "CANDIDATE";
  const otherName = isCandidate
    ? conversation.companyName
    : conversation.candidateName;
  const otherPhoto = isCandidate
    ? conversation.companyLogo
    : conversation.candidatePhoto;

  const [messages, setMessages] = useState<MessageDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api<{ messages: MessageDTO[] }>(
        `/api/messages/${conversation.id}`,
      );
      setMessages(res.messages ?? []);
    } catch {
      setMessages((prev) => prev ?? []);
    } finally {
      setLoading(false);
    }
  }, [conversation.id]);

  useEffect(() => {
    setLoading(true);
    setMessages(null);
    setDraft("");
    void fetchMessages();
    const id = setInterval(() => void fetchMessages(), 5000);
    return () => clearInterval(id);
  }, [fetchMessages]);

  // Auto-scroll to bottom whenever messages change.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimistic: MessageDTO = {
      id: tempId,
      conversationId: conversation.id,
      senderId: currentUserId,
      body: text,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => (prev ? [...prev, optimistic] : [optimistic]));
    setDraft("");
    try {
      const res = await api<{ message: MessageDTO }>(
        `/api/messages/${conversation.id}`,
        {
          method: "POST",
          body: JSON.stringify({ body: text }),
        },
      );
      setMessages((prev) =>
        prev ? prev.map((m) => (m.id === tempId ? res.message : m)) : prev,
      );
    } catch {
      // Roll back the optimistic bubble on failure.
      setMessages((prev) =>
        prev ? prev.filter((m) => m.id !== tempId) : prev,
      );
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void send();
    }
  };

  return (
    <>
      {/* Thread header */}
      <header className="flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-border bg-card/60 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="md:hidden grid place-items-center h-9 w-9 -ml-1 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <PartyAvatar
          name={otherName}
          url={otherPhoto}
          isCompany={isCandidate}
          size={40}
        />
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-sm truncate">{otherName}</p>
          {conversation.jobTitle && (
            <span className="inline-flex items-center mt-0.5 rounded-full bg-saffron/10 text-saffron border border-saffron/20 px-2 py-0.5 text-[10px] font-semibold">
              {t("dash.messages.regarding")}: {conversation.jobTitle}
            </span>
          )}
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-area px-3 sm:px-4 py-4 space-y-1 bg-background/40"
      >
        {loading ? (
          <ThreadSkeleton />
        ) : messages && messages.length > 0 ? (
          <AnimatePresence initial={false}>
            {messages.map((m, i) => {
              const mine = m.senderId === currentUserId;
              const prev = messages[i - 1];
              const sameSender = !!prev && prev.senderId === m.senderId;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "flex flex-col",
                    mine ? "items-end" : "items-start",
                    sameSender ? "mt-0.5" : "mt-2",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[78%] px-3.5 py-2 text-sm leading-relaxed shadow-sm break-words",
                      mine
                        ? "bg-brand-gradient text-white rounded-2xl rounded-tr-sm shadow-glow-brand"
                        : "glass rounded-2xl rounded-tl-sm",
                    )}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 mt-0.5 px-1 text-[10px] text-muted-foreground",
                      mine ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <span>{formatRelative(m.createdAt, locale)}</span>
                    {mine &&
                      (m.isRead ? (
                        <CheckCheck className="h-3 w-3 text-saffron" />
                      ) : (
                        <Check className="h-3 w-3" />
                      ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="h-full grid place-items-center text-center">
            <div>
              <div className="mx-auto mb-3 grid place-items-center h-12 w-12 rounded-2xl bg-muted text-muted-foreground">
                <MessageSquare className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("dash.messages.empty")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 bg-card/60 backdrop-blur">
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder={t("dash.messages.placeholder")}
            className="resize-none flex-1 min-h-[44px] max-h-32"
          />
          <Button
            type="button"
            onClick={() => void send()}
            disabled={!draft.trim() || sending}
            className="bg-brand-gradient text-white hover:opacity-90 h-10 px-3.5 shadow-glow-brand"
            aria-label={t("dash.messages.send")}
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">{t("dash.messages.send")}</span>
          </Button>
        </div>
        <p className="hidden sm:block text-[10px] text-muted-foreground mt-1.5 px-1">
          ⌘/Ctrl + Enter
        </p>
      </div>
    </>
  );
}

/* ---------------- Helpers ---------------- */

/** Avatar for the "other party" in a conversation. Renders the photo/logo
 *  when available, falls back to brand-gradient initials. */
function PartyAvatar({
  name,
  url,
  isCompany,
  size = 40,
}: {
  name: string;
  url?: string | null;
  isCompany?: boolean;
  size?: number;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className="object-cover shrink-0 bg-muted"
        style={{
          width: size,
          height: size,
          borderRadius: isCompany ? "0.75rem" : "9999px",
        }}
      />
    );
  }
  return (
    <div
      className={cn(
        "grid place-items-center font-bold text-white shrink-0 bg-brand-gradient",
        isCompany ? "rounded-xl" : "rounded-full",
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials || "?"}
    </div>
  );
}

function ListSkeleton() {
  return (
    <ul className="py-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="px-3 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
            <div className="h-2.5 w-full bg-muted rounded animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ThreadSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex",
            i % 2 === 0 ? "justify-start" : "justify-end",
          )}
        >
          <div className="max-w-[70%] h-12 w-48 rounded-2xl bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}
