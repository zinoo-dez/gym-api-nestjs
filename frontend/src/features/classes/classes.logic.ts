import {
  addDays,
  endOfDay,
  format,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";

import {
  ATTENDANCE_STATUS_LABELS,
  CATEGORY_STYLES,
  CLASS_CATEGORY_OPTIONS,
  DEFAULT_OCCURRENCES,
} from "./classes.constants";
import type {
  AttendanceStatus,
  CalendarViewMode,
  ClassSession,
  RecurrenceDayCode,
} from "./classes.types";

const RRULE_DAY_MAP: Record<number, RecurrenceDayCode> = {
  0: "SU",
  1: "MO",
  2: "TU",
  3: "WE",
  4: "TH",
  5: "FR",
  6: "SA",
};

const REVERSE_RRULE_DAY_MAP: Record<RecurrenceDayCode, number> = {
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
  SU: 0,
};

export const clampNumber = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const deriveDateRange = (
  anchorDate: Date,
  viewMode: CalendarViewMode,
): { startDate: Date; endDate: Date } => {
  if (viewMode === "day") {
    return {
      startDate: startOfDay(anchorDate),
      endDate: endOfDay(anchorDate),
    };
  }

  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 });
  return {
    startDate: startOfDay(weekStart),
    endDate: endOfDay(addDays(weekStart, 6)),
  };
};

export const buildVisibleDays = (anchorDate: Date, viewMode: CalendarViewMode): Date[] => {
  if (viewMode === "day") {
    return [startOfDay(anchorDate)];
  }

  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
};

export const toDateTimeLocalValue = (isoDate?: string): string => {
  if (!isoDate) {
    return "";
  }

  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const timezoneOffsetMs = parsed.getTimezoneOffset() * 60_000;
  const localDate = new Date(parsed.getTime() - timezoneOffsetMs);

  return localDate.toISOString().slice(0, 16);
};

export const fromDateTimeLocalValue = (dateTimeLocal: string): string => {
  const parsed = new Date(dateTimeLocal);
  return parsed.toISOString();
};

export const getCategoryLabel = (category: string): string => {
  const normalized = category.trim().toUpperCase();
  const matched = CLASS_CATEGORY_OPTIONS.find((option) => option.value === normalized);

  if (matched) {
    return matched.label;
  }

  if (!normalized) {
    return "Other";
  }

  return normalized
    .toLowerCase()
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
};

export const getCategoryStyles = (category: string): { badgeClassName: string; cardClassName: string } => {
  const normalized = category.trim().toUpperCase();
  return CATEGORY_STYLES[normalized] ?? CATEGORY_STYLES.OTHER;
};

export const getAttendanceStatusLabel = (status: AttendanceStatus): string =>
  ATTENDANCE_STATUS_LABELS[status];

export const formatClassTimeRange = (startIso: string, endIso: string): string => {
  try {
    const start = parseISO(startIso);
    const end = parseISO(endIso);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return "Invalid time";
    }

    return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
  } catch {
    return "Invalid time";
  }
};

export const getDefaultRepeatDay = (dateTimeLocal: string): RecurrenceDayCode => {
  const parsed = new Date(dateTimeLocal);
  const day = Number.isNaN(parsed.getTime()) ? 1 : parsed.getDay();
  return RRULE_DAY_MAP[day] ?? "MO";
};

export const parseRecurrenceDays = (rule?: string): RecurrenceDayCode[] => {
  if (!rule) {
    return [];
  }

  const byDayMatch = rule.match(/BYDAY=([^;]+)/i);

  if (!byDayMatch || !byDayMatch[1]) {
    return [];
  }

  return byDayMatch[1]
    .split(",")
    .map((dayCode) => dayCode.trim().toUpperCase())
    .filter((dayCode): dayCode is RecurrenceDayCode => dayCode in REVERSE_RRULE_DAY_MAP);
};

export const buildWeeklyRecurrenceRule = (
  startTimeIso: string,
  days: RecurrenceDayCode[],
  occurrences: number = DEFAULT_OCCURRENCES,
): string => {
  const startDate = parseISO(startTimeIso);
  const safeDays = days.length > 0 ? days : [RRULE_DAY_MAP[startDate.getDay()] ?? "MO"];
  const safeCount = Number.isFinite(occurrences) && occurrences > 0 ? Math.trunc(occurrences) : 1;

  return [
    "FREQ=WEEKLY",
    `BYDAY=${safeDays.join(",")}`,
    `BYHOUR=${startDate.getHours()}`,
    `BYMINUTE=${startDate.getMinutes()}`,
    `COUNT=${safeCount}`,
  ].join(";");
};

export const calculateCapacityPercentage = (session: ClassSession): number => {
  if (session.maxCapacity <= 0) {
    return 0;
  }

  return clampNumber(Math.round((session.bookedCount / session.maxCapacity) * 100), 0, 100);
};
