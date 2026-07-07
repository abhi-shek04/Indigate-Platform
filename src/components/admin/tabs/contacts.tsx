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
import { Input } from "@/components/ui/input";
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
import { Mail, Search } from "lucide-react";
import { ExportCsvButton } from "../shared";

/* ============== Contacts tab ============== */

interface ContactRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  userId: string | null;
  createdAt: string;
}

export function ContactsTab() {
  const { t, locale } = useT();
  const [items, setItems] = useState<ContactRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ items: ContactRow[] }>(
        "/api/admin/list/contacts",
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

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.subject ?? "").toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q),
    );
  }, [items, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          Contact Enquiries
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("common.search")}
              className="pl-8 h-9 w-[200px]"
            />
          </div>
          <ExportCsvButton resource="contacts" />
        </div>
      </div>

      {loading ? (
        <CardSkeleton lines={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No enquiries yet"
          description="Contact form submissions will appear here."
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <div className="max-h-[70vh] overflow-y-auto scroll-area">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="pl-5 sm:pl-6">Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Subject</TableHead>
                  <TableHead className="hidden lg:table-cell">Message</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right pr-5 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-5 sm:pl-6">
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {c.email}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {c.email}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {c.subject || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-xs truncate">
                      {c.message}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {formatDate(c.createdAt, locale)}
                    </TableCell>
                    <TableCell className="text-right pr-5 sm:pr-6">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelected(c)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}

      <Sheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      >
        <SheetContent className="w-[440px] sm:max-w-[440px] overflow-y-auto scroll-area">
          <SheetHeader>
            <SheetTitle>Enquiry from {selected?.name}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Email
                </p>
                <a
                  href={`mailto:${selected.email}`}
                  className="text-sm text-crimson hover:underline"
                >
                  {selected.email}
                </a>
              </div>
              {selected.subject && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Subject
                  </p>
                  <p className="text-sm">{selected.subject}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Message
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/40 rounded-lg p-3">
                  {selected.message}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Received
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selected.createdAt, locale)}
                </p>
              </div>
              <a href={`mailto:${selected.email}`}>
                <Button className="w-full bg-brand-gradient text-white hover:opacity-90 font-semibold">
                  <Mail className="mr-2 h-4 w-4" />
                  Reply by Email
                </Button>
              </a>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
