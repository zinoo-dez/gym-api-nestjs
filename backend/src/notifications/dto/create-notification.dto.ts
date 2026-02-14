import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiPropertyOptional({
    description: 'Target role for broadcast',
    enum: [...Object.values(UserRole), 'ALL'],
  })
  @IsOptional()
  @IsEnum([...Object.values(UserRole), 'ALL'] as const)
  targetRole?: UserRole | 'ALL';
}
