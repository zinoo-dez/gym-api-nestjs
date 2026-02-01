import { LogEntry } from './log-entry.interface';

/**
 * Interface for log output destinations (console, file, external services).
 * Implementations handle writing log entries to specific targets.
 */
export interface ILogTransport {
  /**
   * Write a log entry to the transport destination.
   * Can be synchronous or asynchronous depending on the transport type.
   */
  write(entry: LogEntry): void | Promise<void>;

  /**
   * Optional method to flush any buffered logs.
   * Useful for file and network transports.
   */
  flush?(): Promise<void>;
}
