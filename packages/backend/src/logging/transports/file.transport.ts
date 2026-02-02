import { ILogTransport } from '../interfaces/log-transport.interface';
import { LogEntry, LogLevel } from '../interfaces';
import * as fs from 'fs';
import * as path from 'path';

export interface FileTransportOptions {
  /** Directory where log files will be stored */
  logDir?: string;
  /** Base filename for logs (without extension) */
  filename?: string;
  /** Maximum file size in bytes before rotation (default: 10MB) */
  maxFileSize?: number;
  /** Maximum number of log files to keep (default: 5) */
  maxFiles?: number;
  /** Whether to create separate files for each log level */
  separateByLevel?: boolean;
}

/**
 * File transport for writing logs to the filesystem.
 * Supports log rotation and separate files per log level.
 */
export class FileTransport implements ILogTransport {
  private readonly logDir: string;
  private readonly filename: string;
  private readonly maxFileSize: number;
  private readonly maxFiles: number;
  private readonly separateByLevel: boolean;
  private writeStreams: Map<string, fs.WriteStream> = new Map();

  constructor(options: FileTransportOptions = {}) {
    this.logDir = options.logDir || path.join(process.cwd(), 'logs');
    this.filename = options.filename || 'app';
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 5;
    this.separateByLevel = options.separateByLevel ?? true;

    // Ensure log directory exists
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  async write(entry: LogEntry): Promise<void> {
    const logLine = this.formatLogEntry(entry);
    const filename = this.getFilename(entry.level);
    const filepath = path.join(this.logDir, filename);

    // Check if rotation is needed
    await this.rotateIfNeeded(filepath);

    // Write to file
    return new Promise((resolve, reject) => {
      fs.appendFile(filepath, logLine + '\n', (err) => {
        if (err) {
          console.error('Failed to write to log file:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private formatLogEntry(entry: LogEntry): string {
    // Create a readable, structured log format
    const parts: string[] = [];

    // Timestamp and level
    parts.push(`[${entry.timestamp}]`);
    parts.push(`[${entry.level.toUpperCase()}]`);

    // Context if available
    if (entry.context) {
      parts.push(`[${entry.context}]`);
    }

    // Main message
    parts.push(entry.message);

    // Add metadata if present
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      parts.push(`\n  Metadata: ${JSON.stringify(entry.metadata, null, 2)}`);
    }

    // Add correlation ID if present
    if (entry.correlationId) {
      parts.push(`\n  Correlation ID: ${entry.correlationId}`);
    }

    // Add user ID if present
    if (entry.userId) {
      parts.push(`\n  User ID: ${entry.userId}`);
    }

    // Add stack trace for errors
    if (entry.stackTrace) {
      parts.push(`\n  Stack Trace:\n${entry.stackTrace}`);
    }

    return parts.join(' ');
  }

  private getFilename(level: LogLevel): string {
    if (this.separateByLevel) {
      return `${this.filename}-${level}.log`;
    }
    return `${this.filename}.log`;
  }

  private async rotateIfNeeded(filepath: string): Promise<void> {
    try {
      // Check if file exists and its size
      if (!fs.existsSync(filepath)) {
        return;
      }

      const stats = fs.statSync(filepath);
      if (stats.size < this.maxFileSize) {
        return;
      }

      // Rotate files
      await this.rotateFiles(filepath);
    } catch (error) {
      console.error('Error during log rotation:', error);
    }
  }

  private async rotateFiles(filepath: string): Promise<void> {
    const dir = path.dirname(filepath);
    const ext = path.extname(filepath);
    const basename = path.basename(filepath, ext);

    // Delete oldest file if it exists
    const oldestFile = path.join(dir, `${basename}.${this.maxFiles}${ext}`);
    if (fs.existsSync(oldestFile)) {
      fs.unlinkSync(oldestFile);
    }

    // Rotate existing files
    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const oldFile = path.join(dir, `${basename}.${i}${ext}`);
      const newFile = path.join(dir, `${basename}.${i + 1}${ext}`);

      if (fs.existsSync(oldFile)) {
        fs.renameSync(oldFile, newFile);
      }
    }

    // Rename current file to .1
    const rotatedFile = path.join(dir, `${basename}.1${ext}`);
    fs.renameSync(filepath, rotatedFile);
  }

  async flush(): Promise<void> {
    // Close all write streams
    for (const stream of this.writeStreams.values()) {
      await new Promise<void>((resolve) => {
        stream.end(() => resolve());
      });
    }
    this.writeStreams.clear();
  }
}
