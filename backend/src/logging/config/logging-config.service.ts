import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogLevel, LoggingConfig, TransportConfig } from '../interfaces';

@Injectable()
export class LoggingConfigService {
  private readonly config: LoggingConfig;

  constructor(private configService: ConfigService) {
    this.config = this.loadConfiguration();
  }

  private loadConfiguration(): LoggingConfig {
    const env = this.configService.get<string>('APP_ENV', 'development');
    const isDevelopment = env === 'development';

    // Load log level from environment or use defaults
    const logLevelStr = this.configService.get<string>(
      'LOG_LEVEL',
      isDevelopment ? 'debug' : 'info',
    );
    const level = this.parseLogLevel(logLevelStr);

    // Load log format from environment or use defaults
    const format = this.configService.get<'json' | 'pretty'>(
      'LOG_FORMAT',
      isDevelopment ? 'pretty' : 'json',
    );

    // Load color settings
    const enableColors =
      this.configService.get<string>(
        'LOG_COLORS',
        isDevelopment ? 'true' : 'false',
      ) === 'true';

    // Load service information
    const serviceName = this.configService.get<string>(
      'SERVICE_NAME',
      'gym-api',
    );
    const serviceVersion = this.configService.get<string>(
      'SERVICE_VERSION',
      '1.0.0',
    );

    // Load sensitive fields
    const sensitiveFieldsStr = this.configService.get<string>(
      'SENSITIVE_FIELDS',
      '',
    );
    const customSensitiveFields = sensitiveFieldsStr
      ? sensitiveFieldsStr.split(',').map((field) => field.trim())
      : [];

    // Default sensitive fields
    const defaultSensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'creditCard',
      'cvv',
      'ssn',
      'secret',
      'apiKey',
      'privateKey',
      'sessionId',
    ];

    const sensitiveFields = [
      ...defaultSensitiveFields,
      ...customSensitiveFields,
    ];

    // Configure transports
    const transports: TransportConfig[] = [
      {
        type: 'console',
        enabled: true,
      },
      {
        type: 'file',
        enabled:
          this.configService.get<string>('ENABLE_FILE_LOGGING', 'true') ===
          'true',
        options: {
          logDir: this.configService.get<string>('LOG_DIR', 'logs'),
          filename: this.configService.get<string>('LOG_FILENAME', 'app'),
          maxFileSize: parseInt(
            this.configService.get<string>('LOG_MAX_FILE_SIZE', '10485760'), // 10MB
            10,
          ),
          maxFiles: parseInt(
            this.configService.get<string>('LOG_MAX_FILES', '5'),
            10,
          ),
          separateByLevel:
            this.configService.get<string>('LOG_SEPARATE_BY_LEVEL', 'true') ===
            'true',
        },
      },
    ];

    return {
      level,
      format,
      enableColors,
      enableTimestamp: true,
      transports,
      sensitiveFields,
      serviceName,
      serviceVersion,
    };
  }

  private parseLogLevel(level: string): LogLevel {
    const normalizedLevel = level.toLowerCase();
    switch (normalizedLevel) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  getConfig(): LoggingConfig {
    return this.config;
  }

  getLogLevel(): LogLevel {
    return this.config.level;
  }

  getLogFormat(): 'json' | 'pretty' {
    return this.config.format;
  }

  isColorsEnabled(): boolean {
    return this.config.enableColors;
  }

  getSensitiveFields(): string[] {
    return this.config.sensitiveFields;
  }

  getServiceName(): string {
    return this.config.serviceName;
  }

  getServiceVersion(): string {
    return this.config.serviceVersion;
  }

  getTransports(): TransportConfig[] {
    return this.config.transports;
  }
}
