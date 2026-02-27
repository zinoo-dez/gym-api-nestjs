import { ReactNode } from "react";

import { DataTable, DataTableColumn } from "@/components/ui/DataTable";

export interface ManagementDataTableColumn<T> {
    id: string;
    label: string;
    sortable?: boolean;
    align?: "left" | "right";
    className?: string;
    render: (row: T) => ReactNode;
}

interface ManagementDataTableProps<T> {
    rows: T[];
    rowKey: (row: T) => string;
    columns: ManagementDataTableColumn<T>[];
    sortField?: string;
    sortDirection?: "asc" | "desc";
    onSortChange?: (field: string) => void;
    onRowClick?: (row: T) => void;
    mobileCard: (row: T) => ReactNode;
    emptyTitle: string;
    emptyDescription?: string;
}

export function ManagementDataTable<T>({
    rows,
    rowKey,
    columns,
    sortField,
    sortDirection,
    onSortChange,
    onRowClick,
    mobileCard,
    emptyTitle,
    emptyDescription,
}: ManagementDataTableProps<T>) {
    const dtColumns: DataTableColumn<T>[] = columns.map((col) => ({
        id: col.id,
        label: col.label,
        sortable: col.sortable,
        align: col.align,
        className: col.className,
        render: (row: T) => col.render(row),
    }));

    return (
        <DataTable<T>
            columns={dtColumns}
            rows={rows}
            rowKey={rowKey}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            onRowClick={onRowClick}
            mobileCard={mobileCard}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
        />
    );
}
