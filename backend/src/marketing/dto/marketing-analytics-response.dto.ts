import { ApiProperty } from '@nestjs/swagger';

export class MarketingAnalyticsResponseDto {
  @ApiProperty({ example: 'cm1234567890abcdefghijkl' })
  campaignId!: string;

  @ApiProperty({ example: 120 })
  totalRecipients!: number;

  @ApiProperty({ example: 110 })
  deliveredCount!: number;

  @ApiProperty({ example: 10 })
  failedCount!: number;

  @ApiProperty({ example: 44 })
  openedCount!: number;

  @ApiProperty({ example: 20 })
  clickedCount!: number;

  @ApiProperty({ example: 40, description: 'Open rate in percentage.' })
  openRate!: number;

  @ApiProperty({ example: 18.18, description: 'Click-through rate in percentage.' })
  clickRate!: number;
}
