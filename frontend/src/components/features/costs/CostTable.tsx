import { Archive, ArrowUpDown, Eye, PenSquare, RotateCcw } from "lucide-react";

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

interface CostTableProps {
  costs: CostRecord[];
  sortField: CostSortField;
  sortDirection: CostSortDirection;
  onSortChange: (field: CostSortField) => void;
  onView: (cost: CostRecord) => void;
  onEdit: (cost: CostRecord) => void;
  onArchiveToggle: (cost: CostRecord) => void;
}

interface SortableHeaderProps {
  field: CostSortField;
  label: string;
  currentField: CostSortField;
  currentDirection: CostSortDirection;
  onSortChange: (field: CostSortField) => void;
}

function SortableHeader({
  field,
  label,
  currentField,
  currentDirection,
  onSortChange,
}: SortableHeaderProps) {
  const active = currentField === field;

  return (
    <button
      type="button"
      onClick={() => onSortChange(field)}
      className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
      <ArrowUpDown className={`size-3.5 ${active ? "text-foreground" : "text-muted-foreground"}`} />
      {active ? (
        <span className="sr-only">Sorted {currentDirection === "asc" ? "ascending" : "descending"}</span>
      ) : null}
    </button>
  );
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
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="min-w-[1180px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/20">
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  field="costDate"
                  label="Date"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  field="title"
                  label="Title"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  field="category"
                  label="Category"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  field="amount"
                  label="Amount"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  field="dueDate"
                  label="Due Date"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  field="paymentStatus"
                  label="Payment"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  field="status"
                  label="Record"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((cost) => (
              <tr key={cost.id} className="border-b transition-colors hover:bg-muted/50 last:border-0">
                <td className="px-4 py-3 align-top text-foreground">{formatDisplayDate(cost.costDate)}</td>
                <td className="px-4 py-3 align-top">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">{cost.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {cost.vendor || "-"} · {COST_TYPE_LABELS[cost.costType]}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <CostRecurringBadge billingPeriod={cost.billingPeriod} />
                      {cost.budgetGroup ? (
                        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                          {cost.budgetGroup}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-foreground">{COST_CATEGORY_LABELS[cost.category]}</td>
                <td className="px-4 py-3 align-top text-foreground">
                  <div className="space-y-0.5">
                    <p>{formatCurrency(getGrossCostAmount(cost))}</p>
                    {cost.taxAmount > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Base {formatCurrency(cost.amount)} + Tax {formatCurrency(cost.taxAmount)}
                      </p>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-foreground">
                  <div className="space-y-0.5">
                    <p>{formatDisplayDate(cost.dueDate)}</p>
                    {cost.paidDate ? (
                      <p className="text-xs text-muted-foreground">Paid {formatDisplayDate(cost.paidDate)}</p>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <CostPaymentStatusBadge status={cost.paymentStatus} />
                </td>
                <td className="px-4 py-3 align-top">
                  <CostStatusBadge status={cost.status} />
                </td>
                <td className="px-4 py-3 align-top">
                  <Actions
                    cost={cost}
                    onView={onView}
                    onEdit={onEdit}
                    onArchiveToggle={onArchiveToggle}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {costs.map((cost) => (
          <article key={cost.id} className="rounded-lg border bg-card p-4 shadow-sm">
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
        ))}
      </div>
    </>
  );
}
