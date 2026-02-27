import { useMemo } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { CalendarRange, Pencil, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  buildVisibleDays,
  calculateCapacityPercentage,
  formatClassTimeRange,
  getCategoryLabel,
  getCategoryStyles,
  type CalendarViewMode,
  type ClassSession,
} from "@/features/classes";

interface ClassScheduleAgendaProps {
  viewMode: CalendarViewMode;
  anchorDate: Date;
  sessions: ClassSession[];
  loading?: boolean;
  onSessionClick: (session: ClassSession) => void;
  onEditSession?: (session: ClassSession) => void;
  onDeleteSession?: (session: ClassSession) => void;
  showSessionActions?: boolean;
}

export function ClassScheduleAgenda({
  viewMode,
  anchorDate,
  sessions,
  loading = false,
  onSessionClick,
  onEditSession,
  onDeleteSession,
  showSessionActions = true,
}: ClassScheduleAgendaProps) {
  const visibleDays = useMemo(() => buildVisibleDays(anchorDate, viewMode), [anchorDate, viewMode]);

  const grouped = useMemo(
    () =>
      visibleDays.map((day) => ({
        day,
        sessions: sessions
          .filter((session) => isSameDay(parseISO(session.startTime), day))
          .sort(
            (left, right) =>
              new Date(left.startTime).getTime() - new Date(right.startTime).getTime(),
          ),
      })),
    [sessions, visibleDays],
  );

  return (
    <section className="space-y-4 rounded-lg border bg-card p-3">
      <header className="flex items-center gap-2 border-b pb-3">
        <CalendarRange className="size-4 text-primary" />
        <h2 className="text-lg font-semibold tracking-tight text-base">Agenda</h2>
      </header>

      {grouped.map(({ day, sessions: daySessions }) => (
        <div key={day.toISOString()} className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">{format(day, "EEEE, MMM d")}</h3>

          {daySessions.length === 0 ? (
            <p className="small-text rounded-md border border-dashed px-3 py-2">No classes scheduled.</p>
          ) : null}

          {daySessions.map((session) => {
            const categoryStyles = getCategoryStyles(session.category);
            const occupancy = calculateCapacityPercentage(session);
            const capacityTone = occupancy >= 90 ? "bg-danger" : "bg-success";

            return (
              <article
                key={session.id}
                role="button"
                tabIndex={0}
                onClick={() => onSessionClick(session)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSessionClick(session);
                  }
                }}
                className={`space-y-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${categoryStyles.cardClassName}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-semibold text-foreground">{session.className}</p>
                    <p className="small-text">{formatClassTimeRange(session.startTime, session.endTime)}</p>
                  </div>

                  {showSessionActions ? (
                    <div className="flex items-center gap-1">
                      {onEditSession ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEditSession(session);
                          }}
                          aria-label="Edit class"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      ) : null}
                      {onDeleteSession ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8 text-destructive hover:bg-danger/10 hover:text-destructive"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteSession(session);
                          }}
                          aria-label="Delete class"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <UserRound className="size-3.5" />
                    <span className="truncate">{session.instructorName || "Unassigned instructor"}</span>
                  </div>
                  <span className="inline-flex rounded-full bg-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground shadow-sm">
                    {getCategoryLabel(session.category)}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium text-foreground">
                    <span>Occupancy</span>
                    <span>
                      {session.bookedCount}/{session.maxCapacity}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${capacityTone}`} style={{ width: `${occupancy}%` }} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ))}

      {loading ? (
        <div className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
          Loading schedule...
        </div>
      ) : null}
    </section>
  );
}
