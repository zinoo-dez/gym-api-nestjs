import { MaterialIcon } from "@/components/ui/MaterialIcon";

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
  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card md:block">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-4 text-sm font-bold text-muted-foreground">Plan Name</th>
              <th className="px-4 py-4 text-sm font-bold text-muted-foreground">Duration</th>
              <th className="px-4 py-4 text-sm font-bold text-muted-foreground">Price</th>
              <th className="px-4 py-4 text-sm font-bold text-muted-foreground">Features</th>
              <th className="px-4 py-4 text-sm font-bold text-muted-foreground">Members</th>
              <th className="px-4 py-4 text-sm font-bold text-muted-foreground">Status</th>
              <th className="px-4 py-4 text-right text-sm font-bold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr
                key={plan.id}
                className="cursor-pointer border-b transition-colors hover:bg-muted/50 last:border-0"
                onClick={() => onView(plan)}
              >
                <td className="px-4 py-4 align-middle">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.planType.toUpperCase()}</p>
                  </div>
                </td>
                <td className="px-4 py-4 align-middle text-sm text-foreground">{plan.durationDays} days</td>
                <td className="px-4 py-4 align-middle text-sm font-medium text-foreground">${plan.price.toFixed(2)}</td>
                <td className="px-4 py-4 align-middle text-sm text-foreground">{plan.planFeatures.length}</td>
                <td className="px-4 py-4 align-middle text-sm text-foreground">{plan.activeMembers}</td>
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
                onClick={(event) => {
                  event.stopPropagation();
                  onView(plan);
                }}
              >
                <MaterialIcon icon="visibility" className="text-lg" />
                <span>View</span>
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(plan);
                }}
              >
                <MaterialIcon icon="edit" className="text-lg" />
                <span>Edit</span>
              </Button>
              <Button
                type="button"
                variant="text"
                size="sm"
                disabled={plan.activeMembers > 0 || disablingPlanId === plan.id}
                onClick={(event) => {
                  event.stopPropagation();
                  onDisable(plan);
                }}
                className="text-destructive hover:bg-destructive/10 active:bg-destructive/20"
              >
                <MaterialIcon icon="block" className="text-lg" />
                <span>Disable</span>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
