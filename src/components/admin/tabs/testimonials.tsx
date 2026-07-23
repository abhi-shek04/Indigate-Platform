"use client";

import { useEffect, useState, useCallback } from "react";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import {
  EmptyState,
  CardSkeleton,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Quote, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TestimonialRow, FormField } from "../shared";

/* ============== Testimonials tab ============== */

export function TestimonialsTab() {
  const { t } = useT();
  const [items, setItems] = useState<TestimonialRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<{
    mode: "create" | "edit";
    item: TestimonialRow | null;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ items: TestimonialRow[] }>(
        "/api/admin/list/testimonials",
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

  async function toggle(id: string) {
    setBusyId(id);
    try {
      await api(`/api/admin/testimonials/${id}/toggle`, { method: "PATCH" });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      await api(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      toast.success("Testimonial deleted.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusyId(null);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl">
          {t("admin.testimonials")}
        </h2>
        <Button
          size="sm"
          className="bg-brand-gradient text-white hover:opacity-90 font-semibold"
          onClick={() => setEditorState({ mode: "create", item: null })}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Testimonial
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={4} />
        </div>
      ) : !items || items.length === 0 ? (
        <EmptyState
          icon={Quote}
          title="No testimonials yet"
          description="Add success stories from placed candidates and happy employers."
          action={
            <Button
              className="bg-brand-gradient text-white"
              onClick={() => setEditorState({ mode: "create", item: null })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Testimonial
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((row) => (
            <div
              key={row.id}
              className={cn(
                "rounded-2xl border border-border bg-card shadow-premium p-5 flex flex-col gap-3",
                !row.isActive && "opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display font-bold">{row.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.role}
                    {row.company ? ` · ${row.company}` : ""}
                  </p>
                </div>
                <Badge
                  variant={row.isActive ? "default" : "secondary"}
                  className="shrink-0"
                >
                  {row.isActive ? "Active" : "Hidden"}
                </Badge>
              </div>
              <Quote className="h-4 w-4 text-saffron/60" />
              <p className="text-sm text-foreground/90 leading-relaxed line-clamp-4">
                {row.content}
              </p>
              {row.contentJa && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {row.contentJa}
                </p>
              )}
              <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Order #{row.order}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === row.id}
                    onClick={() => toggle(row.id)}
                  >
                    {row.isActive ? "Hide" : "Show"}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-crimson"
                    aria-label="Edit"
                    onClick={() =>
                      setEditorState({ mode: "edit", item: row })
                    }
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog
                    open={deleteId === row.id}
                    onOpenChange={(o) => setDeleteId(o ? row.id : null)}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete this testimonial?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          "{row.name}"'s testimonial will be permanently
                          removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-white hover:bg-destructive/90"
                          onClick={() => remove(row.id)}
                        >
                          {t("common.delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editorState && (
        <TestimonialEditorSheet
          mode={editorState.mode}
          item={editorState.item}
          onClose={() => setEditorState(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}

/* ============== Testimonial Editor Sheet ============== */

interface TestimonialFormState {
  name: string;
  role: string;
  company: string;
  content: string;
  contentJa: string;
  photoUrl: string;
  order: string;
  isActive: boolean;
}

export function TestimonialEditorSheet({
  mode,
  item,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  item: TestimonialRow | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<TestimonialFormState>({
    name: "",
    role: "",
    company: "",
    content: "",
    contentJa: "",
    photoUrl: "",
    order: "0",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        role: item.role,
        company: item.company ?? "",
        content: item.content,
        contentJa: item.contentJa ?? "",
        photoUrl: item.photoUrl ?? "",
        order: String(item.order),
        isActive: item.isActive ?? false,
      });
    }
  }, [item]);

  function update<K extends keyof TestimonialFormState>(
    key: K,
    value: TestimonialFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.content.length < 10) {
      toast.error("Content must be at least 10 characters.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        role: form.role,
        company: form.company || undefined,
        content: form.content,
        contentJa: form.contentJa || undefined,
        photoUrl: form.photoUrl || undefined,
        order: Number(form.order) || 0,
        isActive: form.isActive,
      };
      if (mode === "create") {
        await api("/api/admin/testimonials", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Testimonial created.");
      } else if (item) {
        await api(`/api/admin/testimonials/${item.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Testimonial updated.");
      }
      await onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[440px] sm:max-w-[440px] overflow-y-auto scroll-area">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Add Testimonial" : "Edit Testimonial"}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={submit} className="space-y-4 mt-4 pr-1">
          <FormField label="Name *">
            <Input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Arjun Sharma"
            />
          </FormField>
          <FormField label="Role *">
            <Input
              required
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              placeholder="Backend Engineer"
            />
          </FormField>
          <FormField label="Company">
            <Input
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              placeholder="TechNova Japan"
            />
          </FormField>
          <FormField label="Content (English) *">
            <Textarea
              required
              rows={4}
              minLength={10}
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              placeholder="IndiGate made my move to Tokyo seamless..."
            />
          </FormField>
          <FormField label="Content (Japanese)">
            <Textarea
              rows={4}
              value={form.contentJa}
              onChange={(e) => update("contentJa", e.target.value)}
              placeholder="IndiGateのおかげで東京への移住がスムーズでした..."
            />
          </FormField>
          <FormField label="Photo URL">
            <Input
              value={form.photoUrl}
              onChange={(e) => update("photoUrl", e.target.value)}
              placeholder="https://..."
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Display order">
              <Input
                type="number"
                value={form.order}
                onChange={(e) => update("order", e.target.value)}
              />
            </FormField>
            <label className="flex items-center gap-2 cursor-pointer pt-6">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => update("isActive", v)}
              />
              <span className="text-sm">Active</span>
            </label>
          </div>
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-card pb-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-brand-gradient text-white hover:opacity-90 font-semibold"
            >
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
