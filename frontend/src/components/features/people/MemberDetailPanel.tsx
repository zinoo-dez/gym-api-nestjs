import { useEffect, useMemo, useState } from "react";
import { Edit, History, PauseCircle, PlayCircle, Power } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { ManagementPanel } from "@/components/features/people/ManagementPanel";
import { StatusBadge } from "@/components/features/people/StatusBadge";
import {
  AttendanceRecord,
  AttendanceReport,
  MemberListRecord,
  MemberPaymentRecord,
  MemberProfile,
  MemberProgressRecord,
  MembershipPlanOption,
  formatDisplayDate,
  formatDisplayDateTime,
  formatCurrency,
  toEnumLabel,
} from "@/features/people";

interface MemberDetailPanelProps {
  open: boolean;
  isMobile: boolean;
  onClose: () => void;
  member: MemberProfile | null;
  memberRow: MemberListRecord | null;
  attendanceSummary: AttendanceReport | null;
  attendanceRecords: AttendanceRecord[];
  payments: MemberPaymentRecord[];
  progress: MemberProgressRecord[];
  membershipPlans: MembershipPlanOption[];
  loading: boolean;
  actionSubmitting: boolean;
  onEdit: () => void;
  onAssignPlan: (planId: string) => void;
  onToggleFreeze: (shouldFreeze: boolean) => void;
  onToggleActive: (shouldActivate: boolean) => void;
}

export function MemberDetailPanel({
  open,
  isMobile,
  onClose,
  member,
  memberRow,
  attendanceSummary,
  attendanceRecords,
  payments,
  progress,
  membershipPlans,
  loading,
  actionSubmitting,
  onEdit,
  onAssignPlan,
  onToggleFreeze,
  onToggleActive,
}: MemberDetailPanelProps) {
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [showFullHistory, setShowFullHistory] = useState(false);

  useEffect(() => {
    if (!memberRow) {
      setSelectedPlanId("");
      setShowFullHistory(false);
      return;
    }

    setSelectedPlanId(memberRow.planId ?? "");
    setShowFullHistory(false);
  }, [memberRow]);

  const currentSubscription = useMemo(() => {
    if (!member || !memberRow?.currentSubscriptionId) {
      return undefined;
    }

    return member.subscriptions.find((subscription) => subscription.id === memberRow.currentSubscriptionId);
  }, [member, memberRow?.currentSubscriptionId]);

  const paymentHistory = useMemo(
    () => [...payments].sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1)),
    [payments],
  );

  const attendanceHistory = useMemo(
    () => [...attendanceRecords].sort((left, right) => (left.checkInTime < right.checkInTime ? 1 : -1)),
    [attendanceRecords],
  );

  const notes = useMemo(
    () => progress.filter((item) => Boolean(item.notes?.trim())).sort((left, right) => (left.recordedAt < right.recordedAt ? 1 : -1)),
    [progress],
  );

  if (!member || !memberRow) {
    return null;
  }

  const isFrozen = (currentSubscription?.status ?? "").toUpperCase() === "FROZEN";
  const hasSubscription = Boolean(currentSubscription?.id);

  const footer = (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" variant="outline" onClick={() => setShowFullHistory((value) => !value)}>
        <History className="size-4" />
        {showFullHistory ? "Hide Full History" : "View Full History"}
      </Button>
      <Button type="button" variant="secondary" onClick={onEdit}>
        <Edit className="size-4" />
        Edit Member
      </Button>
      <Button
        type="button"
        variant={isFrozen ? "outline" : "secondary"}
        onClick={() => onToggleFreeze(!isFrozen)}
        disabled={!hasSubscription || actionSubmitting}
      >
        {isFrozen ? <PlayCircle className="size-4" /> : <PauseCircle className="size-4" />}
        {isFrozen ? "Unfreeze" : "Freeze"}
      </Button>
      <Button
        type="button"
        variant={member.isActive ? "danger" : "outline"}
        onClick={() => onToggleActive(!member.isActive)}
        disabled={actionSubmitting}
      >
        <Power className="size-4" />
        {member.isActive ? "Deactivate" : "Activate"}
      </Button>
    </div>
  );

  return (
    <ManagementPanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={memberRow.fullName}
      description={member.email}
      footer={footer}
      className="max-w-4xl"
    >
      {loading ? (
        <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">Loading member details...</div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-lg border bg-card p-4">
            <h3 className="card-title">Personal Info</h3>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium text-foreground">{memberRow.fullName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Contact</dt>
                <dd className="font-medium text-foreground">{member.phone || member.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Address</dt>
                <dd className="font-medium text-foreground">{member.address || "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Date of Birth</dt>
                <dd className="font-medium text-foreground">{formatDisplayDate(member.dateOfBirth)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Emergency Contact</dt>
                <dd className="font-medium text-foreground">{member.emergencyContact || "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Account Status</dt>
                <dd className="font-medium text-foreground">
                  <StatusBadge value={member.isActive ? "ACTIVE" : "INACTIVE"} />
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h3 className="card-title">Membership Info</h3>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge label={memberRow.membershipDisplayStatus} tone={memberRow.membershipStatusTone} />
              <StatusBadge label={memberRow.paymentStatus} tone={memberRow.paymentStatusTone} />
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Plan</dt>
                <dd className="font-medium text-foreground">{memberRow.planName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Expiry Date</dt>
                <dd className="font-medium text-foreground">{formatDisplayDate(memberRow.expiryDate)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last Check-in</dt>
                <dd className="font-medium text-foreground">{formatDisplayDateTime(memberRow.lastCheckIn)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Current Membership Status</dt>
                <dd className="font-medium text-foreground">{toEnumLabel(memberRow.membershipStatus)}</dd>
              </div>
            </dl>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <Label htmlFor="member-plan-select">Assign / Change Membership</Label>
                <Select
                  id="member-plan-select"
                  value={selectedPlanId}
                  onChange={(event) => setSelectedPlanId(event.target.value)}
                >
                  <option value="">Select plan</option>
                  {membershipPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={() => onAssignPlan(selectedPlanId)}
                  disabled={!selectedPlanId || actionSubmitting}
                >
                  {hasSubscription ? "Change Plan" : "Assign Plan"}
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h3 className="card-title">Attendance Summary</h3>
            {attendanceSummary ? (
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">Total Visits</dt>
                  <dd className="font-medium text-foreground">{attendanceSummary.totalVisits}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Gym Visits</dt>
                  <dd className="font-medium text-foreground">{attendanceSummary.totalGymVisits}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Class Attendance</dt>
                  <dd className="font-medium text-foreground">{attendanceSummary.totalClassAttendances}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Avg / Week</dt>
                  <dd className="font-medium text-foreground">{attendanceSummary.averageVisitsPerWeek}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Attendance summary is not available.</p>
            )}

            <div className="mt-4 space-y-2">
              {(showFullHistory ? attendanceHistory : attendanceHistory.slice(0, 5)).map((record) => (
                <div key={record.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{toEnumLabel(record.type)}</span>
                    <span className="text-muted-foreground">{formatDisplayDateTime(record.checkInTime)}</span>
                  </div>
                </div>
              ))}
              {attendanceHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance records found.</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h3 className="card-title">Payment History</h3>

            <div className="mt-4 space-y-2">
              {(showFullHistory ? paymentHistory : paymentHistory.slice(0, 5)).map((payment) => (
                <div key={payment.id} className="rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{formatCurrency(payment.amount, payment.currency)}</p>
                      <p className="text-xs text-muted-foreground">{payment.planName || "Membership payment"}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <StatusBadge value={payment.status} />
                      <p className="text-xs text-muted-foreground">{formatDisplayDateTime(payment.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {paymentHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment history available.</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h3 className="card-title">Notes</h3>

            <div className="mt-4 space-y-2">
              {(showFullHistory ? notes : notes.slice(0, 5)).map((entry) => (
                <div key={entry.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">Progress Note</span>
                    <span className="text-xs text-muted-foreground">{formatDisplayDateTime(entry.recordedAt)}</span>
                  </div>
                  <p className="mt-2 text-foreground">{entry.notes}</p>
                </div>
              ))}
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes available for this member.</p>
              ) : null}
            </div>
          </section>
        </div>
      )}
    </ManagementPanel>
  );
}
