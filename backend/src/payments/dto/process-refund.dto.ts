import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ProcessRefundDto {
  @ApiProperty({
    description: 'Refund reason',
    example: 'Member requested cancellation',
  })
  @IsString()
  reason!: string;

  @ApiPropertyOptional({
    description: 'Refund amount (defaults to full payment amount)',
    example: 25000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}
