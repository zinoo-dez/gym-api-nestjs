import {
  IsEmail,
  IsString,
  MinLength,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateTrainerDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsString({ message: 'First name must be a string' })
  firstName!: string;

  @IsString({ message: 'Last name must be a string' })
  lastName!: string;

  @IsOptional()
  @IsString({ message: 'Avatar URL must be a string' })
  avatarUrl?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsArray({ message: 'Specializations must be an array' })
  @IsString({ each: true, message: 'Each specialization must be a string' })
  specializations!: string[];

  @IsOptional()
  @IsArray({ message: 'Certifications must be an array' })
  @IsString({ each: true, message: 'Each certification must be a string' })
  certifications?: string[];
  @IsOptional()
  experience?: number;

  @IsOptional()
  hourlyRate?: number;
}
