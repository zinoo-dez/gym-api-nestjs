export type StatusTone = "success" | "warning" | "danger" | "info" | "secondary";

export interface StatusPresentation {
  label: string;
  tone: StatusTone;
}

export interface MembershipPlanOption {
  id: string;
  name: string;
  price: number;
  durationDays: number;
}

export interface MemberSubscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  membershipPlanId?: string;
  membershipPlanName?: string;
  membershipPlanPrice?: number;
  membershipPlanDurationDays?: number;
}

export interface MemberProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  currentWeight?: number;
  targetWeight?: number;
  emergencyContact?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subscriptions: MemberSubscription[];
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  classScheduleId?: string;
  checkInTime: string;
  checkOutTime?: string;
  type: string;
  createdAt: string;
}

export interface AttendanceReport {
  memberId: string;
  memberName: string;
  startDate: string;
  endDate: string;
  totalGymVisits: number;
  totalClassAttendances: number;
  totalVisits: number;
  averageVisitsPerWeek: number;
  peakVisitHours: Array<{
    hour: number;
    count: number;
  }>;
  visitsByDayOfWeek: Array<{
    dayOfWeek: string;
    count: number;
  }>;
}

export interface MemberPaymentRecord {
  id: string;
  memberId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  methodType?: string;
  provider?: string;
  transactionNo?: string;
  screenshotUrl?: string;
  status: string;
  adminNote?: string;
  description?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  planName?: string;
}

export interface MemberProgressRecord {
  id: string;
  memberId: string;
  recordedAt: string;
  notes?: string;
  weight?: number;
  bmi?: number;
  bodyFat?: number;
  muscleMass?: number;
}

export interface MemberListRecord {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  planName: string;
  planId?: string;
  currentSubscriptionId?: string;
  membershipStatus: string;
  membershipDisplayStatus: string;
  membershipStatusTone: StatusTone;
  expiryDate?: string;
  paymentStatus: string;
  paymentStatusTone: StatusTone;
  lastCheckIn?: string;
  lastActivityAt?: string;
  isActive: boolean;
  joinedAt: string;
}

export interface MemberOverviewMetrics {
  totalMembers: number;
  activeMembers: number;
  expiringMemberships: number;
  inactiveMembers: number;
  newMembersThisMonth: number;
}

export type MemberQuickFilter = "all" | "total" | "active" | "expiring" | "inactive" | "new";

export type MemberSortOption = "expiry_asc" | "expiry_desc" | "activity_desc" | "activity_asc";

export interface MemberFilterState {
  search: string;
  membershipStatus: string | "all";
  planId: string | "all";
  expiryFrom: string;
  expiryTo: string;
  sort: MemberSortOption;
  quickFilter: MemberQuickFilter;
}

export interface TrainerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  avatarUrl?: string;
  specializations: string[];
  certifications: string[];
  isActive: boolean;
  experience?: number;
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerSessionRecord {
  id: string;
  status: string;
  title: string;
  description?: string;
  duration: number;
  notes?: string;
  rate: number;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  memberName?: string;
  memberEmail?: string;
  trainerId: string;
  trainerName?: string;
  sessionDate: string;
}

export interface TrainerClassScheduleRecord {
  id: string;
  name: string;
  description?: string;
  trainerId: string;
  trainerName?: string;
  schedule: string;
  duration: number;
  capacity: number;
  classType: string;
  isActive: boolean;
  availableSlots?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerInstructorProfile {
  trainerId: string;
  fullName: string;
  bio?: string;
  specializations: string[];
  experience: number;
  certifications?: string;
  averageRating: number;
  ratingsCount: number;
  classHistory: {
    pastClassesCount: number;
    upcomingClassesCount: number;
    topClassTypes: string[];
  };
}

export interface TrainerAssignedMember {
  memberId: string;
  memberName: string;
  memberEmail?: string;
  activeSessions: number;
  nextSessionAt?: string;
  sessionIds: string[];
}

export interface TrainerListRecord {
  id: string;
  fullName: string;
  email: string;
  specialization: string;
  specializations: string[];
  certifications: string[];
  isActive: boolean;
  joinDate: string;
  assignedMembers: number;
  sessionsThisMonth: number;
  upcomingSessions: number;
  workload: number;
}

export interface TrainerOverviewMetrics {
  totalTrainers: number;
  activeTrainers: number;
  assignedMembers: number;
  sessionsThisMonth: number;
}

export interface TrainerPerformanceSummary {
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  averageSessionDuration: number;
  averageSessionRate: number;
}

export type TrainerSortOption =
  | "workload_desc"
  | "workload_asc"
  | "join_desc"
  | "join_asc"
  | "name_asc"
  | "name_desc";

export interface TrainerFilterState {
  search: string;
  activeStatus: "all" | "active" | "inactive";
  sort: TrainerSortOption;
}

export interface StaffProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  staffRole: string;
  employeeId: string;
  hireDate: string;
  department?: string;
  position: string;
  emergencyContact?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffListRecord {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  roleLabel: string;
  isActive: boolean;
  joinDate: string;
  department?: string;
  position: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffRoleDistributionItem {
  role: string;
  roleLabel: string;
  count: number;
}

export interface StaffOverviewMetrics {
  totalStaff: number;
  activeStaff: number;
  newStaffThisMonth: number;
  rolesDistribution: StaffRoleDistributionItem[];
}

export type StaffSortOption = "join_desc" | "join_asc" | "name_asc" | "name_desc";

export interface StaffFilterState {
  search: string;
  role: string | "all";
  sort: StaffSortOption;
}

export interface MemberFormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  avatarUrl: string;
  dateOfBirth: string;
  gender: string;
  height?: number;
  currentWeight?: number;
  targetWeight?: number;
  emergencyContact: string;
}

export interface TrainerFormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  avatarUrl: string;
  specializations: string;
  certifications: string;
  experience?: number;
  hourlyRate?: number;
}

export interface StaffFormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  avatarUrl: string;
  staffRole: string;
  employeeId: string;
  hireDate: string;
  department: string;
  position: string;
  emergencyContact: string;
}

export interface TrainerAssignmentFormValues {
  memberId: string;
  sessionDate: string;
  duration: number;
  title: string;
  description: string;
  notes: string;
  rate: number;
}

export interface BookableMemberOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
