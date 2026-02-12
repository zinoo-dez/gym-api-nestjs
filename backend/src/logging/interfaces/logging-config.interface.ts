export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface TransportConfig {
  type: 'console' | 'file' | 'external';
  enabled: boolean;
  options?: Record<string, any>;
}

export interface LoggingConfig {
  level: LogLevel;
  format: 'json' | 'pretty';
  enableColors: boolean;
  enableTimestamp: boolean;
  transports: TransportConfig[];
  sensitiveFields: string[];
  serviceName: string;
  serviceVersion: string;
}
