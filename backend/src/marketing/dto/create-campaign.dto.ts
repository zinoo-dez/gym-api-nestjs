import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CampaignAudienceType,
  MarketingCampaignStatus,
  NotificationCategory,
  NotificationType,
} from '@prisma/client';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({ example: 'March Member Comeback Campaign' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'Campaign to re-engage inactive members.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.EMAIL })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({
    enum: NotificationCategory,
    default: NotificationCategory.MARKETING,
  })
  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @ApiPropertyOptional({
    enum: MarketingCampaignStatus,
    default: MarketingCampaignStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(MarketingCampaignStatus)
  status?: MarketingCampaignStatus;

  @ApiPropertyOptional({
    enum: CampaignAudienceType,
    default: CampaignAudienceType.ALL_MEMBERS,
  })
  @IsOptional()
  @IsEnum(CampaignAudienceType)
  audienceType?: CampaignAudienceType;

  @ApiPropertyOptional({
    type: [String],
    example: ['cm1234567890abcdefghijkl', 'cm1234567890mnopqrstu'],
    description: 'Used when audienceType is CUSTOM.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  customUserIds?: string[];

  @ApiPropertyOptional({ example: 'cm1234567890abcdefghijkl' })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiPropertyOptional({ example: 'cm1234567890template1234' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({ example: 'Special Offer Just for You' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @ApiProperty({
    example: 'Hi {{firstName}}, enjoy {{specialOffer}} this week at our gym.',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: '20% off annual membership upgrade' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  specialOffer?: string;

  @ApiPropertyOptional({
    example: '2026-02-20T09:00:00.000Z',
    description: 'If provided with SCHEDULED status, campaign will be sent by job runner.',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
