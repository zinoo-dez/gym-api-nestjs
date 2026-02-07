import { DiscountType } from '@prisma/client';

export class DiscountCodeResponseDto {
  id!: string;
  code!: string;
  description?: string | null;
  type!: DiscountType;
  amount!: number;
  isActive!: boolean;
  maxRedemptions?: number | null;
  usedCount!: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
