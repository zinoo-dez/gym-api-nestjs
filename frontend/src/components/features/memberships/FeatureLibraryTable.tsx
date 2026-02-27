import { MaterialIcon } from "@/components/ui/MaterialIcon";

import { FeatureLibraryRecord } from "@/features/memberships";
import { Button } from "@/components/ui/Button";
import { FeatureStatusBadge } from "@/components/features/memberships/FeatureStatusBadge";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";

interface FeatureLibraryTableProps {
    features: FeatureLibraryRecord[];
    deletingFeatureId?: string | null;
    onEdit: (feature: FeatureLibraryRecord) => void;
    onDelete: (feature: FeatureLibraryRecord) => void;
}

export function FeatureLibraryTable({
    features,
    deletingFeatureId,
    onEdit,
    onDelete,
}: FeatureLibraryTableProps) {
    const columns: DataTableColumn<FeatureLibraryRecord>[] = [
        {
            id: "name",
            label: "Feature Name",
            render: (row) => (
                <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">{row.name}</p>
                    {row.isSystem ? <p className="text-xs font-medium text-primary">System Feature</p> : null}
                </div>
            ),
        },
        { id: "description", label: "Description", render: (row) => <span className="text-muted-foreground">{row.description || "-"}</span> },
        { id: "status", label: "Status", render: (row) => <FeatureStatusBadge status={row.status} /> },
        { id: "assignedPlans", label: "Assigned Plans", render: (row) => <span className="font-medium">{row.assignedPlans}</span> },
        {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (row) => (
                <div className="flex items-center justify-end gap-1">
                    <Button type="button" variant="text" size="sm" onClick={() => onEdit(row)} title="Edit feature">
                        <MaterialIcon icon="edit" className="text-xl" />
                    </Button>
                    <Button
                        type="button"
                        variant="text"
                        size="sm"
                        disabled={row.isSystem || row.assignedPlans > 0 || deletingFeatureId === row.id}
                        onClick={() => onDelete(row)}
                        className="text-destructive hover:bg-destructive/10 active:bg-destructive/20"
                        title="Delete feature"
                    >
                        <MaterialIcon icon="delete" className="text-xl" />
                    </Button>
                </div>
            ),
        },
    ];

    const mobileCard = (feature: FeatureLibraryRecord) => (
        <article className="rounded-2xl border border-border bg-card p-4 transition-all hover:bg-card active:bg-card">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">{feature.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{feature.description || "No description"}</p>
                </div>
                <FeatureStatusBadge status={feature.status} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Assigned Plans</dt>
                    <dd className="text-sm font-medium text-foreground">{feature.assignedPlans}</dd>
                </div>
                <div className="space-y-0.5 text-right">
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Type</dt>
                    <dd className="text-sm text-foreground">{feature.isSystem ? "System" : "Custom"}</dd>
                </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outlined" size="sm" className="flex-1" onClick={() => onEdit(feature)}>
                    <MaterialIcon icon="edit" className="text-lg" />
                    <span>Edit</span>
                </Button>
                <Button
                    type="button"
                    variant="text"
                    size="sm"
                    className="flex-1 text-destructive hover:bg-destructive/10 active:bg-destructive/20"
                    disabled={feature.isSystem || feature.assignedPlans > 0 || deletingFeatureId === feature.id}
                    onClick={() => onDelete(feature)}
                >
                    <MaterialIcon icon="delete" className="text-lg" />
                    <span>Delete</span>
                </Button>
            </div>
        </article>
    );

    return (
        <DataTable<FeatureLibraryRecord>
            columns={columns}
            rows={features}
            rowKey={(row) => row.id}
            mobileCard={mobileCard}
        />
    );
}
