import { useMemo, useState } from "react";
import { addDays, addWeeks, format, subDays, subWeeks } from "date-fns";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { toast } from "sonner";

import {
  ClassScheduleAgenda,
  ClassFormPanel,
  ClassScheduleCalendar,
} from "@/components/features/classes";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  deriveDateRange,
  type CalendarViewMode,
  type ClassFormMode,
  type ClassSession,
  type SaveClassInput,
} from "@/features/classes";
import {
  useClassInstructorsQuery,
  useClassSchedulesQuery,
  useCreateClassMutation,
  useDeleteClassMutation,
  useRescheduleClassMutation,
  useUpdateClassMutation,
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

export function ClassSchedulingPage() {
  const isCompactMobile = useIsMobile(640);
  const role = useAuthStore((state) => state.user?.role);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<ClassFormMode>("create");
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);

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
  const instructorsQuery = useClassInstructorsQuery();

  const createClassMutation = useCreateClassMutation();
  const updateClassMutation = useUpdateClassMutation();
  const deleteClassMutation = useDeleteClassMutation();
  const rescheduleClassMutation = useRescheduleClassMutation();
  const canDeleteClass = hasAnyRole(role, [ROLE.ADMIN, ROLE.OWNER]);

  const classes = classSchedulesQuery.data ?? [];

  const headerLabel =
    viewMode === "day"
      ? format(startDate, "EEEE, MMM d, yyyy")
      : `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;

  const summary = useMemo(() => {
    const totalSessions = classes.length;
    const totalBooked = classes.reduce((sum, session) => sum + session.bookedCount, 0);
    const totalCapacity = classes.reduce((sum, session) => sum + session.maxCapacity, 0);
    const highDemandSessions = classes.filter((session) => session.occupancyRatio >= 0.9).length;

    return {
      totalSessions,
      avgOccupancy: totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0,
      highDemandSessions,
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

  const openCreateClass = () => {
    setFormMode("create");
    setEditingClass(null);
    setFormOpen(true);
  };

  const openEditClass = (classSession: ClassSession) => {
    setFormMode("edit");
    setEditingClass(classSession);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload: SaveClassInput) => {
    try {
      if (formMode === "create") {
        await createClassMutation.mutateAsync(payload);
        toast.success("Class session created.");
      } else if (editingClass) {
        await updateClassMutation.mutateAsync({
          classId: editingClass.id,
          payload,
        });
        toast.success("Class session updated.");
      }

      setFormOpen(false);
      setEditingClass(null);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
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
      toast.success("Class session cancelled.");

      if (editingClass?.id === classSession.id) {
        setFormOpen(false);
        setEditingClass(null);
      }
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const handleReschedule = async (
    classSession: ClassSession,
    nextStartTime: string,
    nextEndTime: string,
  ) => {
    try {
      await rescheduleClassMutation.mutateAsync({
        classId: classSession.id,
        startTime: nextStartTime,
        endTime: nextEndTime,
      });

      toast.success(`Rescheduled ${classSession.className}.`);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const isFormSubmitting = createClassMutation.isPending || updateClassMutation.isPending;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="page-title">Class Scheduling</h1>
            <p className="body-text text-muted-foreground">
              Manage class schedules, assign instructors, and maintain capacity planning.
            </p>
          </div>

          <Button type="button" onClick={openCreateClass} className="shadow-elevation-1">
            <MaterialIcon icon="add" className="text-lg" />
            <span>Create Class</span>
          </Button>
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
            <Button type="button" size="sm" variant="outlined" onClick={handlePrevious}>
              <MaterialIcon icon="chevron_left" className="text-lg" />
              <span>Previous</span>
            </Button>

            <Button type="button" size="sm" variant="outlined" onClick={handleToday}>
              <MaterialIcon icon="today" className="text-lg" />
              <span>Today</span>
            </Button>

            <Button type="button" size="sm" variant="outlined" onClick={handleNext}>
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
            <p className="small-text">Average Occupancy</p>
            <p className="text-2xl font-semibold text-foreground">{summary.avgOccupancy}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="small-text">90%+ Capacity Classes</p>
            <p className="text-2xl font-semibold text-foreground">{summary.highDemandSessions}</p>
          </CardContent>
        </Card>
      </section>

      {classSchedulesQuery.isError ? (
        <div className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {toErrorMessage(classSchedulesQuery.error)}
        </div>
      ) : null}

      {isCompactMobile ? (
        <ClassScheduleAgenda
          viewMode={viewMode}
          anchorDate={anchorDate}
          sessions={classes}
          loading={classSchedulesQuery.isLoading}
          onSessionClick={openEditClass}
          onEditSession={openEditClass}
          onDeleteSession={
            canDeleteClass
              ? (session) => {
                  void handleDeleteClass(session);
                }
              : undefined
          }
        />
      ) : (
        <ClassScheduleCalendar
          viewMode={viewMode}
          anchorDate={anchorDate}
          sessions={classes}
          loading={classSchedulesQuery.isLoading || rescheduleClassMutation.isPending}
          onSessionClick={openEditClass}
          onEditSession={openEditClass}
          onDeleteSession={
            canDeleteClass
              ? (session) => {
                  void handleDeleteClass(session);
                }
              : undefined
          }
          onReschedule={(session, nextStartTime, nextEndTime) => {
            void handleReschedule(session, nextStartTime, nextEndTime);
          }}
        />
      )}

      <ClassFormPanel
        open={formOpen}
        mode={formMode}
        classSession={editingClass}
        instructors={instructorsQuery.data ?? []}
        isSubmitting={isFormSubmitting}
        onClose={() => {
          setFormOpen(false);
          setEditingClass(null);
        }}
        onSubmit={handleFormSubmit}
        isMobile={isCompactMobile}
      />
    </div>
  );
}
