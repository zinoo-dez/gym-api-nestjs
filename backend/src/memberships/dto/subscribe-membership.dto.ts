import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscribeMembershipDto {
  @ApiProperty({ example: 'cm1234567890plan123456' })
  @IsString({ message: 'Plan ID must be a string' })
  planId!: string;

  @ApiPropertyOptional({
    example: '2026-02-15T09:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid ISO 8601 date' })
  startDate?: string;

  @ApiPropertyOptional({ example: 'WELCOME20' })
  @IsOptional()
  @IsString({ message: 'Discount code must be a string' })
  discountCode?: string;
}
