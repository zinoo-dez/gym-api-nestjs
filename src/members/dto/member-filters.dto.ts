import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MembershipStatus, MembershipType } from '@prisma/client';
import { PaginationDto } from '../../common/dto';

export class MemberFiltersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by member name (partial match)',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by member email (partial match)',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter by membership status',
    enum: MembershipStatus,
    example: MembershipStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;

  @ApiPropertyOptional({
    description: 'Filter by membership type',
    enum: MembershipType,
    example: MembershipType.PREMIUM,
  })
  @IsOptional()
  @IsEnum(MembershipType)
  membershipType?: MembershipType;
}
