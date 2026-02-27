import type { AttendanceStatus, RecurrenceDayCode } from "./classes.types";

export const CALENDAR_START_HOUR = 5;
export const CALENDAR_END_HOUR = 22;

export const CLASS_CATEGORY_OPTIONS = [
  { value: "YOGA", label: "Yoga" },
  { value: "HIIT", label: "HIIT" },
  { value: "CROSSFIT", label: "CrossFit" },
  { value: "PILATES", label: "Pilates" },
  { value: "STRENGTH", label: "Strength" },
  { value: "CARDIO", label: "Cardio" },
  { value: "SPIN", label: "Spin" },
  { value: "DANCE", label: "Dance" },
  { value: "BOXING", label: "Boxing" },
  { value: "OTHER", label: "Other" },
] as const;

export const DEFAULT_CLASS_CATEGORY = CLASS_CATEGORY_OPTIONS[0].value;

export const CATEGORY_STYLES: Record<
  string,
  { badgeClassName: string; cardClassName: string }
> = {
  YOGA: {
    badgeClassName: "bg-info/20 text-info",
    cardClassName: "border-info/50 bg-info/25",
  },
  HIIT: {
    badgeClassName: "bg-danger/20 text-danger",
    cardClassName: "border-danger/50 bg-danger/25",
  },
  CROSSFIT: {
    badgeClassName: "bg-success/20 text-success",
    cardClassName: "border-success/50 bg-success/25",
  },
  PILATES: {
    badgeClassName: "bg-primary/20 text-primary",
    cardClassName: "border-primary/50 bg-primary/25",
  },
  STRENGTH: {
    badgeClassName: "bg-warning/20 text-warning",
    cardClassName: "border-warning/50 bg-warning/25",
  },
  CARDIO: {
    badgeClassName: "bg-secondary text-secondary-foreground",
    cardClassName: "border-secondary bg-secondary/40",
  },
  SPIN: {
    badgeClassName: "bg-info/20 text-info",
    cardClassName: "border-info/50 bg-info/25",
  },
  DANCE: {
    badgeClassName: "bg-primary/20 text-primary",
    cardClassName: "border-primary/50 bg-primary/25",
  },
  BOXING: {
    badgeClassName: "bg-danger/20 text-danger",
    cardClassName: "border-danger/50 bg-danger/25",
  },
  OTHER: {
    badgeClassName: "bg-muted text-muted-foreground",
    cardClassName: "border-border bg-muted/40",
  },
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  BOOKED: "Booked",
  ATTENDED: "Attended",
  NO_SHOW: "No-show",
  CANCELLED: "Cancelled",
};

export const ATTENDANCE_STATUS_STYLES: Record<AttendanceStatus, string> = {
  BOOKED: "bg-secondary text-secondary-foreground",
  ATTENDED: "bg-success/20 text-success",
  NO_SHOW: "bg-warning/20 text-warning",
  CANCELLED: "bg-danger/20 text-danger",
};

export const RECURRENCE_DAY_OPTIONS: Array<{
  code: RecurrenceDayCode;
  label: string;
}> = [
  { code: "MO", label: "Mon" },
  { code: "TU", label: "Tue" },
  { code: "WE", label: "Wed" },
  { code: "TH", label: "Thu" },
  { code: "FR", label: "Fri" },
  { code: "SA", label: "Sat" },
  { code: "SU", label: "Sun" },
];

export const DEFAULT_OCCURRENCES = 12;
