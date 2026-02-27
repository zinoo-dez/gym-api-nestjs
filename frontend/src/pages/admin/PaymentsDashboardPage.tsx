import { useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { goeyToast } from "goey-toast";

import {
  FinancialSummaryRibbon,
  InvoiceViewPanel,
  ManualPaymentPanel,
  PaymentStatusBadge,
  RefundConfirmationPanel,
} from "@/components/features/payments";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  toPaymentErrorMessage,
  useCancelAutoRenewMutation,
  useManualPaymentMutation,
  usePaymentCapabilitiesQuery,
  usePaymentMembersQuery,
  usePaymentSummaryQuery,
  usePaymentsQuery,
  useProcessRefundMutation,
} from "@/hooks/usePayments";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  BILLING_PAYMENT_METHODS,
  BILLING_PAYMENT_STATUSES,
  type BillingPaymentMethod,
  type BillingPaymentStatus,
  type ManualPaymentPayload,
  type PaymentTransaction,
  type PaymentsQueryFilters,
} from "@/services/payments.service";

interface PaymentsFilterState {
  search: string;
  status: BillingPaymentStatus | "ALL";
  paymentMethod: BillingPaymentMethod | "ALL";
  dateFrom: string;
  dateTo: string;
}

const DEFAULT_FILTERS: PaymentsFilterState = {
  search: "",
  status: "ALL",
  paymentMethod: "ALL",
  dateFrom: "",
  dateTo: "",
};

const paymentMethodLabels: Record<BillingPaymentMethod, string> = {
  CARD: "Card",
  CASH: "Cash",
  TRANSFER: "Transfer",
};

const subscriptionStatusBadgeStyle = (status?: string): string => {
  const normalized = status?.toUpperCase() ?? "";

  if (normalized === "ACTIVE") {
    return "bg-success/20 text-success";
  }

  if (normalized === "PENDING" || normalized === "TRIAL") {
    return "bg-warning/20 text-warning";
  }

  if (normalized === "CANCELLED" || normalized === "FAILED" || normalized === "EXPIRED") {
    return "bg-danger/20 text-destructive";
  }

  return "bg-secondary text-secondary-foreground";
};

const toStatusLabel = (value?: string): string => {
  const normalized = value?.trim().toUpperCase();

  if (!normalized) {
    return "Unknown";
  }

  return normalized
    .split("_")
    .filter((segment) => segment.length > 0)
    .map((segment) => `${segment[0]}${segment.slice(1).toLowerCase()}`)
    .join(" ");
};

const isAfterOrEqualDate = (left: Date, right: Date): boolean => left.getTime() >= right.getTime();

const isBeforeOrEqualDate = (left: Date, right: Date): boolean => left.getTime() <= right.getTime();

export function PaymentsDashboardPage() {
  const isMobile = useIsMobile();

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<PaymentsFilterState>(DEFAULT_FILTERS);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const [manualPanelOpen, setManualPanelOpen] = useState(false);
  const [invoicePanelOpen, setInvoicePanelOpen] = useState(false);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);

  const [refundPanelOpen, setRefundPanelOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState<PaymentTransaction | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFilters((current) => ({
        ...current,
        search: searchInput.trim(),
      }));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const queryFilters = useMemo<PaymentsQueryFilters>(
    () => ({
      search: filters.search || undefined,
      status: filters.status,
      paymentMethod: filters.paymentMethod,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      page: 1,
      limit: 100,
    }),
    [filters],
  );

  const paymentsQuery = usePaymentsQuery(queryFilters);
  const summaryQuery = usePaymentSummaryQuery();
  const membersQuery = usePaymentMembersQuery();
  const capabilitiesQuery = usePaymentCapabilitiesQuery();

  const manualPaymentMutation = useManualPaymentMutation();
  const refundMutation = useProcessRefundMutation();
  const cancelAutoRenewMutation = useCancelAutoRenewMutation();

  const canUseInvoice = capabilitiesQuery.data?.invoice ?? true;
  const canUseRefund = capabilitiesQuery.data?.refund ?? true;

  const visibleTransactions = useMemo(() => {
    const items = paymentsQuery.data?.data ?? [];

    return items.filter((transaction) => {
      if (filters.status !== "ALL" && transaction.status !== filters.status) {
        return false;
      }

      if (filters.paymentMethod !== "ALL" && transaction.paymentMethod !== filters.paymentMethod) {
        return false;
      }

      if (filters.search.length > 0) {
        const haystack = `${transaction.transactionId} ${transaction.memberName}`.toLowerCase();
        if (!haystack.includes(filters.search.toLowerCase())) {
          return false;
        }
      }

      const transactionDate = new Date(transaction.date);

      if (filters.dateFrom) {
        const fromDate = new Date(`${filters.dateFrom}T00:00:00`);

        if (Number.isFinite(transactionDate.getTime()) && Number.isFinite(fromDate.getTime())) {
          if (!isAfterOrEqualDate(transactionDate, fromDate)) {
            return false;
          }
        }
      }

      if (filters.dateTo) {
        const toDate = new Date(`${filters.dateTo}T23:59:59`);

        if (Number.isFinite(transactionDate.getTime()) && Number.isFinite(toDate.getTime())) {
          if (!isBeforeOrEqualDate(transactionDate, toDate)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [filters, paymentsQuery.data?.data]);

  useEffect(() => {
    if (visibleTransactions.length === 0) {
      setSelectedTransactionId(null);
      return;
    }

    setSelectedTransactionId((current) => {
      if (!current) {
        return visibleTransactions[0].id;
      }

      const exists = visibleTransactions.some((transaction) => transaction.id === current);
      return exists ? current : visibleTransactions[0].id;
    });
  }, [visibleTransactions]);

  const selectedTransaction = useMemo(
    () => visibleTransactions.find((transaction) => transaction.id === selectedTransactionId) ?? null,
    [selectedTransactionId, visibleTransactions],
  );

  const hasActiveFilters =
    filters.search.length > 0 ||
    filters.status !== "ALL" ||
    filters.paymentMethod !== "ALL" ||
    filters.dateFrom.length > 0 ||
    filters.dateTo.length > 0;

  const canCancelAutoRenew = useMemo(() => {
    if (!selectedTransaction?.subscription?.id) {
      return false;
    }

    if (selectedTransaction.subscription.autoRenew !== undefined) {
      return selectedTransaction.subscription.autoRenew;
    }

    const normalizedStatus = selectedTransaction.subscription.status.toUpperCase();
    return normalizedStatus === "ACTIVE" || normalizedStatus === "TRIAL" || normalizedStatus === "PENDING";
  }, [selectedTransaction]);

  const handleClearFilters = () => {
    setSearchInput("");
    setFilters(DEFAULT_FILTERS);
  };

  const handleOpenInvoice = (transaction: PaymentTransaction) => {
    if (!canUseInvoice) {
      goeyToast.error("Invoice endpoint is not available on this backend.");
      return;
    }
    setActiveInvoiceId(transaction.invoiceId || transaction.id);
    setInvoicePanelOpen(true);
  };

  const handleOpenRefund = (transaction: PaymentTransaction) => {
    if (!canUseRefund) {
      goeyToast.error("Refund endpoint is not available on this backend.");
      return;
    }
    setRefundTarget(transaction);
    setRefundPanelOpen(true);
  };

  const handleManualSubmit = async (payload: ManualPaymentPayload) => {
    try {
      await manualPaymentMutation.mutateAsync(payload);
      goeyToast.success("Manual payment recorded successfully.");
    } catch (error) {
      goeyToast.error(toPaymentErrorMessage(error));
      throw error;
    }
  };

  const handleRefundConfirm = async (reason: string) => {
    if (!refundTarget) {
      return;
    }

    try {
      await refundMutation.mutateAsync({
        paymentId: refundTarget.id,
        payload: { reason },
      });
      goeyToast.success("Refund processed successfully.");
      setRefundPanelOpen(false);
      setRefundTarget(null);
    } catch (error) {
      goeyToast.error(toPaymentErrorMessage(error));
      throw error;
    }
  };

  const handleCancelAutoRenew = async () => {
    if (!selectedTransaction?.subscription?.id) {
      return;
    }

    try {
      await cancelAutoRenewMutation.mutateAsync(selectedTransaction.subscription.id);
      goeyToast.success("Auto-renew has been cancelled.");
    } catch (error) {
      goeyToast.error(toPaymentErrorMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="page-title">Payment &amp; Billing Management</h1>
          <p className="body-text text-muted-foreground">
            Manage transactions, invoices, subscriptions, and refund workflows from one financial desk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outlined"
            onClick={() => void paymentsQuery.refetch()}
            disabled={paymentsQuery.isFetching}
          >
            <MaterialIcon 
              icon="refresh" 
              className={cn("text-lg", paymentsQuery.isFetching ? "animate-spin" : "")} 
            />
            <span>Refresh</span>
          </Button>
          <Button type="button" onClick={() => setManualPanelOpen(true)}>
            <MaterialIcon icon="add" className="text-lg" />
            <span>Collect Payment</span>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <FinancialSummaryRibbon
          title="Total Revenue (MTD)"
          value={formatCurrency(summaryQuery.data?.totalRevenueMtd ?? 0)}
          subtitle="Recognized successful payments this month"
          icon="payments"
          tone="success"
        />

        <FinancialSummaryRibbon
          title="Pending Invoices (Dues)"
          value={formatCurrency(summaryQuery.data?.pendingInvoicesDues ?? 0)}
          subtitle="Outstanding pending collections"
          icon="calendar_month"
          tone="warning"
        />

        <FinancialSummaryRibbon
          title="Recent Failed Payments"
          value={`${summaryQuery.data?.recentFailedPayments ?? 0}`}
          subtitle="Failed attempts in the last 14 days"
          icon="cancel"
          tone="danger"
        />
      </section>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>Transaction History</CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search transaction ID or member"
                className="w-full min-w-[220px] md:w-[280px]"
              />

              <Select
                value={filters.paymentMethod}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    paymentMethod: event.target.value as BillingPaymentMethod | "ALL",
                  }))
                }
                className="w-full md:w-[140px]"
              >
                <option value="ALL">All Methods</option>
                {BILLING_PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {paymentMethodLabels[method]}
                  </option>
                ))}
              </Select>

              <Select
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    status: event.target.value as BillingPaymentStatus | "ALL",
                  }))
                }
                className="w-full md:w-[150px]"
              >
                <option value="ALL">All Statuses</option>
                {BILLING_PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {toStatusLabel(status)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <label htmlFor="payments-filter-from" className="text-xs font-medium text-muted-foreground">
                From Date
              </label>
              <Input
                id="payments-filter-from"
                type="date"
                value={filters.dateFrom}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    dateFrom: event.target.value,
                  }))
                }
                aria-label="Filter from date"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="payments-filter-to" className="text-xs font-medium text-muted-foreground">
                To Date
              </label>
              <Input
                id="payments-filter-to"
                type="date"
                value={filters.dateTo}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    dateTo: event.target.value,
                  }))
                }
                aria-label="Filter to date"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="text"
                className="w-full justify-start"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
              >
                <MaterialIcon icon="filter_alt_off" className="text-lg" />
                <span>Clear Filters</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {paymentsQuery.isLoading ? (
            <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
              Loading payment transactions...
            </div>
          ) : null}

          {paymentsQuery.isError ? (
            <div className="space-y-3 rounded-md border border-destructive/40 bg-danger/5 p-4">
              <p className="text-sm text-destructive">{toPaymentErrorMessage(paymentsQuery.error)}</p>
              <Button type="button" variant="outlined" onClick={() => void paymentsQuery.refetch()}>
                Retry
              </Button>
            </div>
          ) : null}

          {!paymentsQuery.isLoading && !paymentsQuery.isError ? (
            <>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-[960px] text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left">
                      <th className="px-4 py-3 font-medium text-muted-foreground">Transaction ID</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Member Name</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Payment Method</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleTransactions.map((transaction) => {
                      const isSelected = transaction.id === selectedTransactionId;

                      return (
                        <tr
                          key={transaction.id}
                          className={cn(
                            "cursor-pointer border-b transition-colors hover:bg-muted/30",
                            isSelected ? "bg-muted/40" : "",
                          )}
                          onClick={() => setSelectedTransactionId(transaction.id)}
                        >
                          <td className="px-4 py-3 align-top">
                            <p className="font-medium text-foreground">{transaction.transactionId}</p>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <p className="text-foreground">{transaction.memberName}</p>
                            <p className="text-xs text-muted-foreground">{transaction.memberEmail || "-"}</p>
                          </td>
                          <td className="px-4 py-3 align-top font-medium text-foreground">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-4 py-3 align-top text-foreground">
                            {paymentMethodLabels[transaction.paymentMethod]}
                          </td>
                          <td className="px-4 py-3 align-top text-foreground">
                            {formatDate(transaction.date, "MMM d, yyyy · h:mm a") || "-"}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <PaymentStatusBadge status={transaction.status} />
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <div className="flex justify-end gap-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="outlined"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleOpenInvoice(transaction);
                                }}
                                disabled={!canUseInvoice}
                                title="View Invoice"
                              >
                                <MaterialIcon icon="receipt_long" className="text-lg" />
                                <span>Invoice</span>
                              </Button>

                              {canUseRefund ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="text"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleOpenRefund(transaction);
                                  }}
                                  className="text-destructive hover:bg-destructive/10 active:bg-destructive/20"
                                  title="Process Refund"
                                >
                                  <span>Refund</span>
                                </Button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {visibleTransactions.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">No transactions matched the current filters.</p>
                </div>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription &amp; Refund Management</CardTitle>
        </CardHeader>

        <CardContent>
          {selectedTransaction ? (
            <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
              <section className="space-y-3 rounded-md border bg-card p-4">
                <h3 className="text-lg font-semibold tracking-tight">Selected Payment</h3>

                <dl className="grid gap-2 text-sm md:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Member</dt>
                    <dd className="font-medium text-foreground">{selectedTransaction.memberName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Transaction</dt>
                    <dd className="font-medium text-foreground">{selectedTransaction.transactionId}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Amount</dt>
                    <dd className="font-medium text-foreground">{formatCurrency(selectedTransaction.amount)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <PaymentStatusBadge status={selectedTransaction.status} />
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="space-y-3 rounded-md border bg-card p-4">
                <h3 className="text-lg font-semibold tracking-tight">Subscription Status</h3>

                {selectedTransaction.subscription ? (
                  <>
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground">Plan:</span>{" "}
                      {selectedTransaction.subscription.planName || "Current subscription"}
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground">Period:</span>{" "}
                      {formatDate(selectedTransaction.subscription.startDate) || "-"} -{" "}
                      {formatDate(selectedTransaction.subscription.endDate) || "-"}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          subscriptionStatusBadgeStyle(selectedTransaction.subscription.status),
                        )}
                      >
                        {toStatusLabel(selectedTransaction.subscription.status)}
                      </span>

                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                        Auto-renew: {selectedTransaction.subscription.autoRenew === false ? "Off" : "On"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => void handleCancelAutoRenew()}
                        disabled={!canCancelAutoRenew || cancelAutoRenewMutation.isPending}
                      >
                        {cancelAutoRenewMutation.isPending ? "Cancelling..." : "Cancel Auto-renew"}
                      </Button>

                      {canUseRefund ? (
                        <Button
                          type="button"
                          variant="text"
                          onClick={() => handleOpenRefund(selectedTransaction)}
                          className="text-destructive hover:bg-destructive/10 active:bg-destructive/20"
                        >
                          Process Refund
                        </Button>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    No linked subscription details were returned for this payment.
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Select a transaction row to view subscription and refund controls.
            </div>
          )}
        </CardContent>
      </Card>

      <ManualPaymentPanel
        open={manualPanelOpen}
        onOpenChange={setManualPanelOpen}
        members={membersQuery.data ?? []}
        onSubmit={handleManualSubmit}
        isSubmitting={manualPaymentMutation.isPending}
        isMobile={isMobile}
      />

      <InvoiceViewPanel
        open={invoicePanelOpen}
        onClose={() => setInvoicePanelOpen(false)}
        invoiceId={activeInvoiceId}
        isMobile={isMobile}
      />

      <RefundConfirmationPanel
        open={refundPanelOpen}
        onOpenChange={(open) => {
          setRefundPanelOpen(open);
          if (!open) {
            setRefundTarget(null);
          }
        }}
        paymentId={refundTarget?.id ?? ""}
        amount={refundTarget?.amount ?? 0}
        transactionLabel={refundTarget?.transactionId}
        isSubmitting={refundMutation.isPending}
        onConfirm={handleRefundConfirm}
        isMobile={isMobile}
      />

      {summaryQuery.isError ? (
        <Card className="rounded-2xl border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4 text-destructive">
            <MaterialIcon icon="error" className="text-xl" />
            <span className="text-sm font-bold">{toPaymentErrorMessage(summaryQuery.error)}</span>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
