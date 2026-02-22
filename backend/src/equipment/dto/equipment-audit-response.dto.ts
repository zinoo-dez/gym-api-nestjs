import { ApiProperty } from '@nestjs/swagger';

export class EquipmentAuditResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: '2026-02-21' })
  date!: string;

  @ApiProperty({ example: 'Created' })
  action!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ example: 'Admin User' })
  performedBy!: string;
}
