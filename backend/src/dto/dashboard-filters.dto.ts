import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsDateString } from 'class-validator';

export const DASHBOARD_RANGES = [
  'today',
  'last7days',
  'last30days',
  'custom',
] as const;
export const DASHBOARD_PERIODS = ['daily', 'weekly', 'monthly'] as const;
export const DASHBOARD_EXPORT_FORMATS = ['csv', 'pdf'] as const;

export type DashboardRange = (typeof DASHBOARD_RANGES)[number];
export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];
export type DashboardExportFormat = (typeof DASHBOARD_EXPORT_FORMATS)[number];

export class DashboardFiltersDto {
  @ApiPropertyOptional({ enum: DASHBOARD_RANGES })
  @IsOptional()
  @IsIn(DASHBOARD_RANGES)
  range?: DashboardRange;

  @ApiPropertyOptional({ enum: DASHBOARD_PERIODS })
  @IsOptional()
  @IsIn(DASHBOARD_PERIODS)
  period?: DashboardPeriod;

  @ApiPropertyOptional({
    description: 'Start date (YYYY-MM-DD)',
    example: '2026-02-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date (YYYY-MM-DD)',
    example: '2026-02-29',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Branch identifier (reserved for multi-branch setups)',
    example: 'downtown',
  })
  @IsOptional()
  @IsString()
  branch?: string;

  @ApiPropertyOptional({
    description: 'Class category filter',
    example: 'YOGA',
  })
  @IsOptional()
  @IsString()
  classCategory?: string;
}

export class DashboardExportQueryDto extends DashboardFiltersDto {
  @ApiPropertyOptional({ enum: DASHBOARD_EXPORT_FORMATS, default: 'csv' })
  @IsOptional()
  @IsIn(DASHBOARD_EXPORT_FORMATS)
  format?: DashboardExportFormat;
}
