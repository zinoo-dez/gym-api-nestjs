import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

export class AssignMembershipDto {
  @IsUUID('4', { message: 'Member ID must be a valid UUID' })
  memberId!: string;

  @IsUUID('4', { message: 'Plan ID must be a valid UUID' })
  planId!: string;

  @IsDateString({}, { message: 'Start date must be a valid ISO 8601 date' })
  startDate!: string;

  @IsOptional()
  @IsString({ message: 'Discount code must be a string' })
  discountCode?: string;
}
