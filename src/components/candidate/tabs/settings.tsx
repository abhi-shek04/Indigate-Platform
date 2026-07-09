"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShieldCheck, KeyRound, Trash2, Mail, AlertTriangle } from "lucide-react";

export function AccountSettings() {
  const user = useApp((s) => s.user);
  const logout = useApp((s) => s.logout);
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
          Account Information
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              {user.email}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Role</span>
            <Badge variant="secondary">{user.role}</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Email verified</span>
            {user.isVerified ? (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                Verified
              </Badge>
            ) : (
              <Badge variant="outline">Not verified</Badge>
            )}
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Login method</span>
            <div className="flex gap-2">
              {user.googleId && <Badge variant="secondary">Google</Badge>}
              <Badge variant="secondary">Password</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-saffron" />
          Change Password
        </h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Current password
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
                New password
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min 8 characters"
                className="h-11"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Confirm new password
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                className="h-11"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={changing}
            className="bg-brand-gradient text-white hover:opacity-90 font-semibold"
          >
            {changing ? "Changing..." : "Change Password"}
          </Button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 p-6">
        <h2 className="font-display text-lg font-bold mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Log out of your account on this device.
        </p>
        <Button
          variant="outline"
          onClick={() => logout()}
          className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
