import { MaterialIcon } from "@/components/ui/MaterialIcon";

import {
  MembershipRecord,
  MembershipSortOption,
  formatDisplayDate,
} from "@/features/memberships";
import { Button } from "@/components/ui/Button";
import { MembershipPaymentStatusBadge } from "@/components/features/memberships/MembershipPaymentStatusBadge";
import { MembershipStatusBadge } from "@/components/features/memberships/MembershipStatusBadge";

interface MemberMembershipTableProps {
  memberships: MembershipRecord[];
  sort: MembershipSortOption;
  onSortChange: () => void;
  onView: (membership: MembershipRecord) => void;
}

export function MemberMembershipTable({
  memberships,
  sort,
  onSortChange,
  onView,
}: MemberMembershipTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-outline-variant bg-surface-container-low md:block">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container">
              <th className="px-4 py-4 text-label-large font-bold text-on-surface-variant">Member</th>
              <th className="px-4 py-4 text-label-large font-bold text-on-surface-variant">Plan</th>
              <th className="px-4 py-4 text-label-large font-bold text-on-surface-variant">Start Date</th>
              <th className="px-4 py-4 text-label-large font-bold text-on-surface-variant">
                <button
                  type="button"
                  className="group inline-flex items-center gap-1.5 text-label-large font-bold text-on-surface-variant transition-colors hover:text-on-surface"
                  onClick={onSortChange}
                >
                  End Date
                  <MaterialIcon
                    icon={sort === "expiry_asc" ? "arrow_upward" : "arrow_downward"}
                    className="text-lg transition-transform group-hover:scale-110"
                  />
                  <span className="sr-only">
                    Sorted {sort === "expiry_asc" ? "ascending" : "descending"}
                  </span>
                </button>
              </th>
              <th className="px-4 py-4 text-label-large font-bold text-on-surface-variant">Remaining</th>
              <th className="px-4 py-4 text-label-large font-bold text-on-surface-variant">Status</th>
              <th className="px-4 py-4 text-label-large font-bold text-on-surface-variant">Payment</th>
              <th className="px-4 py-4 text-right text-label-large font-bold text-on-surface-variant">Actions</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((membership) => (
              <tr
                key={membership.id}
                className="cursor-pointer border-b transition-colors hover:bg-muted/50 last:border-0"
                onClick={() => onView(membership)}
              >
                <td className="px-4 py-4 align-middle">
                  <div className="space-y-0.5">
                    <p className="text-title-small font-bold text-on-surface">{membership.memberName}</p>
                    <p className="text-label-small text-on-surface-variant">{membership.memberEmail}</p>
                  </div>
                </td>
                <td className="px-4 py-4 align-middle text-body-medium text-on-surface">{membership.planName}</td>
                <td className="px-4 py-4 align-middle text-body-medium text-on-surface">{formatDisplayDate(membership.startDate)}</td>
                <td className="px-4 py-4 align-middle text-body-medium font-medium text-on-surface">{formatDisplayDate(membership.endDate)}</td>
                <td className="px-4 py-4 align-middle text-body-medium text-on-surface">{membership.remainingDays} days</td>
                <td className="px-4 py-4 align-middle">
                  <MembershipStatusBadge status={membership.status} />
                </td>
                <td className="px-4 py-4 align-middle">
                  <MembershipPaymentStatusBadge status={membership.paymentStatus} />
                </td>
                <td className="px-4 py-4 align-middle">
                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      variant="text"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onView(membership);
                      }}
                      title="View details"
                    >
                      <MaterialIcon icon="visibility" className="text-xl" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {memberships.map((membership) => (
          <article
            key={membership.id}
            className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 transition-all hover:bg-surface-container active:bg-surface-container-high"
            onClick={() => onView(membership)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-title-medium font-bold text-on-surface">
                  {membership.memberName}
                </h3>
                <p className="text-title-small text-on-surface-variant">{membership.planName}</p>
              </div>
              <MembershipStatusBadge status={membership.status} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <dt className="text-label-small font-bold uppercase tracking-wider text-on-surface-variant/80">Start</dt>
                <dd className="text-body-medium text-on-surface">{formatDisplayDate(membership.startDate)}</dd>
              </div>
              <div className="space-y-0.5 text-right">
                <dt className="text-label-small font-bold uppercase tracking-wider text-on-surface-variant/80">End</dt>
                <dd className="text-body-medium font-medium text-on-surface">{formatDisplayDate(membership.endDate)}</dd>
              </div>
              <div className="space-y-0.5">
                <dt className="text-label-small font-bold uppercase tracking-wider text-on-surface-variant/80">Remaining</dt>
                <dd className="text-body-medium text-on-surface">{membership.remainingDays} days</dd>
              </div>
              <div className="space-y-0.5 text-right">
                <dt className="text-label-small font-bold uppercase tracking-wider text-on-surface-variant/80">Payment</dt>
                <dd>
                  <MembershipPaymentStatusBadge status={membership.paymentStatus} />
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <Button
                type="button"
                variant="tonal"
                size="sm"
                className="w-full"
                onClick={(event) => {
                  event.stopPropagation();
                  onView(membership);
                }}
              >
                <MaterialIcon icon="visibility" className="text-lg" />
                <span>View Details</span>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
