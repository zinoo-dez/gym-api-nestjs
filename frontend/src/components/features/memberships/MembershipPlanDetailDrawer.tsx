import { Ban, Copy, Edit, Power } from "lucide-react";

import {
  MembershipPlanRecord,
  MembershipRecord,
  formatDisplayDate,
} from "@/features/memberships";
import { Button } from "@/components/ui/Button";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { MembershipPlanStatusBadge } from "@/components/features/memberships/MembershipPlanStatusBadge";
import { MembershipStatusBadge } from "@/components/features/memberships/MembershipStatusBadge";

interface MembershipPlanDetailDrawerProps {
  open: boolean;
  plan: MembershipPlanRecord | null;
  assignedMemberships: MembershipRecord[];
  isMobile: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onEdit: (plan: MembershipPlanRecord) => void;
  onDuplicate: (plan: MembershipPlanRecord) => void;
  onDeactivate: (plan: MembershipPlanRecord) => void;
}

const getBuiltInFeatures = (plan: MembershipPlanRecord): string[] => {
  const builtInFeatures: string[] = [];

  if (plan.accessToEquipment) {
    builtInFeatures.push("Equipment Access");
  }

  if (plan.accessToLocker) {
    builtInFeatures.push("Locker Access");
  }

  if (plan.nutritionConsultation) {
    builtInFeatures.push("Nutrition Consultation");
  }

  if (plan.unlimitedClasses) {
    builtInFeatures.push("Unlimited Classes");
  }

  if (plan.personalTrainingHours > 0) {
    builtInFeatures.push(`${plan.personalTrainingHours} PT Hours`);
  }

  return builtInFeatures;
};

export function MembershipPlanDetailDrawer({
  open,
  plan,
  assignedMemberships,
  isMobile,
  isSubmitting = false,
  onClose,
  onEdit,
  onDuplicate,
  onDeactivate,
}: MembershipPlanDetailDrawerProps) {
  if (!plan) {
    return null;
  }

  const builtInFeatures = getBuiltInFeatures(plan);
  const canDeactivate = plan.activeMembers === 0;

  const footer = (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" variant="outline" onClick={() => onDuplicate(plan)}>
        <Copy className="size-4" />
        Duplicate Plan
      </Button>
      <Button type="button" variant="secondary" onClick={() => onEdit(plan)}>
        <Edit className="size-4" />
        Edit Plan
      </Button>
      {plan.status === "inactive" ? (
        <Button type="button" variant="outline" disabled>
          <Power className="size-4" />
          Activate Plan
        </Button>
      ) : (
        <Button
          type="button"
          variant="danger"
          onClick={() => onDeactivate(plan)}
          disabled={!canDeactivate || isSubmitting}
        >
          <Ban className="size-4" />
          Deactivate Plan
        </Button>
      )}
    </div>
  );

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={plan.name}
      description="Membership plan details"
      footer={footer}
      className="max-w-3xl"
    >
      <div className="space-y-6">
        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Plan Overview</h3>

          <div className="mt-4 flex flex-wrap gap-2">
            <MembershipPlanStatusBadge status={plan.status} />
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              {plan.planType.toUpperCase()}
            </span>
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Plan Name</dt>
              <dd className="font-medium text-foreground">{plan.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Description</dt>
              <dd className="font-medium text-foreground">{plan.description || "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium text-foreground">{formatDisplayDate(plan.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd className="font-medium text-foreground">{formatDisplayDate(plan.updatedAt)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Pricing & Duration</h3>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="font-medium text-foreground">{plan.durationDays} days</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Price</dt>
              <dd className="font-medium text-foreground">${plan.price.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Max Access</dt>
              <dd className="font-medium text-foreground">Not configured</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Active Members</dt>
              <dd className="font-medium text-foreground">{plan.activeMembers}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Included Features</h3>

          <div className="mt-4 space-y-3">
            {plan.planFeatures.length === 0 && builtInFeatures.length === 0 ? (
              <p className="text-sm text-muted-foreground">No features are assigned yet.</p>
            ) : null}

            {plan.planFeatures.map((feature) => (
              <div key={feature.featureId} className="rounded-md border p-3 text-sm">
                <p className="font-medium text-foreground">{feature.name}</p>
                <p className="mt-1 text-muted-foreground">{feature.description || "No description"}</p>
                <p className="mt-1 text-xs text-muted-foreground">Level: {feature.level}</p>
              </div>
            ))}

            {builtInFeatures.map((feature) => (
              <div
                key={feature}
                className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground"
              >
                {feature}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Assigned Members</h3>

          <div className="mt-4 space-y-2">
            {assignedMemberships.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members assigned to this plan.</p>
            ) : (
              assignedMemberships.slice(0, 10).map((membership) => (
                <div key={membership.id} className="rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{membership.memberName}</p>
                    <MembershipStatusBadge status={membership.status} />
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {formatDisplayDate(membership.startDate)} - {formatDisplayDate(membership.endDate)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Change History</h3>

          <div className="mt-4 space-y-2 text-sm">
            <div className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-foreground">Plan Created</p>
                <p className="text-xs text-muted-foreground">{formatDisplayDate(plan.createdAt)}</p>
              </div>
            </div>
            <div className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-foreground">Plan Last Updated</p>
                <p className="text-xs text-muted-foreground">{formatDisplayDate(plan.updatedAt)}</p>
              </div>
            </div>
          </div>
        </section>

        {!canDeactivate ? (
          <p className="text-sm text-warning">
            Plan cannot be disabled while active memberships are assigned.
          </p>
        ) : null}
      </div>
    </SlidePanel>
  );
}
