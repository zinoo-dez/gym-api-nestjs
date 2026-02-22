import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ManagementPanel } from "@/components/features/people/ManagementPanel";
import { TrainerFormValues } from "@/features/people";

interface TrainerFormPanelProps {
  open: boolean;
  isMobile: boolean;
  mode: "add" | "edit";
  initialValues: TrainerFormValues;
  onClose: () => void;
  onSubmit: (values: TrainerFormValues) => void | Promise<void>;
}

export function TrainerFormPanel({
  open,
  isMobile,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: TrainerFormPanelProps) {
  const schema = useMemo(() => {
    return z
      .object({
        email: z.string().email("Email is required"),
        password: z.string(),
        firstName: z.string().trim().min(1, "First name is required"),
        lastName: z.string().trim().min(1, "Last name is required"),
        address: z.string().trim().optional().default(""),
        avatarUrl: z.string().trim().optional().default(""),
        specializations: z.string().trim().min(1, "At least one specialization is required"),
        certifications: z.string().trim().optional().default(""),
        experience: z.coerce.number().optional(),
        hourlyRate: z.coerce.number().optional(),
      })
      .superRefine((values, ctx) => {
        if (mode === "add" && values.password.trim().length < 8) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Password must be at least 8 characters",
            path: ["password"],
          });
        }
      });
  }, [mode]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<TrainerFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [initialValues, open, reset]);

  const footer = (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" form="trainer-form" disabled={!isValid || isSubmitting}>
        {mode === "add" ? "Add Trainer" : "Save Changes"}
      </Button>
    </div>
  );

  return (
    <ManagementPanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={mode === "add" ? "Add Trainer" : "Edit Trainer"}
      description="Manage trainer profile, specialization, and workload details"
      footer={footer}
      className="max-w-3xl"
    >
      <form id="trainer-form" className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">Account Details</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="trainer-email">
                Email <span className="text-danger">*</span>
              </Label>
              <Input
                id="trainer-email"
                type="email"
                {...register("email")}
                disabled={mode === "edit"}
                hasError={Boolean(errors.email)}
              />
              {errors.email ? <p className="error-text">{errors.email.message}</p> : null}
            </div>

            {mode === "add" ? (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="trainer-password">
                  Password <span className="text-danger">*</span>
                </Label>
                <Input
                  id="trainer-password"
                  type="password"
                  {...register("password")}
                  hasError={Boolean(errors.password)}
                />
                {errors.password ? <p className="error-text">{errors.password.message}</p> : null}
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">Profile Information</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trainer-first-name">
                First Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="trainer-first-name"
                {...register("firstName")}
                hasError={Boolean(errors.firstName)}
              />
              {errors.firstName ? <p className="error-text">{errors.firstName.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainer-last-name">
                Last Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="trainer-last-name"
                {...register("lastName")}
                hasError={Boolean(errors.lastName)}
              />
              {errors.lastName ? <p className="error-text">{errors.lastName.message}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="trainer-address">Address</Label>
              <Input id="trainer-address" {...register("address")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="trainer-avatar-url">Avatar URL</Label>
              <Input id="trainer-avatar-url" {...register("avatarUrl")} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">Professional Details</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="trainer-specializations">
                Specializations <span className="text-danger">*</span>
              </Label>
              <Input
                id="trainer-specializations"
                {...register("specializations")}
                placeholder="Strength Training, HIIT"
                hasError={Boolean(errors.specializations)}
              />
              {errors.specializations ? (
                <p className="error-text">{errors.specializations.message}</p>
              ) : (
                <p className="small-text">Comma-separated values</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="trainer-certifications">Certifications</Label>
              <Input
                id="trainer-certifications"
                {...register("certifications")}
                placeholder="NASM, ACE"
              />
              <p className="small-text">Comma-separated values</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainer-experience">Experience (years)</Label>
              <Input
                id="trainer-experience"
                type="number"
                min={0}
                step={1}
                {...register("experience", {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainer-hourly-rate">Hourly Rate</Label>
              <Input
                id="trainer-hourly-rate"
                type="number"
                min={0}
                step="0.01"
                {...register("hourlyRate", {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
              />
            </div>
          </div>
        </section>
      </form>
    </ManagementPanel>
  );
}
