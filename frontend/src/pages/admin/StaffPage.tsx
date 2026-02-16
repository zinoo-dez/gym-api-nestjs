import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  staffService,
  type StaffMember,
  type StaffRole,
  type CreateStaffRequest,
  type UpdateStaffRequest,
} from "@/services/staff.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoogleDateTimePicker } from "@/components/ui/google-date-time-picker";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media-url";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { uploadsService } from "@/services/uploads.service";

const staffRoles: StaffRole[] = [
  "MANAGER",
  "RECEPTIONIST",
  "MAINTENANCE",
  "CLEANING",
  "SECURITY",
];

const toDateTimeLocalValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const StaffPage = () => {
  const [list, setList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatarUrl: "",
    password: "",
    phone: "",
    staffRole: "RECEPTIONIST" as StaffRole,
    employeeId: "",
    hireDate: "",
    department: "",
    position: "",
    emergencyContact: "",
    address: "",
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const loadStaff = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await staffService.getAll({
        limit: 200,
        name: search || undefined,
      });
      setList(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load staff", err);
      setList([]);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const filtered = useMemo(() => {
    if (!search) return list;
    const lower = search.toLowerCase();
    return list.filter(
      (s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(lower) ||
        s.email.toLowerCase().includes(lower) ||
        s.staffRole.toLowerCase().includes(lower) ||
        (s.department || "").toLowerCase().includes(lower),
    );
  }, [list, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      avatarUrl: "",
      password: "",
      phone: "",
      staffRole: "RECEPTIONIST",
      employeeId: "",
      hireDate: "",
      department: "",
      position: "",
      emergencyContact: "",
      address: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (staff: StaffMember) => {
    setEditing(staff);
    setForm({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      avatarUrl: staff.avatarUrl || "",
      password: "",
      phone: staff.phone || "",
      staffRole: staff.staffRole,
      employeeId: staff.employeeId,
      hireDate: toDateTimeLocalValue(staff.hireDate),
      department: staff.department || "",
      position: staff.position,
      emergencyContact: staff.emergencyContact || "",
      address: staff.address || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    if (!form.employeeId.trim() || !form.position.trim() || !form.hireDate) {
      toast.error("Employee ID, position, and hire date are required.");
      return;
    }

    try {
      if (editing) {
        const payload: UpdateStaffRequest = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim() || undefined,
          avatarUrl: form.avatarUrl.trim() || undefined,
          staffRole: form.staffRole,
          employeeId: form.employeeId.trim(),
          hireDate: form.hireDate,
          department: form.department.trim() || undefined,
          position: form.position.trim(),
          emergencyContact: form.emergencyContact.trim() || undefined,
          address: form.address.trim() || undefined,
        };
        const updated = await staffService.update(editing.id, payload);
        setList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        toast.success("Staff updated");
      } else {
        if (!form.password || form.password.length < 8) {
          toast.error("Password must be at least 8 characters.");
          return;
        }
        const payload: CreateStaffRequest = {
          email: form.email.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim() || undefined,
          avatarUrl: form.avatarUrl.trim() || undefined,
          staffRole: form.staffRole,
          employeeId: form.employeeId.trim(),
          hireDate: form.hireDate,
          department: form.department.trim() || undefined,
          position: form.position.trim(),
          emergencyContact: form.emergencyContact.trim() || undefined,
          address: form.address.trim() || undefined,
        };
        const created = await staffService.create(payload);
        setList((prev) => [created, ...prev]);
        toast.success("Staff created");
      }
      setDialogOpen(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to save staff.";
      toast.error(message);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      const uploaded = await uploadsService.uploadImage(file);
      setForm((prev) => ({ ...prev, avatarUrl: uploaded.url }));
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await staffService.deactivate(id);
      setList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: false } : s)),
      );
      toast.success("Staff deactivated");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to delete staff.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Staff Management</p>
            <p className="text-sm text-muted-foreground">
              {list.length} active staff members and personnel.
            </p>
          </div>
          <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-foreground">Staff Directory</p>
            <p className="text-xs text-muted-foreground">Search and manage your gym personnel</p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff members, roles, departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl border-border"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Role</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Department</th>
                <th className="px-5 py-3 font-medium text-center">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    Loading staff...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    No staff found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const statusClass = s.isActive 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-amber-100 text-amber-700";
                  const avatarSrc = resolveMediaUrl(s.avatarUrl);
                  const initials = `${s.firstName?.[0] || ""}${s.lastName?.[0] || ""}`.toUpperCase();

                  return (
                    <tr key={s.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={avatarSrc || undefined} alt={`${s.firstName} ${s.lastName}`} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-[10px] font-semibold text-white">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <Link to={`/staff-profile/${s.id}`} className="font-medium text-foreground hover:text-blue-600 hover:underline">
                            {s.firstName} {s.lastName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                          {s.staffRole}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-foreground">{s.department || "—"}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium", statusClass)}>
                          {s.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)} className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Deactivate Staff</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to deactivate {s.firstName} {s.lastName}? They will no longer have access to the dashboard.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(s.id)} className="rounded-xl bg-amber-600 hover:bg-amber-700">
                                  Deactivate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl border-none shadow-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">{editing ? "Edit Profile" : "Add Staff Member"}</DialogTitle>
            <p className="text-sm text-muted-foreground">Enter personnel details and assign system roles.</p>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">First name</Label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="h-10 rounded-xl border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Last name</Label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="h-10 rounded-xl border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Email Address</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10 rounded-xl border-border" />
              </div>
              {!editing && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Password</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-10 rounded-xl border-border" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Role & Access</Label>
                <Select
                  value={form.staffRole}
                  onValueChange={(value) => setForm({ ...form, staffRole: value as StaffRole })}
                >
                  <SelectTrigger className="h-10 rounded-xl border-border">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="h-10 rounded-xl border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Employee ID</Label>
                <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="h-10 rounded-xl border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Position Title</Label>
                <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="h-10 rounded-xl border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Hire Date</Label>
                <GoogleDateTimePicker mode="date" value={form.hireDate} onChange={(value) => setForm({ ...form, hireDate: value })} className="h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-10 rounded-xl border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Emergency Contact</Label>
                <Input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} className="h-10 rounded-xl border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Profile Profile</Label>
                <Input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingAvatar}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAvatarUpload(file);
                    }
                  }}
                  className="h-10 rounded-xl border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="h-10 rounded-xl border-border" />
            </div>
            <Button onClick={handleSave} className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-100">
              {editing ? "Update Personnel Records" : "Register Staff Member"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffPage;
