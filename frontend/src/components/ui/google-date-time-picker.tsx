import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function pad2(value: number | string): string {
  return String(value).padStart(2, "0");
}

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function toTimeString(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function toDateTimeString(date: Date): string {
  return `${toDateString(date)}T${toTimeString(date)}`;
}

export type PickerMode = "date" | "time" | "datetime";
type CalendarView = "days" | "months" | "years";

function parsePickerValue(value: string | undefined | null, mode: PickerMode): Date | null {
  if (!value) return null;

  if (mode === "date") {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  if (mode === "time") {
    const [hours, minutes] = value.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);
    return next;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatPickerValue(date: Date, mode: PickerMode): string {
  if (mode === "date") return toDateString(date);
  if (mode === "time") return toTimeString(date);
  return toDateTimeString(date);
}

function formatTriggerLabel(date: Date | null, mode: PickerMode, placeholder: string): string {
  if (!date) return placeholder;
  if (mode === "date") {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }
  if (mode === "time") {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(date);
}

function formatYearLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
  }).format(date);
}

export interface GoogleDateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  mode?: PickerMode;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function GoogleDateTimePicker({
  value,
  onChange,
  mode = "datetime",
  label,
  placeholder = "Select date and time",
  className,
}: GoogleDateTimePickerProps) {
  const parsedValue = useMemo(() => parsePickerValue(value, mode), [value, mode]);
  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(parsedValue || new Date());
  const [viewDate, setViewDate] = useState<Date>(parsedValue || new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>("days");

  const days = useMemo(() => {
    const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [viewDate]);

  const selectedDate = draftDate || new Date();
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) =>
        new Date(2000, index, 1).toLocaleString("en-US", { month: "short" }),
      ),
    [],
  );
  const yearPageStart = Math.floor(viewDate.getFullYear() / 12) * 12;
  const yearOptions = useMemo(
    () => Array.from({ length: 12 }, (_, index) => yearPageStart + index),
    [yearPageStart],
  );

  const applyDay = (day: Date) => {
    setDraftDate((current) => {
      const next = new Date(current || new Date());
      next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
      return next;
    });
  };

  const applyMonth = (month: number) => {
    setDraftDate((current) => {
      const next = new Date(current || new Date());
      next.setMonth(month);
      return next;
    });
    setViewDate((current) => new Date(current.getFullYear(), month, 1));
    setCalendarView("days");
  };

  const applyYear = (year: number) => {
    setDraftDate((current) => {
      const next = new Date(current || new Date());
      next.setFullYear(year);
      return next;
    });
    setViewDate((current) => new Date(year, current.getMonth(), 1));
    setCalendarView("days");
  };

  const setHours = (hours: string | number) => {
    setDraftDate((current) => {
      const next = new Date(current || new Date());
      next.setHours(Number(hours));
      return next;
    });
  };

  const setMinutes = (minutes: string | number) => {
    setDraftDate((current) => {
      const next = new Date(current || new Date());
      next.setMinutes(Number(minutes));
      return next;
    });
  };

  const applySelection = () => {
    if (!draftDate) return;
    onChange(formatPickerValue(draftDate, mode));
    setIsOpen(false);
  };

  const setToday = () => {
    const now = new Date();
    setDraftDate(now);
    setViewDate(now);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const base = parsedValue || new Date();
      setDraftDate(base);
      setViewDate(base);
      setCalendarView("days");
    }
    setIsOpen(nextOpen);
  };

  return (
    <div className={cn("w-full", className)}>
      {label && <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>}

      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/40"
          >
            <span className="truncate">{formatTriggerLabel(parsedValue, mode, placeholder)}</span>
            <CalendarDays className="h-4 w-4 text-blue-600" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={8}
          collisionPadding={12}
          className="z-[60] w-[320px] p-3"
        >
          {(mode === "date" || mode === "datetime") && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    calendarView === "years"
                      ? setViewDate((current) => new Date(current.getFullYear() - 12, current.getMonth(), 1))
                      : setViewDate(
                          (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                        )
                  }
                  className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                  <button
                    type="button"
                    onClick={() => setCalendarView("months")}
                    className="rounded-md px-1.5 py-0.5 transition hover:bg-gray-100"
                  >
                    {formatMonthLabel(viewDate)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarView("years")}
                    className="rounded-md px-1.5 py-0.5 transition hover:bg-gray-100"
                  >
                    {formatYearLabel(viewDate)}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    calendarView === "years"
                      ? setViewDate((current) => new Date(current.getFullYear() + 12, current.getMonth(), 1))
                      : setViewDate(
                          (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                        )
                  }
                  className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {calendarView === "days" && (
                <>
                  <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day) => {
                      const isCurrentMonth = day.getMonth() === viewDate.getMonth();
                      const isSelected =
                        selectedDate.getDate() === day.getDate() &&
                        selectedDate.getMonth() === day.getMonth() &&
                        selectedDate.getFullYear() === day.getFullYear();

                      return (
                        <button
                          key={`${day.toDateString()}-${day.getMonth()}`}
                          type="button"
                          onClick={() => applyDay(day)}
                          className={cn(
                            "h-9 w-9 rounded-full text-sm transition",
                            isSelected && "bg-blue-600 text-white",
                            !isSelected && isCurrentMonth && "text-gray-700 hover:bg-blue-50",
                            !isCurrentMonth && "text-gray-300 hover:bg-gray-100",
                          )}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {calendarView === "months" && (
                <div className="grid grid-cols-3 gap-1">
                  {months.map((monthLabel, monthIndex) => {
                    const isSelected =
                      selectedDate.getMonth() === monthIndex &&
                      selectedDate.getFullYear() === viewDate.getFullYear();

                    return (
                      <button
                        key={monthLabel}
                        type="button"
                        onClick={() => applyMonth(monthIndex)}
                        className={cn(
                          "h-9 rounded-lg px-2 text-sm transition",
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-blue-50",
                        )}
                      >
                        {monthLabel}
                      </button>
                    );
                  })}
                </div>
              )}

              {calendarView === "years" && (
                <div className="grid grid-cols-3 gap-1">
                  {yearOptions.map((year) => {
                    const isSelected = selectedDate.getFullYear() === year;

                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => applyYear(year)}
                        className={cn(
                          "h-9 rounded-lg px-2 text-sm transition",
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-blue-50",
                        )}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {(mode === "time" || mode === "datetime") && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-gray-500">
                Hour
                <select
                  className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
                  value={selectedDate.getHours()}
                  onChange={(event) => setHours(event.target.value)}
                >
                  {Array.from({ length: 24 }, (_, value) => (
                    <option key={`hour-${value}`} value={value}>
                      {pad2(value)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-medium text-gray-500">
                Minute
                <select
                  className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
                  value={selectedDate.getMinutes()}
                  onChange={(event) => setMinutes(event.target.value)}
                >
                  {Array.from({ length: 60 }, (_, value) => (
                    <option key={`minute-${value}`} value={value}>
                      {pad2(value)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={setToday}
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Today
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applySelection}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
