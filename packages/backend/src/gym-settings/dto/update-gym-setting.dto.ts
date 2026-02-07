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
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  @IsString()
  heroTitle?: string;

  @IsOptional()
  @IsString()
  heroSubtitle?: string;

  @IsOptional()
  @IsString()
  heroCtaPrimary?: string;

  @IsOptional()
  @IsString()
  heroCtaSecondary?: string;

  @IsOptional()
  @IsString()
  featuresTitle?: string;

  @IsOptional()
  @IsString()
  featuresSubtitle?: string;

  @IsOptional()
  @IsString()
  classesTitle?: string;

  @IsOptional()
  @IsString()
  classesSubtitle?: string;

  @IsOptional()
  @IsString()
  trainersTitle?: string;

  @IsOptional()
  @IsString()
  trainersSubtitle?: string;

  @IsOptional()
  @IsString()
  workoutsTitle?: string;

  @IsOptional()
  @IsString()
  workoutsSubtitle?: string;

  @IsOptional()
  @IsString()
  pricingTitle?: string;

  @IsOptional()
  @IsString()
  pricingSubtitle?: string;

  @IsOptional()
  @IsString()
  footerTagline?: string;

  @IsOptional()
  @IsString()
  appShowcaseTitle?: string;

  @IsOptional()
  @IsString()
  appShowcaseSubtitle?: string;

  @IsOptional()
  @IsString()
  ctaTitle?: string;

  @IsOptional()
  @IsString()
  ctaSubtitle?: string;

  @IsOptional()
  @IsString()
  ctaButtonLabel?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsString()
  heroBgImage?: string;

  @IsOptional()
  @IsString()
  featuresBgImage?: string;

  @IsOptional()
  @IsString()
  classesBgImage?: string;

  @IsOptional()
  @IsString()
  trainersBgImage?: string;

  @IsOptional()
  @IsString()
  workoutsBgImage?: string;

  @IsOptional()
  @IsString()
  pricingBgImage?: string;

  @IsOptional()
  @IsString()
  ctaBgImage?: string;

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
