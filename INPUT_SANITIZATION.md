# Input Sanitization Implementation

## Overview

This document describes the input sanitization implementation for the Gym API to prevent XSS (Cross-Site Scripting) and SQL injection attacks.

## Implementation Details

### Sanitization Middleware

**Location**: `src/common/middleware/sanitization.middleware.ts`

The `SanitizationMiddleware` is a NestJS middleware that automatically sanitizes all incoming request data before it reaches the controllers and services.

### What Gets Sanitized

The middleware sanitizes:

- **Request Body**: All POST, PUT, PATCH request bodies
- **Query Parameters**: All URL query parameters
- **URL Parameters**: All route parameters

### Sanitization Features

1. **XSS Prevention**
   - Removes all HTML tags using `sanitize-html`
   - Escapes special characters using `validator.escape()`
   - Prevents script injection attacks

2. **SQL Injection Prevention**
   - Escapes SQL special characters
   - Removes null bytes (`\0`)
   - Note: Prisma ORM already prevents SQL injection through parameterized queries

3. **Control Character Removal**
   - Removes control characters (except newlines and tabs)
   - Removes null bytes
   - Cleans malicious character sequences

4. **Whitespace Handling**
   - Trims leading and trailing whitespace
   - Normalizes whitespace in strings

5. **Data Type Preservation**
   - Numbers remain as numbers
   - Booleans remain as booleans
   - Only strings are sanitized
   - Null and undefined values are preserved

### Configuration

The middleware is applied globally to all routes in `app.module.ts`:

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SanitizationMiddleware).forRoutes('*');
  }
}
```

### Dependencies

- `sanitize-html`: HTML sanitization library
- `validator`: String validation and sanitization utilities

### Testing

**Unit Tests**: `src/common/middleware/sanitization.middleware.spec.ts`

- Tests XSS prevention
- Tests SQL injection prevention
- Tests control character removal
- Tests data type preservation
- Tests edge cases

**E2E Tests**: `test/input-sanitization.e2e-spec.ts`

- Tests sanitization in real API requests
- Tests member registration with malicious input
- Tests trainer and class creation with XSS attempts
- Tests SQL injection in search queries

### Security Considerations

1. **Defense in Depth**: This middleware provides an additional security layer on top of:
   - Prisma's parameterized queries (SQL injection prevention)
   - NestJS ValidationPipe (input validation)
   - Helmet security headers

2. **Strict Configuration**: The sanitizer uses a strict configuration that removes ALL HTML tags. This is appropriate for a gym management API where HTML content is not expected.

3. **Performance**: The middleware processes all incoming requests, which adds minimal overhead but provides significant security benefits.

### Example

**Input**:

```json
{
  "firstName": "<script>alert('XSS')</script>John",
  "lastName": "Doe<img src=x onerror=alert(1)>",
  "email": "test@example.com"
}
```

**After Sanitization**:

```json
{
  "firstName": "&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;John",
  "lastName": "Doe&lt;img src=x onerror=alert(1)&gt;",
  "email": "test@example.com"
}
```

The malicious scripts are escaped and rendered harmless.

## Compliance

This implementation satisfies **Requirement 11.3**:

> THE API SHALL validate and sanitize all user inputs to prevent SQL injection and XSS attacks

## Maintenance

- The sanitization rules are centralized in one middleware file
- To adjust sanitization behavior, modify `sanitizeString()` method
- To exclude specific routes, update the `forRoutes()` configuration in `app.module.ts`
