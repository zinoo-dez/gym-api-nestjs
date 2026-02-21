export type MembershipStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED"
  | "PENDING"
  | "FROZEN";

export interface MembershipPlan {
  id: string;
  name: string;
  description?: string;
  durationDays: number;
  price: number;
  features: string[];
}

export interface Membership {
  id: string;
  memberId: string;
  planId: string;
  plan?: MembershipPlan;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
  createdAt: string;
  updatedAt: string;
}
