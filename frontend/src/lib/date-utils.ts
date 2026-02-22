import { format, isValid, parseISO } from "date-fns";

/**
 * Formats a date or ISO string to a human-readable format.
 * Default: MMM d, yyyy (e.g., Feb 21, 2026)
 */
export function formatDate(
  date: Date | string | undefined | null,
  formatStr = "MMM d, yyyy",
): string {
  if (!date) return "";

  const d = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(d)) return "";

  return format(d, formatStr);
}

/**
 * Formats a date for input values (yyyy-MM-dd)
 */
export function formatForInput(date: Date | string | undefined | null): string {
  return formatDate(date, "yyyy-MM-dd");
}

/**
 * Checks if a date is within a specific range
 */
export function isDateInRange(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  return true;
}
