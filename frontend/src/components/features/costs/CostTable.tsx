import { Archive, Eye, PenSquare, RotateCcw } from "lucide-react";

import {
    COST_BILLING_PERIOD_LABELS,
    COST_CATEGORY_LABELS,
    COST_TYPE_LABELS,
    CostRecord,
    CostSortDirection,
    CostSortField,
    formatCurrency,
    formatDisplayDate,
    getGrossCostAmount,
} from "@/features/costs";
import { Button } from "@/components/ui/Button";
import { CostPaymentStatusBadge } from "@/components/features/costs/CostPaymentStatusBadge";
import { CostRecurringBadge } from "@/components/features/costs/CostRecurringBadge";
import { CostStatusBadge } from "@/components/features/costs/CostStatusBadge";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";

interface CostTableProps {
    costs: CostRecord[];
    sortField: CostSortField;
    sortDirection: CostSortDirection;
    onSortChange: (field: CostSortField) => void;
    onView: (cost: CostRecord) => void;
    onEdit: (cost: CostRecord) => void;
    onArchiveToggle: (cost: CostRecord) => void;
}

function Actions({
    cost,
    onView,
    onEdit,
    onArchiveToggle,
}: {
    cost: CostRecord;
    onView: (cost: CostRecord) => void;
    onEdit: (cost: CostRecord) => void;
    onArchiveToggle: (cost: CostRecord) => void;
}) {
    return (
        <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => onView(cost)}>
                <Eye className="size-4" />
                View
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(cost)}>
                <PenSquare className="size-4" />
                Edit
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onArchiveToggle(cost)}>
                {cost.status === "active" ? <Archive className="size-4" /> : <RotateCcw className="size-4" />}
                {cost.status === "active" ? "Archive" : "Restore"}
            </Button>
        </div>
    );
}

export function CostTable({
    costs,
    sortField,
    sortDirection,
    onSortChange,
    onView,
    onEdit,
    onArchiveToggle,
}: CostTableProps) {
    const columns: DataTableColumn<CostRecord>[] = [
        {
            id: "costDate",
            label: "Date",
            sortable: true,
            render: (row) => formatDisplayDate(row.costDate),
        },
        {
            id: "title",
            label: "Title",
            sortable: true,
            render: (row) => (
                <div className="space-y-1">
                    <div className="font-medium text-foreground">{row.title}</div>
                    <div className="text-xs text-muted-foreground">
                        {row.vendor || "-"} · {COST_TYPE_LABELS[row.costType]}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <CostRecurringBadge billingPeriod={row.billingPeriod} />
                        {row.budgetGroup ? (
                            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                                {row.budgetGroup}
                            </span>
                        ) : null}
                    </div>
                </div>
            ),
        },
        {
            id: "category",
            label: "Category",
            sortable: true,
            render: (row) => COST_CATEGORY_LABELS[row.category],
        },
        {
            id: "amount",
            label: "Amount",
            sortable: true,
            render: (row) => (
                <div className="space-y-0.5">
                    <p>{formatCurrency(getGrossCostAmount(row))}</p>
                    {row.taxAmount > 0 ? (
                        <p className="text-xs text-muted-foreground">
                            Base {formatCurrency(row.amount)} + Tax {formatCurrency(row.taxAmount)}
                        </p>
                    ) : null}
                </div>
            ),
        },
        {
            id: "dueDate",
            label: "Due Date",
            sortable: true,
            render: (row) => (
                <div className="space-y-0.5">
                    <p>{formatDisplayDate(row.dueDate)}</p>
                    {row.paidDate ? (
                        <p className="text-xs text-muted-foreground">Paid {formatDisplayDate(row.paidDate)}</p>
                    ) : null}
                </div>
            ),
        },
        {
            id: "paymentStatus",
            label: "Payment",
            sortable: true,
            render: (row) => <CostPaymentStatusBadge status={row.paymentStatus} />,
        },
        {
            id: "status",
            label: "Record",
            sortable: true,
            render: (row) => <CostStatusBadge status={row.status} />,
        },
        {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (row) => (
                <Actions cost={row} onView={onView} onEdit={onEdit} onArchiveToggle={onArchiveToggle} />
            ),
        },
    ];

    const mobileCard = (cost: CostRecord) => (
        <article className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold tracking-tight text-foreground">{cost.title}</h3>
                    <p className="text-sm text-muted-foreground">{cost.vendor || "No vendor"}</p>
                </div>
                <CostStatusBadge status={cost.status} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
                    {COST_CATEGORY_LABELS[cost.category]}
                </span>
                <CostPaymentStatusBadge status={cost.paymentStatus} />
                <CostRecurringBadge billingPeriod={cost.billingPeriod} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</dt>
                    <dd className="text-foreground">{formatCurrency(getGrossCostAmount(cost))}</dd>
                </div>
                <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</dt>
                    <dd className="text-foreground">{formatDisplayDate(cost.costDate)}</dd>
                </div>
                <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Due</dt>
                    <dd className="text-foreground">{formatDisplayDate(cost.dueDate)}</dd>
                </div>
                <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Billing</dt>
                    <dd className="text-foreground">{COST_BILLING_PERIOD_LABELS[cost.billingPeriod]}</dd>
                </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => onView(cost)}>
                    <Eye className="size-4" />
                    View
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(cost)}>
                    <PenSquare className="size-4" />
                    Edit
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => onArchiveToggle(cost)}>
                    {cost.status === "active" ? <Archive className="size-4" /> : <RotateCcw className="size-4" />}
                    {cost.status === "active" ? "Archive" : "Restore"}
                </Button>
            </div>
        </article>
    );

    return (
        <DataTable<CostRecord>
            columns={columns}
            rows={costs}
            rowKey={(row) => row.id}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={(field) => onSortChange(field as CostSortField)}
            mobileCard={mobileCard}
            minWidth="1180px"
        />
    );
}
