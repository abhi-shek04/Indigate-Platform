"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api, formatRelative } from "@/lib/api-client";
import { SectionCard } from "@/components/dashboard/dashboard-shell";
import { FileDropZone } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  FileCheck2,
  AlertCircle,
  FileUp,
} from "lucide-react";

export function Resume() {
  const candidate = useApp((s) => s.candidate);
  const refreshAuth = useApp((s) => s.refreshAuth);
  const { t, locale } = useT();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  async function uploadFile(file: File) {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Resume must be a PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max file size is 5MB.");
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "resume");
      // simulate upload progress (fetch doesn't give us easy progress)
      const fakeTimer = setInterval(() => {
        setProgress((p) => Math.min(90, (p ?? 0) + 10));
      }, 80);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      clearInterval(fakeTimer);
      setProgress(100);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Upload failed.");
      }
      toast.success("Resume uploaded.");
      await refreshAuth();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(null), 600);
    }
  }

  async function removeResume() {
    setBusy(true);
    try {
      // The candidate PUT schema accepts `resumeUrl: null` + `resumeName: null`.
      await api("/api/candidates/me", {
        method: "PUT",
        body: JSON.stringify({ resumeUrl: null, resumeName: null }),
      });
      toast.success("Resume removed.");
      await refreshAuth();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {candidate?.resumeUrl ? (
        <SectionCard title={t("dash.resume.current")}>
          <div className="flex items-center gap-4">
            <div className="grid place-items-center h-14 w-14 rounded-xl bg-crimson/15 text-crimson shrink-0">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">
                {candidate.resumeName || "Resume.pdf"}
              </p>
              <p className="text-xs text-muted-foreground">
                Uploaded {formatRelative(candidate.updatedAt, locale)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                >
                  Download
                </a>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    {t("dash.resume.remove")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove resume?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your resume will be removed from your profile. You can
                      upload a new one any time.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-white hover:bg-destructive/90"
                      onClick={removeResume}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </SectionCard>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            You haven't uploaded a resume yet. A PDF resume is required to apply
            to most jobs.
          </p>
        </div>
      )}

      <SectionCard title={t("dash.resume.upload")}>
        <FileDropZone
          accept="application/pdf"
          onFile={uploadFile}
          busy={busy}
          progress={progress ?? undefined}
          title={t("dash.resume.drag")}
          hint="PDF only · max 5 MB"
          icon={<FileUp className="h-5 w-5" />}
        />
        {candidate?.resumeUrl && (
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Uploading a new file will replace your current resume.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
