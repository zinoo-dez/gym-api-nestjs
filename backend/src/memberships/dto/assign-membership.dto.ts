import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignMembershipDto {
  @ApiProperty({ example: 'cmm3uqoks000429ozjre4c2to' })
  @IsString({ message: 'Member ID must be a string' })
  memberId!: string;

  @ApiProperty({ example: 'cmlmep0ae000cjxoz8plmljlr' })
  @IsString({ message: 'Plan ID must be a string' })
  planId!: string;

  @ApiProperty({ example: '2026-02-15T09:00:00.000Z', format: 'date-time' })
  @IsDateString({}, { message: 'Start date must be a valid ISO 8601 date' })
  startDate!: string;

  @ApiPropertyOptional({ example: 'WELCOME20' })
  @IsOptional()
  @IsString({ message: 'Discount code must be a string' })
  discountCode?: string;
}
