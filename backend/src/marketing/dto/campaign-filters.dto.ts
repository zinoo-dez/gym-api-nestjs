import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  CampaignAudienceType,
  MarketingCampaignStatus,
  NotificationType,
} from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CampaignFiltersDto {
  @ApiPropertyOptional({ enum: MarketingCampaignStatus })
  @IsOptional()
  @IsEnum(MarketingCampaignStatus)
  status?: MarketingCampaignStatus;

  @ApiPropertyOptional({ enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ enum: CampaignAudienceType })
  @IsOptional()
  @IsEnum(CampaignAudienceType)
  audienceType?: CampaignAudienceType;

  @ApiPropertyOptional({ example: 'birthday' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
