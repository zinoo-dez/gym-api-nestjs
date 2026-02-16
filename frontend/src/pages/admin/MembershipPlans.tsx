import { useCallback, useEffect, useMemo, useState } from "react";
import {
  membershipsService,
  type MembershipPlan,
  type FeatureLevel,
  type CreateMembershipPlanRequest,
  type UpdateMembershipPlanRequest,
} from "@/services/memberships.service";
import { featuresService, type Feature } from "@/services/features.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

type FeatureSelection = Record<string, FeatureLevel>;

const MembershipPlans = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MembershipPlan | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    durationDays: "30",
    unlimitedClasses: false,
    personalTrainingHours: "0",
    accessToEquipment: true,
    accessToLocker: false,
    nutritionConsultation: false,
  });
  const [featureSelection, setFeatureSelection] = useState<FeatureSelection>({});

  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await membershipsService.getAllPlans({ limit: 200 });
      setPlans(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load plans", err);
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFeatures = useCallback(async () => {
    try {
      const response = await featuresService.getAll({ limit: 200 });
      setFeatures(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load features", err);
      setFeatures([]);
    }
  }, []);

  useEffect(() => {
    loadPlans();
    loadFeatures();
  }, [loadPlans, loadFeatures]);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      durationDays: "30",
      unlimitedClasses: false,
      personalTrainingHours: "0",
      accessToEquipment: true,
      accessToLocker: false,
      nutritionConsultation: false,
    });
    setFeatureSelection({});
  };

  const openAdd = () => {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (plan: MembershipPlan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      description: plan.description || "",
      price: String(plan.price ?? ""),
      durationDays: String(plan.durationDays ?? 30),
      unlimitedClasses: plan.unlimitedClasses ?? false,
      personalTrainingHours: String(plan.personalTrainingHours ?? 0),
      accessToEquipment: plan.accessToEquipment ?? true,
      accessToLocker: plan.accessToLocker ?? false,
      nutritionConsultation: plan.nutritionConsultation ?? false,
    });

    const selected: FeatureSelection = {};
    plan.planFeatures?.forEach((f) => {
      selected[f.featureId] = f.level;
    });
    setFeatureSelection(selected);
    setDialogOpen(true);
  };

  const hasFeature = (featureId: string) => featureSelection[featureId] !== undefined;

  const toggleFeature = (featureId: string) => {
    setFeatureSelection((prev) => {
      const next = { ...prev };
      if (next[featureId]) {
        delete next[featureId];
      } else {
        next[featureId] = "BASIC";
      }
      return next;
    });
  };

  const updateFeatureLevel = (featureId: string, level: FeatureLevel) => {
    setFeatureSelection((prev) => ({
      ...prev,
      [featureId]: level,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Plan name is required.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      toast.error("Plan price must be greater than 0.");
      return;
    }

    const payloadBase = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      durationDays: Number(form.durationDays || 30),
      unlimitedClasses: form.unlimitedClasses,
      personalTrainingHours: Number(form.personalTrainingHours || 0),
      accessToEquipment: form.accessToEquipment,
      accessToLocker: form.accessToLocker,
      nutritionConsultation: form.nutritionConsultation,
      features: Object.entries(featureSelection).map(([featureId, level]) => ({
        featureId,
        level,
      })),
    };

    try {
      if (editing) {
        const updated = await membershipsService.updatePlan(
          editing.id,
          payloadBase as UpdateMembershipPlanRequest,
        );
        setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Plan updated");
      } else {
        const created = await membershipsService.createPlan(
          payloadBase as CreateMembershipPlanRequest,
        );
        setPlans((prev) => [created, ...prev]);
        toast.success("Plan created");
      }
      setDialogOpen(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to save plan.";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await membershipsService.deletePlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
      toast.success("Plan deleted");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to delete plan.";
      toast.error(message);
    }
  };

  const featureRows = useMemo(() => {
    return features.map((feature) => ({
      ...feature,
      selected: hasFeature(feature.id),
      level: featureSelection[feature.id] || "BASIC",
    }));
  }, [features, featureSelection]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Tiered Memberships</p>
            <p className="text-sm text-gray-500">
              Configure and manage your gym's membership tiers, features, and pricing structures.
            </p>
          </div>
          <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create New Plan
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500">
            Loading membership plans...
          </div>
        ) : plans.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500">
            No plans found. Start by creating a new membership tier.
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{plan.name}</h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">${plan.price}</span>
                    <span className="text-xs text-gray-400 font-medium">/ {plan.durationDays} DAYS</span>
                  </div>
                </div>
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                  <Check className="h-5 w-5" />
                </div>
              </div>
              
              {plan.description && (
                <p className="text-sm text-gray-500 mb-6 line-clamp-2 min-h-[40px]">
                  {plan.description}
                </p>
              )}

              <div className="space-y-3 mb-8">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Core Features</p>
                <ul className="space-y-2.5">
                  {plan.features.slice(0, 5).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
                      <div className="rounded-full bg-emerald-50 p-0.5 text-emerald-600">
                        <Check className="h-3 w-3" />
                      </div>
                      {feature}
                    </li>
                  ))}
                  {plan.features.length > 5 && (
                    <li className="text-xs text-gray-400 font-medium pl-6">
                      + {plan.features.length - 5} more features
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(plan)}
                  className="flex-1 h-9 rounded-xl text-blue-600 hover:bg-blue-50 font-semibold"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit Tier
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-900">Delete Membership Plan</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-500">
                        Are you sure you want to delete the "{plan.name}" plan? This action cannot be undone and may affect active subscriptions.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl border-gray-200">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(plan.id)} className="rounded-xl bg-red-600 hover:bg-red-700">
                        Delete Plan
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">{editing ? "Update Plan Configuration" : "Design New Membership tier"}</DialogTitle>
            <p className="text-sm text-gray-500">Set pricing, duration, and feature permissions for this membership.</p>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plan Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-11 rounded-xl border-gray-200"
                  placeholder="e.g. Platinum Annual"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Public Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="h-11 rounded-xl border-gray-200"
                  placeholder="Summary of benefits..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Price ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="h-11 rounded-xl border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Duration (Days)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.durationDays}
                    onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                    className="h-11 rounded-xl border-gray-200"
                  />
                </div>
              </div>
              <div className="space-y-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Toggle Perks</p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-1">
                    <Label className="text-sm font-medium text-gray-700">Unlimited Classes</Label>
                    <Checkbox
                      checked={form.unlimitedClasses}
                      onCheckedChange={(value) => setForm({ ...form, unlimitedClasses: Boolean(value) })}
                      className="rounded-md border-gray-300"
                    />
                  </div>
                  <div className="flex items-center justify-between p-1">
                    <Label className="text-sm font-medium text-gray-700">Equipment Access</Label>
                    <Checkbox
                      checked={form.accessToEquipment}
                      onCheckedChange={(value) => setForm({ ...form, accessToEquipment: Boolean(value) })}
                      className="rounded-md border-gray-300"
                    />
                  </div>
                  <div className="flex items-center justify-between p-1">
                    <Label className="text-sm font-medium text-gray-700">Locker Access</Label>
                    <Checkbox
                      checked={form.accessToLocker}
                      onCheckedChange={(value) => setForm({ ...form, accessToLocker: Boolean(value) })}
                      className="rounded-md border-gray-300"
                    />
                  </div>
                  <div className="flex items-center justify-between p-1">
                    <Label className="text-sm font-medium text-gray-700">Nutrition Consultation</Label>
                    <Checkbox
                      checked={form.nutritionConsultation}
                      onCheckedChange={(value) => setForm({ ...form, nutritionConsultation: Boolean(value) })}
                      className="rounded-md border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Enhanced Features & Access levels</Label>
              {featureRows.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-gray-100 p-8 text-center">
                  <p className="text-sm text-gray-400">No system features defined.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {featureRows.map((feature) => (
                    <div
                      key={feature.id}
                      className={cn(
                        "rounded-2xl border p-4 transition-all",
                        feature.selected ? "border-blue-200 bg-blue-50/30 ring-1 ring-blue-100" : "border-gray-100 bg-white"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={feature.selected}
                          onCheckedChange={() => toggleFeature(feature.id)}
                          className="mt-1 rounded-md border-gray-300"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{feature.name}</span>
                            {feature.isSystem && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">System</span>}
                          </div>
                          {feature.selected && (
                            <Select
                              value={feature.level}
                              onValueChange={(value) => updateFeatureLevel(feature.id, value as FeatureLevel)}
                            >
                              <SelectTrigger className="h-8 w-full rounded-lg bg-white border-blue-200 text-xs font-semibold text-blue-700">
                                <SelectValue placeholder="Access Level" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-none shadow-xl">
                                <SelectItem value="BASIC">Basic Access</SelectItem>
                                <SelectItem value="STANDARD">Standard Access</SelectItem>
                                <SelectItem value="PREMIUM">Premium Access</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-8">
            <Button onClick={() => setDialogOpen(false)} variant="ghost" className="flex-1 h-12 rounded-xl text-gray-500 font-semibold">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100">
              {editing ? "Save Transformations" : "Launch Membership Plan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembershipPlans;
