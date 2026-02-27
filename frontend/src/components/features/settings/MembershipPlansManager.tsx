import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import {
  membershipPlanEditorSchema,
  type MembershipPlan,
  type MembershipPlanEditorFormValues,
  type MembershipPlanInput,
} from "@/features/settings";

interface MembershipPlansManagerProps {
  plans: MembershipPlan[];
  isSaving: boolean;
  onCreate: (values: MembershipPlanInput) => Promise<void>;
  onUpdate: (id: string, values: MembershipPlanInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const DEFAULT_PLAN_VALUES: MembershipPlanEditorFormValues = {
  name: "",
  price: 0,
  duration: "MONTHLY",
  features: [{ value: "" }],
};

export function MembershipPlansManager({
  plans,
  isSaving,
  onCreate,
  onUpdate,
  onDelete,
}: MembershipPlansManagerProps) {
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);

  const form = useForm<MembershipPlanEditorFormValues>({
    resolver: zodResolver(membershipPlanEditorSchema),
    defaultValues: DEFAULT_PLAN_VALUES,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const submitLabel = editingPlanId ? "Update Plan" : "Create Plan";

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => a.price - b.price);
  }, [plans]);

  const resetEditor = () => {
    setEditingPlanId(null);
    form.reset(DEFAULT_PLAN_VALUES);
  };

  const startEditing = (plan: MembershipPlan) => {
    setEditingPlanId(plan.id);

    form.reset({
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      features:
        plan.features.length > 0
          ? plan.features.map((feature) => ({ value: feature }))
          : [{ value: "" }],
    });
  };

  const handleSubmit = async (values: MembershipPlanEditorFormValues) => {
    const payload: MembershipPlanInput = {
      name: values.name.trim(),
      price: Number(values.price),
      duration: values.duration,
      features: values.features
        .map((feature) => feature.value.trim())
        .filter((feature) => feature.length > 0),
    };

    if (editingPlanId) {
      await onUpdate(editingPlanId, payload);
      resetEditor();
      return;
    }

    await onCreate(payload);
    resetEditor();
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this membership plan?");

    if (!confirmed) {
      return;
    }

    setActiveDeleteId(id);

    try {
      await onDelete(id);

      if (editingPlanId === id) {
        resetEditor();
      }
    } finally {
      setActiveDeleteId(null);
    }
  };

  const isSubmitting = isSaving || form.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Membership Plans</CardTitle>
          <CardDescription>
            Build, update, and remove plan tiers that members can subscribe to in your gym app.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form
            className="space-y-4 rounded-lg border bg-muted/20 p-4"
            onSubmit={form.handleSubmit((values) => void handleSubmit(values))}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name *</Label>
                <Input
                  id="planName"
                  placeholder="Pro"
                  aria-invalid={Boolean(form.formState.errors.name)}
                  hasError={Boolean(form.formState.errors.name)}
                  {...form.register("name")}
                />
                {form.formState.errors.name?.message ? (
                  <p className="error-text">{form.formState.errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="planPrice">Price *</Label>
                <Input
                  id="planPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="49.99"
                  aria-invalid={Boolean(form.formState.errors.price)}
                  hasError={Boolean(form.formState.errors.price)}
                  {...form.register("price", { valueAsNumber: true })}
                />
                {form.formState.errors.price?.message ? (
                  <p className="error-text">{form.formState.errors.price.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="planDuration">Duration *</Label>
                <Select id="planDuration" {...form.register("duration")}>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Features *</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => append({ value: "" })}>
                  <Plus className="size-4" />
                  Add Feature
                </Button>
              </div>

              <div className="space-y-2">
                {fields.map((field, index) => {
                  const featureError = form.formState.errors.features?.[index]?.value?.message;

                  return (
                    <div key={field.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={`Feature ${index + 1}`}
                          aria-invalid={Boolean(featureError)}
                          hasError={Boolean(featureError)}
                          {...form.register(`features.${index}.value`)}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          aria-label={`Remove feature ${index + 1}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      {featureError ? <p className="error-text">{featureError}</p> : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {submitLabel}
              </Button>

              {editingPlanId ? (
                <Button type="button" variant="outline" onClick={resetEditor} disabled={isSubmitting}>
                  Cancel Edit
                </Button>
              ) : null}
            </div>
          </form>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight">Existing Plans</h3>

            {sortedPlans.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                No membership plans yet. Add your first tier above.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-[620px] text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left">
                      <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Price</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Duration</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Features</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedPlans.map((plan) => (
                      <tr key={plan.id} className="border-b transition-colors last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium text-foreground">{plan.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{plan.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {plan.duration === "YEARLY" ? "Yearly" : "Monthly"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {plan.features.map((feature, featureIndex) => (
                              <span
                                key={`${plan.id}-feature-${featureIndex}`}
                                className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(plan)}
                              disabled={isSubmitting}
                            >
                              <Pencil className="size-4" />
                              Edit
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="danger"
                              onClick={() => void handleDelete(plan.id)}
                              disabled={activeDeleteId === plan.id || isSubmitting}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
