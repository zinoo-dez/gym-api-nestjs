import { MaterialIcon } from "@/components/ui/MaterialIcon";

import { MembershipPlanRecord } from "@/features/memberships";
import { Button } from "@/components/ui/Button";
import { MembershipPlanStatusBadge } from "@/components/features/memberships/MembershipPlanStatusBadge";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";

interface MembershipPlansTableProps {
    plans: MembershipPlanRecord[];
    onView: (plan: MembershipPlanRecord) => void;
    onEdit: (plan: MembershipPlanRecord) => void;
    onDisable: (plan: MembershipPlanRecord) => void;
    disablingPlanId?: string | null;
}

interface ActionButtonsProps {
    plan: MembershipPlanRecord;
    onView: (plan: MembershipPlanRecord) => void;
    onEdit: (plan: MembershipPlanRecord) => void;
    onDisable: (plan: MembershipPlanRecord) => void;
    isDisabling: boolean;
}

function ActionButtons({
    plan,
    onView,
    onEdit,
    onDisable,
    isDisabling,
}: ActionButtonsProps) {
    return (
        <div className="flex items-center justify-end gap-1">
            <Button
                type="button"
                variant="text"
                size="sm"
                onClick={(event) => {
                    event.stopPropagation();
                    onView(plan);
                }}
                title="View details"
            >
                <MaterialIcon icon="visibility" className="text-xl" />
            </Button>
            <Button
                type="button"
                variant="text"
                size="sm"
                onClick={(event) => {
                    event.stopPropagation();
                    onEdit(plan);
                }}
                title="Edit plan"
            >
                <MaterialIcon icon="edit" className="text-xl" />
            </Button>
            <Button
                type="button"
                variant="text"
                size="sm"
                disabled={plan.activeMembers > 0 || isDisabling}
                onClick={(event) => {
                    event.stopPropagation();
                    onDisable(plan);
                }}
                className="text-destructive hover:bg-destructive/10 active:bg-destructive/20"
                title="Disable plan"
            >
                <MaterialIcon icon="block" className="text-xl" />
            </Button>
        </div>
    );
}

export function MembershipPlansTable({
    plans,
    onView,
    onEdit,
    onDisable,
    disablingPlanId,
}: MembershipPlansTableProps) {
    const columns: DataTableColumn<MembershipPlanRecord>[] = [
        {
            id: "name",
            label: "Plan Name",
            render: (row) => (
                <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.planType.toUpperCase()}</p>
                </div>
            ),
        },
        { id: "duration", label: "Duration", render: (row) => `${row.durationDays} days` },
        { id: "price", label: "Price", render: (row) => <span className="font-medium">${row.price.toFixed(2)}</span> },
        { id: "features", label: "Features", render: (row) => row.planFeatures.length },
        { id: "members", label: "Members", render: (row) => row.activeMembers },
        { id: "status", label: "Status", render: (row) => <MembershipPlanStatusBadge status={row.status} /> },
        {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (row) => (
                <ActionButtons
                    plan={row}
                    onView={onView}
                    onEdit={onEdit}
                    onDisable={onDisable}
                    isDisabling={disablingPlanId === row.id}
                />
            ),
        },
    ];

    const mobileCard = (plan: MembershipPlanRecord) => (
        <article
            className="rounded-2xl border border-border bg-card p-4 transition-all hover:bg-card active:bg-card"
            onClick={() => onView(plan)}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.durationDays} days</p>
                </div>
                <MembershipPlanStatusBadge status={plan.status} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Price</dt>
                    <dd className="text-sm font-medium text-foreground">${plan.price.toFixed(2)}</dd>
                </div>
                <div className="space-y-0.5 text-right">
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Features</dt>
                    <dd className="text-sm text-foreground">{plan.planFeatures.length}</dd>
                </div>
                <div className="space-y-0.5">
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Members</dt>
                    <dd className="text-sm text-foreground">{plan.activeMembers}</dd>
                </div>
                <div className="space-y-0.5 text-right">
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Type</dt>
                    <dd className="text-sm text-foreground">{plan.planType.toUpperCase()}</dd>
                </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="tonal"
                    size="sm"
                    onClick={(event) => { event.stopPropagation(); onView(plan); }}
                >
                    <MaterialIcon icon="visibility" className="text-lg" />
                    <span>View</span>
                </Button>
                <Button
                    type="button"
                    variant="outlined"
                    size="sm"
                    onClick={(event) => { event.stopPropagation(); onEdit(plan); }}
                >
                    <MaterialIcon icon="edit" className="text-lg" />
                    <span>Edit</span>
                </Button>
                <Button
                    type="button"
                    variant="text"
                    size="sm"
                    disabled={plan.activeMembers > 0 || disablingPlanId === plan.id}
                    onClick={(event) => { event.stopPropagation(); onDisable(plan); }}
                    className="text-destructive hover:bg-destructive/10 active:bg-destructive/20"
                >
                    <MaterialIcon icon="block" className="text-lg" />
                    <span>Disable</span>
                </Button>
            </div>
        </article>
    );

    return (
        <DataTable<MembershipPlanRecord>
            columns={columns}
            rows={plans}
            rowKey={(row) => row.id}
            onRowClick={onView}
            mobileCard={mobileCard}
        />
    );
}
