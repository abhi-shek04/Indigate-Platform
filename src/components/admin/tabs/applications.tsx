"use client";

import { useEffect, useState, useMemo } from "react";
import { useT } from "@/lib/use-t";
import { api, formatDate } from "@/lib/api-client";
import {
  EmptyState,
  SectionCard,
  CardSkeleton,
} from "@/components/dashboard/dashboard-shell";
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
import { CandidateAvatar } from "@/components/brand/logo";
import { FileText } from "lucide-react";
import type { ApplicationDTO, ApplicationStatus } from "@/lib/types";
import { APPLICATION_STATUSES, STATUS_BADGE } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ExportCsvButton } from "../shared";

/* ============== Applications tab ============== */

export function ApplicationsTab() {
  const { t, locale } = useT();
  const [items, setItems] = useState<ApplicationDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api<{ items: ApplicationDTO[] }>(
          "/api/admin/list/applications",
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
    if (status === "all") return items;
    return items.filter((a) => a.status === status);
  }, [items, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          {t("admin.applications")}
        </h2>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as ApplicationStatus | "all")}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`status.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExportCsvButton resource="applications" />
        </div>
      </div>

      {loading ? (
        <CardSkeleton lines={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description={status !== "all" ? "Try a different status filter." : undefined}
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="max-h-[70vh] overflow-y-auto scroll-area">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">Candidate</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-5 sm:pr-6">Applied</TableHead>
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
                          size={28}
                        />
                        <span className="text-sm font-medium truncate max-w-[160px]">
                          {a.candidate?.fullName ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {a.job?.title ?? "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {a.job?.company?.companyName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("font-semibold", STATUS_BADGE[a.status])}
                      >
                        {t(`status.${a.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-5 sm:pr-6 text-sm text-muted-foreground">
                      {formatDate(a.appliedAt, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
