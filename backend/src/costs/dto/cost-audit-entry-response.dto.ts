import { ApiProperty } from '@nestjs/swagger';

export class CostAuditEntryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: '2026-02-20' })
  date!: string;

  @ApiProperty({ example: 'Created' })
  action!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  performedBy!: string;
}
