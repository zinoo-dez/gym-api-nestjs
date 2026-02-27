import {
    MAINTENANCE_LOG_TYPE_LABELS,
    MaintenanceLogEntry,
    formatCurrency,
    formatDisplayDate,
} from "@/features/equipment";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";

interface MaintenanceLogProps {
    logs: MaintenanceLogEntry[];
}

const columns: DataTableColumn<MaintenanceLogEntry>[] = [
    { id: "date", label: "Date", render: (row) => formatDisplayDate(row.date) },
    { id: "type", label: "Type", render: (row) => MAINTENANCE_LOG_TYPE_LABELS[row.type] },
    { id: "description", label: "Description", render: (row) => row.description },
    { id: "cost", label: "Cost", render: (row) => formatCurrency(row.cost) },
    { id: "performedBy", label: "Performed By", render: (row) => row.performedBy },
    { id: "nextDue", label: "Next Due", render: (row) => formatDisplayDate(row.nextDueDate) },
];

export function MaintenanceLog({ logs }: MaintenanceLogProps) {
    if (logs.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No maintenance logs recorded yet.
            </div>
        );
    }

    return (
        <DataTable<MaintenanceLogEntry>
            columns={columns}
            rows={logs}
            rowKey={(row) => row.id}
        />
    );
}
