import { ProgressPhotoPose } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class PhotoComparisonQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  beforePhotoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  afterPhotoId?: string;

  @ApiPropertyOptional({ enum: ProgressPhotoPose })
  @IsOptional()
  @IsEnum(ProgressPhotoPose)
  pose?: ProgressPhotoPose;
}
