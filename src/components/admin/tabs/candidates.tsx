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
import { Check, X as XIcon, Edit, ChevronDown, CheckCircle2, Copy, Eye, Languages, Briefcase, MapPin, Phone, Code2, Quote, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ResumePreview } from "@/components/candidate/resume-preview";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
                      <div className="flex items-center justify-end gap-1">
                        {c.hasResumeData && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] font-semibold border-saffron/40 hover:bg-saffron/10"
                              onClick={() => window.open(`/api/candidates/${c.id}/resume/pdf?lang=en`, "_blank")}
                            >
                              <Download className="h-3 w-3 mr-1 text-saffron" />
                              EN PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] font-semibold border-crimson/40 hover:bg-crimson/10"
                              onClick={() => window.open(`/api/candidates/${c.id}/resume/pdf?lang=ja`, "_blank")}
                            >
                              <Download className="h-3 w-3 mr-1 text-crimson" />
                              JP PDF
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => setEditingCandidate(c)}
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}

      {/* Candidate Full-Screen Modal */}
      <CandidateDetailModal
        candidate={editingCandidate}
        onClose={() => setEditingCandidate(null)}
      />
    </div>
  );
}

function CandidateDetailModal({
  candidate,
  onClose,
}: {
  candidate: CandidateRow | null;
  onClose: () => void;
}) {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "en" | "ja">("en");

  useEffect(() => {
    if (!candidate) {
      setResumeData(null);
      setResumeUrl(null);
      return;
    }
    setFetching(true);
    (async () => {
      try {
        const res = await api<{
          resumeData: ResumeData | null;
          resumeUrl: string | null;
          resumeName: string | null;
        }>(`/api/admin/candidates/${candidate.id}/resume`);
        setResumeData(res.resumeData);
        setResumeUrl(res.resumeUrl);
        if (res.resumeData) {
          setActiveTab("en");
        } else {
          setActiveTab("profile");
        }
      } catch {
        setResumeData(null);
        setResumeUrl(null);
        setActiveTab("profile");
      } finally {
        setFetching(false);
      }
    })();
  }, [candidate]);

  if (!candidate) return null;

  return (
    <Dialog open={!!candidate} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[96vw] w-[96vw] max-h-[94vh] h-[94vh] overflow-hidden flex flex-col p-0 border-border bg-background shadow-2xl rounded-2xl">
        {/* Top Header Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-md shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <CandidateAvatar
              name={candidate.fullName}
              photoUrl={candidate.photoUrl}
              size={44}
            />
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="font-display font-bold text-lg text-foreground">{candidate.fullName}</DialogTitle>
                <Badge variant="outline" className={cn("font-semibold text-xs", JLPT_BADGE[candidate.jlptLevel])}>
                  {candidate.jlptLevel}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{candidate.email} • {candidate.location || "No Location"} • {candidate.experienceYears}y exp</p>
            </div>
          </div>

          {/* Center Tabs */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/50">
            <button
              onClick={() => setActiveTab("profile")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeTab === "profile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Candidate Overview
            </button>
            {resumeData && (
              <>
                <button
                  onClick={() => setActiveTab("en")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
                    activeTab === "en" ? "bg-saffron text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  🇬🇧 English Resume
                </button>
                <button
                  onClick={() => setActiveTab("ja")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
                    activeTab === "ja" ? "bg-saffron text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  🇯🇵 Japanese 履歴書
                </button>
              </>
            )}
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center gap-2">
            {fetching ? (
              <span className="text-xs text-muted-foreground animate-pulse">Loading resume data…</span>
            ) : (
              <>
                {resumeData && (
                  <>
                    <PDFDownloadLink
                      document={<EnglishResumePDF data={resumeData} />}
                      fileName={`${candidate.fullName}_EN.pdf`}
                    >
                      {({ loading }) => (
                        <Button variant="outline" size="sm" disabled={loading} className="font-semibold text-xs h-8">
                          <Download className="h-3.5 w-3.5 mr-1" />
                          {loading ? "Exporting..." : "EN PDF"}
                        </Button>
                      )}
                    </PDFDownloadLink>
                    <PDFDownloadLink
                      document={<JapaneseResumePDF data={resumeData} />}
                      fileName={`${candidate.fullName}_JP.pdf`}
                    >
                      {({ loading }) => (
                        <Button variant="outline" size="sm" disabled={loading} className="font-semibold text-xs h-8">
                          <Download className="h-3.5 w-3.5 mr-1" />
                          {loading ? "生成中..." : "履歴書 PDF"}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  </>
                )}
                {(resumeUrl || candidate.resumeUrl) && (
                  <Button variant="outline" size="sm" asChild className="font-semibold text-xs h-8">
                    <a
                      href={(resumeUrl || candidate.resumeUrl) as string}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Uploaded File
                    </a>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto bg-muted/20 p-6">
          {activeTab === "profile" && (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl mx-auto space-y-6 py-2"
            >
              {/* Top Profile Header Banner Card */}
              <div className="relative overflow-hidden rounded-2xl border border-saffron/30 bg-gradient-to-r from-saffron/10 via-card to-crimson/5 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <CandidateAvatar
                      name={candidate.fullName}
                      photoUrl={candidate.photoUrl}
                      size={60}
                    />
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="font-display font-black text-2xl text-foreground">{candidate.fullName}</h2>
                        <Badge className="bg-saffron text-white font-bold px-2.5 py-0.5 shadow-sm">
                          JLPT {candidate.jlptLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <span>{candidate.email}</span>
                        {candidate.phone && <span>• {candidate.phone}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-border bg-card px-3 py-1 text-xs font-semibold">
                      ID: {candidate.id.slice(-8)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 4 Core Stat Cards with Color Combinations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: JLPT */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="p-5 rounded-2xl border border-saffron/30 bg-gradient-to-b from-saffron/15 to-saffron/5 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-saffron">JLPT Level</span>
                    <div className="p-2 rounded-xl bg-saffron/20 text-saffron">
                      <Languages className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-black text-foreground">{candidate.jlptLevel}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Japanese Proficiency</p>
                  </div>
                </motion.div>

                {/* Card 2: Experience */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/15 to-emerald-500/5 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Experience</span>
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                      <Briefcase className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-black text-foreground">{candidate.experienceYears} <span className="text-sm font-semibold text-muted-foreground">Years</span></p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Work Experience</p>
                  </div>
                </motion.div>

                {/* Card 3: Location */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/15 to-cyan-500/5 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">Location</span>
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-500">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-lg font-bold text-foreground truncate">{candidate.location || "Not Specified"}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Current Residence</p>
                  </div>
                </motion.div>

                {/* Card 4: Phone */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="p-5 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-500/15 to-purple-500/5 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-500">Contact Phone</span>
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-500">
                      <Phone className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-lg font-bold text-foreground truncate">{candidate.phone || "Not Specified"}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Primary Contact</p>
                  </div>
                </motion.div>
              </div>

              {/* Candidate Bio Card */}
              {candidate.bio && (
                <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm space-y-3 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Quote className="h-4 w-4 text-saffron" />
                    <span>Candidate Bio & Introduction</span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed pl-6 border-l-2 border-saffron/40 italic">
                    "{candidate.bio}"
                  </p>
                </div>
              )}

              {/* Skills & Technologies Section */}
              <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Code2 className="h-4 w-4 text-crimson" />
                    <span>Skills & Technical Stack</span>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground">
                    {candidate.skills.length} Skills Listed
                  </Badge>
                </div>

                {candidate.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {candidate.skills.map((s, idx) => (
                      <motion.div 
                        key={s}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Badge 
                          variant="secondary" 
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-muted to-muted/80 hover:from-saffron/15 hover:to-saffron/10 hover:text-saffron hover:border-saffron/40 border border-border/60 transition-all shadow-sm cursor-default flex items-center gap-1.5"
                        >
                          <Sparkles className="h-3 w-3 text-saffron/70" />
                          {s}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-xl bg-muted/20 border border-dashed border-border/60">
                    <p className="text-xs text-muted-foreground">No specific skills listed for this candidate profile.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {(activeTab === "en" || activeTab === "ja") && resumeData && (
            <div className="w-full flex justify-center py-4 overflow-x-auto">
              <ResumePreview data={resumeData} lang={activeTab} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
