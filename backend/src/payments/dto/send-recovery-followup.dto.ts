import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendRecoveryFollowUpDto {
  @ApiPropertyOptional({
    description: 'Message shown to member for recovery follow-up',
    example:
      'Your payment is pending review. Please confirm your transaction screenshot.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @ApiPropertyOptional({
    description: 'If true, payment is moved back to PENDING for retry flow',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  markAsRetryRequested?: boolean;
}
