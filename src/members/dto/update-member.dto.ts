import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsPhone, IsPastDate } from '../../common/validators';

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
    description: 'Member date of birth (ISO 8601 format)',
    example: '1990-01-15',
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid ISO 8601 date' })
  @IsPastDate({ message: 'Date of birth must be in the past' })
  dateOfBirth?: string;
}
