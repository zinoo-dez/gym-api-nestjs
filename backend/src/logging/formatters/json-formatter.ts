import { ILogFormatter } from '../interfaces/log-formatter.interface';
import { LogEntry } from '../interfaces/log-entry.interface';

/**
 * JSON formatter for structured log output.
 * Outputs log entries as valid JSON strings suitable for production environments
 * and log aggregation tools.
 *
 * Requirements: 1.1, 1.3
 */
export class JsonFormatter implements ILogFormatter {
  /**
   * Format a log entry as a JSON string.
   * Ensures all required fields are included and output is valid JSON.
   *
   * @param entry - The log entry to format
   * @returns JSON string representation of the log entry
   */
  format(entry: LogEntry): string {
    // Create output object with all required fields
    const output: Record<string, any> = {
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
    };

    // Add service information if available
    if (entry.serviceName) {
      output.serviceName = entry.serviceName;
    }

    if (entry.serviceVersion) {
      output.serviceVersion = entry.serviceVersion;
    }

    // Add optional contextual fields
    if (entry.context) {
      output.context = entry.context;
    }

    if (entry.correlationId) {
      output.correlationId = entry.correlationId;
    }

    if (entry.userId) {
      output.userId = entry.userId;
    }

    if (entry.metadata) {
      output.metadata = entry.metadata;
    }

    if (entry.stackTrace) {
      output.stackTrace = entry.stackTrace;
    }

    // Return valid JSON string
    return JSON.stringify(output);
  }
}
