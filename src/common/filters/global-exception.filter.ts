import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Log the full error with stack trace
    this.logError(exception, request);

    // Build error response
    const errorResponse = this.buildErrorResponse(exception, request);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;

    // Handle NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let message: string | string[];
      let error: string;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;
      } else {
        message = exception.message;
        error = exception.name;
      }

      return {
        statusCode: status,
        message,
        error,
        timestamp,
        path,
      };
    }

    // Handle Prisma errors
    if (this.isPrismaError(exception)) {
      return this.handlePrismaError(exception, timestamp, path);
    }

    // Handle unknown errors
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'InternalServerError',
      timestamp,
      path,
    };
  }

  private isPrismaError(
    exception: unknown,
  ): exception is Prisma.PrismaClientKnownRequestError {
    return (
      exception instanceof Prisma.PrismaClientKnownRequestError ||
      exception instanceof Prisma.PrismaClientUnknownRequestError ||
      exception instanceof Prisma.PrismaClientValidationError ||
      exception instanceof Prisma.PrismaClientInitializationError
    );
  }

  private handlePrismaError(
    exception: any,
    timestamp: string,
    path: string,
  ): ErrorResponse {
    // Handle known Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          // Unique constraint violation
          const target = exception.meta?.target as string[] | undefined;
          const field = target ? target[0] : 'field';
          return {
            statusCode: HttpStatus.CONFLICT,
            message: `A record with this ${field} already exists`,
            error: 'Conflict',
            timestamp,
            path,
          };

        case 'P2025':
          // Record not found
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Record not found',
            error: 'NotFound',
            timestamp,
            path,
          };

        case 'P2003':
          // Foreign key constraint violation
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid reference to related record',
            error: 'BadRequest',
            timestamp,
            path,
          };

        case 'P2014':
          // Required relation violation
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Required relation is missing',
            error: 'BadRequest',
            timestamp,
            path,
          };

        default:
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Database operation failed',
            error: 'BadRequest',
            timestamp,
            path,
          };
      }
    }

    // Handle validation errors
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid data provided',
        error: 'BadRequest',
        timestamp,
        path,
      };
    }

    // Handle unknown Prisma errors
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database error occurred',
      error: 'InternalServerError',
      timestamp,
      path,
    };
  }

  private logError(exception: unknown, request: Request): void {
    const { method, url, body, query, params } = request;

    // Sanitize request data (remove sensitive fields)
    const sanitizedBody = this.sanitizeData(body);
    const sanitizedQuery = this.sanitizeData(query);

    const errorContext = {
      method,
      url,
      body: sanitizedBody,
      query: sanitizedQuery,
      params,
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      // Log client errors (4xx) as warnings
      if (status >= 400 && status < 500) {
        this.logger.warn(
          `Client error: ${exception.message}`,
          JSON.stringify(errorContext, null, 2),
        );
      } else {
        // Log server errors (5xx) as errors with stack trace
        this.logger.error(
          `Server error: ${exception.message}`,
          exception.stack,
          JSON.stringify(errorContext, null, 2),
        );
      }
    } else if (exception instanceof Error) {
      // Log unknown errors with full stack trace
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
        JSON.stringify(errorContext, null, 2),
      );
    } else {
      // Log non-Error exceptions
      this.logger.error(
        'Unknown exception occurred',
        JSON.stringify({ exception, context: errorContext }, null, 2),
      );
    }
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'creditCard',
      'cvv',
      'ssn',
    ];

    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }
}
