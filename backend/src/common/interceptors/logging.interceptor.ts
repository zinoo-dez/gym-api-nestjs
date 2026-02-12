import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../../logging/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly sensitiveFields = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'creditCard',
    'cvv',
    'ssn',
    'secret',
  ];

  constructor(private readonly fileLogger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const { method, url, body, headers } = request;

    const startTime = Date.now();

    // Sanitize request data
    const sanitizedBody = this.sanitizeData(body);
    const sanitizedHeaders = this.sanitizeHeaders(headers);

    // Log incoming request
    this.logger.log(
      `Incoming Request: ${method} ${url} - Body: ${JSON.stringify(sanitizedBody)} - Headers: ${JSON.stringify(sanitizedHeaders)}`,
    );
    this.fileLogger.log(
      `Incoming Request: ${method} ${url} - Body: ${JSON.stringify(sanitizedBody)} - Headers: ${JSON.stringify(sanitizedHeaders)}`,
      'HTTP',
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const sanitizedResponse = this.sanitizeData(data);

          this.logger.log(
            `Outgoing Response: ${method} ${url} - Status: ${response.statusCode} - Duration: ${duration}ms - Response: ${JSON.stringify(sanitizedResponse)}`,
          );
          this.fileLogger.log(
            `Outgoing Response: ${method} ${url} - Status: ${response.statusCode} - Duration: ${duration}ms - Response: ${JSON.stringify(sanitizedResponse)}`,
            'HTTP',
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.logger.error(
            `Request Failed: ${method} ${url} - Status: ${error.status || 500} - Duration: ${duration}ms - Error: ${error.message}`,
          );
          this.fileLogger.logHttpError(error, {
            method,
            url,
            body: sanitizedBody,
            query: this.sanitizeData(request.query),
            params: request.params,
            user: request.user,
          });
        },
      }),
    );
  }

  /**
   * Recursively sanitize data by removing sensitive fields
   */
  private sanitizeData(data: any): any {
    if (!data) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }

    if (typeof data === 'object') {
      const sanitized: any = {};

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          // Check if field is sensitive
          if (this.isSensitiveField(key)) {
            sanitized[key] = '[REDACTED]';
          } else {
            sanitized[key] = this.sanitizeData(data[key]);
          }
        }
      }

      return sanitized;
    }

    return data;
  }

  /**
   * Sanitize HTTP headers by removing sensitive information
   */
  private sanitizeHeaders(headers: any): any {
    const sanitized: any = {};

    for (const key in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, key)) {
        const lowerKey = key.toLowerCase();

        // Redact authorization headers
        if (lowerKey === 'authorization' || lowerKey === 'cookie') {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = headers[key];
        }
      }
    }

    return sanitized;
  }

  /**
   * Check if a field name is sensitive
   */
  private isSensitiveField(fieldName: string): boolean {
    const lowerFieldName = fieldName.toLowerCase();

    return this.sensitiveFields.some((sensitiveField) =>
      lowerFieldName.includes(sensitiveField.toLowerCase()),
    );
  }
}
