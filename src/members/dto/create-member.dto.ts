import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsPhone, IsPastDate } from '../../common/validators';

export class CreateMemberDto {
  @ApiProperty({
    description: 'Member email address',
    example: 'member@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email!: string;

  @ApiProperty({
    description: 'Member password (minimum 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @ApiProperty({
    description: 'Member first name',
    example: 'John',
  })
  @IsString({ message: 'First name must be a string' })
  firstName!: string;

  @ApiProperty({
    description: 'Member last name',
    example: 'Doe',
  })
  @IsString({ message: 'Last name must be a string' })
  lastName!: string;

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
