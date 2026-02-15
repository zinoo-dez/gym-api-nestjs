import {
  PaymentMethodType,
  PaymentProvider,
  PaymentStatus,
} from '@prisma/client';

export class PaymentMemberDto {
  id!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
}

export class PaymentPlanDto {
  id!: string;
  name!: string;
  price?: number;
}

export class PaymentSubscriptionDto {
  id!: string;
  status!: string;
  startDate!: Date;
  endDate!: Date;
  membershipPlan?: PaymentPlanDto;
}

export class PaymentResponseDto {
  id!: string;
  memberId!: string;
  subscriptionId?: string;
  amount!: number;
  currency!: string;
  methodType!: PaymentMethodType;
  provider!: PaymentProvider;
  transactionNo!: string;
  screenshotUrl?: string;
  status!: PaymentStatus;
  adminNote?: string;
  description?: string;
  paidAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
  member?: PaymentMemberDto;
  subscription?: PaymentSubscriptionDto;
}
