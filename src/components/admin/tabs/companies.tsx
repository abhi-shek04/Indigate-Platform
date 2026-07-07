"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useT } from "@/lib/use-t";
import { api, formatDate } from "@/lib/api-client";
import {
  EmptyState,
  SectionCard,
  CardSkeleton,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
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
import { CompanyAvatar } from "@/components/brand/logo";
import { toast } from "sonner";
import { Building2, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyRow, ExportCsvButton } from "../shared";

/* ============== Companies tab ============== */

export function CompaniesTab() {
  const { t, locale } = useT();
  const [items, setItems] = useState<CompanyRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ items: CompanyRow[] }>(
        "/api/admin/list/companies",
      );
      setItems(res.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(id: string, approve: boolean) {
    setBusyId(id);
    try {
      await api(`/api/admin/companies/${id}?action=${approve ? "approve" : "reject"}`, {
        method: "PATCH",
      });
      toast.success(approve ? "Approved." : "Rejected.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusyId(null);
    }
  }

  const filtered = useMemo(() => {
    if (!items) return [];
    if (filter === "approved") return items.filter((c) => c.isApproved);
    if (filter === "pending") return items.filter((c) => !c.isApproved);
    return items;
  }, [items, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          {t("admin.companies")}
        </h2>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <ExportCsvButton resource="companies" />
        </div>
      </div>

      {loading ? (
        <CardSkeleton lines={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies found"
          description={filter !== "all" ? "Try a different filter." : undefined}
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="max-h-[70vh] overflow-y-auto scroll-area">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">Company</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Industry</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-5 sm:pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-5 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <CompanyAvatar
                          name={c.companyName}
                          color={c.logoUrl}
                          size={32}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {c.companyName}
                          </p>
                          <p className="text-xs text-muted-foreground md:hidden truncate">
                            {c.email}
                          </p>
                          <p className="text-xs text-muted-foreground hidden sm:block">
                            Joined {formatDate(c.createdAt, locale)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {c.email ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {c.industry ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {c.locationJapan ?? "—"}
                    </TableCell>
                    <TableCell>
                      {c.isApproved ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-transparent font-semibold">
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-transparent font-semibold">
                          <Hourglass className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-5 sm:pr-6">
                      {!c.isApproved ? (
                        <div className="inline-flex gap-1">
                          <Button
                            size="sm"
                            className="bg-brand-gradient text-white hover:opacity-90 h-7"
                            disabled={busyId === c.id}
                            onClick={() => approve(c.id, true)}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="hidden sm:inline">
                              {t("admin.approve")}
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive h-7"
                            disabled={busyId === c.id}
                            onClick={() => approve(c.id, false)}
                          >
                            <XCircle className="h-3 w-3" />
                            <span className="hidden sm:inline">
                              {t("admin.reject")}
                            </span>
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive h-7"
                          disabled={busyId === c.id}
                          onClick={() => approve(c.id, false)}
                        >
                          Revoke
                        </Button>
                      )}
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
