"use client";

import { useState, useMemo, useEffect } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api, formatDate } from "@/lib/api-client";
import {
  CardSkeleton,
  EmptyState,
  SectionCard,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { CandidateAvatar } from "@/components/brand/logo";
import { toast } from "sonner";
import {
  Users,
  Briefcase,
  Eye,
  Star,
  Trophy,
  XCircle,
  CalendarClock,
  Download,
  MessageSquare,
  Send,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { EnglishResumePDF } from "@/lib/pdf-templates/english-resume-pdf";
import { JapaneseResumePDF } from "@/lib/pdf-templates/japanese-resume-pdf";
import type { ResumeData } from "@/lib/resume-types";
import type {
  ApplicationDTO,
  ApplicationStatus,
  EducationEntry,
} from "@/lib/types";
import {
  JLPT_BADGE,
  STATUS_BADGE,
  APPLICATION_STATUSES,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCompanyJobs, useCompanyApps } from "../shared";

export function Applicants() {
  const { t, locale, pick } = useT();
  const jobId = useApp((s) => s.companyApplicantsJobId);
  const setTab = useApp((s) => s.setCompanyTab);
  const { jobs } = useCompanyJobs();
  const { apps, loading, reload } = useCompanyApps();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">(
    "ALL",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [matchScores, setMatchScores] = useState<Record<string, { score: number; reasons: string[] }>>({});

  useEffect(() => {
    if (!jobId) return;
    api<{ matches: Array<{ candidateId: string; matchScore: number; matchReasons: string[] }> }>(
      `/api/companies/jobs/${jobId}/matches`
    )
      .then((res) => {
        const map: Record<string, { score: number; reasons: string[] }> = {};
        (res.matches || []).forEach((m) => {
          map[m.candidateId] = { score: m.matchScore, reasons: m.matchReasons };
        });
        setMatchScores(map);
      })
      .catch(() => {});
  }, [jobId]);

  const filtered = useMemo(() => {
    let list = apps ?? [];
    if (jobId) list = list.filter((a) => a.jobId === jobId);
    if (statusFilter !== "ALL")
      list = list.filter((a) => a.status === statusFilter);
    return list;
  }, [apps, jobId, statusFilter]);

  const selectedApp = filtered.find((a) => a.id === selectedId) ?? null;

  async function changeStatus(
    app: ApplicationDTO,
    status: ApplicationStatus,
    interview?: { date: string; notes: string },
  ) {
    setBusyId(app.id);
    try {
      const body: Record<string, unknown> = { status };
      if (interview) {
        body.interviewDate = interview.date;
        body.interviewNotes = interview.notes;
      }
      await api(`/api/applications/${app.id}/status`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      toast.success(`Marked as ${t(`status.${status}`)}.`);
      await reload();
      if (selectedId === app.id) {
        // keep slide-over open; data will refresh
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Top filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-xl">
            {t("dash.company.applicants")}
          </h2>
          {jobId ? (
            <p className="text-sm text-muted-foreground">
              {t("dash.company.applicants.title", {
                title: jobs?.find((j) => j.id === jobId)?.title ?? "Selected job",
              })}{" "}
              <button
                className="text-crimson hover:underline ml-1"
                onClick={() => useApp.setState({ companyApplicantsJobId: null })}
              >
                (show all)
              </button>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {jobs && jobs.length > 0
                ? "All applications across your jobs"
                : "Post a job to start receiving applications."}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {jobs && jobs.length > 0 && (
            <Select
              value={jobId ?? "all"}
              onValueChange={(v) => {
                if (v === "all") {
                  useApp.setState({ companyApplicantsJobId: null });
                } else {
                  setTab("applicants", { jobId: v });
                }
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={pick("All jobs", "すべての求人")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{pick("All jobs", "すべての求人")}</SelectItem>
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ApplicationStatus | "ALL")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("common.all")}</SelectItem>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`status.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <CardSkeleton lines={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("dash.company.applicants.empty")}
          description={pick("Try changing the status filter or check back later.", "ステータスフィルターを変更するか、後でもう一度確認してください。")}
          action={
            <Button variant="outline" onClick={() => setTab("jobs")}>
              <Briefcase className="h-4 w-4" />
              {pick("View your jobs", "求人を表示")}
            </Button>
          }
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="max-h-[70vh] overflow-y-auto scroll-area">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">{pick("Candidate", "候補者")}</TableHead>
                  <TableHead className="hidden md:table-cell">{pick("JLPT", "JLPT")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{pick("Skills", "スキル")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{pick("AI Match", "AI マッチ")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{pick("Applied", "応募日")}</TableHead>
                  <TableHead>{pick("Status", "ステータス")}</TableHead>
                  <TableHead className="text-right pr-5 sm:pr-6">{pick("Action", "アクション")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="pl-5 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <CandidateAvatar
                          name={a.candidate?.fullName || "?"}
                          photoUrl={a.candidate?.photoUrl}
                          size={36}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {a.candidate?.fullName ?? "Candidate"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {a.job?.title}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {a.candidate?.jlptLevel && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-semibold",
                            JLPT_BADGE[a.candidate.jlptLevel],
                          )}
                        >
                          {a.candidate.jlptLevel}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {(a.candidate?.skills ?? []).slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px]">
                            {s}
                          </Badge>
                        ))}
                        {(a.candidate?.skills ?? []).length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{(a.candidate?.skills ?? []).length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {formatDate(a.appliedAt, locale)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={a.status}
                        onValueChange={(v) =>
                          changeStatus(a, v as ApplicationStatus)
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="w-[130px] h-8"
                          disabled={busyId === a.id}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPLICATION_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {t(`status.${s}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right pr-5 sm:pr-6">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedId(a.id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">
                          {t("dash.company.viewprofile")}
                        </span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}

      {/* Slide-over detail */}
      <Sheet
        open={!!selectedApp}
        onOpenChange={(o) => !o && setSelectedId(null)}
      >
        <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto scroll-area">
          {selectedApp && (
            <>
              <SheetHeader className="px-5 pt-5">
                <SheetTitle className="font-display text-lg">
                  Candidate profile
                </SheetTitle>
                <SheetDescription>
                  {selectedApp.job?.title} ·{" "}
                  {selectedApp.job?.company?.companyName}
                </SheetDescription>
              </SheetHeader>
              <ApplicantDetail
                app={selectedApp}
                busy={busyId === selectedApp.id}
                onAction={(s, iv) => changeStatus(selectedApp, s, iv)}
              />
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ApplicantDetail({
  app,
  busy,
  onAction,
}: {
  app: ApplicationDTO;
  busy: boolean;
  onAction: (
    s: ApplicationStatus,
    interview?: { date: string; notes: string },
  ) => void;
}) {
  const { t, locale, pick } = useT();
  const c = app.candidate;
  const setActiveConversation = useApp((s) => s.setActiveConversation);
  const setCompanyTab = useApp((s) => s.setCompanyTab);
  // Interview scheduling dialog state
  const [showSchedule, setShowSchedule] = useState(false);
  const [intDate, setIntDate] = useState("");
  const [intNotes, setIntNotes] = useState("");
  // Message Candidate dialog state
  const [showMessage, setShowMessage] = useState(false);
  const [msgDraft, setMsgDraft] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  // Resume builder data (fetched from company-facing endpoint)
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loadingResume, setLoadingResume] = useState(false);

  useEffect(() => {
    if (!c?.id) {
      setResumeData(null);
      return;
    }
    let cancelled = false;
    setLoadingResume(true);
    api<{ resumeData: ResumeData | null; resumeUrl: string | null; resumeName: string | null }>(
      `/api/company/candidates/${c.id}/resume`,
    )
      .then((res) => {
        if (cancelled) return;
        setResumeData(res.resumeData ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setResumeData(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingResume(false);
      });
    return () => {
      cancelled = true;
    };
  }, [c?.id]);

  if (!c) {
    return (
      <div className="p-5">
        <p className="text-sm text-muted-foreground">
          Candidate data unavailable.
        </p>
      </div>
    );
  }

  async function sendMessage() {
    if (!c) return;
    if (!msgDraft.trim() || sendingMsg) return;
    setSendingMsg(true);
    try {
      const res = await api<{ conversationId: string }>("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          candidateId: c.id,
          jobId: app.jobId,
          firstMessage: msgDraft.trim(),
        }),
      });
      toast.success(t("dash.messages.send"));
      setShowMessage(false);
      setMsgDraft("");
      setActiveConversation(res.conversationId);
      setCompanyTab("messages");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send message.");
    } finally {
      setSendingMsg(false);
    }
  }

  const actions: { label: string; status: ApplicationStatus; icon: typeof Star; accent: string }[] = [
    { label: t("status.SHORTLISTED"), status: "SHORTLISTED", icon: Star, accent: "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300" },
    { label: pick("Schedule interview", "面接をスケジュール"), status: "INTERVIEWED", icon: CalendarClock, accent: "bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-950 dark:text-violet-300" },
    { label: pick("Make offer", "オファーを出す"), status: "OFFERED", icon: Trophy, accent: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300" },
    { label: t("status.REJECTED"), status: "REJECTED", icon: XCircle, accent: "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300" },
  ];

  return (
    <div className="px-5 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4 pt-3">
        <CandidateAvatar
          name={c.fullName}
          photoUrl={c.photoUrl}
          size={56}
        />
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-lg truncate">
            {c.fullName}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {c.location ?? "—"}
          </p>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 border-saffron/40 text-saffron font-semibold bg-saffron/10 text-xs px-2.5 py-1"
        >
          Handled via Admin Support
        </Badge>
      </div>

      {/* Status pill */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn("font-semibold", STATUS_BADGE[app.status])}
        >
          {t(`status.${app.status}`)}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Applied {formatDate(app.appliedAt, locale)}
        </span>
      </div>

      {/* Quick facts */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground uppercase">{pick("JLPT", "JLPT")}</p>
          <Badge
            variant="outline"
            className={cn("mt-1 font-semibold", JLPT_BADGE[c.jlptLevel])}
          >
            {c.jlptLevel}
          </Badge>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground uppercase">{pick("Experience", "経験年数")}</p>
          <p className="mt-1 font-semibold">
            {c.experienceYears} year{c.experienceYears === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Skills */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Skills
        </p>
        <div className="flex flex-wrap gap-1.5">
          {c.skills.length === 0 ? (
            <span className="text-sm text-muted-foreground">{pick("No skills listed", "スキル未登録")}</span>
          ) : (
            c.skills.map((s) => (
              <Badge key={s} variant="secondary" className="font-medium">
                {s}
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Bio */}
      {c.bio && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            About
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {c.bio}
          </p>
        </div>
      )}

      {/* Education */}
      {c.education && c.education.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Education
          </p>
          <ul className="space-y-1.5 text-sm">
            {c.education.map((ed: EducationEntry, i: number) => (
              <li key={i} className="text-foreground/90">
                <span className="font-medium">{ed.degree}</span> · {ed.field}
                <br />
                <span className="text-xs text-muted-foreground">
                  {ed.institution} · {ed.year}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resume */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
          Resume
        </p>
        {loadingResume ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading resume…
          </div>
        ) : resumeData ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Built with Resume Builder · download as PDF:
            </p>
            <div className="flex flex-wrap gap-2">
              <PDFDownloadLink
                document={<EnglishResumePDF data={resumeData} />}
                fileName={`${resumeData.name || c.fullName || "resume"}_EN.pdf`}
              >
                {({ loading }) => (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="font-semibold h-9"
                  >
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    {loading ? "Generating…" : "Download EN PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
              <PDFDownloadLink
                document={<JapaneseResumePDF data={resumeData} />}
                fileName={`${resumeData.name || c.fullName || "resume"}_JP.pdf`}
              >
                {({ loading }) => (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="font-semibold h-9"
                  >
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    {loading ? "生成中…" : "履歴書 PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
            {(c.resumeUrl || app.resumeUrlSnapshot) && (
              <Button asChild variant="outline" size="sm" className="font-semibold h-9">
                <a
                  href={c.resumeUrl || app.resumeUrlSnapshot || "#"}
                  target="_blank"
                  rel="noreferrer"
                  download
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download {c.resumeName || "resume.pdf"}
                </a>
              </Button>
            )}
          </div>
        ) : (c.resumeUrl || app.resumeUrlSnapshot) ? (
          <Button asChild variant="outline" size="sm" className="font-semibold h-9">
            <a
              href={c.resumeUrl || app.resumeUrlSnapshot || "#"}
              target="_blank"
              rel="noreferrer"
              download
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download {c.resumeName || "resume.pdf"}
            </a>
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No resume on file.
          </p>
        )}
      </div>

      {/* Cover note */}
      {app.coverNote && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            Cover note
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap rounded-lg border border-border bg-background/60 p-3">
            {app.coverNote}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-3 border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Update status
        </p>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Button
                key={a.status}
                type="button"
                variant="outline"
                disabled={busy}
                className={cn("justify-start h-auto py-2.5", a.accent)}
                onClick={() => {
                  if (a.status === "INTERVIEWED") {
                    setShowSchedule(true);
                  } else {
                    onAction(a.status);
                  }
                }}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{a.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Interview scheduling dialog */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pick("Schedule Interview", "面接をスケジュール")}</DialogTitle>
            <DialogDescription>
              {pick(
                `Set the interview date/time and notes for ${c.fullName}. These will be visible to the candidate.`,
                `${c.fullName}の面接日時とメモを設定します。これらは候補者にも表示されます。`
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {pick("Interview date & time (JST)", "面接日時（日本時間）")}
              </label>
              <Input
                type="datetime-local"
                value={intDate}
                onChange={(e) => setIntDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {pick("Notes for candidate", "候補者へのメモ")}
              </label>
              <Textarea
                rows={3}
                value={intNotes}
                onChange={(e) => setIntNotes(e.target.value)}
                placeholder={pick("Include meeting link, format (video/in-person), duration...", "ミーティングリンク、形式（ビデオ/対面）、所要時間などを記載...")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSchedule(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!intDate || busy}
              onClick={() => {
                onAction("INTERVIEWED", { date: intDate, notes: intNotes });
                setShowSchedule(false);
                setIntDate("");
                setIntNotes("");
              }}
              className="bg-brand-gradient text-white hover:opacity-90 font-semibold"
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message candidate dialog */}
      <Dialog open={showMessage} onOpenChange={setShowMessage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dash.messages.start")}</DialogTitle>
            <DialogDescription>
              {t("dash.messages.regarding")}: {app.job?.title ?? "—"} ·{" "}
              {c.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Textarea
              rows={5}
              value={msgDraft}
              onChange={(e) => setMsgDraft(e.target.value)}
              placeholder={t("dash.messages.placeholder")}
              className="resize-none"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMessage(false);
                setMsgDraft("");
              }}
              disabled={sendingMsg}
            >
              {t("common.cancel")}
            </Button>
            <Button
              disabled={!msgDraft.trim() || sendingMsg}
              onClick={() => void sendMessage()}
              className="bg-brand-gradient text-white hover:opacity-90 font-semibold"
            >
              <Send className="mr-2 h-4 w-4" />
              {t("dash.messages.send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
