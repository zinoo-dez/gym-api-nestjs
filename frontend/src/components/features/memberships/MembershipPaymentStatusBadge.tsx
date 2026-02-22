import {
  MEMBERSHIP_PAYMENT_STATUS_BADGE_STYLES,
  MEMBERSHIP_PAYMENT_STATUS_LABELS,
  MembershipPaymentStatus,
} from "@/features/memberships";

interface MembershipPaymentStatusBadgeProps {
  status: MembershipPaymentStatus;
}

export function MembershipPaymentStatusBadge({ status }: MembershipPaymentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${MEMBERSHIP_PAYMENT_STATUS_BADGE_STYLES[status]}`}
    >
      {MEMBERSHIP_PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
