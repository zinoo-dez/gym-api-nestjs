import { useEffect, useMemo, useState } from "react";
import { CheckCheck, Plus, RefreshCcw, Search, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ATTENDANCE_STATUS_STYLES,
  calculateCapacityPercentage,
  formatClassTimeRange,
  getAttendanceStatusLabel,
  getCategoryLabel,
  type AttendanceStatus,
  type ClassSession,
  type MemberSearchOption,
  type RosterMember,
} from "@/features/classes";
import {
  useAddMemberToClassMutation,
  useClassRosterQuery,
  useMemberSearchQuery,
  useUpdateAttendanceStatusMutation,
} from "@/hooks/useClassScheduling";

interface ClassRosterModalProps {
  open: boolean;
  classSession: ClassSession | null;
  onClose: () => void;
  onEditClass?: (classSession: ClassSession) => void;
  onDeleteClass?: (classSession: ClassSession) => void;
}

const statusOrder: AttendanceStatus[] = ["BOOKED", "ATTENDED", "NO_SHOW", "CANCELLED"];

const toErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      message?: string;
      response?: {
        data?: {
          message?: string | string[];
        };
      };
    };

    const apiMessage = candidate.response?.data?.message;

    if (Array.isArray(apiMessage)) {
      return apiMessage.join(", ");
    }

    if (typeof apiMessage === "string" && apiMessage.length > 0) {
      return apiMessage;
    }

    if (typeof candidate.message === "string" && candidate.message.length > 0) {
      return candidate.message;
    }
  }

  return "Unable to complete roster request.";
};

const isSameMember = (left: RosterMember, right: MemberSearchOption): boolean =>
  left.memberId === right.memberId;

export function ClassRosterModal({
  open,
  classSession,
  onClose,
  onEditClass,
  onDeleteClass,
}: ClassRosterModalProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useState("");

  useEffect(() => {
    if (!open) {
      setSearchInput("");
      setDebouncedSearchInput("");
      return;
    }

    const timeout = window.setTimeout(() => {
      setDebouncedSearchInput(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [open, searchInput]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSearchInput("");
    setDebouncedSearchInput("");
  }, [classSession?.id, open]);

  const rosterQuery = useClassRosterQuery(classSession?.id ?? "", open && Boolean(classSession));
  const updateStatusMutation = useUpdateAttendanceStatusMutation();
  const addMemberMutation = useAddMemberToClassMutation();

  const memberSearchQuery = useMemberSearchQuery(
    debouncedSearchInput,
    open && debouncedSearchInput.length >= 2,
  );

  const rosterMembers = rosterQuery.data ?? [];

  const summaryByStatus = useMemo(
    () =>
      rosterMembers.reduce<Record<AttendanceStatus, number>>(
        (accumulator, member) => {
          accumulator[member.status] += 1;
          return accumulator;
        },
        {
          BOOKED: 0,
          ATTENDED: 0,
          NO_SHOW: 0,
          CANCELLED: 0,
        },
      ),
    [rosterMembers],
  );

  const availableSearchResults = useMemo(() => {
    const searchResults = memberSearchQuery.data ?? [];

    return searchResults.filter(
      (searchResult) => !rosterMembers.some((rosterMember) => isSameMember(rosterMember, searchResult)),
    );
  }, [memberSearchQuery.data, rosterMembers]);

  const liveBookedCount = rosterMembers.filter((member) => member.status !== "CANCELLED").length;
  const occupancyPercentage = classSession
    ? Math.min(Math.round((liveBookedCount / classSession.maxCapacity) * 100), 100)
    : 0;

  const fallbackOccupancyPercentage = classSession
    ? calculateCapacityPercentage(classSession)
    : 0;

  const displayOccupancyPercentage =
    Number.isFinite(occupancyPercentage) && occupancyPercentage >= 0
      ? occupancyPercentage
      : fallbackOccupancyPercentage;

  const handleUpdateStatus = async (member: RosterMember, status: AttendanceStatus) => {
    if (!classSession) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        classId: classSession.id,
        memberId: member.memberId,
        status,
        bookingId: member.bookingId,
        attendanceId: member.attendanceId,
      });

      toast.success(`${member.memberName} marked as ${getAttendanceStatusLabel(status)}.`);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const handleAddMember = async (member: MemberSearchOption) => {
    if (!classSession) {
      return;
    }

    try {
      await addMemberMutation.mutateAsync({
        classId: classSession.id,
        memberId: member.memberId,
      });

      toast.success(`${member.fullName} added to class.`);
      setSearchInput("");
      setDebouncedSearchInput("");
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  if (!open || !classSession) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close class roster"
      />

      <section className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-lg">
        <header className="flex flex-col gap-4 border-b px-4 py-4 md:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="section-title text-lg md:text-xl">Attendance Roster</h2>
              <p className="body-text text-sm text-muted-foreground">
                {classSession.className} · {getCategoryLabel(classSession.category)}
              </p>
              <p className="small-text">{formatClassTimeRange(classSession.startTime, classSession.endTime)}</p>
            </div>

            <button
              type="button"
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onEditClass ? (
              <Button type="button" variant="outline" size="sm" onClick={() => onEditClass(classSession)}>
                Edit Class
              </Button>
            ) : null}
            {onDeleteClass ? (
              <Button type="button" variant="danger" size="sm" onClick={() => onDeleteClass(classSession)}>
                Cancel Class
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void rosterQuery.refetch()}
              disabled={rosterQuery.isFetching}
            >
              <RefreshCcw className={`size-4 ${rosterQuery.isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-foreground">
              <span>Capacity</span>
              <span>
                {liveBookedCount}/{classSession.maxCapacity}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${displayOccupancyPercentage >= 90 ? "bg-danger" : "bg-success"}`}
                style={{ width: `${Math.min(displayOccupancyPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusOrder.map((status) => (
              <span
                key={status}
                className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${ATTENDANCE_STATUS_STYLES[status]}`}
              >
                {getAttendanceStatusLabel(status)}
                <span>{summaryByStatus[status]}</span>
              </span>
            ))}
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-[1fr_320px] md:p-6">
          <section className="space-y-3">
            <h3 className="card-title text-base">Booked Members</h3>

            {rosterQuery.isLoading ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Loading roster...</div>
            ) : null}

            {rosterQuery.isError ? (
              <div className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
                {toErrorMessage(rosterQuery.error)}
              </div>
            ) : null}

            {!rosterQuery.isLoading && !rosterQuery.isError && rosterMembers.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No members booked yet.
              </div>
            ) : null}

            {rosterMembers.map((member) => {
              const isUpdating =
                updateStatusMutation.isPending &&
                updateStatusMutation.variables?.memberId === member.memberId;

              return (
                <article key={member.id} className="rounded-lg border p-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{member.memberName}</p>
                      <p className="small-text">{member.memberEmail || "No email"}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${ATTENDANCE_STATUS_STYLES[member.status]}`}
                      >
                        {getAttendanceStatusLabel(member.status)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {member.status !== "ATTENDED" ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void handleUpdateStatus(member, "ATTENDED")}
                          disabled={isUpdating}
                        >
                          <CheckCheck className="size-4" />
                          Check-in
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void handleUpdateStatus(member, "BOOKED")}
                          disabled={isUpdating}
                        >
                          Mark Booked
                        </Button>
                      )}

                      {member.status !== "NO_SHOW" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleUpdateStatus(member, "NO_SHOW")}
                          disabled={isUpdating}
                        >
                          No-show
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleUpdateStatus(member, "BOOKED")}
                          disabled={isUpdating}
                        >
                          Reinstate
                        </Button>
                      )}

                      {member.status !== "CANCELLED" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleUpdateStatus(member, "CANCELLED")}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleUpdateStatus(member, "BOOKED")}
                          disabled={isUpdating}
                        >
                          Rebook
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="space-y-3 rounded-lg border p-4">
            <h3 className="card-title text-base">Quick Add Member</h3>

            <div className="space-y-2">
              <LabelForSearch />
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="roster-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by name or email"
                  className="pl-9"
                />
              </div>
            </div>

            {memberSearchQuery.isFetching ? (
              <p className="small-text">Searching members...</p>
            ) : null}

            {debouncedSearchInput.length >= 2 && availableSearchResults.length === 0 && !memberSearchQuery.isFetching ? (
              <p className="small-text">No matching members found.</p>
            ) : null}

            <div className="max-h-80 space-y-2 overflow-y-auto">
              {availableSearchResults.map((member) => {
                const isAdding =
                  addMemberMutation.isPending &&
                  addMemberMutation.variables?.memberId === member.memberId;

                return (
                  <article key={member.memberId} className="rounded-md border p-2">
                    <p className="text-sm font-medium text-foreground">{member.fullName}</p>
                    <p className="small-text truncate">{member.email || "No email"}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => void handleAddMember(member)}
                      disabled={isAdding}
                    >
                      <Plus className="size-4" />
                      {isAdding ? "Adding..." : "Add to class"}
                    </Button>
                  </article>
                );
              })}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function LabelForSearch() {
  return (
    <label className="text-sm font-medium text-foreground" htmlFor="roster-search">
      Search Members
    </label>
  );
}
