import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  @ApiOperation({ summary: 'Simple test endpoint for deployment verification' })
  @ApiResponse({
    status: 200,
    description: 'Test successful',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Hello World! Deployment is working.',
        },
        status: { type: 'string', example: 'success' },
        timestamp: { type: 'string', example: '2026-01-29T12:00:00.000Z' },
      },
    },
  })
  test(): { message: string; status: string; timestamp: string } {
    return {
      message: 'Hello World! Deployment is working.',
      status: 'success',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-28T12:00:00.000Z' },
        database: { type: 'string', example: 'connected' },
        responseTime: { type: 'number', example: 15 },
      },
    },
  })
  async checkHealth(): Promise<{
    status: string;
    timestamp: string;
    database: string;
    responseTime: number;
  }> {
    return this.appService.checkHealth();
  }
}
