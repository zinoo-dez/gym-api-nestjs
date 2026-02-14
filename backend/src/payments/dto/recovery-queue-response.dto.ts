import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';

class RecoveryExpiringItemDto {
  @ApiProperty()
  subscriptionId!: string;

  @ApiProperty()
  memberId!: string;

  @ApiProperty()
  memberName!: string;

  @ApiProperty()
  memberEmail!: string;

  @ApiProperty()
  planName!: string;

  @ApiProperty()
  endDate!: Date;

  @ApiProperty()
  daysToExpiry!: number;
}

class RecoveryPaymentItemDto {
  @ApiProperty()
  paymentId!: string;

  @ApiProperty()
  memberId!: string;

  @ApiProperty()
  memberName!: string;

  @ApiProperty()
  memberEmail!: string;

  @ApiProperty({ enum: PaymentStatus })
  status!: PaymentStatus;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ required: false })
  subscriptionId?: string;
}

export class RecoveryQueueResponseDto {
  @ApiProperty({ type: [RecoveryExpiringItemDto] })
  expiringSoon!: RecoveryExpiringItemDto[];

  @ApiProperty({ type: [RecoveryPaymentItemDto] })
  pendingPayments!: RecoveryPaymentItemDto[];

  @ApiProperty({ type: [RecoveryPaymentItemDto] })
  rejectedPayments!: RecoveryPaymentItemDto[];

  @ApiProperty()
  totalExpiringSoon!: number;

  @ApiProperty()
  totalPendingPayments!: number;

  @ApiProperty()
  totalRejectedPayments!: number;
}

