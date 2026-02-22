export type CalendarViewMode = "week" | "day";

export type AttendanceStatus = "BOOKED" | "ATTENDED" | "NO_SHOW" | "CANCELLED";

export type ClassFormMode = "create" | "edit";

export type RecurrenceDayCode = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

export interface ClassSession {
  id: string;
  className: string;
  description?: string;
  category: string;
  instructorId: string;
  instructorName: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  availableSlots: number;
  occupancyRatio: number;
  isActive: boolean;
  recurrenceRule?: string;
  occurrences?: number;
}

export interface ClassScheduleFilters {
  startDate: string;
  endDate: string;
}

export interface SaveClassInput {
  className: string;
  description?: string;
  category: string;
  instructorId: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  recurrenceRule?: string;
  occurrences?: number;
}

export interface RescheduleClassInput {
  classId: string;
  startTime: string;
  endTime: string;
}

export interface RosterMember {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  status: AttendanceStatus;
  bookingId?: string;
  attendanceId?: string;
  bookedAt?: string;
  checkedInAt?: string;
}

export interface UpdateRosterStatusInput {
  classId: string;
  memberId: string;
  status: AttendanceStatus;
  bookingId?: string;
  attendanceId?: string;
}

export interface MemberSearchOption {
  memberId: string;
  fullName: string;
  email: string;
}

export interface ClassFormValues {
  className: string;
  description: string;
  category: string;
  instructorId: string;
  startTime: string;
  endTime: string;
  maxCapacity: string;
  repeating: boolean;
  repeatDays: RecurrenceDayCode[];
  occurrences: string;
}
