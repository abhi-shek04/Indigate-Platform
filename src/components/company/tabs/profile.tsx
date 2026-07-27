"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { api } from "@/lib/api-client";
import { SectionCard } from "@/components/dashboard/dashboard-shell";
import { FileDropZone } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CompanyAvatar } from "@/components/brand/logo";
import { toast } from "sonner";
import { ImageIcon, Clock } from "lucide-react";

export function Profile() {
  const company = useApp((s) => s.company);
  const refreshAuth = useApp((s) => s.refreshAuth);
  const { t, pick } = useT();
  const [form, setForm] = useState({
    companyName: company?.companyName ?? "",
    industry: company?.industry ?? "",
    locationJapan: company?.locationJapan ?? "",
    description: company?.description ?? "",
    website: company?.website ?? "",
    employeeCount: company?.employeeCount ?? "",
    logoUrl: company?.logoUrl ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!company) return;
    setForm({
      companyName: company.companyName,
      industry: company.industry ?? "",
      locationJapan: company.locationJapan ?? "",
      description: company.description ?? "",
      website: company.website ?? "",
      employeeCount: company.employeeCount ?? "",
      logoUrl: company.logoUrl ?? "",
    });
  }, [company?.updatedAt]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadLogo(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Logo must be an image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max logo size is 2MB.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "logo");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error || "Upload failed");
      }
      const data = (await res.json()) as { url: string };
      // The upload route already persists logoUrl on the company profile,
      // so refreshAuth will pick it up. We also update local form state.
      set("logoUrl", data.url);
      toast.success("Logo updated.");
      await refreshAuth();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function removeLogo() {
    setUploading(true);
    try {
      await api("/api/companies/me", {
        method: "PUT",
        body: JSON.stringify({
          logoUrl: null,
        }),
      });
      set("logoUrl", "");
      toast.success("Logo removed.");
      await refreshAuth();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove logo.");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/api/companies/me", {
        method: "PUT",
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          industry: form.industry.trim() || null,
          locationJapan: form.locationJapan.trim() || null,
          description: form.description.trim() || null,
          website: form.website.trim() || null,
          employeeCount: form.employeeCount.trim() || null,
        }),
      });
      await refreshAuth();
      toast.success("Company profile saved.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6 max-w-3xl">
      {/* Logo */}
      <SectionCard title={pick("Company logo", "会社のロゴ")}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <CompanyAvatar
            name={form.companyName || "?"}
            color={form.logoUrl}
            size={72}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">
                {form.logoUrl
                  ? "Logo uploaded"
                  : "No logo yet — using a colored avatar."}
              </p>
              {form.logoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive/80 hover:bg-destructive/10 px-2"
                  disabled={uploading}
                  onClick={removeLogo}
                >
                  Remove logo
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              PNG, JPG or SVG · max 2MB
            </p>
            <FileDropZone
              accept="image/*"
              onFile={uploadLogo}
              busy={uploading}
              title={uploading ? "Uploading..." : "Upload new logo"}
              hint="Drag an image or click to browse"
              icon={<ImageIcon className="h-5 w-5" />}
              className="py-5"
            />
          </div>
        </div>
      </SectionCard>

      {/* Details */}
      <SectionCard title={pick("Company details", "会社情報")}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="companyName">{pick("Company name", "会社名")}</Label>
            <Input
              id="companyName"
              value={form.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="industry">{pick("Industry", "業種")}</Label>
            <Input
              id="industry"
              value={form.industry}
              onChange={(e) => set("industry", e.target.value)}
              placeholder={pick("e.g. IT Services", "例：ITサービス")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="locationJapan">{pick("Location (Japan)", "所在地 (日本)")}</Label>
            <Input
              id="locationJapan"
              value={form.locationJapan}
              onChange={(e) => set("locationJapan", e.target.value)}
              placeholder={pick("e.g. Shibuya, Tokyo", "例：東京都渋谷区")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">{pick("Website", "ウェブサイト")}</Label>
            <Input
              id="website"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="employeeCount">{pick("Employee count", "従業員数")}</Label>
            <Input
              id="employeeCount"
              value={form.employeeCount}
              onChange={(e) => set("employeeCount", e.target.value)}
              placeholder={pick("e.g. 50-200", "例：50-200")}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">{pick("About the company", "会社について")}</Label>
            <Textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={pick("Tell candidates what makes your company special...", "会社の魅力や特徴を候補者に伝えてください...")}
              maxLength={5000}
            />
          </div>
        </div>
      </SectionCard>

      {company?.isApproved === false && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">
              {t("dash.company.pending")}
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
              You can edit your profile now — it will be visible once an admin
              approves your account.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 sticky bottom-4">
        <Button
          type="submit"
          disabled={saving}
          className="bg-brand-gradient text-white shadow-premium hover:opacity-90 px-6"
        >
          {saving ? t("common.loading") : t("common.save")}
        </Button>
      </div>
    </form>
  );
}
