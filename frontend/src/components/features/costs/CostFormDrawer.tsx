import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAfter, isBefore, isValid, parseISO, startOfDay } from "date-fns";
import { z } from "zod";

import {
  COST_BILLING_PERIODS,
  COST_BILLING_PERIOD_LABELS,
  COST_CATEGORIES,
  COST_CATEGORY_LABELS,
  COST_PAYMENT_METHODS,
  COST_PAYMENT_METHOD_LABELS,
  COST_PAYMENT_STATUSES,
  COST_PAYMENT_STATUS_LABELS,
  COST_STATUSES,
  COST_STATUS_LABELS,
  COST_TYPES,
  COST_TYPE_LABELS,
  CostFormValues,
  getCostDateValidationHint,
  getCostDueDateValidationHint,
} from "@/features/costs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { Textarea } from "@/components/ui/Textarea";

const parseSafeDate = (value: string): Date | null => {
  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return null;
  }

  return startOfDay(parsed);
};

const costFormSchema = z
  .object({
    title: z.string().trim().min(1, "Cost title is required"),
    category: z.enum(COST_CATEGORIES),
    costType: z.enum(COST_TYPES),
    amount: z.coerce.number().positive("Amount must be positive"),
    taxAmount: z.coerce.number().min(0, "Tax amount must be 0 or higher"),
    paymentMethod: z.enum(COST_PAYMENT_METHODS),
    billingPeriod: z.enum(COST_BILLING_PERIODS),
    costDate: z.string().trim().min(1, "Cost date is required"),
    dueDate: z.string().trim().min(1, "Due date is required"),
    paidDate: z.string().trim().optional().default(""),
    paymentStatus: z.enum(COST_PAYMENT_STATUSES),
    budgetGroup: z.string().trim().optional().default(""),
    vendor: z.string().trim().optional().default(""),
    referenceNumber: z.string().trim().optional().default(""),
    notes: z.string().trim().optional().default(""),
    createdBy: z.string().trim().min(1, "Created by is required"),
    status: z.enum(COST_STATUSES),
  })
  .superRefine((values, ctx) => {
    const parsedCostDate = parseSafeDate(values.costDate);
    const parsedDueDate = parseSafeDate(values.dueDate);
    const parsedPaidDate = values.paidDate ? parseSafeDate(values.paidDate) : null;
    const today = startOfDay(new Date());

    if (!parsedCostDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cost date is invalid",
        path: ["costDate"],
      });
      return;
    }

    if (!parsedDueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date is invalid",
        path: ["dueDate"],
      });
      return;
    }

    if (isAfter(parsedCostDate, today)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cost date cannot be in the future",
        path: ["costDate"],
      });
    }

    if (isBefore(parsedDueDate, parsedCostDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date must be on or after cost date",
        path: ["dueDate"],
      });
    }

    if (values.paidDate && !parsedPaidDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Paid date is invalid",
        path: ["paidDate"],
      });
      return;
    }

    if (parsedPaidDate && isBefore(parsedPaidDate, parsedCostDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Paid date must be on or after cost date",
        path: ["paidDate"],
      });
    }

    if (parsedPaidDate && isAfter(parsedPaidDate, today)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Paid date cannot be in the future",
        path: ["paidDate"],
      });
    }

    if (values.paymentStatus === "paid" && !values.paidDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Paid date is required when payment status is paid",
        path: ["paidDate"],
      });
    }
  });

interface CostFormDrawerProps {
  open: boolean;
  isMobile: boolean;
  mode: "add" | "edit";
  initialValues: CostFormValues;
  onClose: () => void;
  onSubmit: (values: CostFormValues) => void | Promise<void>;
}

export function CostFormDrawer({
  open,
  isMobile,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: CostFormDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CostFormValues>({
    resolver: zodResolver(costFormSchema),
    mode: "onChange",
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [initialValues, open, reset]);

  const costDate = watch("costDate");
  const dueDate = watch("dueDate");
  const paymentStatus = watch("paymentStatus");

  useEffect(() => {
    if (paymentStatus !== "paid") {
      setValue("paidDate", "", { shouldDirty: true, shouldValidate: true });
    }
  }, [paymentStatus, setValue]);

  const footer = (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" form="cost-form" disabled={!isValid || isSubmitting}>
        {mode === "add" ? "Add Cost" : "Save Changes"}
      </Button>
    </div>
  );

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={mode === "add" ? "Add Cost" : "Edit Cost"}
      description="Record detailed operational cost data with payment tracking"
      footer={footer}
      className="max-w-3xl"
    >
      <form id="cost-form" className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Basic Details</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cost-title">
                Cost Title <span className="text-destructive">*</span>
              </Label>
              <Input id="cost-title" {...register("title")} hasError={Boolean(errors.title)} />
              {errors.title ? <p className="error-text">{errors.title.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                id="cost-category"
                {...register("category")}
                hasError={Boolean(errors.category)}
              >
                {COST_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {COST_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-budget-group">Budget Group</Label>
              <Input id="cost-budget-group" {...register("budgetGroup")} placeholder="e.g. Facilities" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-vendor">Vendor / Payee</Label>
              <Input id="cost-vendor" {...register("vendor")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-reference">Reference / Invoice Number</Label>
              <Input id="cost-reference" {...register("referenceNumber")} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Financial Details</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost-type">
                Cost Type <span className="text-destructive">*</span>
              </Label>
              <Select id="cost-type" {...register("costType")} hasError={Boolean(errors.costType)}>
                {COST_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {COST_TYPE_LABELS[type]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-payment-method">
                Payment Method <span className="text-destructive">*</span>
              </Label>
              <Select
                id="cost-payment-method"
                {...register("paymentMethod")}
                hasError={Boolean(errors.paymentMethod)}
              >
                {COST_PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {COST_PAYMENT_METHOD_LABELS[method]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-billing-period">
                Billing Period <span className="text-destructive">*</span>
              </Label>
              <Select
                id="cost-billing-period"
                {...register("billingPeriod")}
                hasError={Boolean(errors.billingPeriod)}
              >
                {COST_BILLING_PERIODS.map((period) => (
                  <option key={period} value={period}>
                    {COST_BILLING_PERIOD_LABELS[period]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-amount">
                Base Amount (USD) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cost-amount"
                type="number"
                min={0.01}
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                hasError={Boolean(errors.amount)}
              />
              {errors.amount ? <p className="error-text">{errors.amount.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-tax-amount">Tax Amount (USD)</Label>
              <Input
                id="cost-tax-amount"
                type="number"
                min={0}
                step="0.01"
                {...register("taxAmount", { valueAsNumber: true })}
                hasError={Boolean(errors.taxAmount)}
              />
              {errors.taxAmount ? <p className="error-text">{errors.taxAmount.message}</p> : null}
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Payment Tracking</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost-date">
                Cost Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cost-date"
                type="date"
                {...register("costDate")}
                hasError={Boolean(errors.costDate)}
              />
              {errors.costDate ? (
                <p className="error-text">{errors.costDate.message}</p>
              ) : (
                <p className="small-text">{getCostDateValidationHint(costDate)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-due-date">
                Due Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cost-due-date"
                type="date"
                {...register("dueDate")}
                hasError={Boolean(errors.dueDate)}
              />
              {errors.dueDate ? (
                <p className="error-text">{errors.dueDate.message}</p>
              ) : (
                <p className="small-text">{getCostDueDateValidationHint(dueDate)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-payment-status">
                Payment Status <span className="text-destructive">*</span>
              </Label>
              <Select
                id="cost-payment-status"
                {...register("paymentStatus")}
                hasError={Boolean(errors.paymentStatus)}
              >
                {COST_PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {COST_PAYMENT_STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-paid-date">Paid Date</Label>
              <Input
                id="cost-paid-date"
                type="date"
                {...register("paidDate")}
                hasError={Boolean(errors.paidDate)}
                disabled={paymentStatus !== "paid"}
              />
              {errors.paidDate ? <p className="error-text">{errors.paidDate.message}</p> : null}
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Notes & Metadata</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cost-notes">Notes</Label>
              <Textarea
                id="cost-notes"
                {...register("notes")}
                placeholder="Optional context for audit and reconciliation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-created-by">
                Created By <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cost-created-by"
                {...register("createdBy")}
                hasError={Boolean(errors.createdBy)}
                readOnly
              />
              {errors.createdBy ? <p className="error-text">{errors.createdBy.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-status">
                Record Status <span className="text-destructive">*</span>
              </Label>
              <Select id="cost-status" {...register("status")} hasError={Boolean(errors.status)}>
                {COST_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {COST_STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </section>
      </form>
    </SlidePanel>
  );
}
