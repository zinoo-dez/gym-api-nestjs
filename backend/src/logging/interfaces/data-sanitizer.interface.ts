/**
 * Interface for sanitizing sensitive data from log entries.
 * Implementations handle redaction of passwords, tokens, and other sensitive fields.
 */
export interface IDataSanitizer {
  /**
   * Recursively sanitize an object, array, or primitive value.
   * Replaces sensitive field values with "[REDACTED]".
   *
   * @param data - The data to sanitize (can be object, array, or primitive)
   * @returns Sanitized copy of the data
   */
  sanitize(data: any): any;

  /**
   * Check if a field name matches sensitive field patterns.
   *
   * @param fieldName - The field name to check
   * @returns True if the field is considered sensitive
   */
  isSensitiveField(fieldName: string): boolean;

  /**
   * Add a custom sensitive field pattern to the sanitizer.
   *
   * @param fieldName - The field name or pattern to add
   */
  addSensitiveField(fieldName: string): void;

  /**
   * Sanitize HTTP headers by redacting sensitive header values.
   * Specifically redacts Authorization and Cookie headers.
   *
   * @param headers - The HTTP headers object to sanitize
   * @returns Sanitized copy of the headers
   */
  sanitizeHeaders(headers: Record<string, any>): Record<string, any>;
}
