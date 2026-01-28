import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkHealth(): Promise<{
    status: string;
    timestamp: string;
    database: string;
    responseTime: number;
  }> {
    const startTime = Date.now();

    try {
      // Simple database connectivity check using $queryRaw
      // This is a lightweight query that just verifies the connection
      await this.prisma.$queryRaw`SELECT 1`;

      const responseTime = Date.now() - startTime;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        responseTime,
      };
    }
  }
}
