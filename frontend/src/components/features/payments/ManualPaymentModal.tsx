import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { PaymentMemberOption } from "@/hooks/usePayments";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import {
  BILLING_PAYMENT_METHODS,
  PAYMENT_CATEGORIES,
  type ManualPaymentPayload,
} from "@/services/payments.service";

const paymentMethodLabels: Record<(typeof BILLING_PAYMENT_METHODS)[number], string> = {
  CARD: "Card",
  CASH: "Cash",
  TRANSFER: "Transfer",
};

const paymentCategoryLabels: Record<(typeof PAYMENT_CATEGORIES)[number], string> = {
  MEMBERSHIP: "Membership",
  PERSONAL_TRAINING: "Personal Training",
  PRODUCT: "Product",
};

const manualPaymentFormSchema = z.object({
  memberId: z.string().trim().min(1, "Please select a member"),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  paymentCategory: z.enum(PAYMENT_CATEGORIES),
  paymentMethod: z.enum(BILLING_PAYMENT_METHODS),
  notes: z.string().trim().max(500, "Notes must be 500 characters or less").optional().default(""),
});

type ManualPaymentFormValues = z.infer<typeof manualPaymentFormSchema>;

interface ManualPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: PaymentMemberOption[];
  onSubmit: (values: ManualPaymentPayload) => Promise<void> | void;
  isSubmitting?: boolean;
}

const defaultValues: ManualPaymentFormValues = {
  memberId: "",
  amount: 0,
  paymentCategory: "MEMBERSHIP",
  paymentMethod: "CASH",
  notes: "",
};

export function ManualPaymentModal({
  open,
  onOpenChange,
  members,
  onSubmit,
  isSubmitting = false,
}: ManualPaymentModalProps) {
  const [memberQuery, setMemberQuery] = useState("");
  const [memberSelectOpen, setMemberSelectOpen] = useState(false);

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isValid, isSubmitting: isFormSubmitting },
  } = useForm<ManualPaymentFormValues>({
    resolver: zodResolver(manualPaymentFormSchema),
    mode: "onChange",
    defaultValues,
  });

  const selectedMemberId = watch("memberId");

  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId),
    [members, selectedMemberId],
  );

  const filteredMembers = useMemo(() => {
    const normalized = memberQuery.trim().toLowerCase();

    if (normalized.length === 0) {
      return members;
    }

    return members.filter((member) =>
      `${member.fullName} ${member.email}`.toLowerCase().includes(normalized),
    );
  }, [memberQuery, members]);

  useEffect(() => {
    if (!open) {
      setMemberQuery("");
      setMemberSelectOpen(false);
      reset(defaultValues);
    }
  }, [open, reset]);

  const submitting = isSubmitting || isFormSubmitting;

  const handleFormSubmit = async (values: ManualPaymentFormValues) => {
    const payload: ManualPaymentPayload = {
      memberId: values.memberId,
      amount: values.amount,
      paymentCategory: values.paymentCategory,
      paymentMethod: values.paymentMethod,
      notes: values.notes?.trim() || undefined,
    };

    try {
      await onSubmit(payload);
      onOpenChange(false);
      reset(defaultValues);
    } catch {
      // Keep the form open so the user can adjust and retry.
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card text-card-foreground shadow-lg">
          <div className="flex items-start justify-between border-b px-4 py-4 md:px-6">
            <div className="space-y-1">
              <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">
                Collect Payment
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                Record offline or walk-in transactions with secure validation and categorization.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </Dialog.Close>
          </div>

          <form id="manual-payment-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 p-4 md:p-6">
            <div className="space-y-2">
              <Label htmlFor="payment-member-picker">
                Member <span className="text-danger">*</span>
              </Label>

              <Popover.Root open={memberSelectOpen} onOpenChange={setMemberSelectOpen}>
                <Popover.Trigger asChild>
                  <button
                    id="payment-member-picker"
                    type="button"
                    className={cn(
                      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      errors.memberId ? "border-danger focus-visible:ring-danger" : "",
                    )}
                    aria-expanded={memberSelectOpen}
                  >
                    <span className={cn("truncate", !selectedMember ? "text-muted-foreground" : "text-foreground")}>
                      {selectedMember ? selectedMember.fullName : "Search member by name or email"}
                    </span>
                    <ChevronsUpDown className="size-4 text-muted-foreground" />
                  </button>
                </Popover.Trigger>

                <Popover.Portal>
                  <Popover.Content
                    className="z-50 w-[var(--radix-popover-trigger-width)] rounded-md border bg-card p-2 text-card-foreground shadow-md"
                    align="start"
                    sideOffset={4}
                  >
                    <div className="relative mb-2">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={memberQuery}
                        onChange={(event) => setMemberQuery(event.target.value)}
                        className="pl-9"
                        placeholder="Type to search members"
                      />
                    </div>

                    <div className="max-h-56 space-y-1 overflow-y-auto">
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map((member) => {
                          const isSelected = member.id === selectedMemberId;

                          return (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => {
                                setValue("memberId", member.id, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                                setMemberSelectOpen(false);
                              }}
                              className={cn(
                                "flex w-full items-start justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted/60",
                              )}
                            >
                              <span className="min-w-0">
                                <span className="block truncate font-medium">{member.fullName}</span>
                                <span
                                  className={cn(
                                    "block truncate text-xs",
                                    isSelected ? "text-primary-foreground/90" : "text-muted-foreground",
                                  )}
                                >
                                  {member.email}
                                </span>
                              </span>
                              {isSelected ? <Check className="mt-0.5 size-4" /> : null}
                            </button>
                          );
                        })
                      ) : (
                        <p className="px-3 py-2 text-sm text-muted-foreground">No members match your search.</p>
                      )}
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>

              {errors.memberId ? <p className="error-text">{errors.memberId.message}</p> : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="manual-payment-amount">
                  Amount <span className="text-danger">*</span>
                </Label>
                <Input
                  id="manual-payment-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  hasError={Boolean(errors.amount)}
                  placeholder="0.00"
                  {...register("amount")}
                />
                {errors.amount ? <p className="error-text">{errors.amount.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-payment-category">
                  Payment Category <span className="text-danger">*</span>
                </Label>
                <Select
                  id="manual-payment-category"
                  hasError={Boolean(errors.paymentCategory)}
                  {...register("paymentCategory")}
                >
                  {PAYMENT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {paymentCategoryLabels[category]}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="manual-payment-method">
                  Payment Method <span className="text-danger">*</span>
                </Label>
                <Select
                  id="manual-payment-method"
                  hasError={Boolean(errors.paymentMethod)}
                  {...register("paymentMethod")}
                >
                  {BILLING_PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {paymentMethodLabels[method]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-payment-notes">Notes</Label>
              <Textarea
                id="manual-payment-notes"
                placeholder="Optional details for this payment"
                className="min-h-28"
                {...register("notes")}
              />
              {errors.notes ? <p className="error-text">{errors.notes.message}</p> : null}
            </div>
          </form>

          <div className="flex items-center justify-end gap-2 border-t px-4 py-4 md:px-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" form="manual-payment-form" disabled={!isValid || submitting}>
              {submitting ? "Saving..." : "Collect Payment"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
