import { useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { format, isValid, parseISO } from "date-fns";

import type { ExportFormat, ReportActivityRow } from "@/features/reports";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

import { TableSkeleton } from "./ReportsSkeleton";

type SortColumn = "member" | "action" | "category" | "amount" | "status" | "timestamp";
type SortDirection = "asc" | "desc";

interface RecentTransactionsTableProps {
    rows: ReportActivityRow[];
    loading: boolean;
    exportingFormat: ExportFormat | null;
    onExport: (format: ExportFormat) => void;
    errorMessage?: string;
}

const toDateTimeLabel = (value: string): string => {
    const parsed = parseISO(value);

    if (!isValid(parsed)) {
        return value;
    }

    return format(parsed, "MMM d, yyyy h:mm a");
};

const statusToneClass = (status: string): string => {
    const normalized = status.trim().toLowerCase();

    if (normalized === "completed") {
        return "bg-success/20 text-success";
    }

    if (normalized === "pending") {
        return "bg-warning/20 text-warning";
    }

    if (normalized === "failed") {
        return "bg-danger/20 text-destructive";
    }

    return "bg-secondary text-secondary-foreground";
};

const compareValues = (
    left: string | number | null,
    right: string | number | null,
    direction: SortDirection,
): number => {
    if (left === right) {
        return 0;
    }

    if (left === null) {
        return 1;
    }

    if (right === null) {
        return -1;
    }

    if (typeof left === "number" && typeof right === "number") {
        return direction === "asc" ? left - right : right - left;
    }

    const result = String(left).localeCompare(String(right), undefined, { sensitivity: "base" });
    return direction === "asc" ? result : -result;
};

const transactionColumns: DataTableColumn<ReportActivityRow>[] = [
    { id: "member", label: "Member", sortable: true, render: (row) => <span className="font-medium">{row.member}</span> },
    { id: "action", label: "Activity", sortable: true, render: (row) => row.action },
    { id: "category", label: "Category", sortable: true, render: (row) => row.category },
    {
        id: "amount",
        label: "Amount",
        sortable: true,
        render: (row) => (row.amount === null ? "—" : formatCurrency(row.amount)),
    },
    {
        id: "status",
        label: "Status",
        sortable: true,
        render: (row) => (
            <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold", statusToneClass(row.status))}>
                {row.status}
            </span>
        ),
    },
    { id: "timestamp", label: "Date", sortable: true, render: (row) => <span className="text-muted-foreground">{toDateTimeLabel(row.timestamp)}</span> },
];

export function RecentTransactionsTable({
    rows,
    loading,
    exportingFormat,
    onExport,
    errorMessage,
}: RecentTransactionsTableProps) {
    const [sortColumn, setSortColumn] = useState<SortColumn>("timestamp");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const sortedRows = useMemo(() => {
        const nextRows = [...rows];

        nextRows.sort((left, right) => {
            if (sortColumn === "amount") {
                return compareValues(left.amount, right.amount, sortDirection);
            }

            if (sortColumn === "timestamp") {
                const leftTime = parseISO(left.timestamp).getTime();
                const rightTime = parseISO(right.timestamp).getTime();

                return compareValues(
                    Number.isFinite(leftTime) ? leftTime : null,
                    Number.isFinite(rightTime) ? rightTime : null,
                    sortDirection,
                );
            }

            return compareValues((left as any)[sortColumn], (right as any)[sortColumn], sortDirection);
        });

        return nextRows;
    }, [rows, sortColumn, sortDirection]);

    const toggleSort = (field: string) => {
        const column = field as SortColumn;
        if (column === sortColumn) {
            setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
            return;
        }

        setSortColumn(column);
        setSortDirection(column === "timestamp" ? "desc" : "asc");
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <p className="small-text mt-1">Sorted activity feed with export-ready transaction details.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outlined"
                        size="sm"
                        onClick={() => onExport("csv")}
                        disabled={exportingFormat !== null}
                    >
                        <MaterialIcon icon="download" className="text-sm" />
                        <span>{exportingFormat === "csv" ? "Exporting CSV..." : "Export CSV"}</span>
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        size="sm"
                        onClick={() => onExport("pdf")}
                        disabled={exportingFormat !== null}
                    >
                        <MaterialIcon icon="download" className="text-sm" />
                        <span>{exportingFormat === "pdf" ? "Exporting PDF..." : "Export PDF"}</span>
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <TableSkeleton />
                ) : errorMessage ? (
                    <div className="rounded-md border border-destructive/40 bg-danger/10 p-4 text-sm text-destructive">
                        {errorMessage}
                    </div>
                ) : (
                    <DataTable<ReportActivityRow>
                        columns={transactionColumns}
                        rows={sortedRows}
                        rowKey={(row) => row.id}
                        sortField={sortColumn}
                        sortDirection={sortDirection}
                        onSortChange={toggleSort}
                        emptyTitle="No transaction activity in this date range."
                        minWidth="860px"
                    />
                )}
            </CardContent>
        </Card>
    );
}
