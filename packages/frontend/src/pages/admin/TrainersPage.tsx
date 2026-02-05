
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/layouts";
import { PrimaryButton, SecondaryButton, FormInput } from "@/components/gym";
import { FormTextarea } from "@/components/gym/form-textarea";
import { FormModal } from "@/components/gym/form-modal";
import { ConfirmationDialog } from "@/components/gym/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import {
  trainersService,
  type Trainer,
  type CreateTrainerRequest,
  type UpdateTrainerRequest,
} from "@/services/trainers.service";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Users,
  Mail,
  MoreVertical,
} from "lucide-react";

export default function AdminTrainersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    specializations: "",
    certifications: "",
    experience: "",
    hourlyRate: "",
  });
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    specializations: "",
    certifications: "",
    experience: "",
    hourlyRate: "",
  });

  useEffect(() => {
    const loadTrainers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await trainersService.getAll({ limit: 50 });
        setTrainers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error loading trainers:", err);
        setError("Failed to load trainers.");
        setTrainers([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrainers();
  }, []);

  const filteredTrainers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return trainers.filter((trainer) => {
      const name = `${trainer.firstName} ${trainer.lastName}`.toLowerCase();
      const matchesName = name.includes(query);
      const matchesSpecialization = trainer.specializations.some((spec) =>
        spec.toLowerCase().includes(query),
      );
      return matchesName || matchesSpecialization;
    });
  }, [trainers, searchQuery]);

  const parseList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const openCreate = () => {
    setCreateForm({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      specializations: "",
      certifications: "",
      experience: "",
      hourlyRate: "",
    });
    setIsCreateOpen(true);
  };

  const openEdit = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setEditForm({
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      specializations: trainer.specializations.join(", "),
      certifications: trainer.certifications.join(", "),
      experience: "",
      hourlyRate: "",
    });
    setIsEditOpen(true);
  };

  const openDelete = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setIsDeleteOpen(true);
  };

  const handleCreate = async () => {
    setIsSaving(true);
    try {
      const payload: CreateTrainerRequest = {
        email: createForm.email.trim(),
        password: createForm.password,
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        specializations: parseList(createForm.specializations),
        certifications: parseList(createForm.certifications),
        experience: createForm.experience ? Number(createForm.experience) : undefined,
        hourlyRate: createForm.hourlyRate ? Number(createForm.hourlyRate) : undefined,
      };
      const created = await trainersService.create(payload);
      setTrainers((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      toast.success("Trainer created successfully");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to create trainer.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTrainer) return;
    setIsSaving(true);
    try {
      const payload: UpdateTrainerRequest = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        specializations: parseList(editForm.specializations),
        certifications: parseList(editForm.certifications),
        experience: editForm.experience ? Number(editForm.experience) : undefined,
        hourlyRate: editForm.hourlyRate ? Number(editForm.hourlyRate) : undefined,
      };
      const updated = await trainersService.update(selectedTrainer.id, payload);
      setTrainers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setIsEditOpen(false);
      setSelectedTrainer(null);
      toast.success("Trainer updated successfully");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update trainer.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTrainer) return;
    setIsDeleting(true);
    try {
      await trainersService.deactivate(selectedTrainer.id);
      setTrainers((prev) =>
        prev.map((t) => (t.id === selectedTrainer.id ? { ...t, isActive: false } : t)),
      );
      setIsDeleteOpen(false);
      setSelectedTrainer(null);
      toast.success("Trainer deactivated");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to deactivate trainer.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-primary/20 text-primary border-primary/30">
          Active
        </Badge>
      );
    }
    return (
      <Badge className="bg-muted text-muted-foreground border-border">
        Inactive
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Trainer Management
            </h1>
            <p className="text-muted-foreground">
              Manage your gym trainers and staff
            </p>
          </div>
          <PrimaryButton onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Trainer
          </PrimaryButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {trainers.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Trainers</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {trainers.length ? "—" : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  —
                </p>
                <p className="text-sm text-muted-foreground">Total Clients</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/10 p-2">
                <Users className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  —
                </p>
                <p className="text-sm text-muted-foreground">On Leave</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search trainers or specializations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <SecondaryButton
              size="sm"
              className={viewMode === "grid" ? "bg-primary/20" : ""}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </SecondaryButton>
            <SecondaryButton
              size="sm"
              className={viewMode === "list" ? "bg-primary/20" : ""}
              onClick={() => setViewMode("list")}
            >
              List
            </SecondaryButton>
          </div>
        </div>

        {/* Trainers Grid */}
        {viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center text-muted-foreground">
                Loading trainers...
              </div>
            ) : error ? (
              <div className="col-span-full text-center text-destructive">
                {error}
              </div>
            ) : filteredTrainers.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground">
                No trainers found.
              </div>
            ) : (
            filteredTrainers.map((trainer) => (
              <div
                key={trainer.id}
                className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
                      <img
                        src="/placeholder.svg"
                        alt={`${trainer.firstName} ${trainer.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {trainer.firstName} {trainer.lastName}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        —
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                    aria-label="More options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {trainer.specializations.map((spec) => (
                    <Badge
                      key={spec}
                      variant="secondary"
                      className="bg-muted text-muted-foreground"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {trainer.email}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {getStatusBadge(trainer.isActive)}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Edit trainer"
                      onClick={() => openEdit(trainer)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete trainer"
                      onClick={() => openDelete(trainer)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Trainer
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Specializations
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Rating
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        Loading trainers...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-destructive">
                        {error}
                      </td>
                    </tr>
                  ) : filteredTrainers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No trainers found.
                      </td>
                    </tr>
                  ) : (
                  filteredTrainers.map((trainer) => (
                    <tr
                      key={trainer.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                            <img
                              src="/placeholder.svg"
                              alt={`${trainer.firstName} ${trainer.lastName}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {trainer.firstName} {trainer.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              —
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-foreground">{trainer.email}</p>
                        <p className="text-sm text-muted-foreground">
                          —
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {trainer.specializations.slice(0, 2).map((spec) => (
                            <Badge
                              key={spec}
                              variant="secondary"
                              className="bg-muted text-muted-foreground text-xs"
                            >
                              {spec}
                            </Badge>
                          ))}
                          {trainer.specializations.length > 2 && (
                            <Badge
                              variant="secondary"
                              className="bg-muted text-muted-foreground text-xs"
                            >
                              +{trainer.specializations.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-foreground">
                            —
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(trainer.isActive)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Edit trainer"
                            onClick={() => openEdit(trainer)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Delete trainer"
                            onClick={() => openDelete(trainer)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <FormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Trainer"
        onSubmit={handleCreate}
        submitText="Create Trainer"
        isLoading={isSaving}
      >
        <FormInput
          label="First Name"
          name="firstName"
          value={createForm.firstName}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, firstName: e.target.value }))}
          required
        />
        <FormInput
          label="Last Name"
          name="lastName"
          value={createForm.lastName}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, lastName: e.target.value }))}
          required
        />
        <FormInput
          label="Email"
          type="email"
          name="email"
          value={createForm.email}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <FormInput
          label="Password"
          type="password"
          name="password"
          value={createForm.password}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
        <FormTextarea
          label="Specializations"
          name="specializations"
          value={createForm.specializations}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, specializations: e.target.value }))}
          placeholder="e.g. Strength, HIIT, Yoga"
          required
          rows={3}
        />
        <FormTextarea
          label="Certifications"
          name="certifications"
          value={createForm.certifications}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, certifications: e.target.value }))}
          placeholder="e.g. NASM CPT, ACE"
          rows={2}
        />
        <FormInput
          label="Experience (years)"
          type="number"
          name="experience"
          value={createForm.experience}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, experience: e.target.value }))}
          min={0}
        />
        <FormInput
          label="Hourly Rate"
          type="number"
          name="hourlyRate"
          value={createForm.hourlyRate}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, hourlyRate: e.target.value }))}
          min={0}
          step="0.01"
        />
      </FormModal>

      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Trainer"
        onSubmit={handleUpdate}
        submitText="Save Changes"
        isLoading={isSaving}
      >
        <FormInput
          label="First Name"
          name="firstName"
          value={editForm.firstName}
          onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
          required
        />
        <FormInput
          label="Last Name"
          name="lastName"
          value={editForm.lastName}
          onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
          required
        />
        <FormTextarea
          label="Specializations"
          name="specializations"
          value={editForm.specializations}
          onChange={(e) => setEditForm((prev) => ({ ...prev, specializations: e.target.value }))}
          placeholder="e.g. Strength, HIIT, Yoga"
          required
          rows={3}
        />
        <FormTextarea
          label="Certifications"
          name="certifications"
          value={editForm.certifications}
          onChange={(e) => setEditForm((prev) => ({ ...prev, certifications: e.target.value }))}
          placeholder="e.g. NASM CPT, ACE"
          rows={2}
        />
        <FormInput
          label="Experience (years)"
          type="number"
          name="experience"
          value={editForm.experience}
          onChange={(e) => setEditForm((prev) => ({ ...prev, experience: e.target.value }))}
          min={0}
        />
        <FormInput
          label="Hourly Rate"
          type="number"
          name="hourlyRate"
          value={editForm.hourlyRate}
          onChange={(e) => setEditForm((prev) => ({ ...prev, hourlyRate: e.target.value }))}
          min={0}
          step="0.01"
        />
      </FormModal>

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        title="Deactivate Trainer"
        description="This will deactivate the trainer account. You can re-activate later from the backend."
        confirmText="Deactivate"
        type="danger"
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
}
