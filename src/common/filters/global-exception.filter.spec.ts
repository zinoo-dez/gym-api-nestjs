import { GlobalExceptionFilter } from './global-exception.filter';
import {
  ArgumentsHost,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/test-endpoint',
      method: 'POST',
      body: { email: 'test@example.com', password: 'secret123' },
      query: {},
      params: {},
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    };
  });

  describe('HttpException handling', () => {
    it('should handle BadRequestException with validation errors', () => {
      const exception = new BadRequestException([
        'email must be an email',
        'password must be longer than 8 characters',
      ]);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: [
            'email must be an email',
            'password must be longer than 8 characters',
          ],
          error: 'Bad Request',
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );
    });

    it('should handle NotFoundException', () => {
      const exception = new NotFoundException(
        'Member with ID abc123 not found',
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Member with ID abc123 not found',
          error: 'Not Found',
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );
    });

    it('should handle ConflictException', () => {
      const exception = new ConflictException(
        'User with this email already exists',
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.CONFLICT,
          message: 'User with this email already exists',
          error: 'Conflict',
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );
    });

    it('should handle InternalServerErrorException', () => {
      const exception = new InternalServerErrorException(
        'Something went wrong',
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
          error: 'Internal Server Error',
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );
    });
  });

  describe('Prisma error handling', () => {
    it('should handle P2002 unique constraint violation', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: { target: ['email'] },
        },
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.CONFLICT,
          message: 'A record with this email already exists',
          error: 'Conflict',
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );
    });

    it('should handle P2025 record not found', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Record to update not found',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
          meta: {},
        },
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          error: 'NotFound',
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );
    });

    it('should handle P2003 foreign key constraint violation', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
          meta: {},
        },
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid reference to related record',
          error: 'BadRequest',
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );
    });

    it('should handle PrismaClientValidationError', () => {
      const exception = new Prisma.PrismaClientValidationError(
        'Invalid data provided',
        { clientVersion: '5.0.0' },
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid data provided',
          error: 'BadRequest',
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );
    });
  });

  describe('Unknown error handling', () => {
    it('should handle unknown errors with 500 status', () => {
      const exception = new Error('Unexpected error');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: 'InternalServerError',
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );
    });

    it('should handle non-Error exceptions', () => {
      const exception = 'String error';

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: 'InternalServerError',
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );
    });
  });

  describe('Sensitive data sanitization', () => {
    it('should sanitize password from request body in logs', () => {
      const loggerSpy = jest.spyOn(filter['logger'], 'warn');
      const exception = new BadRequestException('Invalid input');

      filter.catch(exception, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalled();
      const loggedData = loggerSpy.mock.calls[0][1];
      expect(loggedData).toContain('[REDACTED]');
      expect(loggedData).not.toContain('secret123');
    });

    it('should sanitize token from request body', () => {
      mockRequest.body = {
        token: 'secret-token-123',
        email: 'test@example.com',
      };
      const loggerSpy = jest.spyOn(filter['logger'], 'error');
      const exception = new InternalServerErrorException('Server error');

      filter.catch(exception, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalled();
      const loggedData = loggerSpy.mock.calls[0][2];
      expect(loggedData).toContain('[REDACTED]');
      expect(loggedData).not.toContain('secret-token-123');
    });

    it('should not expose sensitive data in error responses', () => {
      mockRequest.body = {
        password: 'secret123',
        creditCard: '1234-5678-9012-3456',
      };
      const exception = new BadRequestException('Invalid data');

      filter.catch(exception, mockArgumentsHost);

      const responseData = mockResponse.json.mock.calls[0][0];
      expect(JSON.stringify(responseData)).not.toContain('secret123');
      expect(JSON.stringify(responseData)).not.toContain('1234-5678-9012-3456');
    });
  });

  describe('Error logging', () => {
    it('should log client errors (4xx) as warnings', () => {
      const loggerSpy = jest.spyOn(filter['logger'], 'warn');
      const exception = new BadRequestException('Invalid input');

      filter.catch(exception, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Client error'),
        expect.any(String),
      );
    });

    it('should log server errors (5xx) as errors with stack trace', () => {
      const loggerSpy = jest.spyOn(filter['logger'], 'error');
      const exception = new InternalServerErrorException('Server error');

      filter.catch(exception, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Server error'),
        expect.any(String),
        expect.any(String),
      );
    });

    it('should log unknown errors with full stack trace', () => {
      const loggerSpy = jest.spyOn(filter['logger'], 'error');
      const exception = new Error('Unexpected error');

      filter.catch(exception, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unexpected error'),
        expect.any(String),
        expect.any(String),
      );
    });
  });

  describe('Response format consistency', () => {
    it('should always include required fields in error response', () => {
      const exception = new BadRequestException('Test error');

      filter.catch(exception, mockArgumentsHost);

      const responseData = mockResponse.json.mock.calls[0][0];
      expect(responseData).toHaveProperty('statusCode');
      expect(responseData).toHaveProperty('message');
      expect(responseData).toHaveProperty('error');
      expect(responseData).toHaveProperty('timestamp');
      expect(responseData).toHaveProperty('path');
    });

    it('should format timestamp as ISO string', () => {
      const exception = new BadRequestException('Test error');

      filter.catch(exception, mockArgumentsHost);

      const responseData = mockResponse.json.mock.calls[0][0];
      expect(() => new Date(responseData.timestamp)).not.toThrow();
      expect(responseData.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      );
    });

    it('should include request path in error response', () => {
      mockRequest.url = '/api/members/123';
      const exception = new NotFoundException('Member not found');

      filter.catch(exception, mockArgumentsHost);

      const responseData = mockResponse.json.mock.calls[0][0];
      expect(responseData.path).toBe('/api/members/123');
    });
  });
});
