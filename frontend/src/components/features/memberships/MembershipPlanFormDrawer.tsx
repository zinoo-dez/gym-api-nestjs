import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  FEATURE_LEVEL_LABELS,
  FEATURE_LEVELS,
  FeatureLibraryRecord,
  MembershipPlanFormValues,
  MEMBERSHIP_PLAN_TYPE_LABELS,
  MEMBERSHIP_PLAN_TYPES,
  getDurationFromPlanType,
  isMembershipPlanFormValid,
  togglePlanFeatureSelection,
  updatePlanFeatureLevel,
  validateMembershipPlanForm,
} from "@/features/memberships";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { Textarea } from "@/components/ui/Textarea";

interface MembershipPlanFormDrawerProps {
  open: boolean;
  isMobile: boolean;
  mode: "add" | "edit";
  initialValues: MembershipPlanFormValues;
  features: FeatureLibraryRecord[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: MembershipPlanFormValues) => void | Promise<void>;
}

const FORM_STEPS = ["Basic Info", "Pricing & Duration", "Feature Selection"] as const;

export function MembershipPlanFormDrawer({
  open,
  isMobile,
  mode,
  initialValues,
  features,
  isSubmitting = false,
  onClose,
  onSubmit,
}: MembershipPlanFormDrawerProps) {
  const [values, setValues] = useState<MembershipPlanFormValues>(initialValues);
  const [step, setStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setStep(0);
      setShowErrors(false);
    }
  }, [initialValues, open]);

  const errors = useMemo(() => validateMembershipPlanForm(values), [values]);
  const isValid = isMembershipPlanFormValid(values);

  const canMoveNext =
    step === 0
      ? !errors.name
      : step === 1
        ? !errors.price && !errors.durationDays
        : true;

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setShowErrors(true);

    if (!isValid || isSubmitting) {
      return;
    }

    await onSubmit(values);
  };

  const footer = (
    <div className="flex flex-wrap justify-between gap-2">
      <div className="flex gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)}>
            Back
          </Button>
        ) : null}
      </div>

      {step < FORM_STEPS.length - 1 ? (
        <Button
          type="button"
          onClick={() => {
            setShowErrors(true);
            if (!canMoveNext) {
              return;
            }

            setStep((current) => current + 1);
          }}
        >
          Next
        </Button>
      ) : (
        <Button type="submit" form="membership-plan-form" disabled={!isValid || isSubmitting}>
          {mode === "add" ? "Add Plan" : "Save Changes"}
        </Button>
      )}
    </div>
  );

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={mode === "add" ? "Add Membership Plan" : "Edit Membership Plan"}
      description="Configure plan details, pricing, and feature assignment"
      footer={footer}
      className="max-w-3xl"
    >
      <form id="membership-plan-form" className="space-y-6" onSubmit={submitForm}>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap gap-2">
            {FORM_STEPS.map((stepLabel, stepIndex) => (
              <div
                key={stepLabel}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  stepIndex === step
                    ? "bg-primary/15 text-primary"
                    : stepIndex < step
                      ? "bg-success/20 text-success"
                      : "bg-secondary text-secondary-foreground"
                }`}
              >
                {stepIndex + 1}. {stepLabel}
              </div>
            ))}
          </div>
        </div>

        {step === 0 ? (
          <section className="rounded-lg border bg-card p-4">
            <h3 className="card-title">Basic Info</h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="plan-name">
                  Plan Name <span className="text-danger">*</span>
                </Label>
                <Input
                  id="plan-name"
                  value={values.name}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  hasError={showErrors && Boolean(errors.name)}
                />
                {showErrors && errors.name ? <p className="error-text">{errors.name}</p> : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="plan-description">Description</Label>
                <Textarea
                  id="plan-description"
                  value={values.description}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Internal description for admins"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-max-access">Max Access (Optional)</Label>
                <Input
                  id="plan-max-access"
                  type="number"
                  min={0}
                  value={values.maxAccess}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      maxAccess: event.target.value,
                    }))
                  }
                />
                <p className="small-text">Backend contract currently does not persist this field.</p>
              </div>
            </div>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="rounded-lg border bg-card p-4">
            <h3 className="card-title">Pricing & Duration</h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plan-type">
                  Plan Type <span className="text-danger">*</span>
                </Label>
                <Select
                  id="plan-type"
                  value={values.planType}
                  onChange={(event) => {
                    const nextPlanType = event.target.value as MembershipPlanFormValues["planType"];
                    setValues((current) => ({
                      ...current,
                      planType: nextPlanType,
                      durationDays: getDurationFromPlanType(nextPlanType, current.durationDays),
                    }));
                  }}
                >
                  {MEMBERSHIP_PLAN_TYPES.map((planType) => (
                    <option key={planType} value={planType}>
                      {MEMBERSHIP_PLAN_TYPE_LABELS[planType]}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-duration">
                  Duration (Days) <span className="text-danger">*</span>
                </Label>
                <Input
                  id="plan-duration"
                  type="number"
                  min={1}
                  value={values.durationDays}
                  readOnly={values.planType !== "custom"}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      durationDays: Number(event.target.value),
                    }))
                  }
                  hasError={showErrors && Boolean(errors.durationDays)}
                />
                {showErrors && errors.durationDays ? (
                  <p className="error-text">{errors.durationDays}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-price">
                  Price (USD) <span className="text-danger">*</span>
                </Label>
                <Input
                  id="plan-price"
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={values.price}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      price: Number(event.target.value),
                    }))
                  }
                  hasError={showErrors && Boolean(errors.price)}
                />
                {showErrors && errors.price ? <p className="error-text">{errors.price}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-pt-hours">Personal Training Hours</Label>
                <Input
                  id="plan-pt-hours"
                  type="number"
                  min={0}
                  step="0.5"
                  value={values.personalTrainingHours}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      personalTrainingHours: Number(event.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <label className="flex items-center gap-2 rounded-md border p-3">
                <input
                  type="checkbox"
                  checked={values.unlimitedClasses}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      unlimitedClasses: event.target.checked,
                    }))
                  }
                />
                Unlimited Classes
              </label>

              <label className="flex items-center gap-2 rounded-md border p-3">
                <input
                  type="checkbox"
                  checked={values.accessToEquipment}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      accessToEquipment: event.target.checked,
                    }))
                  }
                />
                Equipment Access
              </label>

              <label className="flex items-center gap-2 rounded-md border p-3">
                <input
                  type="checkbox"
                  checked={values.accessToLocker}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      accessToLocker: event.target.checked,
                    }))
                  }
                />
                Locker Access
              </label>

              <label className="flex items-center gap-2 rounded-md border p-3">
                <input
                  type="checkbox"
                  checked={values.nutritionConsultation}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      nutritionConsultation: event.target.checked,
                    }))
                  }
                />
                Nutrition Consultation
              </label>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="rounded-lg border bg-card p-4">
            <h3 className="card-title">Feature Selection</h3>

            <div className="mt-4 space-y-3">
              {features.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reusable features found. Create features from the Feature Library section.
                </p>
              ) : (
                features.map((feature) => {
                  const selectedFeature = values.selectedFeatures.find(
                    (item) => item.featureId === feature.id,
                  );

                  return (
                    <div key={feature.id} className="rounded-md border p-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <label className="flex items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedFeature)}
                            onChange={(event) =>
                              setValues((current) => ({
                                ...current,
                                selectedFeatures: togglePlanFeatureSelection(
                                  current.selectedFeatures,
                                  feature.id,
                                  event.target.checked,
                                ),
                              }))
                            }
                          />
                          <span>
                            <span className="font-medium text-foreground">{feature.name}</span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {feature.description || "No description"}
                            </span>
                          </span>
                        </label>

                        <div className="w-full md:w-40">
                          <Select
                            value={selectedFeature?.level ?? "BASIC"}
                            disabled={!selectedFeature}
                            onChange={(event) =>
                              setValues((current) => ({
                                ...current,
                                selectedFeatures: updatePlanFeatureLevel(
                                  current.selectedFeatures,
                                  feature.id,
                                  event.target.value as MembershipPlanFormValues["selectedFeatures"][number]["level"],
                                ),
                              }))
                            }
                          >
                            {FEATURE_LEVELS.map((level) => (
                              <option key={level} value={level}>
                                {FEATURE_LEVEL_LABELS[level]}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        ) : null}
      </form>
    </SlidePanel>
  );
}
