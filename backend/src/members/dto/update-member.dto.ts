import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsPhone, IsPastDate } from '../../common/validators';
import { Type } from 'class-transformer';

export class UpdateMemberDto {
  @ApiPropertyOptional({
    description: 'Member first name',
    example: 'John',
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Member last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Member phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  @IsPhone({ message: 'Phone must be a valid phone number' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Member address',
    example: '123 Main St, Springfield',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Member date of birth (ISO 8601 format)',
    example: '1990-01-15',
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid ISO 8601 date' })
  @IsPastDate({ message: 'Date of birth must be in the past' })
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Member gender',
    example: 'Female',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    description: 'Member height in cm',
    example: 175,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({
    description: 'Current weight in kg',
    example: 72,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currentWeight?: number;

  @ApiPropertyOptional({
    description: 'Target weight in kg',
    example: 68,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  targetWeight?: number;

  @ApiPropertyOptional({
    description: 'Emergency contact',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

}
