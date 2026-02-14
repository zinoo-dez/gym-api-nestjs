import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  ValidateIf,
} from 'class-validator';

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
