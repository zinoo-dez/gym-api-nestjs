import { Ban, Eye, PenSquare } from "lucide-react";

import { MembershipPlanRecord } from "@/features/memberships";
import { Button } from "@/components/ui/Button";
import { MembershipPlanStatusBadge } from "@/components/features/memberships/MembershipPlanStatusBadge";

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
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          onView(plan);
        }}
      >
        <Eye className="size-4" />
        View
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          onEdit(plan);
        }}
      >
        <PenSquare className="size-4" />
        Edit
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={plan.activeMembers > 0 || isDisabling}
        onClick={(event) => {
          event.stopPropagation();
          onDisable(plan);
        }}
      >
        <Ban className="size-4" />
        Disable
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
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/20">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Plan Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Duration</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Feature Count</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Active Members</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr
                key={plan.id}
                className="cursor-pointer border-b transition-colors hover:bg-muted/50 last:border-0"
                onClick={() => onView(plan)}
              >
                <td className="px-4 py-3 align-top">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.planType.toUpperCase()}</p>
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-foreground">{plan.durationDays} days</td>
                <td className="px-4 py-3 align-top text-foreground">${plan.price.toFixed(2)}</td>
                <td className="px-4 py-3 align-top text-foreground">{plan.planFeatures.length}</td>
                <td className="px-4 py-3 align-top text-foreground">{plan.activeMembers}</td>
                <td className="px-4 py-3 align-top">
                  <MembershipPlanStatusBadge status={plan.status} />
                </td>
                <td className="px-4 py-3 align-top">
                  <ActionButtons
                    plan={plan}
                    onView={onView}
                    onEdit={onEdit}
                    onDisable={onDisable}
                    isDisabling={disablingPlanId === plan.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className="rounded-lg border bg-card p-4 shadow-sm"
            onClick={() => onView(plan)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.durationDays} days</p>
              </div>
              <MembershipPlanStatusBadge status={plan.status} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Price</dt>
                <dd className="text-foreground">${plan.price.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Features</dt>
                <dd className="text-foreground">{plan.planFeatures.length}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active Members</dt>
                <dd className="text-foreground">{plan.activeMembers}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</dt>
                <dd className="text-foreground">{plan.planType.toUpperCase()}</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onView(plan);
                }}
              >
                <Eye className="size-4" />
                View
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(plan);
                }}
              >
                <PenSquare className="size-4" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={plan.activeMembers > 0 || disablingPlanId === plan.id}
                onClick={(event) => {
                  event.stopPropagation();
                  onDisable(plan);
                }}
              >
                <Ban className="size-4" />
                Disable
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
