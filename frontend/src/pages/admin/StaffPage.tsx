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
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
      hireDate: staff.hireDate ? staff.hireDate.slice(0, 10) : "",
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
    <div className="space-y-6 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Staff</h1>
          <p className="text-muted-foreground">{list.length} staff members</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead className="hidden sm:table-cell">Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading staff...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No staff found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <Link to={`/staff-profile/${s.id}`} className="text-primary hover:underline">
                        {s.firstName} {s.lastName}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{s.staffRole}</TableCell>
                    <TableCell className="hidden sm:table-cell">{s.department || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={s.isActive ? "default" : "secondary"}>
                        {s.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deactivate Staff</AlertDialogTitle>
                              <AlertDialogDescription>
                                Deactivate {s.firstName} {s.lastName}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(s.id)}>
                                Deactivate
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Staff</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Profile image URL</Label>
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
              />
              {form.avatarUrl && (
                <p className="text-xs text-muted-foreground">Uploaded: {form.avatarUrl}</p>
              )}
            </div>
            {!editing && (
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Staff Role</Label>
                <Select
                  value={form.staffRole}
                  onValueChange={(value) => setForm({ ...form, staffRole: value as StaffRole })}
                >
                  <SelectTrigger>
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
                <Label>Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hire Date</Label>
                <Input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <Input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <Button onClick={handleSave} className="w-full">
              {editing ? "Update" : "Add"} Staff
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffPage;
