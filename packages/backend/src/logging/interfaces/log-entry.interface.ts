import { LogLevel } from './logging-config.interface';

/**
 * Represents a single structured log entry with all required fields
 * and optional contextual metadata.
 */
export interface LogEntry {
  /** ISO 8601 formatted timestamp */
  timestamp: string;

  /** Severity level of the log entry */
  level: LogLevel;

  /** Primary log message */
  message: string;

  /** Module or service name that generated the log */
  context?: string;

  /** Unique identifier for request tracking across services */
  correlationId?: string;

  /** Authenticated user identifier */
  userId?: string;

  /** Additional structured metadata */
  metadata?: Record<string, any>;

  /** Error stack trace (for error-level logs) */
  stackTrace?: string;

  /** Service name from configuration */
  serviceName?: string;

  /** Service version from configuration */
  serviceVersion?: string;
}
