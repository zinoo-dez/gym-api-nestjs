import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MembershipType } from '@prisma/client';
import { PaginationDto } from '../../common/dto';

export class MembershipPlanFiltersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by membership type',
    enum: MembershipType,
    example: MembershipType.PREMIUM,
  })
  @IsOptional()
  @IsEnum(MembershipType)
  type?: MembershipType;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;
}
