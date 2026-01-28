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
