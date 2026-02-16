import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  trainersService,
  type Trainer,
  type CreateTrainerRequest,
  type UpdateTrainerRequest,
} from "@/services/trainers.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { uploadsService } from "@/services/uploads.service";

const Trainers = () => {
  const [list, setList] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Trainer | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    avatarUrl: "",
    password: "",
    confirmPassword: "",
    specializations: "",
    certifications: "",
    experience: "",
    hourlyRate: "",
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const loadTrainers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await trainersService.getAll({
        limit: 200,
        specialization: search || undefined,
      });
      setList(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load trainers", err);
      setList([]);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadTrainers();
  }, [loadTrainers]);

  const filtered = useMemo(() => {
    if (!search) return list;
    const lower = search.toLowerCase();
    return list.filter(
      (t) =>
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(lower) ||
        t.specializations.join(", ").toLowerCase().includes(lower),
    );
  }, [list, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      avatarUrl: "",
      password: "",
      confirmPassword: "",
      specializations: "",
      certifications: "",
      experience: "",
      hourlyRate: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (t: Trainer) => {
    setEditing(t);
    setForm({
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.email,
      address: t.address || "",
      avatarUrl: t.avatarUrl || "",
      password: "",
      confirmPassword: "",
      specializations: t.specializations.join(", "),
      certifications: t.certifications.join(", "),
      experience: t.experience !== undefined ? String(t.experience) : "",
      hourlyRate: t.hourlyRate !== undefined ? String(t.hourlyRate) : "",
    });
    setDialogOpen(true);
  };

  const parseList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    const specializations = parseList(form.specializations);
    if (specializations.length === 0) {
      toast.error("Add at least one specialization.");
      return;
    }

    if (form.password) {
      if (form.password.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error("Password and confirm password do not match.");
        return;
      }
    }

    try {
      if (editing) {
        const payload: UpdateTrainerRequest = {
          email: form.email.trim(),
          password: form.password || undefined,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          address: form.address.trim() || undefined,
          avatarUrl: form.avatarUrl.trim() || undefined,
          specializations,
          certifications: parseList(form.certifications),
          experience: form.experience ? Number(form.experience) : undefined,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        };
        const updated = await trainersService.update(editing.id, payload);
        setList((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        toast.success("Trainer updated");
      } else {
        if (!form.password) {
          toast.error("Password is required.");
          return;
        }
        const payload: CreateTrainerRequest = {
          email: form.email.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          address: form.address.trim() || undefined,
          avatarUrl: form.avatarUrl.trim() || undefined,
          specializations,
          certifications: parseList(form.certifications),
          experience: form.experience ? Number(form.experience) : undefined,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        };
        const created = await trainersService.create(payload);
        setList((prev) => [created, ...prev]);
        toast.success("Trainer created");
      }
      setDialogOpen(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to save trainer.";
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
      await trainersService.deactivate(id);
      setList((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive: false } : t)),
      );
      toast.success("Trainer deactivated");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to delete trainer.";
      toast.error(message);
    }
  };

  const statusVariant = (isActive: boolean) => (isActive ? "emerald" : "amber");

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Expert Trainers</p>
            <p className="text-sm text-gray-500">
              {list.length} certified professionals managing your gym's training programs.
            </p>
          </div>
          <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Trainer
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-900">Trainer Directory</p>
            <p className="text-xs text-gray-500">Search by name or specialization</p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search trainers, strength, yoga..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl border-gray-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Specialization</th>
                <th className="px-5 py-3 font-medium text-center">Status</th>
                <th className="px-5 py-3 font-medium hidden lg:table-cell">Member Since</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                    Loading trainers...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                    No trainers found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const variant = statusVariant(t.isActive);
                  const statusClass = variant === "emerald" 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-amber-100 text-amber-700";

                  return (
                    <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-[10px] font-semibold text-white">
                            {t.avatarUrl ? (
                              <img src={t.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                            ) : (
                              `${t.firstName[0]}${t.lastName[0]}`.toUpperCase()
                            )}
                          </div>
                          <Link to={`/trainer/${t.id}`} className="font-medium text-gray-900 hover:text-blue-600 hover:underline">
                            {t.firstName} {t.lastName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {t.specializations.slice(0, 2).map((s) => (
                            <span key={s} className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                              {s}
                            </span>
                          ))}
                          {t.specializations.length > 2 && (
                            <span className="text-[10px] text-gray-400">+{t.specializations.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium", statusClass)}>
                          {t.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-gray-600">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(t)} className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-gray-900">Deactivate Trainer</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-500">
                                  Are you sure you want to deactivate {t.firstName} {t.lastName}? They will no longer be assigned to classes.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl border-gray-200">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(t.id)} className="rounded-xl bg-red-600 hover:bg-red-700">
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
            <DialogTitle className="text-xl font-bold text-gray-900">{editing ? "Edit Trainer Profile" : "Register New Trainer"}</DialogTitle>
            <p className="text-sm text-gray-500">Professional profile details, specializations, and rates.</p>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500">First name</Label>
                <Input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="h-10 rounded-xl border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500">Last name</Label>
                <Input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="h-10 rounded-xl border-gray-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500">Email Address</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-10 rounded-xl border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500">Address</Label>
                <Input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="h-10 rounded-xl border-gray-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500">
                  {editing ? "New password (optional)" : "Account Password"}
                </Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="h-10 rounded-xl border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500">
                  {editing ? "Confirm new password" : "Confirm Password"}
                </Label>
                <Input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="h-10 rounded-xl border-gray-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500">Specializations</Label>
                <Input
                  type="text"
                  placeholder="e.g. Strength, Yoga, Cardio"
                  value={form.specializations}
                  onChange={(e) => setForm({ ...form, specializations: e.target.value })}
                  className="h-10 rounded-xl border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500">Certifications</Label>
                <Input
                  type="text"
                  placeholder="e.g. NASM, ACE"
                  value={form.certifications}
                  onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                  className="h-10 rounded-xl border-gray-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500">Experience (years)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="h-10 rounded-xl border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500">Hourly Rate ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                  className="h-10 rounded-xl border-gray-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-500">Profile Image</Label>
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
                className="h-10 rounded-xl border-gray-200"
              />
            </div>
            <Button onClick={handleSave} className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-100">
              {editing ? "Save Profile Changes" : "Complete Registration"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Trainers;
