import {
  MEMBERSHIP_STATUS_BADGE_STYLES,
  MEMBERSHIP_STATUS_LABELS,
  MembershipDisplayStatus,
} from "@/features/memberships";

interface MembershipStatusBadgeProps {
  status: MembershipDisplayStatus;
}

export function MembershipStatusBadge({ status }: MembershipStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${MEMBERSHIP_STATUS_BADGE_STYLES[status]}`}
    >
      {MEMBERSHIP_STATUS_LABELS[status]}
    </span>
  );
}
