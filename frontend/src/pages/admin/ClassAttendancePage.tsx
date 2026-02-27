import { useEffect, useMemo, useState } from "react";
import { addDays, addWeeks, format, subDays, subWeeks } from "date-fns";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useNavigate } from "react-router-dom";
import { goeyToast } from "goey-toast";

import {
    ClassRosterPanel,
    ClassScheduleAgenda,
    ClassScheduleCalendar,
} from "@/components/features/classes";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
    deriveDateRange,
    type CalendarViewMode,
    type ClassSession,
} from "@/features/classes";
import {
    useClassSchedulesQuery,
    useDeleteClassMutation,
} from "@/hooks/useClassScheduling";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAuthStore } from "@/store/auth.store";
import { hasAnyRole, ROLE } from "@/lib/roles";

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

    return "Unable to complete request.";
};

export function ClassAttendancePage() {
    const navigate = useNavigate();
    const isCompactMobile = useIsMobile(640);
    const role = useAuthStore((state) => state.user?.role);

    const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
    const [anchorDate, setAnchorDate] = useState(() => new Date());
    const [activeClass, setActiveClass] = useState<ClassSession | null>(null);

    const { startDate, endDate } = useMemo(
        () => deriveDateRange(anchorDate, viewMode),
        [anchorDate, viewMode],
    );

    const classFilters = useMemo(
        () => ({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        }),
        [endDate, startDate],
    );

    const classSchedulesQuery = useClassSchedulesQuery(classFilters);
    const deleteClassMutation = useDeleteClassMutation();
    const canAccessScheduling = hasAnyRole(role, [ROLE.ADMIN, ROLE.OWNER, ROLE.TRAINER]);
    const canDeleteClass = hasAnyRole(role, [ROLE.ADMIN, ROLE.OWNER]);
    const canQuickAddMember = hasAnyRole(role, [ROLE.ADMIN, ROLE.OWNER]);

    const classes = classSchedulesQuery.data ?? [];

    useEffect(() => {
        if (!activeClass) {
            return;
        }

        const refreshed = classes.find((session) => session.id === activeClass.id) ?? null;
        setActiveClass(refreshed);
    }, [activeClass?.id, classes]);

    const headerLabel =
        viewMode === "day"
            ? format(startDate, "EEEE, MMM d, yyyy")
            : `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;

    const summary = useMemo(() => {
        const totalSessions = classes.length;
        const totalBooked = classes.reduce((sum, session) => sum + session.bookedCount, 0);
        const totalCapacity = classes.reduce((sum, session) => sum + session.maxCapacity, 0);

        return {
            totalSessions,
            totalBooked,
            avgOccupancy: totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0,
        };
    }, [classes]);

    const handlePrevious = () => {
        setAnchorDate((current) => (viewMode === "day" ? subDays(current, 1) : subWeeks(current, 1)));
    };

    const handleNext = () => {
        setAnchorDate((current) => (viewMode === "day" ? addDays(current, 1) : addWeeks(current, 1)));
    };

    const handleToday = () => {
        setAnchorDate(new Date());
    };

    const openRoster = (classSession: ClassSession) => {
        setActiveClass(classSession);
    };

    const handleDeleteClass = async (classSession: ClassSession) => {
        const startLabel = format(new Date(classSession.startTime), "EEE, MMM d, h:mm a");
        const shouldDelete = window.confirm(
            `Cancel \"${classSession.className}\" scheduled at ${startLabel}?`,
        );

        if (!shouldDelete) {
            return;
        }

        try {
            await deleteClassMutation.mutateAsync(classSession.id);
            goeyToast.success("Class session cancelled.");

            if (activeClass?.id === classSession.id) {
                setActiveClass(null);
            }
        } catch (error) {
            goeyToast.error(toErrorMessage(error));
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="page-title">Class Attendance</h1>
                        <p className="body-text text-muted-foreground">
                            Monitor class rosters in real-time and update attendance statuses for each session.
                        </p>
                    </div>

                    {canAccessScheduling ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => void navigate("/management/classes/schedule")}
                        >
                            <MaterialIcon icon="edit_calendar" className="text-lg" />
                            <span>Open Scheduling</span>
                        </Button>
                    ) : null}
                </div>

                <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant={viewMode === "week" ? "tonal" : "outlined"}
                            onClick={() => setViewMode("week")}
                        >
                            Weekly
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={viewMode === "day" ? "tonal" : "outlined"}
                            onClick={() => setViewMode("day")}
                        >
                            Daily
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={handlePrevious}>
                            <MaterialIcon icon="chevron_left" className="text-lg" />
                            <span>Previous</span>
                        </Button>

                        <Button type="button" size="sm" variant="outline" onClick={handleToday}>
                            <MaterialIcon icon="today" className="text-lg" />
                            <span>Today</span>
                        </Button>

                        <Button type="button" size="sm" variant="outline" onClick={handleNext}>
                            <span>Next</span>
                            <MaterialIcon icon="chevron_right" className="text-lg" />
                        </Button>
                    </div>

                    <p className="text-sm font-medium text-foreground">{headerLabel}</p>
                </div>
            </header>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="space-y-2 p-4">
                        <p className="small-text">Sessions In View</p>
                        <p className="text-2xl font-semibold text-foreground">{summary.totalSessions}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-2 p-4">
                        <p className="small-text">Members Booked</p>
                        <p className="text-2xl font-semibold text-foreground">{summary.totalBooked}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-2 p-4">
                        <p className="small-text">Average Occupancy</p>
                        <p className="text-2xl font-semibold text-foreground">{summary.avgOccupancy}%</p>
                    </CardContent>
                </Card>
            </section>

            {classSchedulesQuery.isError ? (
                <div className="rounded-lg border border-destructive/40 bg-danger/10 p-4 text-sm text-destructive">
                    {toErrorMessage(classSchedulesQuery.error)}
                </div>
            ) : null}

            {isCompactMobile ? (
                <ClassScheduleAgenda
                    viewMode={viewMode}
                    anchorDate={anchorDate}
                    sessions={classes}
                    loading={classSchedulesQuery.isLoading}
                    onSessionClick={openRoster}
                    showSessionActions={false}
                />
            ) : (
                <ClassScheduleCalendar
                    viewMode={viewMode}
                    anchorDate={anchorDate}
                    sessions={classes}
                    loading={classSchedulesQuery.isLoading}
                    onSessionClick={openRoster}
                    showSessionActions={false}
                    allowReschedule={false}
                />
            )}

            <ClassRosterPanel
                open={Boolean(activeClass)}
                classSession={activeClass}
                onClose={() => setActiveClass(null)}
                onDeleteClass={
                    canDeleteClass
                        ? (classSession) => {
                            void handleDeleteClass(classSession);
                        }
                        : undefined
                }
                allowQuickAdd={canQuickAddMember}
                isMobile={isCompactMobile}
            />
        </div>
    );
}
