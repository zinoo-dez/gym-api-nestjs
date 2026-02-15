import { ApiProperty } from '@nestjs/swagger';
import { CampaignEventType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class LogCampaignEventDto {
  @ApiProperty({ enum: CampaignEventType })
  @IsEnum(CampaignEventType)
  eventType!: CampaignEventType;
}
