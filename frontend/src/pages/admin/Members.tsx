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
import { Input } from "@/components/ui/input";
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
import { Plus, Search, Pencil, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

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
        avatarUrl: "",
        dateOfBirth: "",
        password: "",
        gender: "",
        height: "",
        currentWeight: "",
        targetWeight: "",
        emergencyContact: "",
    });

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

    const statusVariant = (isActive: boolean) => (isActive ? "default" : "secondary");

    const getPlanLabel = (member: Member) => {
        const active = member.subscriptions?.find((sub) => sub.status === "ACTIVE");
        return active?.membershipPlan?.name || "—";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Members</h1>
                    <p className="text-muted-foreground">{members.length} total members</p>
                </div>
                <Button onClick={openAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                </Button>
            </div>

            <Card>
                <CardHeader className="space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search members..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={planFilter} onValueChange={setPlanFilter}>
                                <SelectTrigger className="w-44">
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
                            <Button variant="ghost" onClick={handleResetFilters}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="hidden md:table-cell">Email</TableHead>
                                <TableHead className="hidden lg:table-cell">Phone</TableHead>
                                <TableHead className="hidden lg:table-cell">Gender</TableHead>
                                <TableHead className="hidden xl:table-cell">Height</TableHead>
                                <TableHead className="hidden xl:table-cell">Current</TableHead>
                                <TableHead className="hidden xl:table-cell">Target</TableHead>
                                <TableHead className="hidden xl:table-cell">Emergency</TableHead>
                                <TableHead className="hidden sm:table-cell">Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden lg:table-cell">Join Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={13} className="text-center text-muted-foreground">
                                        Loading members...
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={13} className="text-center text-muted-foreground">
                                        No members found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium">
                                            <Link
                                                to={`/member/${member.id}`}
                                                className="text-primary hover:underline"
                                            >
                                                {member.firstName} {member.lastName}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{member.email}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{member.phone || "—"}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{member.gender || "—"}</TableCell>
                                        <TableCell className="hidden xl:table-cell">
                                            {member.height !== undefined ? `${member.height} cm` : "—"}
                                        </TableCell>
                                        <TableCell className="hidden xl:table-cell">
                                            {member.currentWeight !== undefined ? `${member.currentWeight} kg` : "—"}
                                        </TableCell>
                                        <TableCell className="hidden xl:table-cell">
                                            {member.targetWeight !== undefined ? `${member.targetWeight} kg` : "—"}
                                        </TableCell>
                                        <TableCell className="hidden xl:table-cell">
                                            {member.emergencyContact || "—"}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{getPlanLabel(member)}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(member.isActive)}>
                                                {member.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                {member.isActive ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeactivate(member.id)}
                                                        title="Deactivate"
                                                    >
                                                        <span className="text-xs font-semibold">Off</span>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleActivate(member.id)}
                                                        title="Activate"
                                                    >
                                                        <span className="text-xs font-semibold">On</span>
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(member)}>
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
                                                            <AlertDialogTitle>Delete Member</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete {member.firstName} {member.lastName}?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(member.id)}>
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
                        <DialogTitle>{editing ? "Edit Member" : "Add Member"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First name</Label>
                                <Input
                                    type="text"
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Last name</Label>
                                <Input
                                    type="text"
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
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
                        {!editing && (
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Profile image URL</Label>
                            <Input
                                type="text"
                                value={form.avatarUrl}
                                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Input
                                type="date"
                                value={form.dateOfBirth}
                                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Input
                                    type="text"
                                    value={form.gender}
                                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Emergency Contact</Label>
                                <Input
                                    type="text"
                                    value={form.emergencyContact}
                                    onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Height (cm)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={form.height}
                                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Current Weight (kg)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={form.currentWeight}
                                    onChange={(e) => setForm({ ...form, currentWeight: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Target Weight (kg)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={form.targetWeight}
                                    onChange={(e) => setForm({ ...form, targetWeight: e.target.value })}
                                />
                            </div>
                        </div>
                        <Button onClick={handleSave} className="w-full">
                            {editing ? "Update Member" : "Add Member"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Members;
