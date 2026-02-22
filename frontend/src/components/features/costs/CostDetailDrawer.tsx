import { Archive, Copy, Edit, RotateCcw } from "lucide-react";

import {
  COST_BILLING_PERIOD_LABELS,
  COST_CATEGORY_LABELS,
  COST_PAYMENT_METHOD_LABELS,
  COST_TYPE_LABELS,
  CostRecord,
  formatCurrency,
  formatDisplayDate,
  getGrossCostAmount,
} from "@/features/costs";
import { Button } from "@/components/ui/Button";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { CostPaymentStatusBadge } from "@/components/features/costs/CostPaymentStatusBadge";
import { CostRecurringBadge } from "@/components/features/costs/CostRecurringBadge";
import { CostStatusBadge } from "@/components/features/costs/CostStatusBadge";

interface CostDetailDrawerProps {
  open: boolean;
  cost: CostRecord | null;
  isMobile: boolean;
  onClose: () => void;
  onEdit: (cost: CostRecord) => void;
  onArchiveToggle: (cost: CostRecord) => void;
  onDuplicate: (cost: CostRecord) => void;
}

export function CostDetailDrawer({
  open,
  cost,
  isMobile,
  onClose,
  onEdit,
  onArchiveToggle,
  onDuplicate,
}: CostDetailDrawerProps) {
  if (!cost) {
    return null;
  }

  const footer = (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" variant="outline" onClick={() => onDuplicate(cost)}>
        <Copy className="size-4" />
        Duplicate
      </Button>
      <Button type="button" variant="secondary" onClick={() => onEdit(cost)}>
        <Edit className="size-4" />
        Edit Cost
      </Button>
      <Button
        type="button"
        variant={cost.status === "active" ? "danger" : "outline"}
        onClick={() => onArchiveToggle(cost)}
      >
        {cost.status === "active" ? <Archive className="size-4" /> : <RotateCcw className="size-4" />}
        {cost.status === "active" ? "Archive" : "Restore"}
      </Button>
    </div>
  );

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={cost.title}
      description={cost.vendor || "Cost details"}
      footer={footer}
      className="max-w-3xl"
    >
      <div className="space-y-6">
        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">Cost Information</h3>

          <div className="mt-4 flex flex-wrap gap-2">
            <CostStatusBadge status={cost.status} />
            <CostPaymentStatusBadge status={cost.paymentStatus} />
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              {COST_TYPE_LABELS[cost.costType]}
            </span>
            <CostRecurringBadge billingPeriod={cost.billingPeriod} />
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Title</dt>
              <dd className="font-medium text-foreground">{cost.title}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="font-medium text-foreground">{COST_CATEGORY_LABELS[cost.category]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created By</dt>
              <dd className="font-medium text-foreground">{cost.createdBy}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Budget Group</dt>
              <dd className="font-medium text-foreground">{cost.budgetGroup || "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Recorded Date</dt>
              <dd className="font-medium text-foreground">{formatDisplayDate(cost.costDate)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Due Date</dt>
              <dd className="font-medium text-foreground">{formatDisplayDate(cost.dueDate)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Paid Date</dt>
              <dd className="font-medium text-foreground">{cost.paidDate ? formatDisplayDate(cost.paidDate) : "-"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">Payment Details</h3>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Total Amount</dt>
              <dd className="font-medium text-foreground">{formatCurrency(getGrossCostAmount(cost))}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Base Amount</dt>
              <dd className="font-medium text-foreground">{formatCurrency(cost.amount)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tax Amount</dt>
              <dd className="font-medium text-foreground">{formatCurrency(cost.taxAmount)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Payment Method</dt>
              <dd className="font-medium text-foreground">
                {COST_PAYMENT_METHOD_LABELS[cost.paymentMethod]}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Billing Period</dt>
              <dd className="font-medium text-foreground">
                {COST_BILLING_PERIOD_LABELS[cost.billingPeriod]}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Vendor / Payee</dt>
              <dd className="font-medium text-foreground">{cost.vendor || "-"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Reference / Invoice Number</dt>
              <dd className="font-medium text-foreground">{cost.referenceNumber || "-"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">Notes</h3>
          <p className="mt-3 text-sm text-foreground">{cost.notes || "No notes provided."}</p>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">History / Audit Trail</h3>

          <div className="mt-4 space-y-2">
            {cost.auditTrail.length === 0 ? (
              <p className="text-sm text-muted-foreground">No history available yet.</p>
            ) : (
              cost.auditTrail.map((entry) => (
                <div key={entry.id} className="rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{entry.action}</span>
                    <span className="text-xs text-muted-foreground">{formatDisplayDate(entry.date)}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{entry.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Performed by {entry.performedBy}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </SlidePanel>
  );
}
