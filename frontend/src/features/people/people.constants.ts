import {
  MemberFilterState,
  StaffFilterState,
  StaffFormValues,
  StatusPresentation,
  TrainerFilterState,
  TrainerFormValues,
  MemberFormValues,
  TrainerAssignmentFormValues,
} from "./people.types";

export const STATUS_BADGE_TONE_STYLES: Record<
  StatusPresentation["tone"],
  string
> = {
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  danger: "bg-danger/20 text-destructive",
  info: "bg-info/20 text-info",
  secondary: "bg-secondary text-secondary-foreground",
};

export const STATUS_PRESENTATION_BY_VALUE: Record<string, StatusPresentation> =
  {
    ACTIVE: { label: "Active", tone: "success" },
    INACTIVE: { label: "Inactive", tone: "danger" },
    EXPIRED: { label: "Expired", tone: "danger" },
    CANCELLED: { label: "Cancelled", tone: "danger" },
    FROZEN: { label: "Frozen", tone: "info" },
    PENDING: { label: "Pending", tone: "warning" },
    PAID: { label: "Paid", tone: "success" },
    REJECTED: { label: "Rejected", tone: "danger" },
    SCHEDULED: { label: "Scheduled", tone: "info" },
    RESCHEDULED: { label: "Rescheduled", tone: "warning" },
    COMPLETED: { label: "Completed", tone: "success" },
  };

export const SESSION_ACTIVE_STATUSES = new Set(["SCHEDULED", "RESCHEDULED"]);

export const MEMBER_DEFAULT_FILTERS: MemberFilterState = {
  search: "",
  membershipStatus: "all",
  planId: "all",
  expiryFrom: "",
  expiryTo: "",
  sort: "expiry_asc",
  quickFilter: "all",
};

export const TRAINER_DEFAULT_FILTERS: TrainerFilterState = {
  search: "",
  activeStatus: "all",
  sort: "workload_desc",
};

export const STAFF_DEFAULT_FILTERS: StaffFilterState = {
  search: "",
  role: "all",
  sort: "join_desc",
};

export const STAFF_ROLE_VALUES = [
  "MANAGER",
  "RECEPTIONIST",
  "MAINTENANCE",
  "CLEANING",
  "SECURITY",
] as const;

export const MEMBER_SORT_OPTIONS: Array<{
  value: MemberFilterState["sort"];
  label: string;
}> = [
  { value: "expiry_asc", label: "Expiry (Soonest)" },
  { value: "expiry_desc", label: "Expiry (Latest)" },
  { value: "activity_desc", label: "Last Activity (Newest)" },
  { value: "activity_asc", label: "Last Activity (Oldest)" },
];

export const TRAINER_SORT_OPTIONS: Array<{
  value: TrainerFilterState["sort"];
  label: string;
}> = [
  { value: "workload_desc", label: "Workload (High to Low)" },
  { value: "workload_asc", label: "Workload (Low to High)" },
  { value: "join_desc", label: "Join Date (Newest)" },
  { value: "join_asc", label: "Join Date (Oldest)" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
];

export const STAFF_SORT_OPTIONS: Array<{
  value: StaffFilterState["sort"];
  label: string;
}> = [
  { value: "join_desc", label: "Join Date (Newest)" },
  { value: "join_asc", label: "Join Date (Oldest)" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
];

export const DEFAULT_MEMBER_FORM_VALUES: MemberFormValues = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  avatarUrl: "",
  dateOfBirth: "",
  gender: "",
  height: undefined,
  currentWeight: undefined,
  targetWeight: undefined,
  emergencyContact: "",
  initialPaymentAmount: undefined,
  paymentMethod: "",
  transactionNo: "",
  paymentNote: "",
};

export const DEFAULT_TRAINER_FORM_VALUES: TrainerFormValues = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  address: "",
  avatarUrl: "",
  specializations: "",
  certifications: "",
  experience: undefined,
  hourlyRate: undefined,
};

export const DEFAULT_STAFF_FORM_VALUES: StaffFormValues = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  avatarUrl: "",
  staffRole: "",
  employeeId: "",
  hireDate: "",
  department: "",
  position: "",
  emergencyContact: "",
};

export const DEFAULT_TRAINER_ASSIGNMENT_VALUES: TrainerAssignmentFormValues = {
  memberId: "",
  sessionDate: "",
  duration: 60,
  title: "Personal Training Session",
  description: "",
  notes: "",
  rate: 0,
};
