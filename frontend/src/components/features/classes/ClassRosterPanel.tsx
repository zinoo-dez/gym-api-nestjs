import { useEffect, useMemo, useState } from "react";
import { CheckCheck, Plus, RefreshCcw, Search } from "lucide-react";
import { goeyToast } from "goey-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ManagementPanel } from "@/components/features/people/ManagementPanel";
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

interface ClassRosterPanelProps {
    open: boolean;
    classSession: ClassSession | null;
    onClose: () => void;
    onEditClass?: (classSession: ClassSession) => void;
    onDeleteClass?: (classSession: ClassSession) => void;
    allowQuickAdd?: boolean;
    isMobile?: boolean;
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

export function ClassRosterPanel({
    open,
    classSession,
    onClose,
    onEditClass,
    onDeleteClass,
    allowQuickAdd = true,
    isMobile = false,
}: ClassRosterPanelProps) {
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
        allowQuickAdd && open && debouncedSearchInput.length >= 2,
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

            goeyToast.success(`${member.memberName} marked as ${getAttendanceStatusLabel(status)}.`);
        } catch (error) {
            goeyToast.error(toErrorMessage(error));
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

            goeyToast.success(`${member.fullName} added to class.`);
            setSearchInput("");
            setDebouncedSearchInput("");
        } catch (error) {
            goeyToast.error(toErrorMessage(error));
        }
    };

    const footer = (
        <div className="flex flex-wrap items-center gap-2">
            {onEditClass ? (
                <Button type="button" variant="outlined" size="sm" onClick={() => onEditClass(classSession!)}>
                    Edit Class
                </Button>
            ) : null}
            {onDeleteClass ? (
                <Button type="button" variant="error" size="sm" onClick={() => onDeleteClass(classSession!)}>
                    Cancel Class
                </Button>
            ) : null}
            <Button
                type="button"
                variant="text"
                size="sm"
                onClick={() => void rosterQuery.refetch()}
                disabled={rosterQuery.isFetching}
            >
                <RefreshCcw className={`size-4 ${rosterQuery.isFetching ? "animate-spin" : ""}`} />
                Refresh
            </Button>
        </div>
    );

    return (
        <ManagementPanel
            open={open && Boolean(classSession)}
            onClose={onClose}
            isMobile={isMobile}
            title="Attendance Roster"
            description={classSession ? `${classSession.className} · ${getCategoryLabel(classSession.category)} · ${formatClassTimeRange(classSession.startTime, classSession.endTime)}` : ""}
            footer={footer}
            className="max-w-5xl"
        >
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium text-foreground">
                        <span>Capacity</span>
                        <span>
                            {liveBookedCount}/{classSession?.maxCapacity}
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                        <div
                            className={`h-full rounded-full ${displayOccupancyPercentage >= 90 ? "bg-destructive" : "bg-success"}`}
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

                <div
                    className={`grid grid-cols-1 gap-6 ${allowQuickAdd ? "lg:grid-cols-[1fr_320px]" : ""
                        }`}
                >
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold tracking-tight text-base">Booked Members</h3>

                        {rosterQuery.isLoading ? (
                            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Loading roster...</div>
                        ) : null}

                        {rosterQuery.isError ? (
                            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                                {toErrorMessage(rosterQuery.error)}
                            </div>
                        ) : null}

                        {!rosterQuery.isLoading && !rosterQuery.isError && rosterMembers.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                No members booked yet.
                            </div>
                        ) : null}

                        <div className="space-y-3">
                            {rosterMembers.map((member) => {
                                const isUpdating =
                                    updateStatusMutation.isPending &&
                                    updateStatusMutation.variables?.memberId === member.memberId;

                                return (
                                    <article key={member.id} className="rounded-lg border p-3 bg-card shadow-sm">
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
                                                        variant="outlined"
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
                                                        variant="text"
                                                        onClick={() => void handleUpdateStatus(member, "NO_SHOW")}
                                                        disabled={isUpdating}
                                                    >
                                                        No-show
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="text"
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
                                                        variant="text"
                                                        onClick={() => void handleUpdateStatus(member, "CANCELLED")}
                                                        disabled={isUpdating}
                                                    >
                                                        Cancel
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="text"
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
                        </div>
                    </section>

                    {allowQuickAdd ? (
                        <aside className="space-y-4 rounded-lg border bg-card p-4">
                            <h3 className="text-lg font-semibold tracking-tight text-base">Quick Add Member</h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground" htmlFor="roster-search">
                                    Search Members
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
                                <p className="small-text animate-pulse">Searching members...</p>
                            ) : null}

                            {debouncedSearchInput.length >= 2 &&
                                availableSearchResults.length === 0 &&
                                !memberSearchQuery.isFetching ? (
                                <p className="small-text text-muted-foreground italic">No matching members found.</p>
                            ) : null}

                            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                                {availableSearchResults.map((member) => {
                                    const isAdding =
                                        addMemberMutation.isPending &&
                                        addMemberMutation.variables?.memberId === member.memberId;

                                    return (
                                        <article key={member.memberId} className="rounded-md border bg-card p-3 shadow-sm">
                                            <p className="text-sm font-medium text-foreground">{member.fullName}</p>
                                            <p className="small-text truncate">{member.email || "No email"}</p>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outlined"
                                                className="mt-3 w-full"
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
                    ) : null}
                </div>
            </div>
        </ManagementPanel>
    );
}
