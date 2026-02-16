import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    membersService,
    type Member,
    type CreateMemberRequest,
    type UpdateMemberRequest,
} from "@/services/members.service";
import { membershipsService, type MembershipPlan } from "@/services/memberships.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoogleDateTimePicker } from "@/components/ui/google-date-time-picker";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Pencil, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { uploadsService } from "@/services/uploads.service";
import { resolveMediaUrl } from "@/lib/media-url";

const Members = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("active");
    const [planFilter, setPlanFilter] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Member | null>(null);
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        avatarUrl: "",
        dateOfBirth: "",
        password: "",
        gender: "",
        height: "",
        currentWeight: "",
        targetWeight: "",
        emergencyContact: "",
    });
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const loadMembers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await membersService.getAll({
                limit: 200,
                name: search || undefined,
                isActive: statusFilter === "all" ? undefined : statusFilter === "active",
                planId: planFilter === "all" ? undefined : planFilter,
            });
            setMembers(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Failed to load members", err);
            setMembers([]);
        } finally {
            setIsLoading(false);
        }
    }, [search, statusFilter, planFilter]);

    const loadPlans = useCallback(async () => {
        try {
            const response = await membershipsService.getAllPlans({ limit: 200 });
            setPlans(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Failed to load plans", err);
            setPlans([]);
        }
    }, []);

    useEffect(() => {
        loadMembers();
        loadPlans();
    }, [loadMembers, loadPlans]);

    const filtered = useMemo(() => {
        if (!search) return members;
        const lower = search.toLowerCase();
        return members.filter(
            (member) =>
                `${member.firstName} ${member.lastName}`.toLowerCase().includes(lower) ||
                member.email.toLowerCase().includes(lower),
        );
    }, [members, search]);

    const openAdd = () => {
        setEditing(null);
        setForm({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            avatarUrl: "",
            dateOfBirth: "",
            password: "",
            gender: "",
            height: "",
            currentWeight: "",
            targetWeight: "",
            emergencyContact: "",
        });
        setDialogOpen(true);
    };

    const openEdit = (member: Member) => {
        setEditing(member);
        setForm({
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            phone: member.phone || "",
            address: member.address || "",
            avatarUrl: member.avatarUrl || "",
            dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split("T")[0] : "",
            password: "",
            gender: member.gender || "",
            height: member.height !== undefined ? String(member.height) : "",
            currentWeight: member.currentWeight !== undefined ? String(member.currentWeight) : "",
            targetWeight: member.targetWeight !== undefined ? String(member.targetWeight) : "",
            emergencyContact: member.emergencyContact || "",
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
                toast.error("Name and email are required.");
                return;
            }

            if (editing) {
                const payload: UpdateMemberRequest = {
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    phone: form.phone.trim() || undefined,
                    address: form.address.trim() || undefined,
                    avatarUrl: form.avatarUrl.trim() || undefined,
                    dateOfBirth: form.dateOfBirth || undefined,
                    gender: form.gender.trim() || undefined,
                    height: form.height ? Number(form.height) : undefined,
                    currentWeight: form.currentWeight ? Number(form.currentWeight) : undefined,
                    targetWeight: form.targetWeight ? Number(form.targetWeight) : undefined,
                    emergencyContact: form.emergencyContact.trim() || undefined,
                };
                const updated = await membersService.update(editing.id, payload);
                setMembers((prev) =>
                    prev.map((member) => (member.id === updated.id ? updated : member)),
                );
                toast.success("Member updated");
            } else {
                if (!form.password || form.password.length < 8) {
                    toast.error("Password must be at least 8 characters.");
                    return;
                }
                const payload: CreateMemberRequest = {
                    email: form.email.trim(),
                    password: form.password,
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    phone: form.phone.trim() || undefined,
                    address: form.address.trim() || undefined,
                    avatarUrl: form.avatarUrl.trim() || undefined,
                    dateOfBirth: form.dateOfBirth || undefined,
                    gender: form.gender.trim() || undefined,
                    height: form.height ? Number(form.height) : undefined,
                    currentWeight: form.currentWeight ? Number(form.currentWeight) : undefined,
                    targetWeight: form.targetWeight ? Number(form.targetWeight) : undefined,
                    emergencyContact: form.emergencyContact.trim() || undefined,
                };
                const created = await membersService.create(payload);
                setMembers((prev) => [created, ...prev]);
                toast.success("Member created");
            }

            setDialogOpen(false);
        } catch (err: any) {
            const message = err?.response?.data?.message || "Failed to save member.";
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
            await membersService.deleteHard(id);
            setMembers((prev) => prev.filter((member) => member.id !== id));
            toast.success("Member deleted");
        } catch (err: any) {
            const message = err?.response?.data?.message || "Failed to delete member.";
            toast.error(message);
        }
    };

    const handleDeactivate = async (id: string) => {
        try {
            await membersService.deactivate(id);
            setMembers((prev) =>
                prev.map((member) =>
                    member.id === id ? { ...member, isActive: false } : member,
                ),
            );
            toast.success("Member deactivated");
        } catch (err: any) {
            const message = err?.response?.data?.message || "Failed to deactivate member.";
            toast.error(message);
        }
    };

    const handleActivate = async (id: string) => {
        try {
            await membersService.activate(id);
            setMembers((prev) =>
                prev.map((member) =>
                    member.id === id ? { ...member, isActive: true } : member,
                ),
            );
            toast.success("Member activated");
        } catch (err: any) {
            const message = err?.response?.data?.message || "Failed to activate member.";
            toast.error(message);
        }
    };

    const handleResetFilters = () => {
        setSearch("");
        setStatusFilter("active");
        setPlanFilter("all");
    };

    const statusVariant = (isActive: boolean) => (isActive ? "emerald" : "amber");

    const getPlanLabel = (member: Member) => {
        const active = member.subscriptions?.find((sub) => sub.status === "ACTIVE");
        return active?.membershipPlan?.name || "—";
    };

    return (
        <div className="space-y-4">
            <section className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Members Management</p>
                        <p className="text-sm text-muted-foreground">
                            {members.length} total members enrolled in your gym.
                        </p>
                    </div>
                    <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Member
                    </Button>
                </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold text-foreground">Member Directory</p>
                        <p className="text-xs text-muted-foreground">Filter and search your member base</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="relative w-full lg:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search members..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-10 rounded-xl border-border"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40 h-10 rounded-xl border-border">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={planFilter} onValueChange={setPlanFilter}>
                            <SelectTrigger className="w-44 h-10 rounded-xl border-border">
                                <SelectValue placeholder="Plan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All plans</SelectItem>
                                {plans.map((plan) => (
                                    <SelectItem key={plan.id} value={plan.id}>
                                        {plan.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" onClick={handleResetFilters} className="h-10 rounded-xl">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto -mx-5">
                    <table className="min-w-full text-sm">
                        <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3 font-medium">Name</th>
                                <th className="px-5 py-3 font-medium hidden md:table-cell">Email</th>
                                <th className="px-5 py-3 font-medium hidden lg:table-cell">Phone</th>
                                <th className="px-5 py-3 font-medium hidden lg:table-cell">Gender</th>
                                <th className="px-5 py-3 font-medium hidden xl:table-cell text-center">Plan</th>
                                <th className="px-5 py-3 font-medium text-center">Status</th>
                                <th className="px-5 py-3 font-medium hidden lg:table-cell">Join Date</th>
                                <th className="px-5 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">
                                        Loading members...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">
                                        No members found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((member) => {
                                    const variant = statusVariant(member.isActive);
                                    const statusClass = variant === "emerald" 
                                        ? "bg-emerald-100 text-emerald-700" 
                                        : "bg-amber-100 text-amber-700";
                                    const avatarSrc = resolveMediaUrl(member.avatarUrl);
                                    const initials = `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase();

                                    return (
                                        <tr key={member.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={avatarSrc || undefined} alt={`${member.firstName} ${member.lastName}`} className="object-cover" />
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-[10px] font-semibold text-white">
                                                            {initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <Link
                                                            to={`/member/${member.id}`}
                                                            className="font-medium text-foreground hover:text-blue-600 hover:underline"
                                                        >
                                                            {member.firstName} {member.lastName}
                                                        </Link>
                                                        <p className="text-[11px] text-muted-foreground md:hidden">{member.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 hidden md:table-cell text-foreground">{member.email}</td>
                                            <td className="px-5 py-4 hidden lg:table-cell text-foreground">{member.phone || "—"}</td>
                                            <td className="px-5 py-4 hidden lg:table-cell text-foreground capitalize">{member.gender?.toLowerCase() || "—"}</td>
                                            <td className="px-5 py-4 hidden xl:table-cell text-center">
                                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                                                    {getPlanLabel(member)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium", statusClass)}>
                                                    {member.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 hidden lg:table-cell text-foreground">
                                                {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "—"}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {member.isActive ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeactivate(member.id)}
                                                            className="h-8 w-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                                                            title="Deactivate"
                                                        >
                                                            <span className="text-[10px] font-bold">OFF</span>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleActivate(member.id)}
                                                            className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                                            title="Activate"
                                                        >
                                                            <span className="text-[10px] font-bold">ON</span>
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(member)} className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-foreground">Delete Member</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-muted-foreground">
                                                                    Are you sure you want to delete {member.firstName} {member.lastName}? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter className="gap-2 sm:gap-0">
                                                                <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(member.id)} className="rounded-xl bg-red-600 hover:bg-red-700">
                                                                    Delete Member
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
                        <DialogTitle className="text-xl font-bold text-foreground">{editing ? "Edit Member" : "Add New Member"}</DialogTitle>
                        <p className="text-sm text-muted-foreground">Enter member details to manage their profile.</p>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">First name</Label>
                                <Input
                                    type="text"
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    className="h-10 rounded-xl border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">Last name</Label>
                                <Input
                                    type="text"
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                    className="h-10 rounded-xl border-border"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="h-10 rounded-xl border-border"
                                />
                            </div>
                            {!editing && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground">Password</Label>
                                    <Input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="h-10 rounded-xl border-border"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
                                <Input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="h-10 rounded-xl border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">Gender</Label>
                                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                                    <SelectTrigger className="h-10 rounded-xl border-border">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Address</Label>
                            <Input
                                type="text"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="h-10 rounded-xl border-border"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">Date of Birth</Label>
                                <GoogleDateTimePicker
                                    mode="date"
                                    value={form.dateOfBirth}
                                    onChange={(value) => setForm({ ...form, dateOfBirth: value })}
                                    placeholder="Select birthday"
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">Emergency Contact</Label>
                                <Input
                                    type="text"
                                    value={form.emergencyContact}
                                    onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                                    className="h-10 rounded-xl border-border"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">Height (cm)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={form.height}
                                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                                    className="h-10 rounded-xl border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">Current (kg)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={form.currentWeight}
                                    onChange={(e) => setForm({ ...form, currentWeight: e.target.value })}
                                    className="h-10 rounded-xl border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">Target (kg)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={form.targetWeight}
                                    onChange={(e) => setForm({ ...form, targetWeight: e.target.value })}
                                    className="h-10 rounded-xl border-border"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Profile Image</Label>
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
                        <Button onClick={handleSave} className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-100">
                            {editing ? "Update Member Profile" : "Create Member Account"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Members;
