import {
    VendorSpendSummaryItem,
    formatCurrency,
    formatDisplayDate,
} from "@/features/costs";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";

interface CostVendorSummaryProps {
    items: VendorSpendSummaryItem[];
}

const columns: DataTableColumn<VendorSpendSummaryItem>[] = [
    { id: "vendor", label: "Vendor", render: (row) => <span className="font-medium">{row.vendor}</span> },
    { id: "totalAmount", label: "Total Spend", render: (row) => formatCurrency(row.totalAmount) },
    { id: "entryCount", label: "Entries", render: (row) => row.entryCount },
    { id: "averageAmount", label: "Average", render: (row) => formatCurrency(row.averageAmount) },
    { id: "overdueCount", label: "Overdue", render: (row) => row.overdueCount },
    { id: "latestCostDate", label: "Latest Cost Date", render: (row) => formatDisplayDate(row.latestCostDate) },
];

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
        <DataTable<VendorSpendSummaryItem>
            columns={columns}
            rows={items}
            rowKey={(row) => row.vendor}
        />
    );
}
