import { ArrowDownUp, Eye } from "lucide-react";

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
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/20">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Member</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Plan</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Start Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={onSortChange}
                >
                  End Date
                  <ArrowDownUp className="size-3.5" />
                  <span className="sr-only">
                    Sorted {sort === "expiry_asc" ? "ascending" : "descending"}
                  </span>
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Remaining Days</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Payment Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((membership) => (
              <tr
                key={membership.id}
                className="cursor-pointer border-b transition-colors hover:bg-muted/50 last:border-0"
                onClick={() => onView(membership)}
              >
                <td className="px-4 py-3 align-top">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{membership.memberName}</p>
                    <p className="text-xs text-muted-foreground">{membership.memberEmail}</p>
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-foreground">{membership.planName}</td>
                <td className="px-4 py-3 align-top text-foreground">{formatDisplayDate(membership.startDate)}</td>
                <td className="px-4 py-3 align-top text-foreground">{formatDisplayDate(membership.endDate)}</td>
                <td className="px-4 py-3 align-top text-foreground">{membership.remainingDays}</td>
                <td className="px-4 py-3 align-top">
                  <MembershipStatusBadge status={membership.status} />
                </td>
                <td className="px-4 py-3 align-top">
                  <MembershipPaymentStatusBadge status={membership.paymentStatus} />
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onView(membership);
                      }}
                    >
                      <Eye className="size-4" />
                      View
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
            className="rounded-lg border bg-card p-4 shadow-sm"
            onClick={() => onView(membership)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {membership.memberName}
                </h3>
                <p className="text-sm text-muted-foreground">{membership.planName}</p>
              </div>
              <MembershipStatusBadge status={membership.status} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Start</dt>
                <dd className="text-foreground">{formatDisplayDate(membership.startDate)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">End</dt>
                <dd className="text-foreground">{formatDisplayDate(membership.endDate)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remaining</dt>
                <dd className="text-foreground">{membership.remainingDays} days</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payment</dt>
                <dd>
                  <MembershipPaymentStatusBadge status={membership.paymentStatus} />
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onView(membership);
                }}
              >
                <Eye className="size-4" />
                View Details
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
