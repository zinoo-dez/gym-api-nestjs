import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingConfigService } from './config';
import { LoggerService } from './logger.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [LoggingConfigService, LoggerService],
  exports: [LoggingConfigService, LoggerService],
})
export class LoggingModule {}
