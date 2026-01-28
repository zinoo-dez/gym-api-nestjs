import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsNumber,
  IsEnum,
  IsArray,
} from 'class-validator';
import { MembershipType } from '@prisma/client';

export class CreateMembershipPlanDto {
  @IsString({ message: 'Name must be a string' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsInt({ message: 'Duration days must be an integer' })
  @Min(1, { message: 'Duration must be at least 1 day' })
  durationDays!: number;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be non-negative' })
  price!: number;

  @IsEnum(MembershipType, {
    message: 'Type must be a valid membership type (BASIC, PREMIUM, VIP)',
  })
  type!: MembershipType;

  @IsArray({ message: 'Features must be an array' })
  @IsString({ each: true, message: 'Each feature must be a string' })
  features!: string[];
}
