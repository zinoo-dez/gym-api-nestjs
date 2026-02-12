import { IsOptional, IsString } from 'class-validator';

export class CreateFeatureDto {
  @IsString({ message: 'Name must be a string' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsString()
  defaultName?: string;

  @IsOptional()
  isSystem?: boolean;
}
