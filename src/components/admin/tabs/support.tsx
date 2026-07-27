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
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/use-t";

const STATUSES = ["ALL", "NEW", "OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"];

export function AdminSupportTab() {
  const { locale } = useT();
  const [tickets, setTickets] = useState<SupportTicketDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketDTO | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);

  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter === "ALL" ? "/api/support/tickets" : `/api/support/tickets?status=${statusFilter}`;
      const res = await api<{ tickets: SupportTicketDTO[] }>(url);
      setTickets(res.tickets);
      if (res.tickets.length > 0 && !selectedId) {
        setSelectedId(res.tickets[0].id);
      }
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, selectedId]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const loadSingleTicket = useCallback(async (id: string) => {
    setLoadingTicket(true);
    try {
      const res = await api<{ ticket: SupportTicketDTO }>(`/api/support/tickets/${id}`);
      setSelectedTicket(res.ticket);
      setInternalNote(res.ticket.internalNote ?? "");
    } catch {
      setSelectedTicket(null);
    } finally {
      setLoadingTicket(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadSingleTicket(selectedId);
    }
  }, [selectedId, loadSingleTicket]);

  async function handleSendReply() {
    if (!selectedId || !replyBody.trim()) return;
    setReplying(true);
    try {
      await api(`/api/support/tickets/${selectedId}/reply`, {
        method: "POST",
        body: JSON.stringify({ body: replyBody }),
      });
      setReplyBody("");
      toast.success("Reply sent to candidate.");
      await loadSingleTicket(selectedId);
      await loadTickets();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send reply.");
    } finally {
      setReplying(false);
    }
  }

  async function handleSaveNote() {
    if (!selectedId) return;
    setSavingNote(true);
    try {
      await api(`/api/support/tickets/${selectedId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ internalNote }),
      });
      toast.success("Internal note saved.");
      await loadSingleTicket(selectedId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save note.");
    } finally {
      setSavingNote(false);
    }
  }

  async function handleUpdateStatus(newStatus: string) {
    if (!selectedId) return;
    setUpdatingStatus(true);
    try {
      await api(`/api/support/tickets/${selectedId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Status updated to ${newStatus}`);
      await loadSingleTicket(selectedId);
      await loadTickets();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-xl flex items-center gap-2">
            <Headphones className="h-5 w-5 text-saffron" />
            Support Desk
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage candidate support tickets, visa inquiries, and resume requests.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[160px] text-xs font-semibold">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <CardSkeleton lines={8} />
      ) : !tickets || tickets.length === 0 ? (
        <EmptyState
          icon={Headphones}
          title="No support tickets"
          description="Candidates have not submitted any support inquiries yet."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[600px]">
          {/* Left column — Ticket List */}
          <div className="lg:col-span-4 space-y-2 max-h-[75vh] overflow-y-auto pr-1">
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
                    <span className="text-xs font-bold text-saffron uppercase tracking-wider">
                      {t.category}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold uppercase",
                        t.status === "NEW" && "border-rose-500/50 bg-rose-500/10 text-rose-500",
                        t.status === "OPEN" && "border-amber-500/50 bg-amber-500/10 text-amber-500",
                        t.status === "RESOLVED" && "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                      )}
                    >
                      {t.status}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-sm line-clamp-1">{t.subject}</h4>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                    <span>{t.candidateName}</span>
                    <span>{formatRelative(t.createdAt, locale)}</span>
                  </p>
                  {(t.unreadCount ?? 0) > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-crimson animate-ping" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right column — Selected Ticket Detail & Chat */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
            {loadingTicket ? (
              <div className="p-8">
                <CardSkeleton lines={6} />
              </div>
            ) : selectedTicket ? (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-saffron uppercase">
                        [{selectedTicket.category}]
                      </span>
                      <h3 className="font-display font-bold text-base">{selectedTicket.subject}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      From: <strong className="text-foreground">{selectedTicket.candidateName}</strong> ({selectedTicket.candidateEmail})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-semibold">Status:</span>
                    <Select
                      value={selectedTicket.status}
                      onValueChange={handleUpdateStatus}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger className="h-8 text-xs font-bold min-w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.filter((s) => s !== "ALL").map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Quick button to download candidate's PDF */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-saffron/40 hover:bg-saffron/10 font-semibold"
                      onClick={() =>
                        window.open(`/api/candidates/${selectedTicket.candidateId}/resume/pdf?lang=en`, "_blank")
                      }
                    >
                      EN PDF
                    </Button>
                  </div>
                </div>

                {/* Internal Admin Note */}
                <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <Input
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Admin internal note (hidden from candidate)..."
                    className="h-7 text-xs bg-background/60 border-amber-500/30 focus-visible:ring-amber-500"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="h-7 text-xs px-2.5 font-semibold shrink-0"
                  >
                    Save Note
                  </Button>
                </div>

                {/* Thread Messages */}
                <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[450px]">
                  {selectedTicket.messages.map((m) => {
                    const isAdmin = m.senderRole === "ADMIN";
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "flex flex-col max-w-[85%]",
                          isAdmin ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        <span className="text-[10px] text-muted-foreground mb-1 font-semibold">
                          {isAdmin ? "IndiGate Admin Support" : selectedTicket.candidateName} ·{" "}
                          {formatRelative(m.createdAt, locale)}
                        </span>
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap",
                            isAdmin
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

                {/* Reply Footer */}
                <div className="p-3 sm:p-4 border-t border-border bg-card flex items-center gap-2">
                  <Textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Type your official reply to candidate..."
                    rows={2}
                    className="text-xs sm:text-sm resize-none min-h-[50px]"
                  />
                  <Button
                    onClick={handleSendReply}
                    disabled={replying || !replyBody.trim()}
                    className="bg-brand-gradient text-white h-[50px] px-4 font-semibold shrink-0"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Reply
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
