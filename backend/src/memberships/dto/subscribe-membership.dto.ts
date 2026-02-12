import { IsString, IsOptional, IsDateString } from 'class-validator';

export class SubscribeMembershipDto {
  @IsString({ message: 'Plan ID must be a string' })
  planId!: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid ISO 8601 date' })
  startDate?: string;

  @IsOptional()
  @IsString({ message: 'Discount code must be a string' })
  discountCode?: string;
}
