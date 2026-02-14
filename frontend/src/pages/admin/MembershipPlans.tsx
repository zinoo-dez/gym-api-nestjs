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
    <div className="space-y-6 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Membership Plans</h1>
          <p className="text-muted-foreground">{plans.length} plans</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Loading plans...
            </CardContent>
          </Card>
        ) : plans.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No plans found.
            </CardContent>
          </Card>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.durationDays} days</span>
                </div>
                {plan.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(plan)}
                    className="flex-1"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                        <AlertDialogDescription>
                          Delete {plan.name}?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(plan.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.durationDays}
                  onChange={(e) =>
                    setForm({ ...form, durationDays: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Personal training hours</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.personalTrainingHours}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      personalTrainingHours: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Unlimited classes</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.unlimitedClasses}
                    onCheckedChange={(value) =>
                      setForm({
                        ...form,
                        unlimitedClasses: Boolean(value),
                      })
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    Include unlimited classes
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Equipment access</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.accessToEquipment}
                    onCheckedChange={(value) =>
                      setForm({
                        ...form,
                        accessToEquipment: Boolean(value),
                      })
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    Full equipment access
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Locker access</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.accessToLocker}
                    onCheckedChange={(value) =>
                      setForm({
                        ...form,
                        accessToLocker: Boolean(value),
                      })
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    Include locker access
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nutrition consultation</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={form.nutritionConsultation}
                  onCheckedChange={(value) =>
                    setForm({
                      ...form,
                      nutritionConsultation: Boolean(value),
                    })
                  }
                />
                <span className="text-sm text-muted-foreground">
                  Include nutrition consultation
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Plan Features</Label>
              {featureRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No features available. Create features first.
                </p>
              ) : (
                <div className="space-y-2">
                  {featureRows.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex flex-col gap-2 rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={feature.selected}
                            onCheckedChange={() => toggleFeature(feature.id)}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {feature.name}
                              </span>
                              {feature.isSystem && <Badge>System</Badge>}
                            </div>
                            {feature.description && (
                              <p className="text-xs text-muted-foreground">
                                {feature.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {feature.selected && (
                          <Select
                            value={feature.level}
                            onValueChange={(value) =>
                              updateFeatureLevel(feature.id, value as FeatureLevel)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BASIC">Basic</SelectItem>
                              <SelectItem value="STANDARD">Standard</SelectItem>
                              <SelectItem value="PREMIUM">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleSave} className="w-full">
              {editing ? "Update" : "Add"} Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembershipPlans;
