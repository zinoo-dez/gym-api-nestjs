import { ApiProperty } from '@nestjs/swagger';

import { CostAuditEntryResponseDto } from './cost-audit-entry-response.dto';

export class CostResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ example: 'rent' })
  category!: string;

  @ApiProperty({ example: 'fixed' })
  costType!: string;

  @ApiProperty({ example: 3250 })
  amount!: number;

  @ApiProperty({ example: 0 })
  taxAmount!: number;

  @ApiProperty({ example: 'bank' })
  paymentMethod!: string;

  @ApiProperty({ example: 'monthly' })
  billingPeriod!: string;

  @ApiProperty({ example: '2026-02-01' })
  costDate!: string;

  @ApiProperty({ example: '2026-02-03' })
  dueDate!: string;

  @ApiProperty({ required: false, example: '2026-02-02', nullable: true })
  paidDate!: string | null;

  @ApiProperty({ example: 'Facilities' })
  budgetGroup!: string;

  @ApiProperty({ example: 'Skyline Properties' })
  vendor!: string;

  @ApiProperty({ example: 'RENT-2026-02' })
  referenceNumber!: string;

  @ApiProperty({ example: 'Monthly lease payment for gym premises.' })
  notes!: string;

  @ApiProperty({ example: 'Owner' })
  createdBy!: string;

  @ApiProperty({ example: 'active' })
  status!: string;

  @ApiProperty({ example: '2026-02-01' })
  createdAt!: string;

  @ApiProperty({ example: '2026-02-02' })
  updatedAt!: string;

  @ApiProperty({ type: [CostAuditEntryResponseDto] })
  auditTrail!: CostAuditEntryResponseDto[];
}
