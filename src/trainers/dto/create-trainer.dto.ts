import {
  IsEmail,
  IsString,
  MinLength,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateTrainerDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsArray()
  @IsString({ each: true })
  specializations!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];
}
