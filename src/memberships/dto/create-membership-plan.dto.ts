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
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  durationDays!: number;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsEnum(MembershipType)
  type!: MembershipType;

  @IsArray()
  @IsString({ each: true })
  features!: string[];
}
