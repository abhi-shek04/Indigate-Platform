"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** User row shape returned by GET /api/admin/users (matches the prisma select). */
interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isVerified: boolean;
  googleId: string | null;
  totpEnabled: boolean;
  createdAt: string;
}

export function UsersTab() {
  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api<{ users: AdminUserRow[] }>("/api/admin/users");
      setUsers(res.users);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateRole(id: string) {
    try {
      await api(`/api/admin/users?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: editRole }),
      });
      toast.success("User role updated.");
      setEditingId(null);
      load();
    } catch {
      toast.error("Failed to update user.");
    }
  }

  async function toggleVerified(id: string, current: boolean) {
    try {
      await api(`/api/admin/users?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isVerified: !current }),
      });
      toast.success(!current ? "User verified." : "User unverified.");
      load();
    } catch {
      toast.error("Failed to update user.");
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      await api(`/api/admin/users?id=${id}`, { method: "DELETE" });
      toast.success("User deleted.");
      load();
    } catch {
      toast.error("Failed to delete user.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Users & Roles</h2>
        <Badge variant="secondary">{users?.length ?? 0} users</Badge>
      </div>

      {!users || users.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          No users found.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    {editingId === u.id ? (
                      <Select value={editRole} onValueChange={setEditRole}>
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CANDIDATE">CANDIDATE</SelectItem>
                          <SelectItem value="COMPANY">COMPANY</SelectItem>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline">{u.role}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleVerified(u.id, u.isVerified)}
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-md transition-colors",
                        u.isVerified
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {u.isVerified ? "Verified" : "Unverified"}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {u.googleId && <Badge variant="secondary" className="text-xs">Google</Badge>}
                      <Badge variant="secondary" className="text-xs">Password</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {u.totpEnabled ? (
                      <Badge className="bg-saffron/10 text-saffron text-xs">2FA</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editingId === u.id ? (
                        <>
                          <Button size="sm" className="h-7 text-xs" onClick={() => updateRole(u.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => {
                              setEditingId(u.id);
                              setEditRole(u.role);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => deleteUser(u.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
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
