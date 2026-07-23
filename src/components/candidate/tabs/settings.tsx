"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api-client";
import { useT } from "@/lib/use-t";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShieldCheck, KeyRound, Mail } from "lucide-react";

export function AccountSettings() {
  const user = useApp((s) => s.user);
  const { pick } = useT();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changing, setChanging] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast.error("New passwords don't match.");
      return;
    }
    setChanging(true);
    try {
      await api("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      toast.success("Password changed successfully.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setChanging(false);
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Account info */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-saffron" />
          {pick("Account Information", "アカウント情報")}
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">{pick("Email", "メールアドレス")}</span>
            <span className="font-medium flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              {user.email}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">{pick("Role", "ロール")}</span>
            <Badge variant="secondary">{user.role}</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">{pick("Email verified", "メール確認")}</span>
            {user.isVerified ? (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                {pick("Verified", "確認済み")}
              </Badge>
            ) : (
              <Badge variant="outline">{pick("Not verified", "未確認")}</Badge>
            )}
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">{pick("Login method", "ログイン方法")}</span>
            <div className="flex gap-2">
              {user.googleId && <Badge variant="secondary">{pick("Google", "Google")}</Badge>}
              <Badge variant="secondary">{pick("Password", "パスワード")}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-saffron" />
          {pick("Change Password", "パスワードを変更")}
        </h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {pick("Current password", "現在のパスワード")}
            </label>
            <Input
              type="password"
              required
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
              className="h-11"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {pick("New password", "新しいパスワード")}
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder={pick("Min 8 characters", "最小8文字")}
                className="h-11"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {pick("Confirm new password", "新しいパスワード (確認)")}
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder={pick("Repeat new password", "新しいパスワードを再入力")}
                className="h-11"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={changing}
            className="bg-brand-gradient text-white hover:opacity-90 font-semibold"
          >
            {changing ? pick("Changing...", "変更中...") : pick("Change Password", "パスワードを変更")}
          </Button>
        </form>
      </div>

    </div>
  );
}
