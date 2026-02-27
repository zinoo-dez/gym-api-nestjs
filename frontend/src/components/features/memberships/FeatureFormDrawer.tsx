import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  FeatureFormValues,
  isFeatureFormValid,
  normalizeFeatureFormValues,
  validateFeatureForm,
} from "@/features/memberships";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { Textarea } from "@/components/ui/Textarea";

interface FeatureFormDrawerProps {
  open: boolean;
  isMobile: boolean;
  mode: "add" | "edit";
  initialValues: FeatureFormValues;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: FeatureFormValues) => void | Promise<void>;
}

export function FeatureFormDrawer({
  open,
  isMobile,
  mode,
  initialValues,
  isSubmitting = false,
  onClose,
  onSubmit,
}: FeatureFormDrawerProps) {
  const [values, setValues] = useState<FeatureFormValues>(initialValues);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setShowErrors(false);
    }
  }, [initialValues, open]);

  const errors = useMemo(() => validateFeatureForm(values), [values]);
  const isValid = isFeatureFormValid(values);

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setShowErrors(true);

    if (!isValid || isSubmitting) {
      return;
    }

    await onSubmit(normalizeFeatureFormValues(values));
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" form="feature-form" disabled={!isValid || isSubmitting}>
        {mode === "add" ? "Add Feature" : "Save Feature"}
      </Button>
    </div>
  );

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={mode === "add" ? "Add Feature" : "Edit Feature"}
      description="Manage reusable membership features"
      footer={footer}
      className="max-w-2xl"
    >
      <form id="feature-form" className="space-y-6" onSubmit={submitForm}>
        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Feature Details</h3>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feature-name">
                Feature Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="feature-name"
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

            <div className="space-y-2">
              <Label htmlFor="feature-description">Description</Label>
              <Textarea
                id="feature-description"
                value={values.description}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Operational description for plan assignment"
              />
            </div>
          </div>
        </section>
      </form>
    </SlidePanel>
  );
}
