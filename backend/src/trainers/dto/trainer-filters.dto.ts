import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto';

export class TrainerFiltersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by specialization',
    example: 'Yoga',
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({
    description: 'Filter by availability',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  availability?: boolean;
}
