import { SubscriptionStatus } from '@prisma/client';
import { MembershipPlanResponseDto } from './membership-plan-response.dto';

export class MembershipResponseDto {
  id!: string;
  memberId!: string;
  planId!: string;
  plan?: MembershipPlanResponseDto;
  startDate!: Date;
  endDate!: Date;
  status!: SubscriptionStatus;
  createdAt!: Date;
  updatedAt!: Date;
}
