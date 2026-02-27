import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Edit,
  MinusCircle,
  PlusCircle,
  Power,
  TrendingUp,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { ManagementPanel } from "@/components/features/people/ManagementPanel";
import { StatusBadge } from "@/components/features/people/StatusBadge";
import {
  BookableMemberOption,
  DEFAULT_TRAINER_ASSIGNMENT_VALUES,
  TrainerAssignedMember,
  TrainerClassScheduleRecord,
  TrainerInstructorProfile,
  TrainerListRecord,
  TrainerPerformanceSummary,
  TrainerProfile,
  TrainerSessionRecord,
  formatCurrency,
  formatDisplayDate,
  formatDisplayDateTime,
} from "@/features/people";

interface TrainerDetailPanelProps {
  open: boolean;
  isMobile: boolean;
  onClose: () => void;
  trainer: TrainerProfile | null;
  trainerRow: TrainerListRecord | null;
  assignedMembers: TrainerAssignedMember[];
  sessionSchedule: TrainerSessionRecord[];
  classSchedule: TrainerClassScheduleRecord[];
  instructorProfile: TrainerInstructorProfile | null;
  performanceSummary: TrainerPerformanceSummary;
  bookableMembers: BookableMemberOption[];
  loading: boolean;
  actionSubmitting: boolean;
  activationSupported: boolean;
  onEdit: () => void;
  onAssignMember: (values: {
    memberId: string;
    sessionDate: string;
    duration: number;
    title: string;
    description: string;
    notes: string;
    rate: number;
  }) => void;
  onRemoveMember: (assignment: TrainerAssignedMember) => void;
  onToggleActive: (shouldActivate: boolean) => void;
}

export function TrainerDetailPanel({
  open,
  isMobile,
  onClose,
  trainer,
  trainerRow,
  assignedMembers,
  sessionSchedule,
  classSchedule,
  instructorProfile,
  performanceSummary,
  bookableMembers,
  loading,
  actionSubmitting,
  activationSupported,
  onEdit,
  onAssignMember,
  onRemoveMember,
  onToggleActive,
}: TrainerDetailPanelProps) {
  const [assignmentValues, setAssignmentValues] = useState(DEFAULT_TRAINER_ASSIGNMENT_VALUES);

  useEffect(() => {
    if (open) {
      setAssignmentValues(DEFAULT_TRAINER_ASSIGNMENT_VALUES);
    }
  }, [open, trainer?.id]);

  const canSubmitAssignment = useMemo(() => {
    return (
      assignmentValues.memberId.length > 0 &&
      assignmentValues.sessionDate.length > 0 &&
      assignmentValues.duration >= 15 &&
      assignmentValues.title.trim().length > 0
    );
  }, [
    assignmentValues.duration,
    assignmentValues.memberId,
    assignmentValues.sessionDate,
    assignmentValues.title,
  ]);

  if (!trainer || !trainerRow) {
    return null;
  }

  const upcomingSessions = sessionSchedule
    .filter((session) => new Date(session.sessionDate) >= new Date())
    .slice(0, 8);

  const upcomingClassSchedule = classSchedule
    .filter((schedule) => new Date(schedule.schedule) >= new Date())
    .slice(0, 8);

  const footer = (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" variant="secondary" onClick={onEdit}>
        <Edit className="size-4" />
        Edit Trainer
      </Button>
      <Button
        type="button"
        variant={trainer.isActive ? "danger" : "outline"}
        onClick={() => onToggleActive(!trainer.isActive)}
        disabled={actionSubmitting || (!trainer.isActive && !activationSupported)}
      >
        <Power className="size-4" />
        {trainer.isActive ? "Deactivate" : "Activate"}
      </Button>
    </div>
  );

  return (
    <ManagementPanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={trainerRow.fullName}
      description={trainer.email}
      footer={footer}
      className="max-w-4xl"
    >
      {loading ? (
        <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">Loading trainer details...</div>
      ) : (
        <div className="space-y-6">
          {!trainer.isActive && !activationSupported ? (
            <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
              Reactivation is not currently available from the existing trainer API contract.
            </div>
          ) : null}

          <section className="rounded-lg border bg-card p-4">
            <h3 className="text-lg font-semibold tracking-tight">Profile Info</h3>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge value={trainer.isActive ? "ACTIVE" : "INACTIVE"} />
              {trainer.specializations.map((specialization) => (
                <span
                  key={specialization}
                  className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground"
                >
                  {specialization}
                </span>
              ))}
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Experience</dt>
                <dd className="font-medium text-foreground">
                  {trainer.experience !== undefined ? `${trainer.experience} years` : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Hourly Rate</dt>
                <dd className="font-medium text-foreground">
                  {trainer.hourlyRate !== undefined ? formatCurrency(trainer.hourlyRate) : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Join Date</dt>
                <dd className="font-medium text-foreground">{formatDisplayDate(trainer.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Address</dt>
                <dd className="font-medium text-foreground">{trainer.address || "-"}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h3 className="text-lg font-semibold tracking-tight">Certifications</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {trainer.certifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No certifications recorded.</p>
              ) : (
                trainer.certifications.map((certification) => (
                  <span
                    key={certification}
                    className="inline-flex items-center rounded-full bg-info/20 px-2.5 py-0.5 text-xs font-semibold text-info"
                  >
                    {certification}
                  </span>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold tracking-tight">Assigned Members</h3>
              <span className="text-sm text-muted-foreground">{assignedMembers.length} active members</span>
            </div>

            <div className="mt-4 space-y-2">
              {assignedMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active member assignments.</p>
              ) : (
                assignedMembers.map((assignment) => (
                  <div key={assignment.memberId} className="rounded-md border p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{assignment.memberName}</p>
                        <p className="text-xs text-muted-foreground">{assignment.memberEmail || "No email"}</p>
                        <p className="text-xs text-muted-foreground">
                          {assignment.activeSessions} active sessions
                          {assignment.nextSessionAt
                            ? ` • Next ${formatDisplayDateTime(assignment.nextSessionAt)}`
                            : ""}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveMember(assignment)}
                        disabled={actionSubmitting}
                      >
                        <MinusCircle className="size-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h3 className="text-lg font-semibold tracking-tight">Assign Member</h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="assign-member-id">Member</Label>
                <Select
                  id="assign-member-id"
                  value={assignmentValues.memberId}
                  onChange={(event) =>
                    setAssignmentValues((current) => ({
                      ...current,
                      memberId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select member</option>
                  {bookableMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {`${member.firstName} ${member.lastName}`.trim()} ({member.email})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assign-session-date">Session Date</Label>
                <Input
                  id="assign-session-date"
                  type="datetime-local"
                  value={assignmentValues.sessionDate}
                  onChange={(event) =>
                    setAssignmentValues((current) => ({
                      ...current,
                      sessionDate: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assign-duration">Duration (min)</Label>
                <Input
                  id="assign-duration"
                  type="number"
                  min={15}
                  value={assignmentValues.duration}
                  onChange={(event) =>
                    setAssignmentValues((current) => ({
                      ...current,
                      duration: Number(event.target.value || 0),
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="assign-title">Session Title</Label>
                <Input
                  id="assign-title"
                  value={assignmentValues.title}
                  onChange={(event) =>
                    setAssignmentValues((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="assign-description">Description</Label>
                <Input
                  id="assign-description"
                  value={assignmentValues.description}
                  onChange={(event) =>
                    setAssignmentValues((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="assign-notes">Notes</Label>
                <Input
                  id="assign-notes"
                  value={assignmentValues.notes}
                  onChange={(event) =>
                    setAssignmentValues((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assign-rate">Rate</Label>
                <Input
                  id="assign-rate"
                  type="number"
                  min={0}
                  step="0.01"
                  value={assignmentValues.rate}
                  onChange={(event) =>
                    setAssignmentValues((current) => ({
                      ...current,
                      rate: Number(event.target.value || 0),
                    }))
                  }
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => onAssignMember(assignmentValues)}
                  disabled={!canSubmitAssignment || actionSubmitting}
                >
                  <UserPlus className="size-4" />
                  Assign Member
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold tracking-tight">Session Schedule (Read-only)</h3>
              <CalendarClock className="size-5 text-muted-foreground" />
            </div>

            <div className="mt-4 space-y-2">
              {upcomingSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming trainer sessions.</p>
              ) : (
                upcomingSessions.map((session) => (
                  <div key={session.id} className="rounded-md border p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{session.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.memberName || "Unknown member"} • {session.duration} min
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <StatusBadge value={session.status} />
                        <p className="text-xs text-muted-foreground">
                          {formatDisplayDateTime(session.sessionDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {upcomingClassSchedule.length > 0 ? (
              <div className="mt-4 rounded-md border p-3">
                <p className="text-sm font-medium text-foreground">Upcoming Class Schedule</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {upcomingClassSchedule.map((schedule) => (
                    <p key={schedule.id}>
                      {schedule.name} • {formatDisplayDateTime(schedule.schedule)}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold tracking-tight">Performance Summary</h3>
              <TrendingUp className="size-5 text-muted-foreground" />
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Total Sessions</dt>
                <dd className="font-medium text-foreground">{performanceSummary.totalSessions}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Completed</dt>
                <dd className="font-medium text-foreground">{performanceSummary.completedSessions}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Completion Rate</dt>
                <dd className="font-medium text-foreground">{performanceSummary.completionRate}%</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Avg Session Duration</dt>
                <dd className="font-medium text-foreground">{performanceSummary.averageSessionDuration} min</dd>
              </div>
            </dl>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Average Session Rate</dt>
                <dd className="font-medium text-foreground">
                  {formatCurrency(performanceSummary.averageSessionRate)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Instructor Rating</dt>
                <dd className="font-medium text-foreground">
                  {instructorProfile ? `${instructorProfile.averageRating} (${instructorProfile.ratingsCount})` : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Past Classes</dt>
                <dd className="font-medium text-foreground">
                  {instructorProfile?.classHistory.pastClassesCount ?? 0}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Upcoming Classes</dt>
                <dd className="font-medium text-foreground">
                  {instructorProfile?.classHistory.upcomingClassesCount ?? 0}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </ManagementPanel>
  );
}
