import {
    COST_BILLING_PERIOD_LABELS,
    RecurringCostTrackItem,
    formatCurrency,
    formatDisplayDate,
} from "@/features/costs";
import { Card, CardContent } from "@/components/ui/Card";
import { CostPaymentStatusBadge } from "@/components/features/costs/CostPaymentStatusBadge";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";

interface CostRecurringTrackerProps {
    items: RecurringCostTrackItem[];
}

const columns: DataTableColumn<RecurringCostTrackItem>[] = [
    { id: "title", label: "Title", render: (row) => row.title },
    { id: "vendor", label: "Vendor", render: (row) => row.vendor || "-" },
    { id: "cycle", label: "Cycle", render: (row) => COST_BILLING_PERIOD_LABELS[row.billingPeriod] },
    { id: "nextCharge", label: "Next Charge", render: (row) => formatDisplayDate(row.nextChargeDate) },
    { id: "amount", label: "Amount", render: (row) => formatCurrency(row.amount + row.taxAmount) },
    { id: "payment", label: "Payment", render: (row) => <CostPaymentStatusBadge status={row.paymentStatus} /> },
];

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
        <DataTable<RecurringCostTrackItem>
            columns={columns}
            rows={items}
            rowKey={(row) => row.id}
        />
    );
}
