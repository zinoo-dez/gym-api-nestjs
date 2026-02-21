import { useCallback, useEffect, useMemo, useState } from "react";
import { usersService, type UserProfile } from "@/services/users.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { RefreshCcw, Search, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ROLE_OPTIONS = ["MEMBER", "TRAINER", "STAFF"] as const;

const UsersPage = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | string>("all");
  const [draftRole, setDraftRole] = useState<Record<string, string>>({});

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const users = await usersService.getAll();
      const normalized = Array.isArray(users) ? users : [];
      setRows(normalized);
      setDraftRole(
        Object.fromEntries(normalized.map((user) => [user.id, user.role || "MEMBER"])),
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load users");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((row) => {
      const passRole = roleFilter === "all" ? true : row.role === roleFilter;
      if (!passRole) return false;
      if (!keyword) return true;
      return (
        row.email.toLowerCase().includes(keyword) ||
        `${row.firstName} ${row.lastName}`.toLowerCase().includes(keyword)
      );
    });
  }, [rows, search, roleFilter]);

  const saveRole = async (user: UserProfile) => {
    const nextRole = draftRole[user.id];
    if (!nextRole || nextRole === user.role) {
      toast.message("No role changes to save");
      return;
    }

    try {
      const updated = await usersService.changeRole(user.id, { role: nextRole });
      setRows((prev) => prev.map((item) => (item.id === user.id ? { ...item, ...updated } : item)));
      toast.success("User role updated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update role");
    }
  };

  const removeUser = async (user: UserProfile) => {
    try {
      await usersService.remove(user.id);
      setRows((prev) => prev.filter((item) => item.id !== user.id));
      toast.success("User deleted");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">User Access Management</h1>
            <p className="text-sm text-muted-foreground">
              Review registered users, update role assignments, and remove invalid accounts.
            </p>
          </div>
          <Button variant="outline" onClick={loadRows} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full lg:w-52">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ROLE_OPTIONS.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-y border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                    Loading users...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{user.role}</Badge>
                        {user.role !== "ADMIN" && (
                          <Select
                            value={draftRole[user.id] || user.role}
                            onValueChange={(value) =>
                              setDraftRole((prev) => ({ ...prev, [user.id]: value }))
                            }
                          >
                            <SelectTrigger className="h-8 w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((role) => (
                                <SelectItem key={`${user.id}-${role}`} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {user.role !== "ADMIN" && (
                          <Button size="sm" variant="outline" onClick={() => saveRole(user)}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Role
                          </Button>
                        )}

                        {user.role !== "ADMIN" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete user?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This permanently removes the account for {user.email}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removeUser(user)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UsersPage;
