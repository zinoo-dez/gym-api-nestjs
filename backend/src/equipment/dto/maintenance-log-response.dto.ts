import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MaintenanceLogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: '2026-02-21' })
  date!: string;

  @ApiProperty({ example: 'routine' })
  type!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ example: 120 })
  cost!: number;

  @ApiProperty({ example: 'Admin User' })
  performedBy!: string;

  @ApiPropertyOptional({ example: '2026-03-21' })
  nextDueDate?: string;
}
