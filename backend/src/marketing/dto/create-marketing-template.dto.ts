import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationCategory, NotificationType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMarketingTemplateDto {
  @ApiProperty({ example: 'Birthday Greeting Template' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.EMAIL })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiPropertyOptional({
    enum: NotificationCategory,
    default: NotificationCategory.MARKETING,
  })
  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @ApiPropertyOptional({ example: 'Happy Birthday from Our Gym' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @ApiProperty({
    example: 'Hi {{firstName}}, happy birthday! Enjoy {{specialOffer}}.',
  })
  @IsString()
  body!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
