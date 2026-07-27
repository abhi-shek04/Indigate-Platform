"use client";

import { useEffect, useState, useCallback } from "react";
import { api, formatRelative } from "@/lib/api-client";
import type { SupportTicketDTO } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionCard, CardSkeleton, EmptyState } from "@/components/dashboard/dashboard-shell";
import { toast } from "sonner";
import {
  Headphones,
  Send,
  Plus,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/use-t";

const CATEGORIES = [
  { value: "GENERAL", label: "General Question" },
  { value: "VISA", label: "Visa Sponsorship & Legal" },
  { value: "APPLICATION", label: "Job Application Help" },
  { value: "INTERVIEW", label: "Interview Coaching" },
  { value: "TECHNICAL", label: "Resume / PDF Request" },
];

export function CandidateSupportTab() {
  const { locale } = useT();
  const [tickets, setTickets] = useState<SupportTicketDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketDTO | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);

  const [creating, setCreating] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("GENERAL");
  const [newMessage, setNewMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ tickets: SupportTicketDTO[] }>("/api/support/tickets");
      setTickets(res.tickets);
      if (res.tickets.length > 0 && !selectedId && !creating) {
        setSelectedId(res.tickets[0].id);
      }
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [selectedId, creating]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const loadSingleTicket = useCallback(async (id: string) => {
    setLoadingTicket(true);
    try {
      const res = await api<{ ticket: SupportTicketDTO }>(`/api/support/tickets/${id}`);
      setSelectedTicket(res.ticket);
    } catch {
      setSelectedTicket(null);
    } finally {
      setLoadingTicket(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId && !creating) {
      loadSingleTicket(selectedId);
    }
  }, [selectedId, creating, loadSingleTicket]);

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    setSubmitting(true);
    try {
      const res = await api<{ ticketId: string }>("/api/support/tickets", {
        method: "POST",
        body: JSON.stringify({
          subject: newSubject,
          category: newCategory,
          firstMessage: newMessage,
        }),
      });
      toast.success("Support ticket created! IndiGate team will respond shortly.");
      setNewSubject("");
      setNewMessage("");
      setCreating(false);
      setSelectedId(res.ticketId);
      await loadTickets();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendReply() {
    if (!selectedId || !replyBody.trim()) return;
    setReplying(true);
    try {
      await api(`/api/support/tickets/${selectedId}/reply`, {
        method: "POST",
        body: JSON.stringify({ body: replyBody }),
      });
      setReplyBody("");
      toast.success("Reply sent.");
      await loadSingleTicket(selectedId);
      await loadTickets();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reply.");
    } finally {
      setReplying(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-xl flex items-center gap-2">
            <Headphones className="h-5 w-5 text-saffron" />
            Support & Concierge
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Direct communication line to IndiGate advisors and admin support.
          </p>
        </div>

        <Button
          onClick={() => {
            setCreating(!creating);
            if (!creating) setSelectedId(null);
          }}
          className="bg-brand-gradient text-white font-semibold shadow-premium"
        >
          {creating ? (
            <>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> View Tickets
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1.5" /> Open Support Ticket
            </>
          )}
        </Button>
      </div>

      {creating ? (
        /* Create New Ticket Form */
        <SectionCard className="max-w-2xl mx-auto">
          <form onSubmit={handleCreateTicket} className="space-y-4 p-2">
            <h3 className="font-display font-bold text-lg">New Support Ticket</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Category</label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Subject</label>
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Brief title of your inquiry..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Message</label>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Explain how we can help you with your visa, application, or resume PDF request..."
                rows={5}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !newSubject.trim() || !newMessage.trim()}
                className="bg-brand-gradient text-white font-semibold"
              >
                Submit Ticket
              </Button>
            </div>
          </form>
        </SectionCard>
      ) : loading ? (
        <CardSkeleton lines={6} />
      ) : !tickets || tickets.length === 0 ? (
        <EmptyState
          icon={Headphones}
          title="No support tickets yet"
          description="Have questions about job applications, visa sponsorship, or need your PDF resume exported? Open a support ticket to chat with our team."
          action={
            <Button
              onClick={() => setCreating(true)}
              className="bg-brand-gradient text-white font-semibold"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Open Support Ticket
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[500px]">
          {/* Left — Candidate Ticket List */}
          <div className="lg:col-span-4 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {tickets.map((t) => {
              const isSelected = t.id === selectedId;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer relative",
                    isSelected
                      ? "bg-saffron/10 border-saffron/40 shadow-sm"
                      : "bg-card border-border hover:border-saffron/30"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-saffron uppercase tracking-wider">
                      {t.category}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold uppercase",
                        t.status === "NEW" && "border-rose-500/50 bg-rose-500/10 text-rose-500",
                        t.status === "WAITING" && "border-amber-500/50 bg-amber-500/10 text-amber-500",
                        t.status === "RESOLVED" && "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                      )}
                    >
                      {t.status}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-sm line-clamp-1">{t.subject}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelative(t.createdAt, locale)}
                  </p>
                  {(t.unreadCount ?? 0) > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-crimson animate-ping" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right — Chat view */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
            {loadingTicket ? (
              <div className="p-8">
                <CardSkeleton lines={6} />
              </div>
            ) : selectedTicket ? (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-saffron uppercase">
                      [{selectedTicket.category}]
                    </span>
                    <h3 className="font-display font-bold text-base">{selectedTicket.subject}</h3>
                  </div>
                  <Badge variant="outline" className="font-bold text-xs">
                    {selectedTicket.status}
                  </Badge>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[400px]">
                  {selectedTicket.messages.map((m) => {
                    const isCandidate = m.senderRole === "CANDIDATE";
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "flex flex-col max-w-[85%]",
                          isCandidate ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        <span className="text-[10px] text-muted-foreground mb-1 font-semibold">
                          {isCandidate ? "You" : "IndiGate Admin Support"} ·{" "}
                          {formatRelative(m.createdAt, locale)}
                        </span>
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap",
                            isCandidate
                              ? "bg-brand-gradient text-white rounded-br-none shadow-sm"
                              : "bg-muted border border-border text-foreground rounded-bl-none"
                          )}
                        >
                          {m.body}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Reply */}
                <div className="p-3 sm:p-4 border-t border-border bg-card flex items-center gap-2">
                  <Textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Type your message to IndiGate support..."
                    rows={2}
                    className="text-xs sm:text-sm resize-none min-h-[48px]"
                  />
                  <Button
                    onClick={handleSendReply}
                    disabled={replying || !replyBody.trim()}
                    className="bg-brand-gradient text-white h-[48px] px-4 font-semibold shrink-0"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
