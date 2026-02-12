import { Injectable } from '@nestjs/common';
import { IDataSanitizer } from './interfaces/data-sanitizer.interface';

/**
 * Service for sanitizing sensitive data from log entries.
 * Redacts passwords, tokens, credit cards, and other sensitive information.
 */
@Injectable()
export class DataSanitizer implements IDataSanitizer {
  private sensitiveFields: Set<string>;

  /**
   * Initialize the DataSanitizer with default sensitive field patterns.
   * Default patterns include: password, token, authorization, creditCard, etc.
   */
  constructor() {
    // Default sensitive fields based on requirements 4.1, 4.2, 4.3
    this.sensitiveFields = new Set([
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'creditCard',
      'creditCardNumber',
      'cardNumber',
      'cvv',
      'ssn',
      'secret',
      'apiKey',
      'privateKey',
      'sessionId',
    ]);
  }

  /**
   * Check if a field name matches sensitive field patterns.
   * Performs case-insensitive matching against known sensitive field names.
   *
   * @param fieldName - The field name to check
   * @returns True if the field is considered sensitive
   */
  isSensitiveField(fieldName: string): boolean {
    if (!fieldName || typeof fieldName !== 'string') {
      return false;
    }

    const lowerFieldName = fieldName.toLowerCase();

    // Check exact matches (case-insensitive)
    for (const sensitiveField of this.sensitiveFields) {
      if (lowerFieldName === sensitiveField.toLowerCase()) {
        return true;
      }
    }

    // Check if field name contains sensitive patterns
    for (const sensitiveField of this.sensitiveFields) {
      const lowerSensitiveField = sensitiveField.toLowerCase();
      if (
        lowerFieldName.includes(lowerSensitiveField) ||
        lowerFieldName.endsWith(lowerSensitiveField)
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Add a custom sensitive field pattern to the sanitizer.
   * Allows runtime configuration of additional sensitive fields.
   *
   * @param fieldName - The field name or pattern to add
   */
  addSensitiveField(fieldName: string): void {
    if (fieldName && typeof fieldName === 'string') {
      this.sensitiveFields.add(fieldName);
    }
  }

  /**
   * Recursively sanitize an object, array, or primitive value.
   * Replaces sensitive field values with "[REDACTED]".
   * Handles nested objects and arrays at any depth.
   *
   * Requirements: 4.1, 4.2, 4.3, 4.6
   *
   * @param data - The data to sanitize (can be object, array, or primitive)
   * @returns Sanitized copy of the data
   */
  sanitize(data: any): any {
    // Handle null and undefined
    if (data === null || data === undefined) {
      return data;
    }

    // Handle primitives (string, number, boolean)
    if (typeof data !== 'object') {
      return data;
    }

    // Handle Date objects
    if (data instanceof Date) {
      return data;
    }

    // Handle arrays recursively
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    // Handle objects recursively
    const sanitized: Record<string, any> = {};

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Check if this field is sensitive
        if (this.isSensitiveField(key)) {
          // Replace sensitive field values with "[REDACTED]"
          sanitized[key] = '[REDACTED]';
        } else {
          // Recursively sanitize nested values
          sanitized[key] = this.sanitize(data[key]);
        }
      }
    }

    return sanitized;
  }

  /**
   * Sanitize HTTP headers by redacting sensitive header values.
   * Specifically redacts Authorization and Cookie headers.
   *
   * Requirement: 4.4
   *
   * @param headers - The HTTP headers object to sanitize
   * @returns Sanitized copy of the headers
   */
  sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    if (!headers || typeof headers !== 'object') {
      return headers;
    }

    const sanitized: Record<string, any> = {};

    for (const key in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, key)) {
        const lowerKey = key.toLowerCase();

        // Redact Authorization and Cookie headers (case-insensitive)
        if (lowerKey === 'authorization' || lowerKey === 'cookie') {
          sanitized[key] = '[REDACTED]';
        } else {
          // Keep other headers as-is
          sanitized[key] = headers[key];
        }
      }
    }

    return sanitized;
  }
}
