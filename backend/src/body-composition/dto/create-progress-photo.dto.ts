import { ProgressPhotoPhase, ProgressPhotoPose } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProgressPhotoDto {
  @ApiPropertyOptional({ description: 'Required for ADMIN/TRAINER/STAFF' })
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiProperty({ example: '/uploads/1234-before.jpg' })
  @IsString()
  photoUrl!: string;

  @ApiPropertyOptional({
    enum: ProgressPhotoPose,
    default: ProgressPhotoPose.FRONT,
  })
  @IsOptional()
  @IsEnum(ProgressPhotoPose)
  pose?: ProgressPhotoPose;

  @ApiPropertyOptional({
    enum: ProgressPhotoPhase,
    default: ProgressPhotoPhase.PROGRESS,
  })
  @IsOptional()
  @IsEnum(ProgressPhotoPhase)
  phase?: ProgressPhotoPhase;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  capturedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
