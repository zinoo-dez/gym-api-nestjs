import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EquipmentAuditResponseDto } from './equipment-audit-response.dto';
import { MaintenanceLogResponseDto } from './maintenance-log-response.dto';

export class EquipmentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ example: 'cardio' })
  category!: string;

  @ApiProperty({ example: 'Life Fitness Integrity+' })
  brandModel!: string;

  @ApiPropertyOptional()
  serialNumber?: string;

  @ApiProperty({ example: '2026-02-21' })
  purchaseDate!: string;

  @ApiProperty({ example: 6800 })
  purchaseCost!: number;

  @ApiProperty({ example: '2029-02-21' })
  warrantyExpiryDate!: string;

  @ApiProperty({ example: 'good' })
  condition!: string;

  @ApiProperty({ example: 'monthly' })
  maintenanceFrequency!: string;

  @ApiProperty({ example: '2026-02-21' })
  lastMaintenanceDate!: string;

  @ApiProperty({ example: '2026-03-21' })
  nextMaintenanceDue!: string;

  @ApiProperty()
  assignedArea!: string;

  @ApiProperty()
  notes!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: [MaintenanceLogResponseDto] })
  maintenanceLogs!: MaintenanceLogResponseDto[];

  @ApiProperty({ type: [EquipmentAuditResponseDto] })
  auditTrail!: EquipmentAuditResponseDto[];

  @ApiProperty({ example: '2026-02-21' })
  createdAt!: string;

  @ApiProperty({ example: '2026-02-21' })
  updatedAt!: string;
}
