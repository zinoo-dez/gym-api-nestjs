import { User } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { formatCurrency } from "@/lib/currency";
import type { SaleRecord } from "@/services/product-sales.service";

interface SalesHistorySectionProps {
    sectionId: string;
    searchInput: string;
    onSearchInputChange: (value: string) => void;
    loading: boolean;
    errorMessage: string | null;
    onRetry: () => void;
    sales: SaleRecord[];
    currentPage: number;
    totalPages: number;
    onPreviousPage: () => void;
    onNextPage: () => void;
}

const columns: DataTableColumn<SaleRecord>[] = [
    {
        id: "date",
        label: "Date",
        render: (row) => (
            <div>
                <p className="text-foreground">{new Date(row.soldAt).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{row.saleNumber}</p>
            </div>
        ),
    },
    {
        id: "member",
        label: "Member",
        render: (row) => {
            const memberName = row.member
                ? `${row.member.firstName} ${row.member.lastName}`.trim()
                : "Walk-in";
            return (
                <div className="inline-flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <span className="text-foreground">{memberName}</span>
                </div>
            );
        },
    },
    {
        id: "total",
        label: "Total Amount",
        render: (row) => <span className="font-medium">{formatCurrency(row.total)}</span>,
    },
    {
        id: "items",
        label: "Items Purchased",
        render: (row) => (
            <p className="line-clamp-2">
                {row.items.map((item) => `${item.productName} x${item.quantity}`).join(", ")}
            </p>
        ),
    },
];

export function SalesHistorySection({
    sectionId,
    searchInput,
    onSearchInputChange,
    loading,
    errorMessage,
    onRetry,
    sales,
    currentPage,
    totalPages,
    onPreviousPage,
    onNextPage,
}: SalesHistorySectionProps) {
    return (
        <Card id={sectionId} className="scroll-mt-24">
            <CardHeader className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <CardTitle>Sales History</CardTitle>
                    <Input
                        value={searchInput}
                        onChange={(event) => onSearchInputChange(event.target.value)}
                        placeholder="Search sales by member, SKU, or sale number"
                        className="w-full max-w-sm"
                    />
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {errorMessage ? (
                    <div className="space-y-3 rounded-md border border-destructive/40 bg-danger/5 p-4">
                        <p className="text-sm text-destructive">{errorMessage}</p>
                        <Button type="button" variant="outline" onClick={onRetry}>
                            Retry
                        </Button>
                    </div>
                ) : null}

                {!errorMessage ? (
                    <>
                        <DataTable<SaleRecord>
                            columns={columns}
                            rows={sales}
                            rowKey={(row) => row.id}
                            isLoading={loading}
                            emptyTitle="No sales transactions found."
                            minWidth="760px"
                        />

                        {sales.length > 0 ? (
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={onPreviousPage} disabled={currentPage <= 1}>
                                        Previous
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" onClick={onNextPage} disabled={currentPage >= totalPages}>
                                        Next
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </>
                ) : null}
            </CardContent>
        </Card>
    );
}
