import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { ManagementPanel } from "@/components/features/people/ManagementPanel";
import { StaffFormValues } from "@/features/people";

interface StaffFormPanelProps {
  open: boolean;
  isMobile: boolean;
  mode: "add" | "edit";
  initialValues: StaffFormValues;
  roleOptions: string[];
  onClose: () => void;
  onSubmit: (values: StaffFormValues) => void | Promise<void>;
}

export function StaffFormPanel({
  open,
  isMobile,
  mode,
  initialValues,
  roleOptions,
  onClose,
  onSubmit,
}: StaffFormPanelProps) {
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
        staffRole: z.string().trim().min(1, "Role is required"),
        employeeId: z.string().trim().min(1, "Employee ID is required"),
        hireDate: z.string().trim().min(1, "Hire date is required"),
        department: z.string().trim().optional().default(""),
        position: z.string().trim().min(1, "Position is required"),
        emergencyContact: z.string().trim().optional().default(""),
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
  } = useForm<StaffFormValues>({
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
      <Button type="submit" form="staff-form" disabled={!isValid || isSubmitting}>
        {mode === "add" ? "Add Staff" : "Save Changes"}
      </Button>
    </div>
  );

  return (
    <ManagementPanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={mode === "add" ? "Add Staff" : "Edit Staff"}
      description="Manage administrative staff profile and operational role"
      footer={footer}
      className="max-w-3xl"
    >
      <form id="staff-form" className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Account Details</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="staff-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="staff-email"
                type="email"
                {...register("email")}
                disabled={mode === "edit"}
                hasError={Boolean(errors.email)}
              />
              {errors.email ? <p className="error-text">{errors.email.message}</p> : null}
            </div>

            {mode === "add" ? (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="staff-password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="staff-password"
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
          <h3 className="text-lg font-semibold tracking-tight">Personal Info</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff-first-name">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input id="staff-first-name" {...register("firstName")} hasError={Boolean(errors.firstName)} />
              {errors.firstName ? <p className="error-text">{errors.firstName.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-last-name">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input id="staff-last-name" {...register("lastName")} hasError={Boolean(errors.lastName)} />
              {errors.lastName ? <p className="error-text">{errors.lastName.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-phone">Phone</Label>
              <Input id="staff-phone" {...register("phone")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-emergency-contact">Emergency Contact</Label>
              <Input id="staff-emergency-contact" {...register("emergencyContact")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="staff-address">Address</Label>
              <Input id="staff-address" {...register("address")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="staff-avatar-url">Avatar URL</Label>
              <Input id="staff-avatar-url" {...register("avatarUrl")} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Role & Employment</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff-role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select id="staff-role" {...register("staffRole")}>
                <option value="">Select role</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
              {errors.staffRole ? <p className="error-text">{errors.staffRole.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-employee-id">
                Employee ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="staff-employee-id"
                {...register("employeeId")}
                hasError={Boolean(errors.employeeId)}
              />
              {errors.employeeId ? <p className="error-text">{errors.employeeId.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-hire-date">
                Hire Date <span className="text-destructive">*</span>
              </Label>
              <Input id="staff-hire-date" type="date" {...register("hireDate")} hasError={Boolean(errors.hireDate)} />
              {errors.hireDate ? <p className="error-text">{errors.hireDate.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-position">
                Position <span className="text-destructive">*</span>
              </Label>
              <Input id="staff-position" {...register("position")} hasError={Boolean(errors.position)} />
              {errors.position ? <p className="error-text">{errors.position.message}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="staff-department">Department</Label>
              <Input id="staff-department" {...register("department")} />
            </div>
          </div>
        </section>
      </form>
    </ManagementPanel>
  );
}
