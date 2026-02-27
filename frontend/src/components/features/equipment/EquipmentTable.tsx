import { Eye, PenSquare, Wrench } from "lucide-react";

import {
    EQUIPMENT_CATEGORY_LABELS,
    EquipmentRecord,
    EquipmentSortField,
    SortDirection,
    formatDisplayDate,
} from "@/features/equipment";
import { Button } from "@/components/ui/Button";
import { EquipmentAlertBadges } from "@/components/features/equipment/EquipmentAlertBadges";
import { EquipmentConditionBadge } from "@/components/features/equipment/EquipmentConditionBadge";
import { EquipmentStatusBadge } from "@/components/features/equipment/EquipmentStatusBadge";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";

interface EquipmentTableProps {
    equipment: EquipmentRecord[];
    sortField: EquipmentSortField;
    sortDirection: SortDirection;
    onSortChange: (field: EquipmentSortField) => void;
    onView: (equipment: EquipmentRecord) => void;
    onEdit: (equipment: EquipmentRecord) => void;
    onLogMaintenance: (equipment: EquipmentRecord) => void;
}

function ActionButtons({
    equipment,
    onView,
    onEdit,
    onLogMaintenance,
}: {
    equipment: EquipmentRecord;
    onView: (equipment: EquipmentRecord) => void;
    onEdit: (equipment: EquipmentRecord) => void;
    onLogMaintenance: (equipment: EquipmentRecord) => void;
}) {
    return (
        <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => onView(equipment)}>
                <Eye className="size-4" />
                View
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(equipment)}>
                <PenSquare className="size-4" />
                Edit
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onLogMaintenance(equipment)}>
                <Wrench className="size-4" />
                Log Maintenance
            </Button>
        </div>
    );
}

export function EquipmentTable({
    equipment,
    sortField,
    sortDirection,
    onSortChange,
    onView,
    onEdit,
    onLogMaintenance,
}: EquipmentTableProps) {
    const columns: DataTableColumn<EquipmentRecord>[] = [
        {
            id: "name",
            label: "Equipment Name",
            sortable: true,
            render: (row) => (
                <div className="space-y-1">
                    <div className="font-medium text-foreground">{row.name}</div>
                    <div className="text-xs text-muted-foreground">{row.brandModel}</div>
                    <EquipmentAlertBadges equipment={row} />
                </div>
            ),
        },
        {
            id: "category",
            label: "Category",
            sortable: true,
            render: (row) => EQUIPMENT_CATEGORY_LABELS[row.category],
        },
        {
            id: "condition",
            label: "Condition",
            render: (row) => <EquipmentConditionBadge condition={row.condition} />,
        },
        {
            id: "assignedArea",
            label: "Area",
            sortable: true,
            render: (row) => row.assignedArea,
        },
        {
            id: "lastMaintenanceDate",
            label: "Last Maintenance",
            sortable: true,
            render: (row) => formatDisplayDate(row.lastMaintenanceDate),
        },
        {
            id: "nextMaintenanceDue",
            label: "Next Due",
            sortable: true,
            render: (row) => formatDisplayDate(row.nextMaintenanceDue),
        },
        {
            id: "isActive",
            label: "Status",
            sortable: true,
            render: (row) => <EquipmentStatusBadge isActive={row.isActive} />,
        },
        {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (row) => (
                <ActionButtons
                    equipment={row}
                    onView={onView}
                    onEdit={onEdit}
                    onLogMaintenance={onLogMaintenance}
                />
            ),
        },
    ];

    const mobileCard = (item: EquipmentRecord) => (
        <article className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold tracking-tight text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{EQUIPMENT_CATEGORY_LABELS[item.category]}</p>
                </div>
                <EquipmentStatusBadge isActive={item.isActive} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                <EquipmentConditionBadge condition={item.condition} />
                <EquipmentAlertBadges equipment={item} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Area</dt>
                    <dd className="text-foreground">{item.assignedArea}</dd>
                </div>
                <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last Maint.</dt>
                    <dd className="text-foreground">{formatDisplayDate(item.lastMaintenanceDate)}</dd>
                </div>
                <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Next Due</dt>
                    <dd className="text-foreground">{formatDisplayDate(item.nextMaintenanceDue)}</dd>
                </div>
                <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Model</dt>
                    <dd className="text-foreground">{item.brandModel}</dd>
                </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => onView(item)}>
                    <Eye className="size-4" />
                    View
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(item)}>
                    <PenSquare className="size-4" />
                    Edit
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => onLogMaintenance(item)}>
                    <Wrench className="size-4" />
                    Log Maintenance
                </Button>
            </div>
        </article>
    );

    return (
        <DataTable<EquipmentRecord>
            columns={columns}
            rows={equipment}
            rowKey={(row) => row.id}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={(field) => onSortChange(field as EquipmentSortField)}
            mobileCard={mobileCard}
        />
    );
}
