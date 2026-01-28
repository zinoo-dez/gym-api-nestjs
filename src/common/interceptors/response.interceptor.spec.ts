import { ResponseInterceptor } from './response.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();

    const mockRequest = {
      url: '/test-endpoint',
    };

    const mockResponse = {
      statusCode: 200,
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as any;

    mockCallHandler = {
      handle: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap response data in consistent format', (done) => {
    const testData = { id: '123', name: 'Test' };
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('statusCode');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('path');
        expect(result.data).toEqual(testData);
        expect(result.statusCode).toBe(200);
        expect(result.path).toBe('/test-endpoint');
        expect(result.timestamp).toBeDefined();
        done();
      },
      error: done,
    });
  });

  it('should include correct timestamp format', (done) => {
    const testData = { message: 'Success' };
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (result) => {
        const timestamp = new Date(result.timestamp);
        expect(timestamp).toBeInstanceOf(Date);
        expect(timestamp.toISOString()).toBe(result.timestamp);
        done();
      },
      error: done,
    });
  });

  it('should preserve original data structure', (done) => {
    const complexData = {
      items: [{ id: 1 }, { id: 2 }],
      total: 2,
      page: 1,
    };
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(complexData));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result.data).toEqual(complexData);
        expect(result.data.items).toHaveLength(2);
        expect(result.data.total).toBe(2);
        done();
      },
      error: done,
    });
  });

  it('should handle null data', (done) => {
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(null));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result.data).toBeNull();
        expect(result.statusCode).toBe(200);
        done();
      },
      error: done,
    });
  });

  it('should handle undefined data', (done) => {
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(undefined));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result.data).toBeUndefined();
        expect(result.statusCode).toBe(200);
        done();
      },
      error: done,
    });
  });

  it('should use correct status code from response', (done) => {
    const mockResponse = { statusCode: 201 };
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ url: '/test' }),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as any;

    (mockCallHandler.handle as jest.Mock).mockReturnValue(
      of({ created: true }),
    );

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result.statusCode).toBe(201);
        done();
      },
      error: done,
    });
  });
});
