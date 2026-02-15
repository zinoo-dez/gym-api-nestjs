import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignMembershipDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4', { message: 'Member ID must be a valid UUID' })
  memberId!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174111' })
  @IsUUID('4', { message: 'Plan ID must be a valid UUID' })
  planId!: string;

  @ApiProperty({ example: '2026-02-15T09:00:00.000Z', format: 'date-time' })
  @IsDateString({}, { message: 'Start date must be a valid ISO 8601 date' })
  startDate!: string;

  @ApiPropertyOptional({ example: 'WELCOME20' })
  @IsOptional()
  @IsString({ message: 'Discount code must be a string' })
  discountCode?: string;
}
