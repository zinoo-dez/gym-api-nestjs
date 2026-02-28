import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { getApiErrorMessage } from "@/lib/api-error";
import { peopleService } from "@/services/people.service";
import type { ApiPaginatedResponse } from "@/services/api.types";
import {
    type InvoicePdfDownload,
    type ManualPaymentPayload,
    type PaymentCapabilities,
    type PaymentInvoice,
    type PaymentSummary,
    type PaymentTransaction,
    type PaymentsQueryFilters,
    type ProcessRefundPayload,
    calculatePaymentSummary,
    paymentsService,
} from "@/services/payments.service";

export interface PaymentMemberOption {
    id: string;
    fullName: string;
    email: string;
    activeSubscriptionId?: string;
    activeSubscriptionStatus?: string;
    activePlanName?: string;
    autoRenew?: boolean;
}

const getActiveSubscription = (member: {
    subscriptions: Array<{
        id: string;
        status: string;
        membershipPlanName?: string;
    }>;
}) => {
    const activeStatuses = new Set(["ACTIVE", "TRIAL", "PENDING"]);

    const active = member.subscriptions.find((subscription) =>
        activeStatuses.has(subscription.status.toUpperCase()),
    );

    return active ?? member.subscriptions[0];
};

export const paymentsQueryKeys = {
    all: ["payments"] as const,
    list: (filters: PaymentsQueryFilters) => ["payments", "list", filters] as const,
    summary: () => ["payments", "summary"] as const,
    invoice: (invoiceId: string) => ["payments", "invoice", invoiceId] as const,
    capabilities: () => ["payments", "capabilities"] as const,
    members: () => ["payments", "members"] as const,
};

/**
 * @deprecated Use `getApiErrorMessage` from `@/lib/api-error` directly.
 * Kept for backward-compat with existing callers.
 */
export const toPaymentErrorMessage = (error: unknown): string =>
    getApiErrorMessage(error, "Unable to complete payment request.");

export const usePaymentsQuery = (filters: PaymentsQueryFilters) =>
    useQuery<ApiPaginatedResponse<PaymentTransaction>>({
        queryKey: paymentsQueryKeys.list(filters),
        queryFn: () => paymentsService.listPayments(filters),
        staleTime: 30_000,
        placeholderData: keepPreviousData,
    });

export const usePaymentSummaryQuery = () =>
    useQuery<ApiPaginatedResponse<PaymentTransaction>, unknown, PaymentSummary>({
        queryKey: paymentsQueryKeys.summary(),
        queryFn: () =>
            paymentsService.listPayments({
                page: 1,
                limit: 200,
            }),
        select: (result) => calculatePaymentSummary(result.data),
        staleTime: 30_000,
    });

export const usePaymentInvoiceQuery = (invoiceId: string | null, enabled = true) =>
    useQuery<PaymentInvoice>({
        queryKey: paymentsQueryKeys.invoice(invoiceId ?? "unknown"),
        queryFn: () => paymentsService.getInvoice(invoiceId ?? ""),
        enabled: Boolean(invoiceId) && enabled,
        staleTime: 60_000,
    });

export const usePaymentMembersQuery = () =>
    useQuery<PaymentMemberOption[]>({
        queryKey: paymentsQueryKeys.members(),
        queryFn: async () => {
            const members = await peopleService.listMembers();

            return members
                .map((member) => {
                    const activeSubscription = getActiveSubscription(member);

                    return {
                        id: member.id,
                        fullName: `${member.firstName} ${member.lastName}`.trim(),
                        email: member.email,
                        activeSubscriptionId: activeSubscription?.id,
                        activeSubscriptionStatus: activeSubscription?.status,
                        activePlanName: activeSubscription?.membershipPlanName,
                        autoRenew: activeSubscription ? ["ACTIVE", "TRIAL"].includes(activeSubscription.status.toUpperCase()) : undefined,
                    } satisfies PaymentMemberOption;
                })
                .sort((left, right) => left.fullName.localeCompare(right.fullName));
        },
        staleTime: 120_000,
    });

export const usePaymentCapabilitiesQuery = () =>
    useQuery<PaymentCapabilities>({
        queryKey: paymentsQueryKeys.capabilities(),
        queryFn: () => paymentsService.getCapabilities(),
        staleTime: 5 * 60_000,
    });

export const useManualPaymentMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ManualPaymentPayload) => paymentsService.createManualPayment(payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: paymentsQueryKeys.all });
        },
    });
};

export const useProcessRefundMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ paymentId, payload }: { paymentId: string; payload: ProcessRefundPayload }) =>
            paymentsService.processRefund(paymentId, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: paymentsQueryKeys.all });
        },
    });
};

export const useCancelAutoRenewMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (subscriptionId: string) => paymentsService.cancelAutoRenew(subscriptionId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: paymentsQueryKeys.all });
        },
    });
};

export const useDownloadInvoicePdfMutation = () =>
    useMutation<InvoicePdfDownload, unknown, string>({
        mutationFn: (invoiceId) => paymentsService.downloadInvoicePdf(invoiceId),
    });
