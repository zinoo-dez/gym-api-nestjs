import { IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceType } from '@prisma/client';
import { PaginationDto } from '../../common/dto';

export class AttendanceFiltersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by member ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date (ISO 8601 format)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (ISO 8601 format)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by attendance type',
    enum: AttendanceType,
    example: AttendanceType.GYM_VISIT,
  })
  @IsOptional()
  @IsEnum(AttendanceType)
  type?: AttendanceType;
}
