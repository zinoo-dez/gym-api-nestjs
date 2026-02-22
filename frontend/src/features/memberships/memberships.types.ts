import {
  FeatureLevel,
  FeatureLibraryStatus,
  MembershipDisplayStatus,
  MembershipPaymentStatus,
  MembershipPlanStatus,
  MembershipPlanType,
  MembershipQuickFilter,
  MembershipRawStatus,
  MembershipSortOption,
  PlanSortOption,
} from "./memberships.constants";

export interface MembershipPlanFeature {
  featureId: string;
  name: string;
  description?: string;
  level: FeatureLevel;
}

export interface MembershipPlanRecord {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  planType: MembershipPlanType;
  price: number;
  maxAccess?: number;
  unlimitedClasses: boolean;
  personalTrainingHours: number;
  accessToEquipment: boolean;
  accessToLocker: boolean;
  nutritionConsultation: boolean;
  planFeatures: MembershipPlanFeature[];
  createdAt: string;
  updatedAt: string;
  activeMembers: number;
  totalMembers: number;
  status: MembershipPlanStatus;
}

export interface MemberSubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
}

export interface MemberSubscriptionRecord {
  id: string;
  status: MembershipRawStatus;
  startDate: string;
  endDate: string;
  membershipPlan?: MemberSubscriptionPlan;
}

export interface MemberRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  subscriptions: MemberSubscriptionRecord[];
}

export interface PaymentRecord {
  id: string;
  memberId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: MembershipPaymentStatus;
  createdAt: string;
  paidAt?: string;
}

export interface MembershipRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  remainingDays: number;
  status: MembershipDisplayStatus;
  statusRaw: MembershipRawStatus;
  paymentStatus: MembershipPaymentStatus;
  latestPaymentAt?: string;
  latestPaymentAmount?: number;
}

export interface MembershipDetailRecord {
  id: string;
  memberId: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  statusRaw: MembershipRawStatus;
  status: MembershipDisplayStatus;
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureLibraryRecord {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  defaultName?: string;
  createdAt: string;
  updatedAt: string;
  assignedPlans: number;
  status: FeatureLibraryStatus;
}

export interface MembershipOverviewMetrics {
  totalActiveMemberships: number;
  expiringSoon: number;
  expired: number;
  frozen: number;
  totalMembershipRevenue: number;
}

export interface MembershipPlanFilterState {
  search: string;
  status: MembershipPlanStatus | "all";
  sort: PlanSortOption;
}

export interface MembershipFilterState {
  search: string;
  status: MembershipDisplayStatus | "all";
  planId: string | "all";
  expiryFrom: string;
  expiryTo: string;
  sort: MembershipSortOption;
  quickFilter: MembershipQuickFilter;
}

export interface FeatureFilterState {
  search: string;
  status: FeatureLibraryStatus | "all";
}

export interface MembershipPlanFeatureSelection {
  featureId: string;
  level: FeatureLevel;
}

export interface MembershipPlanFormValues {
  name: string;
  description: string;
  planType: MembershipPlanType;
  durationDays: number;
  price: number;
  maxAccess: string;
  unlimitedClasses: boolean;
  personalTrainingHours: number;
  accessToEquipment: boolean;
  accessToLocker: boolean;
  nutritionConsultation: boolean;
  selectedFeatures: MembershipPlanFeatureSelection[];
}

export interface MembershipPlanFormErrors {
  name?: string;
  durationDays?: string;
  price?: string;
}

export interface FeatureFormValues {
  name: string;
  description: string;
}

export interface FeatureFormErrors {
  name?: string;
}

export interface MembershipHistoryEntry {
  id: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: MembershipDisplayStatus;
}
