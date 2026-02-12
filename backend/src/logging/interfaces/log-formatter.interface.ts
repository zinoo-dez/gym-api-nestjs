import { LogEntry } from './log-entry.interface';

/**
 * Interface for formatting log entries into output strings.
 * Implementations handle different output formats (JSON, pretty-print, etc.).
 */
export interface ILogFormatter {
  /**
   * Format a log entry into a string for output.
   *
   * @param entry - The log entry to format
   * @returns Formatted string representation of the log entry
   */
  format(entry: LogEntry): string;
}
