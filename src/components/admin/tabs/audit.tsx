"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/api-client";

interface AuditEntry {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string | null;
  targetName: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export function AuditLogTab() {
  const [logs, setLogs] = useState<AuditEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api<{ logs: AuditEntry[] }>("/api/admin/audit-log?limit=100");
        setLogs(res.logs);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Audit Log</h2>
        <Badge variant="secondary">{logs?.length ?? 0} entries</Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        All admin actions are recorded for APPI compliance. This log tracks who did what, when, and from which IP.
      </p>

      {!logs || logs.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          No audit log entries yet.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(log.createdAt, "en")}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{log.actorEmail}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        log.action.includes("DELETE")
                          ? "text-red-600 border-red-200"
                          : log.action.includes("VERIFY") || log.action.includes("APPROVE")
                            ? "text-emerald-600 border-emerald-200"
                            : ""
                      }
                    >
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.targetName ?? log.targetId ?? "—"}
                    <span className="text-xs text-muted-foreground ml-1">({log.targetType})</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {log.ipAddress ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
