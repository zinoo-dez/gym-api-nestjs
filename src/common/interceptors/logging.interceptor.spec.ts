import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();

    // Mock request and response
    const mockRequest = {
      method: 'POST',
      url: '/auth/login',
      body: {
        email: 'test@example.com',
        password: 'secretPassword123',
      },
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer secret-token',
      },
    };

    const mockResponse = {
      statusCode: 200,
    };

    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    mockCallHandler = {
      handle: () => of({ accessToken: 'jwt-token', user: { id: '1' } }),
    } as CallHandler;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log incoming requests with sanitized data', (done) => {
    const logSpy = jest.spyOn(interceptor['logger'], 'log');

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: () => {
        // Check that incoming request was logged
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('Incoming Request: POST /auth/login'),
        );

        // Check that password is redacted
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('[REDACTED]'),
        );

        // Check that email is not redacted
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('test@example.com'),
        );

        done();
      },
    });
  });

  it('should log outgoing responses with sanitized data', (done) => {
    const logSpy = jest.spyOn(interceptor['logger'], 'log');

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: () => {
        // Check that outgoing response was logged
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('Outgoing Response: POST /auth/login'),
        );

        // Check that response includes status and duration
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('Status: 200'),
        );
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('Duration:'),
        );

        done();
      },
    });
  });

  it('should redact sensitive fields in request body', (done) => {
    const logSpy = jest.spyOn(interceptor['logger'], 'log');

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: () => {
        const logCalls = logSpy.mock.calls.map((call) => call[0]);
        const incomingRequestLog = logCalls.find((log) =>
          log.includes('Incoming Request'),
        );

        expect(incomingRequestLog).toBeDefined();
        expect(incomingRequestLog).toContain('[REDACTED]');
        expect(incomingRequestLog).not.toContain('secretPassword123');

        done();
      },
    });
  });

  it('should redact authorization headers', (done) => {
    const logSpy = jest.spyOn(interceptor['logger'], 'log');

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: () => {
        const logCalls = logSpy.mock.calls.map((call) => call[0]);
        const incomingRequestLog = logCalls.find((log) =>
          log.includes('Incoming Request'),
        );

        expect(incomingRequestLog).toBeDefined();
        expect(incomingRequestLog).not.toContain('Bearer secret-token');

        done();
      },
    });
  });

  it('should redact tokens in response data', (done) => {
    const logSpy = jest.spyOn(interceptor['logger'], 'log');

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: () => {
        const logCalls = logSpy.mock.calls.map((call) => call[0]);
        const outgoingResponseLog = logCalls.find((log) =>
          log.includes('Outgoing Response'),
        );

        expect(outgoingResponseLog).toBeDefined();
        expect(outgoingResponseLog).toContain('[REDACTED]');
        expect(outgoingResponseLog).not.toContain('jwt-token');

        done();
      },
    });
  });

  it('should log errors when request fails', (done) => {
    const errorSpy = jest.spyOn(interceptor['logger'], 'error');
    const error = { status: 401, message: 'Unauthorized' };

    mockCallHandler = {
      handle: () => throwError(() => error),
    } as CallHandler;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      error: () => {
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Request Failed: POST /auth/login'),
        );
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Status: 401'),
        );
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Error: Unauthorized'),
        );

        done();
      },
    });
  });

  it('should handle nested objects with sensitive fields', () => {
    const data = {
      user: {
        email: 'test@example.com',
        password: 'secret123',
        profile: {
          name: 'John Doe',
          token: 'refresh-token',
        },
      },
    };

    const sanitized = interceptor['sanitizeData'](data);

    expect(sanitized.user.email).toBe('test@example.com');
    expect(sanitized.user.password).toBe('[REDACTED]');
    expect(sanitized.user.profile.name).toBe('John Doe');
    expect(sanitized.user.profile.token).toBe('[REDACTED]');
  });

  it('should handle arrays with sensitive data', () => {
    const data = [
      { email: 'user1@example.com', password: 'pass1' },
      { email: 'user2@example.com', password: 'pass2' },
    ];

    const sanitized = interceptor['sanitizeData'](data);

    expect(sanitized[0].email).toBe('user1@example.com');
    expect(sanitized[0].password).toBe('[REDACTED]');
    expect(sanitized[1].email).toBe('user2@example.com');
    expect(sanitized[1].password).toBe('[REDACTED]');
  });

  it('should handle null and undefined values', () => {
    expect(interceptor['sanitizeData'](null)).toBeNull();
    expect(interceptor['sanitizeData'](undefined)).toBeUndefined();
  });

  it('should detect sensitive fields case-insensitively', () => {
    const data = {
      Password: 'secret',
      ACCESS_TOKEN: 'token123',
      CreditCard: '1234-5678-9012-3456',
    };

    const sanitized = interceptor['sanitizeData'](data);

    expect(sanitized.Password).toBe('[REDACTED]');
    expect(sanitized.ACCESS_TOKEN).toBe('[REDACTED]');
    expect(sanitized.CreditCard).toBe('[REDACTED]');
  });

  it('should redact cookie headers', () => {
    const headers = {
      'content-type': 'application/json',
      cookie: 'session=abc123; token=xyz789',
      'user-agent': 'Mozilla/5.0',
    };

    const sanitized = interceptor['sanitizeHeaders'](headers);

    expect(sanitized['content-type']).toBe('application/json');
    expect(sanitized.cookie).toBe('[REDACTED]');
    expect(sanitized['user-agent']).toBe('Mozilla/5.0');
  });
});
