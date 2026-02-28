import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    private pool: Pool;

    constructor(configService: ConfigService) {
        const connectionString = configService.get<string>('DATABASE_URL');
        if (!connectionString) {
            throw new Error(
                'DATABASE_URL environment variable is required but not set',
            );
        }

        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);

        super({
            adapter,
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'event', level: 'error' },
                { emit: 'event', level: 'info' },
                { emit: 'event', level: 'warn' },
            ],
            errorFormat: 'pretty',
        });

        this.pool = pool;
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Successfully connected to database');
        } catch (error) {
            this.logger.error('Failed to connect to database', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        await this.pool.end();
        this.logger.log('Disconnected from database');
    }
}
