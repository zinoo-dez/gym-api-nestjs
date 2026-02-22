import {
  MEMBERSHIP_PLAN_STATUS_BADGE_STYLES,
  MEMBERSHIP_PLAN_STATUS_LABELS,
  MembershipPlanStatus,
} from "@/features/memberships";

interface MembershipPlanStatusBadgeProps {
  status: MembershipPlanStatus;
}

export function MembershipPlanStatusBadge({ status }: MembershipPlanStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${MEMBERSHIP_PLAN_STATUS_BADGE_STYLES[status]}`}
    >
      {MEMBERSHIP_PLAN_STATUS_LABELS[status]}
    </span>
  );
}
