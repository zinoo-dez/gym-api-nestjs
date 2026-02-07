
import { useEffect, useMemo, useState, useCallback } from "react";
import { AdminLayout } from "@/layouts";
import { PrimaryButton, SecondaryButton, FormInput, FormCheckbox, Modal } from "@/components/gym";
import { FormTextarea } from "@/components/gym/form-textarea";
import { FormModal } from "@/components/gym/form-modal";
import { ConfirmationDialog } from "@/components/gym/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import {
  membershipsService,
  type MembershipPlan,
  type CreateMembershipPlanRequest,
  type UpdateMembershipPlanRequest,
  type FeatureLevel,
} from "@/services/memberships.service";
import {
  featuresService,
  type Feature,
} from "@/services/features.service";
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
  RotateCcw,
} from "lucide-react";

export default function AdminPlansPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [isFeatureCreateOpen, setIsFeatureCreateOpen] = useState(false);
  const [isFeatureEditOpen, setIsFeatureEditOpen] = useState(false);
  const [isFeatureDeleteOpen, setIsFeatureDeleteOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFeatureSaving, setIsFeatureSaving] = useState(false);
  const [isFeatureDeleting, setIsFeatureDeleting] = useState(false);
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
    planFeatures: [] as { featureId: string; level: FeatureLevel }[],
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
    planFeatures: [] as { featureId: string; level: FeatureLevel }[],
  });
  const [featureForm, setFeatureForm] = useState({
    name: "",
    description: "",
  });

  const loadPlans = useCallback(async () => {
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
  }, []);

  const loadFeatures = useCallback(async () => {
    try {
      const response = await featuresService.getAll({ limit: 200 });
      setFeatures(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error loading features:", err);
      setFeatures([]);
    }
  }, []);

  useEffect(() => {
    loadPlans();
    loadFeatures();
  }, [loadPlans, loadFeatures]);

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
      planFeatures: [],
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
      planFeatures: plan.planFeatures
        ? plan.planFeatures.map((feature) => ({
            featureId: feature.featureId,
            level: feature.level,
          }))
        : [],
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
        features: createForm.planFeatures,
      };
      await membershipsService.createPlan(payload);
      await loadPlans();
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
        features: editForm.planFeatures,
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

  const togglePlanFeature = (
    formType: "create" | "edit",
    featureId: string,
    checked: boolean,
  ) => {
    const updater = (prev: typeof createForm) => {
      const current = Array.isArray(prev.planFeatures)
        ? [...prev.planFeatures]
        : [];
      if (checked) {
        if (!current.find((item) => item.featureId === featureId)) {
          current.push({ featureId, level: "BASIC" });
        }
      } else {
        const next = current.filter((item) => item.featureId !== featureId);
        return { ...prev, planFeatures: next };
      }
      return { ...prev, planFeatures: current };
    };

    if (formType === "create") {
      setCreateForm(updater);
    } else {
      setEditForm(updater);
    }
  };

  const updatePlanFeatureLevel = (
    formType: "create" | "edit",
    featureId: string,
    level: FeatureLevel,
  ) => {
    const updater = (prev: typeof createForm) => {
      const current = Array.isArray(prev.planFeatures)
        ? [...prev.planFeatures]
        : [];
      const idx = current.findIndex((item) => item.featureId === featureId);
      if (idx >= 0) {
        current[idx] = { ...current[idx], level };
      }
      return { ...prev, planFeatures: current };
    };

    if (formType === "create") {
      setCreateForm(updater);
    } else {
      setEditForm(updater);
    }
  };

  const openFeatureManager = () => {
    setIsFeatureModalOpen(true);
  };

  const openFeatureCreate = () => {
    setFeatureForm({ name: "", description: "" });
    setIsFeatureModalOpen(false);
    setIsFeatureCreateOpen(true);
  };

  const openFeatureEdit = (feature: Feature) => {
    setSelectedFeature(feature);
    setFeatureForm({
      name: feature.name,
      description: feature.description || "",
    });
    setIsFeatureModalOpen(false);
    setIsFeatureEditOpen(true);
  };

  const openFeatureDelete = (feature: Feature) => {
    setSelectedFeature(feature);
    setIsFeatureModalOpen(false);
    setIsFeatureDeleteOpen(true);
  };

  const handleFeatureCreate = async () => {
    setIsFeatureSaving(true);
    try {
      await featuresService.create({
        name: featureForm.name.trim(),
        description: featureForm.description.trim() || undefined,
      });
      await loadFeatures();
      setIsFeatureCreateOpen(false);
      toast.success("Feature created");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to create feature.";
      toast.error(message);
    } finally {
      setIsFeatureSaving(false);
    }
  };

  const handleFeatureUpdate = async () => {
    if (!selectedFeature) return;
    setIsFeatureSaving(true);
    try {
      const updated = await featuresService.update(selectedFeature.id, {
        name: featureForm.name.trim(),
        description: featureForm.description.trim() || undefined,
      });
      setFeatures((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setIsFeatureEditOpen(false);
      setSelectedFeature(null);
      toast.success("Feature updated");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update feature.";
      toast.error(message);
    } finally {
      setIsFeatureSaving(false);
    }
  };

  const handleFeatureDelete = async () => {
    if (!selectedFeature) return;
    setIsFeatureDeleting(true);
    try {
      await featuresService.remove(selectedFeature.id);
      setFeatures((prev) => prev.filter((item) => item.id !== selectedFeature.id));
      setIsFeatureDeleteOpen(false);
      setSelectedFeature(null);
      toast.success("Feature deleted");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to delete feature.";
      toast.error(message);
    } finally {
      setIsFeatureDeleting(false);
    }
  };

  const handleFeatureRestoreDefault = async (feature: Feature) => {
    try {
      const updated = await featuresService.restoreDefaultName(feature.id);
      setFeatures((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success("Feature name restored to default");
      if (selectedFeature?.id === feature.id) {
        setFeatureForm((prev) => ({ ...prev, name: updated.name }));
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to restore default name.";
      toast.error(message);
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
          <div className="flex flex-col gap-2 sm:flex-row">
            <SecondaryButton onClick={openFeatureManager}>
              Manage Features
            </SecondaryButton>
            <PrimaryButton onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Plan
            </PrimaryButton>
          </div>
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
                {(plan.planFeatures && plan.planFeatures.length > 0
                  ? plan.planFeatures.map((feature) => ({
                      label: feature.name,
                      level: feature.level,
                    }))
                  : plan.features.map((feature) => ({
                      label: feature,
                      level: undefined as string | undefined,
                    }))
                ).map((feature, idx) => (
                  <li
                    key={`${feature.label}-${idx}`}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{feature.label}</span>
                      {feature.level && (
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                            feature.level === "PREMIUM"
                              ? "bg-primary/15 text-primary border-primary/30"
                              : feature.level === "STANDARD"
                              ? "bg-accent/15 text-accent-foreground border-accent/30"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {feature.level}
                        </span>
                      )}
                    </div>
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
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Plan Features</h4>
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={openFeatureManager}
            >
              Manage Features
            </button>
          </div>
          {features.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No features available yet.
            </p>
          ) : (
            <div className="space-y-2">
              {features.map((feature) => {
                const selected = createForm.planFeatures.find(
                  (item) => item.featureId === feature.id,
                );
                return (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
                  >
                    <FormCheckbox
                      label={feature.name}
                      checked={Boolean(selected)}
                      onChange={(e) =>
                        togglePlanFeature("create", feature.id, e.target.checked)
                      }
                    />
                    <select
                      className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                      value={selected?.level ?? "BASIC"}
                      onChange={(e) =>
                        updatePlanFeatureLevel(
                          "create",
                          feature.id,
                          e.target.value as FeatureLevel,
                        )
                      }
                      disabled={!selected}
                    >
                      <option value="BASIC">Basic</option>
                      <option value="STANDARD">Standard</option>
                      <option value="PREMIUM">Premium</option>
                    </select>
                  </div>
                );
              })}
            </div>
          )}
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
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Plan Features</h4>
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={openFeatureManager}
            >
              Manage Features
            </button>
          </div>
          {features.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No features available yet.
            </p>
          ) : (
            <div className="space-y-2">
              {features.map((feature) => {
                const selected = editForm.planFeatures.find(
                  (item) => item.featureId === feature.id,
                );
                return (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
                  >
                    <FormCheckbox
                      label={feature.name}
                      checked={Boolean(selected)}
                      onChange={(e) =>
                        togglePlanFeature("edit", feature.id, e.target.checked)
                      }
                    />
                    <select
                      className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                      value={selected?.level ?? "BASIC"}
                      onChange={(e) =>
                        updatePlanFeatureLevel(
                          "edit",
                          feature.id,
                          e.target.value as FeatureLevel,
                        )
                      }
                      disabled={!selected}
                    >
                      <option value="BASIC">Basic</option>
                      <option value="STANDARD">Standard</option>
                      <option value="PREMIUM">Premium</option>
                    </select>
                  </div>
                );
              })}
            </div>
          )}
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

      <Modal
        isOpen={isFeatureModalOpen}
        onClose={() => setIsFeatureModalOpen(false)}
        title="Manage Features"
        size="lg"
        footer={
          <PrimaryButton onClick={openFeatureCreate}>
            Add Feature
          </PrimaryButton>
        }
      >
        <div className="space-y-3">
          {features.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No features created yet.
            </p>
          ) : (
            features.map((feature) => (
              <div
                key={feature.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {feature.name}
                  </p>
                  {feature.description && (
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {feature.isSystem && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                      System
                    </Badge>
                  )}
                  <div className="flex gap-1">
                    {feature.isSystem && feature.name !== feature.defaultName && (
                      <button
                        type="button"
                        className="rounded-md p-2 text-primary hover:bg-primary/10"
                        title="Restore Default Name"
                        onClick={() => handleFeatureRestoreDefault(feature)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => openFeatureEdit(feature)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 disabled:hover:bg-transparent"
                      onClick={() => openFeatureDelete(feature)}
                      disabled={feature.isSystem}
                      title={feature.isSystem ? "System features cannot be deleted" : "Delete feature"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      <FormModal
        isOpen={isFeatureCreateOpen}
        onClose={() => setIsFeatureCreateOpen(false)}
        title="Create Feature"
        onSubmit={handleFeatureCreate}
        submitText="Save Feature"
        isLoading={isFeatureSaving}
      >
        <FormInput
          label="Feature Name"
          name="featureName"
          value={featureForm.name}
          onChange={(e) => setFeatureForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <FormTextarea
          label="Description"
          name="featureDescription"
          value={featureForm.description}
          onChange={(e) =>
            setFeatureForm((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
        />
      </FormModal>

      <FormModal
        isOpen={isFeatureEditOpen}
        onClose={() => setIsFeatureEditOpen(false)}
        title="Edit Feature"
        onSubmit={handleFeatureUpdate}
        submitText="Save Changes"
        isLoading={isFeatureSaving}
      >
        <FormInput
          label="Feature Name"
          name="featureName"
          value={featureForm.name}
          onChange={(e) => setFeatureForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <FormTextarea
          label="Description"
          name="featureDescription"
          value={featureForm.description}
          onChange={(e) =>
            setFeatureForm((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
        />
      </FormModal>

      <ConfirmationDialog
        isOpen={isFeatureDeleteOpen}
        title="Delete Feature"
        description="This will remove the feature from all plans."
        confirmText="Delete"
        type="danger"
        onCancel={() => setIsFeatureDeleteOpen(false)}
        onConfirm={handleFeatureDelete}
        isLoading={isFeatureDeleting}
      />
    </AdminLayout>
  );
}
