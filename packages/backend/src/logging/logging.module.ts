import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingConfigService } from './config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [LoggingConfigService],
  exports: [LoggingConfigService],
})
export class LoggingModule {}
