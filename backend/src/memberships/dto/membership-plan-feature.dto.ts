import { IsEnum, IsString } from 'class-validator';
import { FeatureLevel } from '@prisma/client';

export class MembershipPlanFeatureInputDto {
  @IsString()
  featureId!: string;

  @IsEnum(FeatureLevel)
  level!: FeatureLevel;
}

export class MembershipPlanFeatureResponseDto {
  featureId!: string;
  name!: string;
  description?: string;
  level!: FeatureLevel;
}
