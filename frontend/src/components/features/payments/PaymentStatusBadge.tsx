import type { BillingPaymentStatus } from "@/services/payments.service";

const PAYMENT_STATUS_LABELS: Record<BillingPaymentStatus, string> = {
  SUCCESS: "Success",
  PENDING: "Pending",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

const PAYMENT_STATUS_STYLES: Record<BillingPaymentStatus, string> = {
  SUCCESS: "bg-tertiary-container text-on-tertiary-container",
  PENDING: "bg-error-container text-on-error-container",
  FAILED: "bg-error text-on-error",
  REFUNDED: "bg-surface-variant text-on-surface-variant",
};

interface PaymentStatusBadgeProps {
  status: BillingPaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_STATUS_STYLES[status]}`}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
