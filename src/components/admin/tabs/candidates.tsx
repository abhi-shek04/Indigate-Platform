"use client";

import { useEffect, useState, useMemo } from "react";
import { useT } from "@/lib/use-t";
import { api, formatDate } from "@/lib/api-client";
import {
  EmptyState,
  SectionCard,
  CardSkeleton,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CandidateAvatar } from "@/components/brand/logo";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { EnglishResumePDF } from "@/lib/pdf-templates/english-resume-pdf";
import { JapaneseResumePDF } from "@/lib/pdf-templates/japanese-resume-pdf";
import { Users, Search, Download } from "lucide-react";
import { JLPT_LEVELS, JLPT_BADGE } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CandidateRow, ExportCsvButton } from "../shared";
import type { ResumeData } from "@/lib/resume-types";

export function CandidatesTab() {
  const { t, locale } = useT();
  const [items, setItems] = useState<CandidateRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jlpt, setJlpt] = useState<string>("all");
  const [editingCandidate, setEditingCandidate] = useState<CandidateRow | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api<{ items: CandidateRow[] }>(
          "/api/admin/list/candidates",
        );
        setItems(res.items);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      if (jlpt !== "all" && c.jlptLevel !== jlpt) return false;
      if (!q) return true;
      return (
        c.fullName.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, search, jlpt]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          {t("admin.candidates")}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or email"
              className="pl-8 h-9 w-[200px]"
            />
          </div>
          <Select value={jlpt} onValueChange={setJlpt}>
            <SelectTrigger className="h-9 w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("jobs.alljlpt")}</SelectItem>
              {JLPT_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l === "NONE" ? "None" : l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExportCsvButton resource="candidates" />
        </div>
      </div>

      {loading ? (
        <CardSkeleton lines={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description={search || jlpt !== "all" ? "Try different filters." : undefined}
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="max-h-[70vh] overflow-y-auto scroll-area">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead>JLPT</TableHead>
                  <TableHead className="hidden sm:table-cell">Exp</TableHead>
                  <TableHead className="hidden lg:table-cell">Skills</TableHead>
                  <TableHead className="hidden sm:table-cell pr-5 sm:pr-6 text-right">
                    Joined
                  </TableHead>
                  <TableHead className="text-right pr-5 sm:pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-5 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <CandidateAvatar
                          name={c.fullName}
                          photoUrl={c.photoUrl}
                          size={32}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {c.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground md:hidden truncate">
                            {c.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {c.email ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {c.location ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("font-semibold", JLPT_BADGE[c.jlptLevel])}
                      >
                        {c.jlptLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {c.experienceYears}y
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {c.skills.slice(0, 3).map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {s}
                          </Badge>
                        ))}
                        {c.skills.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{c.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell pr-5 sm:pr-6 text-sm text-muted-foreground text-right">
                      {formatDate(c.createdAt, locale)}
                    </TableCell>
                    <TableCell className="pr-5 sm:pr-6 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setEditingCandidate(c)}
                      >
                        View & PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}

      {/* Candidate Editor Sheet */}
      <CandidateEditorSheet
        candidate={editingCandidate}
        onClose={() => setEditingCandidate(null)}
      />
    </div>
  );
}

function CandidateEditorSheet({
  candidate,
  onClose,
}: {
  candidate: CandidateRow | null;
  onClose: () => void;
}) {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  useEffect(() => {
    if (!candidate) return;
    (async () => {
      try {
        const res = await api<{ resumeData: ResumeData }>(
          `/api/admin/list/candidates?userId=${candidate.userId}`,
        );
        setResumeData(res.resumeData);
      } catch {
        setResumeData(null);
      }
    })();
  }, [candidate]);

  if (!candidate) return null;

  return (
    <Sheet open={!!candidate} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[600px] sm:max-w-none overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Candidate Editor</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {/* Profile info */}
          <div className="rounded-xl border border-border p-4 space-y-2">
            <div className="flex items-center gap-3">
              <CandidateAvatar
                name={candidate.fullName}
                photoUrl={candidate.photoUrl}
                size={48}
              />
              <div>
                <p className="font-display font-bold text-lg">{candidate.fullName}</p>
                <p className="text-sm text-muted-foreground">{candidate.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mt-3">
              <div>
                <span className="text-muted-foreground">JLPT:</span>{" "}
                <Badge variant="outline" className={cn("font-semibold", JLPT_BADGE[candidate.jlptLevel])}>
                  {candidate.jlptLevel}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Experience:</span> {candidate.experienceYears}y
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span> {candidate.location || "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span> {candidate.phone || "—"}
              </div>
            </div>
            {candidate.bio && (
              <p className="text-sm text-muted-foreground mt-2">{candidate.bio}</p>
            )}
            {candidate.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {candidate.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Resume data */}
          {resumeData && (
            <div className="rounded-xl border border-border p-4">
              <p className="font-semibold text-sm mb-2">Resume Data (EN + JP)</p>
              <pre className="text-xs bg-muted rounded-lg p-3 overflow-x-auto max-h-40">
                {JSON.stringify(resumeData, null, 2)}
              </pre>
            </div>
          )}

          {/* PDF export */}
          <div className="flex gap-2">
            {resumeData && (
              <>
                <PDFDownloadLink
                  document={<EnglishResumePDF data={resumeData} />}
                  fileName={`${candidate.fullName}_EN.pdf`}
                >
                  {({ loading }) => (
                    <Button variant="outline" size="sm" disabled={loading} className="font-semibold">
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      {loading ? "Generating..." : "EN PDF"}
                    </Button>
                  )}
                </PDFDownloadLink>
                <PDFDownloadLink
                  document={<JapaneseResumePDF data={resumeData} />}
                  fileName={`${candidate.fullName}_JP.pdf`}
                >
                  {({ loading }) => (
                    <Button variant="outline" size="sm" disabled={loading} className="font-semibold">
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      {loading ? "生成中..." : "履歴書 PDF"}
                    </Button>
                  )}
                </PDFDownloadLink>
              </>
            )}
            {candidate.resumeUrl && (
              <Button variant="outline" size="sm" asChild className="font-semibold">
                <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Uploaded PDF
                </a>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
