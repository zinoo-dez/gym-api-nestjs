import { ProgressPhotoPhase, ProgressPhotoPose } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { TimelineFiltersDto } from './timeline-filters.dto';

export class ProgressPhotoFiltersDto extends TimelineFiltersDto {
  @ApiPropertyOptional({ enum: ProgressPhotoPhase })
  @IsOptional()
  @IsEnum(ProgressPhotoPhase)
  phase?: ProgressPhotoPhase;

  @ApiPropertyOptional({ enum: ProgressPhotoPose })
  @IsOptional()
  @IsEnum(ProgressPhotoPose)
  pose?: ProgressPhotoPose;
}
