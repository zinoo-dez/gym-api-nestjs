import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsNumber,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateGymSettingDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  tagLine?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  favicon?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  taxPercentage?: number;

  @IsOptional()
  @IsString()
  stripePublicKey?: string;

  @IsOptional()
  @IsString()
  stripeSecretKey?: string;

  @IsOptional()
  @IsString()
  paypalClientId?: string;

  @IsOptional()
  @IsString()
  paypalSecret?: string;

  @IsOptional()
  @IsBoolean()
  emailNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  smsNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  newMemberNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  newTrainerNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  newMembershipNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  newPaymentNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  newSessionNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  newWorkoutPlanNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  newProgressNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  newAttendanceNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  newEquipmentNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  newGymSettingNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  newUserSettingNotification?: boolean;
}
