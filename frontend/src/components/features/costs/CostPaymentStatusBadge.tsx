import { COST_PAYMENT_STATUS_LABELS, CostPaymentStatus } from "@/features/costs";

interface CostPaymentStatusBadgeProps {
  status: CostPaymentStatus;
}

const STATUS_STYLES: Record<CostPaymentStatus, string> = {
  paid: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
  overdue: "bg-danger/15 text-destructive",
};

export function CostPaymentStatusBadge({ status }: CostPaymentStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {COST_PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
