import {
  VendorSpendSummaryItem,
  formatCurrency,
  formatDisplayDate,
} from "@/features/costs";
import { Card, CardContent } from "@/components/ui/Card";

interface CostVendorSummaryProps {
  items: VendorSpendSummaryItem[];
}

export function CostVendorSummary({ items }: CostVendorSummaryProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-base font-medium text-foreground">No vendor data available.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign vendors to cost entries to monitor payee concentration and spend.
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
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Vendor</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total Spend</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Entries</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Average</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Overdue</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Latest Cost Date</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.vendor} className="border-b transition-colors hover:bg-muted/50 last:border-0">
              <td className="px-4 py-3 align-top font-medium text-foreground">{item.vendor}</td>
              <td className="px-4 py-3 align-top text-foreground">{formatCurrency(item.totalAmount)}</td>
              <td className="px-4 py-3 align-top text-foreground">{item.entryCount}</td>
              <td className="px-4 py-3 align-top text-foreground">{formatCurrency(item.averageAmount)}</td>
              <td className="px-4 py-3 align-top text-foreground">{item.overdueCount}</td>
              <td className="px-4 py-3 align-top text-foreground">{formatDisplayDate(item.latestCostDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
