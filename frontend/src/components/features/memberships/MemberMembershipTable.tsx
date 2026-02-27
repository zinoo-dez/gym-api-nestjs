import { MaterialIcon } from "@/components/ui/MaterialIcon";

import {
    MembershipRecord,
    MembershipSortOption,
    formatDisplayDate,
} from "@/features/memberships";
import { Button } from "@/components/ui/Button";
import { MembershipPaymentStatusBadge } from "@/components/features/memberships/MembershipPaymentStatusBadge";
import { MembershipStatusBadge } from "@/components/features/memberships/MembershipStatusBadge";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";

interface MemberMembershipTableProps {
    memberships: MembershipRecord[];
    sort: MembershipSortOption;
    onSortChange: () => void;
    onView: (membership: MembershipRecord) => void;
}

export function MemberMembershipTable({
    memberships,
    sort,
    onSortChange,
    onView,
}: MemberMembershipTableProps) {
    const columns: DataTableColumn<MembershipRecord>[] = [
        {
            id: "member",
            label: "Member",
            render: (row) => (
                <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">{row.memberName}</p>
                    <p className="text-xs text-muted-foreground">{row.memberEmail}</p>
                </div>
            ),
        },
        { id: "plan", label: "Plan", render: (row) => row.planName },
        { id: "startDate", label: "Start Date", render: (row) => formatDisplayDate(row.startDate) },
        {
            id: "endDate",
            label: "End Date",
            sortable: true,
            render: (row) => <span className="font-medium">{formatDisplayDate(row.endDate)}</span>,
        },
        { id: "remaining", label: "Remaining", render: (row) => `${row.remainingDays} days` },
        { id: "status", label: "Status", render: (row) => <MembershipStatusBadge status={row.status} /> },
        { id: "payment", label: "Payment", render: (row) => <MembershipPaymentStatusBadge status={row.paymentStatus} /> },
        {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (row) => (
                <div className="flex items-center justify-end">
                    <Button
                        type="button"
                        variant="text"
                        size="sm"
                        onClick={(event) => { event.stopPropagation(); onView(row); }}
                        title="View details"
                    >
                        <MaterialIcon icon="visibility" className="text-xl" />
                    </Button>
                </div>
            ),
        },
    ];

    const handleSortChange = (field: string) => {
        if (field === "endDate") onSortChange();
    };

    const mobileCard = (membership: MembershipRecord) => (
        <article
            className="rounded-2xl border border-border bg-card p-4 transition-all hover:bg-card active:bg-card"
            onClick={() => onView(membership)}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">{membership.memberName}</h3>
                    <p className="text-sm text-muted-foreground">{membership.planName}</p>
                </div>
                <MembershipStatusBadge status={membership.status} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Start</dt>
                    <dd className="text-sm text-foreground">{formatDisplayDate(membership.startDate)}</dd>
                </div>
                <div className="space-y-0.5 text-right">
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">End</dt>
                    <dd className="text-sm font-medium text-foreground">{formatDisplayDate(membership.endDate)}</dd>
                </div>
                <div className="space-y-0.5">
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Remaining</dt>
                    <dd className="text-sm text-foreground">{membership.remainingDays} days</dd>
                </div>
                <div className="space-y-0.5 text-right">
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Payment</dt>
                    <dd><MembershipPaymentStatusBadge status={membership.paymentStatus} /></dd>
                </div>
            </dl>

            <div className="mt-4">
                <Button
                    type="button"
                    variant="tonal"
                    size="sm"
                    className="w-full"
                    onClick={(event) => { event.stopPropagation(); onView(membership); }}
                >
                    <MaterialIcon icon="visibility" className="text-lg" />
                    <span>View Details</span>
                </Button>
            </div>
        </article>
    );

    return (
        <DataTable<MembershipRecord>
            columns={columns}
            rows={memberships}
            rowKey={(row) => row.id}
            onRowClick={onView}
            sortField={sort === "expiry_asc" ? "endDate" : "endDate"}
            sortDirection={sort === "expiry_asc" ? "asc" : "desc"}
            onSortChange={handleSortChange}
            mobileCard={mobileCard}
        />
    );
}
