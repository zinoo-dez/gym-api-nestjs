import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, CalendarSync, Lock, LockOpen, OctagonAlert } from "lucide-react";

import {
  MembershipDetailRecord,
  MembershipHistoryEntry,
  MembershipPlanRecord,
  MembershipRecord,
  PaymentRecord,
  formatCurrency,
  formatDisplayDate,
  getMembershipTimelineProgress,
} from "@/features/memberships";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { MembershipPaymentStatusBadge } from "@/components/features/memberships/MembershipPaymentStatusBadge";
import { MembershipStatusBadge } from "@/components/features/memberships/MembershipStatusBadge";

interface MembershipDetailDrawerProps {
  open: boolean;
  membership: MembershipRecord | null;
  detail: MembershipDetailRecord | null;
  plans: MembershipPlanRecord[];
  paymentHistory: PaymentRecord[];
  membershipHistory: MembershipHistoryEntry[];
  isMobile: boolean;
  isSubmitting?: boolean;
  detailLoading?: boolean;
  onClose: () => void;
  onRenew: (membership: MembershipRecord, planId: string) => void;
  onChangePlan: (membership: MembershipRecord, newPlanId: string) => void;
  onToggleFreeze: (membership: MembershipRecord, shouldFreeze: boolean) => void;
  onMarkExpired: (membership: MembershipRecord) => void;
}

export function MembershipDetailDrawer({
  open,
  membership,
  detail,
  plans,
  paymentHistory,
  membershipHistory,
  isMobile,
  isSubmitting = false,
  detailLoading = false,
  onClose,
  onRenew,
  onChangePlan,
  onToggleFreeze,
  onMarkExpired,
}: MembershipDetailDrawerProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(membership?.planId ?? "");

  useEffect(() => {
    if (membership) {
      setSelectedPlanId(membership.planId);
    }
  }, [membership?.id, membership?.planId]);

  const currentRawStatus = detail?.statusRaw ?? membership?.statusRaw;

  const timelineProgress = useMemo(() => {
    if (!membership) {
      return 0;
    }

    return getMembershipTimelineProgress(membership.startDate, membership.endDate);
  }, [membership]);

  const latestPayment = paymentHistory[0];

  const canRenew =
    currentRawStatus === "EXPIRED" || currentRawStatus === "CANCELLED" || membership?.status === "expired";

  if (!membership) {
    return null;
  }

  const footer = (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => onRenew(membership, selectedPlanId)}
        disabled={!canRenew || !selectedPlanId || isSubmitting}
      >
        <CalendarSync className="size-4" />
        Renew Membership
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => onChangePlan(membership, selectedPlanId)}
        disabled={!selectedPlanId || selectedPlanId === membership.planId || isSubmitting}
      >
        <ArrowRightLeft className="size-4" />
        Change Plan
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => onToggleFreeze(membership, currentRawStatus !== "FROZEN")}
        disabled={isSubmitting || currentRawStatus === "EXPIRED" || currentRawStatus === "CANCELLED"}
      >
        {currentRawStatus === "FROZEN" ? <LockOpen className="size-4" /> : <Lock className="size-4" />}
        {currentRawStatus === "FROZEN" ? "Unfreeze" : "Freeze"}
      </Button>
      <Button
        type="button"
        variant="danger"
        onClick={() => onMarkExpired(membership)}
        disabled={
          isSubmitting || currentRawStatus === "EXPIRED" || currentRawStatus === "CANCELLED"
        }
      >
        <OctagonAlert className="size-4" />
        Mark Expired
      </Button>
    </div>
  );

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={membership.memberName}
      description={membership.planName}
      footer={footer}
      className="max-w-3xl"
    >
      <div className="space-y-6">
        {detailLoading ? (
          <section className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Loading membership details...</p>
          </section>
        ) : null}

        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">Member Info</h3>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Member Name</dt>
              <dd className="font-medium text-foreground">{membership.memberName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium text-foreground">{membership.memberEmail}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Current Plan</dt>
              <dd className="font-medium text-foreground">{membership.planName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <MembershipStatusBadge status={membership.status} />
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">Membership Info</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="membership-plan-select" className="text-sm font-medium text-foreground">
                Plan Selection
              </label>
              <Select
                id="membership-plan-select"
                value={selectedPlanId}
                onChange={(event) => setSelectedPlanId(event.target.value)}
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2 rounded-md border bg-muted/20 p-3 text-sm">
              <p className="font-medium text-foreground">Current Cycle</p>
              <p className="text-muted-foreground">
                {formatDisplayDate(membership.startDate)} - {formatDisplayDate(membership.endDate)}
              </p>
              <p className="text-muted-foreground">Remaining: {membership.remainingDays} days</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">Timeline</h3>

          <div className="mt-4 space-y-3">
            <div className="h-2 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${timelineProgress}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Start: {formatDisplayDate(membership.startDate)}</span>
              <span>Now</span>
              <span>End: {formatDisplayDate(membership.endDate)}</span>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">Payment Summary</h3>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Original Price</dt>
              <dd className="font-medium text-foreground">
                {detail ? formatCurrency(detail.originalPrice) : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Final Price</dt>
              <dd className="font-medium text-foreground">
                {detail ? formatCurrency(detail.finalPrice) : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Discount</dt>
              <dd className="font-medium text-foreground">
                {detail ? formatCurrency(detail.discountAmount) : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Discount Code</dt>
              <dd className="font-medium text-foreground">{detail?.discountCode || "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Latest Payment Status</dt>
              <dd>{latestPayment ? <MembershipPaymentStatusBadge status={latestPayment.status} /> : "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Latest Payment Amount</dt>
              <dd className="font-medium text-foreground">
                {latestPayment ? formatCurrency(latestPayment.amount) : "-"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">History (Renewals / Freezes)</h3>

          <div className="mt-4 space-y-2">
            {membershipHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No history available for this member.</p>
            ) : (
              membershipHistory.map((history) => (
                <div key={history.id} className="rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{history.planName}</p>
                    <MembershipStatusBadge status={history.status} />
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {formatDisplayDate(history.startDate)} - {formatDisplayDate(history.endDate)}
                  </p>
                </div>
              ))
            )}
          </div>

          {paymentHistory.length > 0 ? (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Payment Attempts</h4>
              {paymentHistory.slice(0, 5).map((payment) => (
                <div key={payment.id} className="rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{formatCurrency(payment.amount)}</p>
                    <MembershipPaymentStatusBadge status={payment.status} />
                  </div>
                  <p className="mt-1 text-muted-foreground">{formatDisplayDate(payment.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </SlidePanel>
  );
}
