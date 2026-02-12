import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { LoggingConfigService } from './config';
import { LogEntry, LogLevel } from './interfaces';
import { FileTransport } from './transports';
import { DataSanitizer } from './data-sanitizer';

/**
 * Custom logger service that writes logs to files.
 * Integrates with NestJS logging system and provides file-based logging.
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private fileTransport: FileTransport | null = null;
  private dataSanitizer: DataSanitizer;
  private serviceName: string;
  private serviceVersion: string;

  constructor(private configService: LoggingConfigService) {
    this.serviceName = configService.getServiceName();
    this.serviceVersion = configService.getServiceVersion();
    this.dataSanitizer = new DataSanitizer();

    // Add custom sensitive fields from config
    const customFields = configService.getSensitiveFields();
    customFields.forEach((field) =>
      this.dataSanitizer.addSensitiveField(field),
    );

    // Initialize file transport
    this.initializeFileTransport();
  }

  private initializeFileTransport(): void {
    const transports = this.configService.getTransports();
    const fileTransportConfig = transports.find((t) => t.type === 'file');

    if (fileTransportConfig && fileTransportConfig.enabled) {
      this.fileTransport = new FileTransport(fileTransportConfig.options);
    }
  }

  /**
   * Log a message at the specified level
   */
  private async writeLog(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    stackTrace?: string,
  ): Promise<void> {
    if (!this.fileTransport) {
      return;
    }

    // Sanitize metadata
    const sanitizedMetadata = metadata
      ? this.dataSanitizer.sanitize(metadata)
      : undefined;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      metadata: sanitizedMetadata,
      stackTrace,
      serviceName: this.serviceName,
      serviceVersion: this.serviceVersion,
    };

    try {
      await this.fileTransport.write(entry);
    } catch (error) {
      // Fallback to console if file writing fails
      console.error('Failed to write log to file:', error);
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: string): void {
    void this.writeLog(LogLevel.DEBUG, message, context);
  }

  /**
   * Log an info message
   */
  log(message: string, context?: string): void {
    void this.writeLog(LogLevel.INFO, message, context);
  }

  /**
   * Log a warning message
   */
  warn(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    void this.writeLog(LogLevel.WARN, message, context, metadata);
  }

  /**
   * Log an error message with optional stack trace
   */
  error(
    message: string,
    stackTrace?: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    void this.writeLog(LogLevel.ERROR, message, context, metadata, stackTrace);
  }

  /**
   * Log an error with full context (useful for exception handling)
   */
  logError(
    error: Error,
    context?: string,
    additionalMetadata?: Record<string, any>,
  ): void {
    const metadata = {
      errorName: error.name,
      errorMessage: error.message,
      ...additionalMetadata,
    };

    void this.writeLog(
      LogLevel.ERROR,
      error.message,
      context,
      metadata,
      error.stack,
    );
  }

  /**
   * Log HTTP request errors
   */
  logHttpError(
    error: Error,
    request: {
      method: string;
      url: string;
      body?: any;
      query?: any;
      params?: any;
      user?: any;
    },
  ): void {
    const metadata = {
      errorName: error.name,
      http: {
        method: request.method,
        url: request.url,
        body: request.body,
        query: request.query,
        params: request.params,
      },
      userId: request.user?.id,
    };

    void this.writeLog(
      LogLevel.ERROR,
      `HTTP Error: ${error.message}`,
      'HttpException',
      metadata,
      error.stack,
    );
  }

  /**
   * Flush all pending logs
   */
  async flush(): Promise<void> {
    if (this.fileTransport) {
      await this.fileTransport.flush();
    }
  }
}
