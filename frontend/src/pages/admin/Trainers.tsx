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

  const statusColor = (isActive: boolean) =>
    isActive ? "default" : "secondary";

  return (
    <div className="space-y-6 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Trainers</h1>
          <p className="text-muted-foreground">{list.length} trainers</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Trainer
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trainers..."
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
                <TableHead className="hidden md:table-cell">
                  Specialization
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Loading trainers...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No trainers found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      <Link
                        to={`/trainer/${t.id}`}
                        className="text-primary hover:underline"
                      >
                        {t.firstName} {t.lastName}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {t.specializations.join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColor(t.isActive)}>
                        {t.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(t)}
                        >
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
                              <AlertDialogTitle>
                                Delete Trainer
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Delete {t.firstName} {t.lastName}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(t.id)}
                              >
                                Delete
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Trainer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input
                type="text"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input
                type="text"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
              type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
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
            <div className="space-y-2">
              <Label>
                {editing ? "New password (optional)" : "Password"}
              </Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                {editing ? "Confirm new password" : "Confirm password"}
              </Label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Specializations</Label>
              <Input
                type="text"
                placeholder="e.g. Strength, Yoga"
                value={form.specializations}
                onChange={(e) =>
                  setForm({ ...form, specializations: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Certifications</Label>
              <Input
                type="text"
                placeholder="Optional"
                value={form.certifications}
                onChange={(e) =>
                  setForm({ ...form, certifications: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.experience}
                  onChange={(e) =>
                    setForm({ ...form, experience: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Hourly rate</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.hourlyRate}
                  onChange={(e) =>
                    setForm({ ...form, hourlyRate: e.target.value })
                  }
                />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">
              {editing ? "Update" : "Add"} Trainer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Trainers;
