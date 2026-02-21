import {
  Controller,
  Get,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
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
    details?: string;
  }> {
    const health = await this.appService.checkHealth();
    if (health.status !== 'ok') {
      throw new ServiceUnavailableException(health);
    }
    return health;
  }

  @Get('health/db')
  @ApiOperation({ summary: 'Database connectivity health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Database is reachable',
  })
  @ApiResponse({
    status: 503,
    description: 'Database is unavailable',
  })
  async checkDatabaseHealth(): Promise<{
    status: string;
    timestamp: string;
    database: string;
    responseTime: number;
    details?: string;
  }> {
    const health = await this.appService.checkDatabaseHealth();
    if (health.status !== 'ok') {
      throw new ServiceUnavailableException(health);
    }
    return health;
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  async getDashboardStats() {
    return this.appService.getDashboardStats();
  }

  @Get('dashboard/recent-members')
  @ApiOperation({ summary: 'Get recent members' })
  @ApiResponse({
    status: 200,
    description: 'Recent members retrieved successfully',
  })
  async getRecentMembers() {
    return this.appService.getRecentMembers();
  }

  @Get('dashboard/popular-classes')
  @ApiOperation({ summary: 'Get popular classes today' })
  @ApiResponse({
    status: 200,
    description: 'Popular classes retrieved successfully',
  })
  async getPopularClasses() {
    return this.appService.getPopularClasses();
  }

  @Get('dashboard/upcoming-classes')
  @ApiOperation({ summary: 'Get upcoming class attendance' })
  @ApiResponse({
    status: 200,
    description: 'Upcoming class attendance retrieved successfully',
  })
  async getUpcomingClasses(@Query('days') days?: string) {
    const windowDays = Number(days) || 7;
    return this.appService.getUpcomingClasses(windowDays);
  }

  @Get('dashboard/recent-activity')
  @ApiOperation({ summary: 'Get recent activity' })
  @ApiResponse({
    status: 200,
    description: 'Recent activity retrieved successfully',
  })
  async getRecentActivity() {
    return this.appService.getRecentActivity();
  }

  @Get('dashboard/analytics')
  @ApiOperation({ summary: 'Get reporting and analytics dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Reporting and analytics data retrieved successfully',
  })
  async getReportingAnalytics() {
    return this.appService.getReportingAnalytics();
  }
}
