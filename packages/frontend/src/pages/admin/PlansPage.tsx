
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/layouts";
import { PrimaryButton, FormInput, FormCheckbox } from "@/components/gym";
import { FormTextarea } from "@/components/gym/form-textarea";
import { FormModal } from "@/components/gym/form-modal";
import { ConfirmationDialog } from "@/components/gym/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import {
  membershipsService,
  type MembershipPlan,
  type CreateMembershipPlanRequest,
  type UpdateMembershipPlanRequest,
} from "@/services/memberships.service";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Users,
  TrendingUp,
  Check,
} from "lucide-react";

export default function AdminPlansPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    durationDays: "",
    price: "",
    unlimitedClasses: false,
    personalTrainingHours: "",
    accessToEquipment: true,
    accessToLocker: false,
    nutritionConsultation: false,
  });
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    durationDays: "",
    price: "",
    unlimitedClasses: false,
    personalTrainingHours: "",
    accessToEquipment: true,
    accessToLocker: false,
    nutritionConsultation: false,
  });

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await membershipsService.getAllPlans({ limit: 50 });
        setPlans(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error loading plans:", err);
        setError("Failed to load plans.");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const filteredPlans = useMemo(
    () =>
      plans.filter((plan) =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [plans, searchQuery],
  );

  const totalRevenue = filteredPlans.reduce((acc, plan) => acc + plan.price, 0);

  const totalSubscribers = 0;

  const getStatusBadge = () => (
    <Badge className="bg-primary/20 text-primary border-primary/30">
      Active
    </Badge>
  );

  const openCreate = () => {
    setCreateForm({
      name: "",
      description: "",
      durationDays: "",
      price: "",
      unlimitedClasses: false,
      personalTrainingHours: "",
      accessToEquipment: true,
      accessToLocker: false,
      nutritionConsultation: false,
    });
    setIsCreateOpen(true);
  };

  const openEdit = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setEditForm({
      name: plan.name,
      description: plan.description || "",
      durationDays: plan.durationDays.toString(),
      price: plan.price.toString(),
      unlimitedClasses: plan.unlimitedClasses,
      personalTrainingHours: plan.personalTrainingHours.toString(),
      accessToEquipment: plan.accessToEquipment,
      accessToLocker: plan.accessToLocker,
      nutritionConsultation: plan.nutritionConsultation,
    });
    setIsEditOpen(true);
  };

  const openDelete = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setIsDeleteOpen(true);
  };

  const handleCreate = async () => {
    setIsSaving(true);
    try {
      const payload: CreateMembershipPlanRequest = {
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        durationDays: Number(createForm.durationDays),
        price: Number(createForm.price),
        unlimitedClasses: createForm.unlimitedClasses,
        personalTrainingHours: createForm.personalTrainingHours
          ? Number(createForm.personalTrainingHours)
          : 0,
        accessToEquipment: createForm.accessToEquipment,
        accessToLocker: createForm.accessToLocker,
        nutritionConsultation: createForm.nutritionConsultation,
      };
      const created = await membershipsService.createPlan(payload);
      setPlans((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      toast.success("Plan created successfully");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to create plan.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPlan) return;
    setIsSaving(true);
    try {
      const payload: UpdateMembershipPlanRequest = {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        durationDays: editForm.durationDays
          ? Number(editForm.durationDays)
          : undefined,
        price: editForm.price ? Number(editForm.price) : undefined,
        unlimitedClasses: editForm.unlimitedClasses,
        personalTrainingHours: editForm.personalTrainingHours
          ? Number(editForm.personalTrainingHours)
          : undefined,
        accessToEquipment: editForm.accessToEquipment,
        accessToLocker: editForm.accessToLocker,
        nutritionConsultation: editForm.nutritionConsultation,
      };
      const updated = await membershipsService.updatePlan(selectedPlan.id, payload);
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setIsEditOpen(false);
      setSelectedPlan(null);
      toast.success("Plan updated successfully");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update plan.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlan) return;
    setIsDeleting(true);
    try {
      await membershipsService.deletePlan(selectedPlan.id);
      setPlans((prev) => prev.filter((plan) => plan.id !== selectedPlan.id));
      setIsDeleteOpen(false);
      setSelectedPlan(null);
      toast.success("Plan deleted");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to delete plan.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Membership Plans
            </h1>
            <p className="text-muted-foreground">
              Manage pricing plans and subscriptions
            </p>
          </div>
          <PrimaryButton onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Plan
          </PrimaryButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  ${totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
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
                  {totalSubscribers}
                </p>
                <p className="text-sm text-muted-foreground">
                  Active Subscribers
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalSubscribers ? `$${(totalRevenue / totalSubscribers).toFixed(0)}` : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Avg Revenue/User</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {plans.length}
                </p>
                <p className="text-sm text-muted-foreground">Active Plans</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center text-muted-foreground">
              Loading plans...
            </div>
          ) : error ? (
            <div className="col-span-full text-center text-destructive">
              {error}
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground">
              No plans found.
            </div>
          ) : (
          filteredPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative rounded-lg border bg-card p-6 transition-all hover:border-primary/50 ${
                index === 1 ? "border-primary" : "border-border"
              }`}
            >
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {plan.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      /month
                    </span>
                  </div>
                </div>
                {getStatusBadge()}
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                — active subscribers
              </div>

              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  Revenue: —/mo
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Edit plan"
                    onClick={() => openEdit(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete plan"
                    onClick={() => openDelete(plan)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )))}
        </div>
      </div>

      <FormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Membership Plan"
        onSubmit={handleCreate}
        submitText="Create Plan"
        isLoading={isSaving}
      >
        <FormInput
          label="Plan Name"
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
        <FormInput
          label="Duration (days)"
          type="number"
          name="durationDays"
          value={createForm.durationDays}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, durationDays: e.target.value }))}
          min={1}
          required
        />
        <FormInput
          label="Price (monthly)"
          type="number"
          name="price"
          value={createForm.price}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, price: e.target.value }))}
          min={0}
          step="0.01"
          required
        />
        <FormInput
          label="Personal Training Hours"
          type="number"
          name="personalTrainingHours"
          value={createForm.personalTrainingHours}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, personalTrainingHours: e.target.value }))}
          min={0}
        />
        <div className="grid gap-2">
          <FormCheckbox
            label="Unlimited Classes"
            checked={createForm.unlimitedClasses}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, unlimitedClasses: e.target.checked }))}
          />
          <FormCheckbox
            label="Access to Equipment"
            checked={createForm.accessToEquipment}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, accessToEquipment: e.target.checked }))}
          />
          <FormCheckbox
            label="Locker Access"
            checked={createForm.accessToLocker}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, accessToLocker: e.target.checked }))}
          />
          <FormCheckbox
            label="Nutrition Consultation"
            checked={createForm.nutritionConsultation}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, nutritionConsultation: e.target.checked }))}
          />
        </div>
      </FormModal>

      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Membership Plan"
        onSubmit={handleUpdate}
        submitText="Save Changes"
        isLoading={isSaving}
      >
        <FormInput
          label="Plan Name"
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
        <FormInput
          label="Duration (days)"
          type="number"
          name="durationDays"
          value={editForm.durationDays}
          onChange={(e) => setEditForm((prev) => ({ ...prev, durationDays: e.target.value }))}
          min={1}
        />
        <FormInput
          label="Price (monthly)"
          type="number"
          name="price"
          value={editForm.price}
          onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
          min={0}
          step="0.01"
        />
        <FormInput
          label="Personal Training Hours"
          type="number"
          name="personalTrainingHours"
          value={editForm.personalTrainingHours}
          onChange={(e) => setEditForm((prev) => ({ ...prev, personalTrainingHours: e.target.value }))}
          min={0}
        />
        <div className="grid gap-2">
          <FormCheckbox
            label="Unlimited Classes"
            checked={editForm.unlimitedClasses}
            onChange={(e) => setEditForm((prev) => ({ ...prev, unlimitedClasses: e.target.checked }))}
          />
          <FormCheckbox
            label="Access to Equipment"
            checked={editForm.accessToEquipment}
            onChange={(e) => setEditForm((prev) => ({ ...prev, accessToEquipment: e.target.checked }))}
          />
          <FormCheckbox
            label="Locker Access"
            checked={editForm.accessToLocker}
            onChange={(e) => setEditForm((prev) => ({ ...prev, accessToLocker: e.target.checked }))}
          />
          <FormCheckbox
            label="Nutrition Consultation"
            checked={editForm.nutritionConsultation}
            onChange={(e) => setEditForm((prev) => ({ ...prev, nutritionConsultation: e.target.checked }))}
          />
        </div>
      </FormModal>

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        title="Delete Plan"
        description="This will delete the plan permanently. Plans with active subscriptions cannot be deleted."
        confirmText="Delete"
        type="danger"
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
}
