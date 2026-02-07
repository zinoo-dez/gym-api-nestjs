
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/layouts";
import { PrimaryButton, FormInput } from "@/components/gym";
import { FormTextarea } from "@/components/gym/form-textarea";
import { FormSelect } from "@/components/gym/form-select";
import { FormModal } from "@/components/gym/form-modal";
import { ConfirmationDialog } from "@/components/gym/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import {
  classesService,
  type ClassSchedule,
  type CreateClassRequest,
  type UpdateClassRequest,
} from "@/services/classes.service";
import { trainersService, type Trainer } from "@/services/trainers.service";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Clock,
  Calendar,
  Filter,
} from "lucide-react";

const WEEKDAY_OPTIONS = [
  { label: "Mon", value: "MO" },
  { label: "Tue", value: "TU" },
  { label: "Wed", value: "WE" },
  { label: "Thu", value: "TH" },
  { label: "Fri", value: "FR" },
  { label: "Sat", value: "SA" },
  { label: "Sun", value: "SU" },
];

export default function AdminClassesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    trainerId: "",
    schedule: "",
    duration: "",
    capacity: "",
    classType: "",
    recurrenceRule: "",
    occurrences: "",
    repeatWeekly: false,
    repeatDays: [] as string[],
    repeatEndDate: "",
    repeatCount: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    trainerId: "",
    schedule: "",
    duration: "",
    capacity: "",
    classType: "",
  });

  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true);
      setError(null);
      try {
        const [classesResponse, trainersResponse] = await Promise.all([
          classesService.getAll({ limit: 50 }),
          trainersService.getAll({ limit: 200 }),
        ]);
        setClasses(Array.isArray(classesResponse.data) ? classesResponse.data : []);
        setTrainers(Array.isArray(trainersResponse.data) ? trainersResponse.data : []);
      } catch (err) {
        console.error("Error loading classes:", err);
        setError("Failed to load classes.");
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  const filteredClasses = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return classes.filter((cls) => {
      const matchesSearch =
        cls.name.toLowerCase().includes(query) ||
        (cls.trainerName || "").toLowerCase().includes(query);
      const matchesCategory =
        filterCategory === "all" ||
        cls.classType.toLowerCase() === filterCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [classes, searchQuery, filterCategory]);

  const getStatusBadge = (cls: ClassSchedule) => {
    const enrolled = cls.availableSlots !== undefined
      ? cls.capacity - cls.availableSlots
      : 0;
    if (!cls.isActive) {
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
          Cancelled
        </Badge>
      );
    }
    if (enrolled >= cls.capacity) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
          Full
        </Badge>
      );
    }
    return (
      <Badge className="bg-primary/20 text-primary border-primary/30">
        Active
      </Badge>
    );
  };

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString();

  const toLocalInput = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}`;
  };

  const openCreate = () => {
    setCreateForm({
      name: "",
      description: "",
      trainerId: trainers[0]?.id || "",
      schedule: "",
      duration: "",
      capacity: "",
      classType: "",
      recurrenceRule: "",
      occurrences: "",
      repeatWeekly: false,
      repeatDays: [],
      repeatEndDate: "",
      repeatCount: "",
    });
    setIsCreateOpen(true);
  };

  const openEdit = (cls: ClassSchedule) => {
    setSelectedClass(cls);
    setEditForm({
      name: cls.name,
      description: cls.description || "",
      trainerId: cls.trainerId || "",
      schedule: toLocalInput(cls.schedule),
      duration: cls.duration.toString(),
      capacity: cls.capacity.toString(),
      classType: cls.classType,
    });
    setIsEditOpen(true);
  };

  const openDelete = (cls: ClassSchedule) => {
    setSelectedClass(cls);
    setIsDeleteOpen(true);
  };

  const toggleRepeatDay = (day: string) => {
    setCreateForm((prev) => {
      const exists = prev.repeatDays.includes(day);
      return {
        ...prev,
        repeatDays: exists
          ? prev.repeatDays.filter((d) => d !== day)
          : [...prev.repeatDays, day],
      };
    });
  };

  const buildWeeklyRRule = () => {
    if (!createForm.repeatWeekly || !createForm.schedule) return undefined;
    const start = new Date(createForm.schedule);
    if (Number.isNaN(start.getTime())) return undefined;

    const dayMap: Record<string, string> = {
      Sunday: "SU",
      Monday: "MO",
      Tuesday: "TU",
      Wednesday: "WE",
      Thursday: "TH",
      Friday: "FR",
      Saturday: "SA",
    };
    const startDay = Object.entries(dayMap).find(
      ([day]) => day === start.toLocaleDateString("en-US", { weekday: "long" }),
    )?.[1];

    const byDays =
      createForm.repeatDays.length > 0
        ? createForm.repeatDays
        : startDay
          ? [startDay]
          : [];

    const parts = [
      "FREQ=WEEKLY",
      byDays.length ? `BYDAY=${byDays.join(",")}` : "",
      `BYHOUR=${start.getHours()}`,
      `BYMINUTE=${start.getMinutes()}`,
    ].filter(Boolean);

    if (createForm.repeatEndDate) {
      const until = new Date(createForm.repeatEndDate);
      if (!Number.isNaN(until.getTime())) {
        const year = until.getFullYear();
        const month = String(until.getMonth() + 1).padStart(2, "0");
        const day = String(until.getDate()).padStart(2, "0");
        parts.push(`UNTIL=${year}${month}${day}`);
      }
    }

    return parts.join(";");
  };

  const handleCreate = async () => {
    setIsSaving(true);
    try {
      const generatedRule = buildWeeklyRRule();
      const occurrencesValue = createForm.repeatCount
        ? Number(createForm.repeatCount)
        : createForm.occurrences
          ? Number(createForm.occurrences)
          : undefined;

      const payload: CreateClassRequest = {
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        trainerId: createForm.trainerId,
        schedule: new Date(createForm.schedule).toISOString(),
        duration: Number(createForm.duration),
        capacity: Number(createForm.capacity),
        classType: createForm.classType.trim(),
        recurrenceRule: generatedRule || createForm.recurrenceRule.trim() || undefined,
        occurrences: occurrencesValue,
      };
      const created = await classesService.create(payload);
      setClasses((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      toast.success("Class created successfully");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to create class.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedClass) return;
    setIsSaving(true);
    try {
      const payload: UpdateClassRequest = {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        trainerId: editForm.trainerId,
        schedule: editForm.schedule
          ? new Date(editForm.schedule).toISOString()
          : undefined,
        duration: editForm.duration ? Number(editForm.duration) : undefined,
        capacity: editForm.capacity ? Number(editForm.capacity) : undefined,
        classType: editForm.classType.trim(),
      };
      const updated = await classesService.update(selectedClass.id, payload);
      setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setIsEditOpen(false);
      setSelectedClass(null);
      toast.success("Class updated successfully");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update class.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    setIsDeleting(true);
    try {
      await classesService.deactivate(selectedClass.id);
      setClasses((prev) =>
        prev.map((c) => (c.id === selectedClass.id ? { ...c, isActive: false } : c)),
      );
      setIsDeleteOpen(false);
      setSelectedClass(null);
      toast.success("Class deactivated");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to deactivate class.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const trainerOptions = [
    { label: "Select trainer", value: "" },
    ...trainers.map((trainer) => ({
      label: `${trainer.firstName} ${trainer.lastName}`,
      value: trainer.id,
    })),
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Class Management
            </h1>
            <p className="text-muted-foreground">
              Manage gym classes and schedules
            </p>
          </div>
          <PrimaryButton onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Class
          </PrimaryButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {classes.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Classes</p>
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
                  {classes.reduce(
                    (acc, cls) =>
                      acc +
                      (cls.availableSlots !== undefined
                        ? cls.capacity - cls.availableSlots
                        : 0),
                    0,
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/10 p-2">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {classes.filter(
                    (cls) =>
                      cls.availableSlots !== undefined &&
                      cls.capacity - cls.availableSlots >= cls.capacity,
                  ).length}
                </p>
                <p className="text-sm text-muted-foreground">Full Classes</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2">
                <Calendar className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {classes.filter((cls) => !cls.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search classes or instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              <option value="cardio">Cardio</option>
              <option value="strength">Strength</option>
              <option value="yoga">Yoga</option>
              <option value="dance">Dance</option>
            </select>
          </div>
        </div>

        {/* Classes Table */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Class
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Instructor
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Schedule
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Capacity
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
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Loading classes...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-destructive">
                      {error}
                    </td>
                  </tr>
                ) : filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No classes found.
                    </td>
                  </tr>
                ) : (
                filteredClasses.map((cls) => (
                  <tr
                    key={cls.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-foreground">{cls.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {cls.classType} - {cls.duration} min
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {cls.trainerName || "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-foreground">{formatDate(cls.schedule)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(cls.schedule)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: `${
                                cls.availableSlots !== undefined
                                  ? ((cls.capacity - cls.availableSlots) / cls.capacity) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {cls.availableSlots !== undefined
                            ? cls.capacity - cls.availableSlots
                            : 0}
                          /{cls.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(cls)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Edit class"
                          onClick={() => openEdit(cls)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Delete class"
                          onClick={() => openDelete(cls)}
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
      </div>

      <FormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Class"
        onSubmit={handleCreate}
        submitText="Create Class"
        isLoading={isSaving}
      >
        <FormInput
          label="Class Name"
          name="name"
          value={createForm.name}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <FormTextarea
          label="Description"
          name="description"
          value={createForm.description}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
        <FormSelect
          label="Trainer"
          value={createForm.trainerId}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, trainerId: e.target.value }))}
          options={trainerOptions}
          required
        />
        <FormInput
          label="Schedule"
          type="datetime-local"
          name="schedule"
          value={createForm.schedule}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, schedule: e.target.value }))}
          required
        />
        <FormInput
          label="Duration (minutes)"
          type="number"
          name="duration"
          value={createForm.duration}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, duration: e.target.value }))}
          min={15}
          required
        />
        <FormInput
          label="Capacity"
          type="number"
          name="capacity"
          value={createForm.capacity}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, capacity: e.target.value }))}
          min={1}
          required
        />
        <FormInput
          label="Class Type"
          name="classType"
          value={createForm.classType}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, classType: e.target.value }))}
          required
        />
        <div className="space-y-3 rounded-lg border border-border bg-background p-4">
          <label className="flex items-center gap-3 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={createForm.repeatWeekly}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  repeatWeekly: e.target.checked,
                  repeatDays: e.target.checked ? prev.repeatDays : [],
                  repeatEndDate: e.target.checked ? prev.repeatEndDate : "",
                  repeatCount: e.target.checked ? prev.repeatCount : "",
                }))
              }
            />
            Repeat weekly
          </label>

          {createForm.repeatWeekly && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Repeat on</p>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_OPTIONS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleRepeatDay(day.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        createForm.repeatDays.includes(day.value)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-muted-foreground border-border"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  label="Repeat until (optional)"
                  type="date"
                  name="repeatEndDate"
                  value={createForm.repeatEndDate}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, repeatEndDate: e.target.value }))
                  }
                />
                <FormInput
                  label="Occurrences (optional)"
                  type="number"
                  name="repeatCount"
                  value={createForm.repeatCount}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, repeatCount: e.target.value }))
                  }
                  min={1}
                  placeholder="e.g. 12"
                />
              </div>
            </div>
          )}
        </div>
      </FormModal>

      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Class"
        onSubmit={handleUpdate}
        submitText="Save Changes"
        isLoading={isSaving}
      >
        <FormInput
          label="Class Name"
          name="name"
          value={editForm.name}
          onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <FormTextarea
          label="Description"
          name="description"
          value={editForm.description}
          onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
        <FormSelect
          label="Trainer"
          value={editForm.trainerId}
          onChange={(e) => setEditForm((prev) => ({ ...prev, trainerId: e.target.value }))}
          options={trainerOptions}
          required
        />
        <FormInput
          label="Schedule"
          type="datetime-local"
          name="schedule"
          value={editForm.schedule}
          onChange={(e) => setEditForm((prev) => ({ ...prev, schedule: e.target.value }))}
        />
        <FormInput
          label="Duration (minutes)"
          type="number"
          name="duration"
          value={editForm.duration}
          onChange={(e) => setEditForm((prev) => ({ ...prev, duration: e.target.value }))}
          min={15}
        />
        <FormInput
          label="Capacity"
          type="number"
          name="capacity"
          value={editForm.capacity}
          onChange={(e) => setEditForm((prev) => ({ ...prev, capacity: e.target.value }))}
          min={1}
        />
        <FormInput
          label="Class Type"
          name="classType"
          value={editForm.classType}
          onChange={(e) => setEditForm((prev) => ({ ...prev, classType: e.target.value }))}
        />
      </FormModal>

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        title="Deactivate Class"
        description="This will deactivate the class schedule. You can re-activate later from the backend."
        confirmText="Deactivate"
        type="danger"
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
}
