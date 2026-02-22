import {
  COST_BILLING_PERIOD_LABELS,
  RecurringCostTrackItem,
  formatCurrency,
  formatDisplayDate,
} from "@/features/costs";
import { Card, CardContent } from "@/components/ui/Card";
import { CostPaymentStatusBadge } from "@/components/features/costs/CostPaymentStatusBadge";

interface CostRecurringTrackerProps {
  items: RecurringCostTrackItem[];
}

export function CostRecurringTracker({ items }: CostRecurringTrackerProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-base font-medium text-foreground">No recurring costs found.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add monthly, quarterly, or yearly costs to track recurring commitments.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/20">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Title</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Vendor</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Cycle</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Next Charge</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Payment</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 last:border-0">
              <td className="px-4 py-3 align-top text-foreground">{item.title}</td>
              <td className="px-4 py-3 align-top text-foreground">{item.vendor || "-"}</td>
              <td className="px-4 py-3 align-top text-foreground">
                {COST_BILLING_PERIOD_LABELS[item.billingPeriod]}
              </td>
              <td className="px-4 py-3 align-top text-foreground">{formatDisplayDate(item.nextChargeDate)}</td>
              <td className="px-4 py-3 align-top text-foreground">
                {formatCurrency(item.amount + item.taxAmount)}
              </td>
              <td className="px-4 py-3 align-top">
                <CostPaymentStatusBadge status={item.paymentStatus} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
