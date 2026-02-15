import { SessionStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTrainerSessionDto {
  @ApiProperty()
  @IsString()
  memberId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trainerId?: string;

  @ApiProperty()
  @IsDateString()
  sessionDate!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(15)
  duration!: number;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rate!: number;

  @ApiPropertyOptional({ enum: SessionStatus })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;
}
