import { useMemo, useState, type DragEvent, type KeyboardEvent } from "react";
import { addMinutes, differenceInMinutes, format, isSameDay, parseISO, set } from "date-fns";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

import {
  CALENDAR_END_HOUR,
  CALENDAR_START_HOUR,
  buildVisibleDays,
  calculateCapacityPercentage,
  clampNumber,
  formatClassTimeRange,
  getCategoryLabel,
  getCategoryStyles,
  type CalendarViewMode,
  type ClassSession,
} from "@/features/classes";

interface ClassScheduleCalendarProps {
  viewMode: CalendarViewMode;
  anchorDate: Date;
  sessions: ClassSession[];
  loading?: boolean;
  onSessionClick: (session: ClassSession) => void;
  onEditSession?: (session: ClassSession) => void;
  onDeleteSession?: (session: ClassSession) => void;
  onReschedule?: (session: ClassSession, startTime: string, endTime: string) => void;
  showSessionActions?: boolean;
  allowReschedule?: boolean;
}

const HOUR_ROW_HEIGHT = 64;
const SNAP_INTERVAL_MINUTES = 15;
const MINIMUM_EVENT_MINUTES = 15;

const getMinutesFromDayStart = (date: Date): number => date.getHours() * 60 + date.getMinutes();

const buildHourLabels = () =>
  Array.from(
    { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR + 1 },
    (_entry, index) => CALENDAR_START_HOUR + index,
  );

export function ClassScheduleCalendar({
  viewMode,
  anchorDate,
  sessions,
  loading = false,
  onSessionClick,
  onEditSession,
  onDeleteSession,
  onReschedule,
  showSessionActions = true,
  allowReschedule = true,
}: ClassScheduleCalendarProps) {
  const [draggingSessionId, setDraggingSessionId] = useState<string | null>(null);
  const [dragTargetDayKey, setDragTargetDayKey] = useState<string | null>(null);

  const visibleDays = useMemo(() => buildVisibleDays(anchorDate, viewMode), [anchorDate, viewMode]);
  const sessionMap = useMemo(() => new Map(sessions.map((session) => [session.id, session])), [sessions]);

  const totalMinutes = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60;
  const rangeStartMinutes = CALENDAR_START_HOUR * 60;
  const rangeEndMinutes = CALENDAR_END_HOUR * 60;
  const columnHeight = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * HOUR_ROW_HEIGHT;
  const hourLabels = useMemo(() => buildHourLabels(), []);
  const gridTemplateColumns = `70px repeat(${visibleDays.length}, minmax(220px, 1fr))`;

  const sessionsByDay = useMemo(
    () =>
      visibleDays.map((day) =>
        sessions
          .filter((session) => {
            const scheduleDate = parseISO(session.startTime);
            return isSameDay(scheduleDate, day);
          })
          .sort(
            (left, right) =>
              new Date(left.startTime).getTime() - new Date(right.startTime).getTime(),
          ),
      ),
    [sessions, visibleDays],
  );

  const handleDragStart = (event: DragEvent<HTMLElement>, sessionId: string) => {
    if (!allowReschedule) {
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", sessionId);
    setDraggingSessionId(sessionId);
  };

  const handleDragEnd = () => {
    setDraggingSessionId(null);
    setDragTargetDayKey(null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, day: Date) => {
    if (!allowReschedule || !onReschedule) {
      setDragTargetDayKey(null);
      return;
    }

    event.preventDefault();

    const droppedSessionId = draggingSessionId ?? event.dataTransfer.getData("text/plain");

    if (!droppedSessionId) {
      setDragTargetDayKey(null);
      return;
    }

    const session = sessionMap.get(droppedSessionId);

    if (!session) {
      setDragTargetDayKey(null);
      return;
    }

    const start = parseISO(session.startTime);
    const end = parseISO(session.endTime);
    const duration = Math.max(differenceInMinutes(end, start), MINIMUM_EVENT_MINUTES);

    const bounds = event.currentTarget.getBoundingClientRect();
    const offsetY = clampNumber(event.clientY - bounds.top, 0, bounds.height);

    const draggedMinutes = (offsetY / bounds.height) * totalMinutes;
    const snappedMinutes = Math.round(draggedMinutes / SNAP_INTERVAL_MINUTES) * SNAP_INTERVAL_MINUTES;

    const nextStartMinutes = clampNumber(
      rangeStartMinutes + snappedMinutes,
      rangeStartMinutes,
      rangeEndMinutes - duration,
    );

    const nextStart = set(day, {
      hours: Math.floor(nextStartMinutes / 60),
      minutes: nextStartMinutes % 60,
      seconds: 0,
      milliseconds: 0,
    });

    const nextEnd = addMinutes(nextStart, duration);

    onReschedule(session, nextStart.toISOString(), nextEnd.toISOString());

    setDragTargetDayKey(null);
    setDraggingSessionId(null);
  };

  const handleKeyOpen = (event: KeyboardEvent<HTMLElement>, session: ClassSession) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onSessionClick(session);
  };

  return (
    <div className="relative overflow-x-auto rounded-lg border bg-card">
      <div className="grid border-b bg-card" style={{ gridTemplateColumns }}>
        <div className="border-r px-2 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Time
        </div>
        {visibleDays.map((day) => (
          <div key={day.toISOString()} className="border-r px-3 py-3 last:border-r-0">
            <p className="text-sm font-semibold text-foreground">{format(day, "EEE")}</p>
            <p className="meta-text mt-1">{format(day, "MMM d")}</p>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns }}>
        <div className="relative border-r bg-muted/20" style={{ height: columnHeight }}>
          {hourLabels.map((hour, index) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-border/70"
              style={{ top: index * HOUR_ROW_HEIGHT }}
            >
              <span className="absolute -top-2.5 left-2 rounded bg-card px-1 text-[11px] text-muted-foreground">
                {format(
                  set(new Date(), {
                    hours: hour,
                    minutes: 0,
                    seconds: 0,
                    milliseconds: 0,
                  }),
                  "ha",
                )}
              </span>
            </div>
          ))}
        </div>

        {visibleDays.map((day, dayIndex) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const daySessions = sessionsByDay[dayIndex] ?? [];
          const isDropTarget = dragTargetDayKey === dayKey;

          return (
            <div
              key={day.toISOString()}
              className={`relative border-r last:border-r-0 ${isDropTarget ? "bg-primary/5" : "bg-card"}`}
              style={{ height: columnHeight }}
              onDragOver={(event) => {
                if (!allowReschedule) {
                  return;
                }
                event.preventDefault();
                setDragTargetDayKey(dayKey);
              }}
              onDragEnter={(event) => {
                if (!allowReschedule) {
                  return;
                }
                event.preventDefault();
                setDragTargetDayKey(dayKey);
              }}
              onDragLeave={() => {
                if (!allowReschedule) {
                  return;
                }
                if (dragTargetDayKey === dayKey) {
                  setDragTargetDayKey(null);
                }
              }}
              onDrop={(event) => handleDrop(event, day)}
            >
              {hourLabels.map((hour, index) => (
                <div
                  key={`${dayKey}-${hour}`}
                  className="absolute left-0 right-0 border-t border-border/70"
                  style={{ top: index * HOUR_ROW_HEIGHT }}
                />
              ))}

              {daySessions.map((session) => {
                const startDate = parseISO(session.startTime);
                const endDate = parseISO(session.endTime);

                const eventStartMinutes = getMinutesFromDayStart(startDate);
                const eventEndMinutes = Math.max(
                  getMinutesFromDayStart(endDate),
                  eventStartMinutes + MINIMUM_EVENT_MINUTES,
                );

                const clampedStart = clampNumber(
                  eventStartMinutes,
                  rangeStartMinutes,
                  rangeEndMinutes - MINIMUM_EVENT_MINUTES,
                );
                const clampedEnd = clampNumber(
                  eventEndMinutes,
                  clampedStart + MINIMUM_EVENT_MINUTES,
                  rangeEndMinutes,
                );

                const topPercent = ((clampedStart - rangeStartMinutes) / totalMinutes) * 100;
                const heightPercent = ((clampedEnd - clampedStart) / totalMinutes) * 100;

                const categoryStyles = getCategoryStyles(session.category);
                const occupancy = calculateCapacityPercentage(session);
                const isNearCapacity = occupancy >= 90;

                return (
                  <article
                    key={session.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${session.className}, ${formatClassTimeRange(session.startTime, session.endTime)}`}
                    draggable={allowReschedule}
                    onDragStart={(event) => handleDragStart(event, session.id)}
                    onDragEnd={handleDragEnd}
                    onKeyDown={(event) => handleKeyOpen(event, session)}
                    onClick={() => onSessionClick(session)}
                    className={`absolute left-2 right-2 cursor-pointer rounded-md border p-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${categoryStyles.cardClassName} ${draggingSessionId === session.id ? "opacity-50" : "opacity-100"}`}
                    style={{
                      top: `${topPercent}%`,
                      height: `${Math.max(heightPercent, 8)}%`,
                      minHeight: 72,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        {allowReschedule ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <GripVertical className="size-3" />
                            <span className="meta-text">Drag to reschedule</span>
                          </div>
                        ) : null}
                        <p className="truncate text-sm font-semibold text-foreground">{session.className}</p>
                      </div>

                      {showSessionActions ? (
                        <div className="flex items-center gap-1">
                          {onEditSession ? (
                            <button
                              type="button"
                              className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                              onClick={(event) => {
                                event.stopPropagation();
                                onEditSession(session);
                              }}
                              aria-label="Edit class"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                          ) : null}

                          {onDeleteSession ? (
                            <button
                              type="button"
                              className="rounded p-1 text-muted-foreground transition-colors hover:bg-danger/15 hover:text-danger"
                              onClick={(event) => {
                                event.stopPropagation();
                                onDeleteSession(session);
                              }}
                              aria-label="Delete class"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <p className="mt-1 truncate text-muted-foreground">{session.instructorName || "Unassigned instructor"}</p>
                    <p className="mt-1 text-foreground">{formatClassTimeRange(session.startTime, session.endTime)}</p>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-background/70 text-foreground">
                        {getCategoryLabel(session.category)}
                      </span>
                      <span className="text-[11px] font-semibold text-foreground">
                        {session.bookedCount}/{session.maxCapacity}
                      </span>
                    </div>

                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${isNearCapacity ? "bg-danger" : "bg-success"}`}
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                  </article>
                );
              })}

              {daySessions.length === 0 ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-xs text-muted-foreground">
                  No scheduled classes
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <p className="small-text">Loading schedule...</p>
        </div>
      ) : null}
    </div>
  );
}
