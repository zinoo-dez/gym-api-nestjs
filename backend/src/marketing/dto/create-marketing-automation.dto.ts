import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MarketingAutomationType, NotificationType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMarketingAutomationDto {
  @ApiProperty({ enum: MarketingAutomationType })
  @IsEnum(MarketingAutomationType)
  type: MarketingAutomationType;

  @ApiProperty({ example: 'Default Birthday Wishes' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: NotificationType, default: NotificationType.EMAIL })
  @IsOptional()
  @IsEnum(NotificationType)
  channel?: NotificationType;

  @ApiPropertyOptional({ example: 'cm1234567890template1234' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({ example: 'We miss you at the gym' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @ApiProperty({ example: 'Hi {{firstName}}, we miss you. Enjoy {{specialOffer}}.' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'Free class pass this week' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  specialOffer?: string;

  @ApiPropertyOptional({
    example: 30,
    minimum: 1,
    maximum: 365,
    description: 'Used for REENGAGEMENT automation type.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  inactiveDays?: number;

  @ApiPropertyOptional({
    example: 'cm1234567890abcdefghijkl',
    description: 'Used for CLASS_PROMOTION automation type.',
  })
  @IsOptional()
  @IsString()
  classId?: string;
}
