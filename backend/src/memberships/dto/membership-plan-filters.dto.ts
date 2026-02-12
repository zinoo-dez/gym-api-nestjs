import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto';

export class MembershipPlanFiltersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by plan name (partial match)',
    example: 'Premium',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
