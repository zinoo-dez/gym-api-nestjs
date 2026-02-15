import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateGymClosureDto {
  @ApiProperty({ example: '2026-02-20T00:00:00.000Z', format: 'date-time' })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({ example: 'Public holiday' })
  @IsString()
  @IsOptional()
  reason?: string;
}
