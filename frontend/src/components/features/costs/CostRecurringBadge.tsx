import { COST_BILLING_PERIOD_LABELS, CostBillingPeriod, isRecurringBillingPeriod } from "@/features/costs";

interface CostRecurringBadgeProps {
  billingPeriod: CostBillingPeriod;
}

export function CostRecurringBadge({ billingPeriod }: CostRecurringBadgeProps) {
  if (!isRecurringBillingPeriod(billingPeriod)) {
    return null;
  }

  return (
    <span className="inline-flex items-center rounded-full bg-info/15 px-2.5 py-0.5 text-xs font-semibold text-info">
      Recurring · {COST_BILLING_PERIOD_LABELS[billingPeriod]}
    </span>
  );
}
