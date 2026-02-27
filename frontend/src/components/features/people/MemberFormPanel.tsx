import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { ManagementPanel } from "@/components/features/people/ManagementPanel";
import { MemberFormValues } from "@/features/people";

interface MemberFormPanelProps {
  open: boolean;
  isMobile: boolean;
  mode: "add" | "edit";
  initialValues: MemberFormValues;
  onClose: () => void;
  onSubmit: (values: MemberFormValues) => void | Promise<void>;
}

export function MemberFormPanel({
  open,
  isMobile,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: MemberFormPanelProps) {
  const schema = useMemo(() => {
    return z
      .object({
        email: z.string().email("Email is required"),
        password: z.string(),
        firstName: z.string().trim().min(1, "First name is required"),
        lastName: z.string().trim().min(1, "Last name is required"),
        phone: z.string().trim().optional().default(""),
        address: z.string().trim().optional().default(""),
        avatarUrl: z.string().trim().optional().default(""),
        dateOfBirth: z.string().trim().optional().default(""),
        gender: z.string().trim().optional().default(""),
        height: z.coerce.number().optional(),
        currentWeight: z.coerce.number().optional(),
        targetWeight: z.coerce.number().optional(),
        emergencyContact: z.string().trim().optional().default(""),
        initialPaymentAmount: z.coerce.number().optional(),
        paymentMethod: z.string().optional().default(""),
        transactionNo: z.string().optional().default(""),
        paymentNote: z.string().optional().default(""),
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
  } = useForm<MemberFormValues>({
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
      <Button type="button" variant="text" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" form="member-form" disabled={!isValid || isSubmitting}>
        {mode === "add" ? "Add Member" : "Save Changes"}
      </Button>
    </div>
  );

  return (
    <ManagementPanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={mode === "add" ? "Add Member" : "Edit Member"}
      description="Manage core member profile and account information"
      footer={footer}
      className="max-w-3xl"
    >
      <form id="member-form" className="space-y-6" onSubmit={handleSubmit(onSubmit as any)}>
        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Account Details</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="member-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="member-email"
                type="email"
                {...register("email")}
                disabled={mode === "edit"}
                hasError={Boolean(errors.email)}
              />
              {errors.email ? <p className="error-text">{errors.email.message}</p> : null}
            </div>

            {mode === "add" ? (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="member-password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="member-password"
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
          <h3 className="text-lg font-semibold tracking-tight">Personal Information</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="member-first-name">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="member-first-name"
                {...register("firstName")}
                hasError={Boolean(errors.firstName)}
              />
              {errors.firstName ? <p className="error-text">{errors.firstName.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-last-name">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="member-last-name"
                {...register("lastName")}
                hasError={Boolean(errors.lastName)}
              />
              {errors.lastName ? <p className="error-text">{errors.lastName.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-phone">Phone</Label>
              <Input id="member-phone" {...register("phone")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-emergency-contact">Emergency Contact</Label>
              <Input id="member-emergency-contact" {...register("emergencyContact")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-date-of-birth">Date of Birth</Label>
              <Input id="member-date-of-birth" type="date" {...register("dateOfBirth")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-gender">Gender</Label>
              <Input id="member-gender" {...register("gender")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-height">Height (cm)</Label>
              <Input
                id="member-height"
                type="number"
                step="0.1"
                min={0}
                {...register("height", {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-current-weight">Current Weight (kg)</Label>
              <Input
                id="member-current-weight"
                type="number"
                step="0.1"
                min={0}
                {...register("currentWeight", {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-target-weight">Target Weight (kg)</Label>
              <Input
                id="member-target-weight"
                type="number"
                step="0.1"
                min={0}
                {...register("targetWeight", {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-avatar-url">Avatar URL</Label>
              <Input id="member-avatar-url" {...register("avatarUrl")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="member-address">Address</Label>
              <Input id="member-address" {...register("address")} />
            </div>
          </div>
        </section>

        {mode === "add" ? (
          <section className="rounded-lg border bg-card p-4">
            <h3 className="text-lg font-semibold tracking-tight">Initial Payment Information</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Optional: Record the first payment or joining fee during registration.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="member-payment-amount">Payment Amount</Label>
                <Input
                  id="member-payment-amount"
                  type="number"
                  min={0}
                  {...register("initialPaymentAmount", {
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-payment-method">Payment Method</Label>
                <Select id="member-payment-method" {...register("paymentMethod")}>
                  <option value="">Select method</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="CARD">Credit/Debit Card</option>
                  <option value="WALLET">Mobile Wallet</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-payment-transaction">Transaction No / Ref</Label>
                <Input id="member-payment-transaction" {...register("transactionNo")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-payment-note">Payment Note</Label>
                <Input id="member-payment-note" {...register("paymentNote")} />
              </div>
            </div>
          </section>
        ) : null}
      </form>
    </ManagementPanel>
  );
}
