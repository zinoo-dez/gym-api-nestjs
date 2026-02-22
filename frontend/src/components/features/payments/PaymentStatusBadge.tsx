import type { BillingPaymentStatus } from "@/services/payments.service";

const PAYMENT_STATUS_LABELS: Record<BillingPaymentStatus, string> = {
  SUCCESS: "Success",
  PENDING: "Pending",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

const PAYMENT_STATUS_STYLES: Record<BillingPaymentStatus, string> = {
  SUCCESS: "bg-success/20 text-success",
  PENDING: "bg-warning/20 text-warning",
  FAILED: "bg-danger/20 text-danger",
  REFUNDED: "bg-secondary/70 text-secondary-foreground",
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
