import { DataSanitizer } from '../data-sanitizer';

describe('DataSanitizer', () => {
  let sanitizer: DataSanitizer;

  beforeEach(() => {
    sanitizer = new DataSanitizer();
  });

  describe('sanitizeHeaders', () => {
    it('should redact Authorization header', () => {
      const headers = {
        Authorization: 'Bearer token123',
        'Content-Type': 'application/json',
      };

      const sanitized = sanitizer.sanitizeHeaders(headers);

      expect(sanitized['Authorization']).toBe('[REDACTED]');
      expect(sanitized['Content-Type']).toBe('application/json');
    });

    it('should redact Cookie header', () => {
      const headers = {
        Cookie: 'session=abc123; user=john',
        Accept: 'application/json',
      };

      const sanitized = sanitizer.sanitizeHeaders(headers);

      expect(sanitized['Cookie']).toBe('[REDACTED]');
      expect(sanitized['Accept']).toBe('application/json');
    });

    it('should handle case-insensitive header names', () => {
      const headers = {
        authorization: 'Bearer token123',
        COOKIE: 'session=abc123',
        cookie: 'another=value',
        Authorization: 'Basic xyz',
      };

      const sanitized = sanitizer.sanitizeHeaders(headers);

      expect(sanitized['authorization']).toBe('[REDACTED]');
      expect(sanitized['COOKIE']).toBe('[REDACTED]');
      expect(sanitized['cookie']).toBe('[REDACTED]');
      expect(sanitized['Authorization']).toBe('[REDACTED]');
    });

    it('should preserve non-sensitive headers', () => {
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'X-Custom-Header': 'custom-value',
      };

      const sanitized = sanitizer.sanitizeHeaders(headers);

      expect(sanitized['Content-Type']).toBe('application/json');
      expect(sanitized['Accept']).toBe('application/json');
      expect(sanitized['User-Agent']).toBe('Mozilla/5.0');
      expect(sanitized['X-Custom-Header']).toBe('custom-value');
    });

    it('should handle null or undefined headers', () => {
      expect(sanitizer.sanitizeHeaders(null)).toBeNull();
      expect(sanitizer.sanitizeHeaders(undefined)).toBeUndefined();
    });

    it('should handle empty headers object', () => {
      const headers = {};
      const sanitized = sanitizer.sanitizeHeaders(headers);

      expect(sanitized).toEqual({});
    });

    it('should redact both Authorization and Cookie in same request', () => {
      const headers = {
        Authorization: 'Bearer token123',
        Cookie: 'session=abc123',
        'Content-Type': 'application/json',
      };

      const sanitized = sanitizer.sanitizeHeaders(headers);

      expect(sanitized['Authorization']).toBe('[REDACTED]');
      expect(sanitized['Cookie']).toBe('[REDACTED]');
      expect(sanitized['Content-Type']).toBe('application/json');
    });
  });
});
