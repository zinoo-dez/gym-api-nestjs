import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';
import validator from 'validator';

/**
 * Middleware to sanitize all incoming request data to prevent XSS attacks
 * and other malicious input. This middleware processes request body, query
 * parameters, and URL parameters.
 *
 * Note: SQL injection is already prevented by Prisma's parameterized queries,
 * but this middleware provides an additional layer of defense.
 */
@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery = this.sanitizeObject(req.query);
      Object.defineProperty(req, 'query', {
        value: sanitizedQuery,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      const sanitizedParams = this.sanitizeObject(req.params);
      Object.defineProperty(req, 'params', {
        value: sanitizedParams,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    next();
  }

  /**
   * Recursively sanitize an object by cleaning all string values
   */
  private sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    // Handle objects
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    // Handle strings - apply sanitization
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    // Return other types as-is (numbers, booleans, etc.)
    return obj;
  }

  /**
   * Sanitize a string value to prevent XSS attacks
   */
  private sanitizeString(value: string): string {
    // First, trim whitespace
    let sanitized = value.trim();

    // Remove any HTML tags and potentially malicious content
    // This is a strict configuration that removes all HTML
    sanitized = sanitizeHtml(sanitized, {
      allowedTags: [], // No HTML tags allowed
      allowedAttributes: {}, // No attributes allowed
      disallowedTagsMode: 'recursiveEscape', // Escape disallowed tags
    });

    // Additional XSS prevention: escape common XSS patterns
    sanitized = validator.escape(sanitized);

    // Remove null bytes which can be used for injection attacks
    sanitized = sanitized.replace(/\0/g, '');

    // Remove any remaining control characters except newlines and tabs
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return sanitized;
  }
}
