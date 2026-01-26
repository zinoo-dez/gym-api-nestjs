import { MembershipType } from '@prisma/client';

export class MembershipPlanResponseDto {
  id!: string;
  name!: string;
  description?: string;
  durationDays!: number;
  price!: number;
  type!: MembershipType;
  features!: string[];
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
