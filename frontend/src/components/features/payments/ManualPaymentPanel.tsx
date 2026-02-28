import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/animate-ui/components/radix/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { PaymentMemberOption } from "@/hooks/use-payments";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "@/components/features/people/ManagementPanel";
import {
    MANUAL_OFFLINE_PAYMENT_METHODS,
    PAYMENT_CATEGORIES,
    type ManualPaymentPayload,
} from "@/services/payments.service";
import {
    discountCodesService,
    type DiscountCode,
} from "@/services/discount-codes.service";

const paymentCategoryLabels: Record<
    (typeof PAYMENT_CATEGORIES)[number],
    string
> = {
    MEMBERSHIP: "Membership",
    PERSONAL_TRAINING: "Personal Training",
    PRODUCT: "Product",
};

const paymentMethodLabels: Record<
    (typeof MANUAL_OFFLINE_PAYMENT_METHODS)[number],
    string
> = {
    CASH: "Cash",
    CARD: "Card",
    BANK: "Bank",
    WALLET: "Wallet",
};

const manualPaymentFormSchema = z.object({
    memberId: z.string().trim().min(1, "Please select a member"),
    amount: z.coerce.number().positive("Amount must be a positive number"),
    paymentMethod: z.enum(MANUAL_OFFLINE_PAYMENT_METHODS),
    paymentCategory: z.enum(PAYMENT_CATEGORIES),
    notes: z
        .string()
        .trim()
        .max(500, "Notes must be 500 characters or less")
        .optional()
        .default(""),
    discountCodeId: z.string().optional(),
});

type ManualPaymentFormInput = z.input<typeof manualPaymentFormSchema>;
type ManualPaymentFormValues = z.output<typeof manualPaymentFormSchema>;

interface ManualPaymentPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    members: PaymentMemberOption[];
    onSubmit: (values: ManualPaymentPayload) => Promise<void> | void;
    isSubmitting?: boolean;
    isMobile?: boolean;
}

const defaultValues: ManualPaymentFormInput = {
    memberId: "",
    amount: 0,
    paymentMethod: "CASH",
    paymentCategory: "MEMBERSHIP",
    notes: "",
    discountCodeId: undefined,
};

export function ManualPaymentPanel({
    open,
    onOpenChange,
    members,
    onSubmit,
    isSubmitting = false,
    isMobile = false,
}: ManualPaymentPanelProps) {
    const [memberQuery, setMemberQuery] = useState("");
    const [memberSelectOpen, setMemberSelectOpen] = useState(false);
    const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);

    const {
        register,
        watch,
        setValue,
        reset,
        handleSubmit,
        formState: { errors, isValid, isSubmitting: isFormSubmitting },
    } = useForm<ManualPaymentFormInput, undefined, ManualPaymentFormValues>({
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
        if (open) {
            const fetchCodes = async () => {
                try {
                    const codes = await discountCodesService.listDiscountCodes({
                        isActive: true,
                    });
                    setDiscountCodes(codes);
                } catch {
                    setDiscountCodes([]);
                }
            };
            void fetchCodes();
        }
    }, [open]);

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
            paymentMethod: values.paymentMethod,
            paymentCategory: values.paymentCategory,
            notes: values.notes?.trim() || undefined,
            discountCodeId: values.discountCodeId,
        };

        try {
            await onSubmit(payload);
            onOpenChange(false);
            reset(defaultValues);
        } catch {
            // Keep panel open so the user can adjust and retry.
        }
    };

    const footer = (
        <div className="flex items-center justify-end gap-2">
            <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
            >
                Cancel
            </Button>
            <Button
                type="submit"
                form="manual-payment-form"
                disabled={!isValid || submitting}
            >
                {submitting ? "Saving..." : "Collect Payment"}
            </Button>
        </div>
    );

    return (
        <ManagementPanel
            open={open}
            onClose={() => onOpenChange(false)}
            isMobile={isMobile}
            title="Collect Payment"
            description="Record offline or walk-in transactions with secure validation and categorization."
            footer={footer}
            className="max-w-2xl"
        >
            <form
                id="manual-payment-form"
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-6"
            >
                <div className="space-y-2">
                    <Label htmlFor="payment-member-picker">
                        Member <span className="text-destructive">*</span>
                    </Label>

                    <Popover
                        open={memberSelectOpen}
                        onOpenChange={setMemberSelectOpen}
                    >
                        <PopoverTrigger asChild>
                            <button
                                id="payment-member-picker"
                                type="button"
                                className={cn(
                                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    errors.memberId
                                        ? "border-destructive focus-visible:ring-danger"
                                        : "",
                                )}
                                aria-expanded={memberSelectOpen}
                            >
                                <span
                                    className={cn(
                                        "truncate",
                                        !selectedMember
                                            ? "text-muted-foreground"
                                            : "text-foreground",
                                    )}
                                >
                                    {selectedMember
                                        ? selectedMember.fullName
                                        : "Search member by name or email"}
                                </span>
                                <ChevronsUpDown className="size-4 text-muted-foreground" />
                            </button>
                        </PopoverTrigger>

                        <PopoverContent
                            className="z-50 w-[var(--radix-popover-trigger-width)] rounded-xl border bg-card p-2 text-foreground shadow-elevation-3 border-border"
                            align="start"
                            sideOffset={8}
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
                                                    "flex w-full items-start justify-between rounded-lg px-4 py-2.5 text-left text-sm transition-all focus:outline-none",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "hover:bg-primary/10 active:bg-primary/20",
                                                )}
                                            >
                                                <span className="min-w-0">
                                                    <span className="block truncate font-medium">
                                                        {member.fullName}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "block truncate text-xs",
                                                            isSelected
                                                                ? "text-primary-foreground/90"
                                                                : "text-muted-foreground",
                                                        )}
                                                    >
                                                        {member.email}
                                                    </span>
                                                </span>
                                                {isSelected ? (
                                                    <Check className="mt-0.5 size-4" />
                                                ) : null}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="px-3 py-2 text-sm text-muted-foreground">
                                        No members match your search.
                                    </p>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {errors.memberId ? (
                        <p className="error-text">{errors.memberId.message}</p>
                    ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="manual-payment-amount">
                            Amount <span className="text-destructive">*</span>
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
                        {errors.amount ? (
                            <p className="error-text">{errors.amount.message}</p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="manual-payment-category">
                            Payment Category <span className="text-destructive">*</span>
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
                            Payment Method <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            id="manual-payment-method"
                            hasError={Boolean(errors.paymentMethod)}
                            {...register("paymentMethod")}
                        >
                            {MANUAL_OFFLINE_PAYMENT_METHODS.map((method) => (
                                <option key={method} value={method}>
                                    {paymentMethodLabels[method]}
                                </option>
                            ))}
                        </Select>
                        {errors.paymentMethod ? (
                            <p className="error-text">{errors.paymentMethod.message}</p>
                        ) : null}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="manual-payment-discount">Discount Code</Label>
                        <Select
                            id="manual-payment-discount"
                            {...register("discountCodeId")}
                        >
                            <option value="">No Discount</option>
                            {discountCodes.map((code) => (
                                <option key={code.id} value={code.id}>
                                    {code.code} ({code.type === "PERCENTAGE" ? `${code.amount}%` : `${code.amount} OFF`})
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
                    {errors.notes ? (
                        <p className="error-text">{errors.notes.message}</p>
                    ) : null}
                </div>
            </form>
        </ManagementPanel>
    );
}
