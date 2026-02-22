import {
  compareAsc,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";

import {
  SESSION_ACTIVE_STATUSES,
  STATUS_PRESENTATION_BY_VALUE,
} from "./people.constants";
import {
  AttendanceRecord,
  MemberFilterState,
  MemberFormValues,
  MemberListRecord,
  MemberOverviewMetrics,
  MemberPaymentRecord,
  MemberProfile,
  MemberSubscription,
  StaffFilterState,
  StaffFormValues,
  StaffListRecord,
  StaffOverviewMetrics,
  StaffProfile,
  StatusPresentation,
  TrainerAssignedMember,
  TrainerFilterState,
  TrainerFormValues,
  TrainerListRecord,
  TrainerOverviewMetrics,
  TrainerPerformanceSummary,
  TrainerProfile,
  TrainerSessionRecord,
} from "./people.types";

const EXPIRY_SOON_DAYS = 7;

const EMPTY_DATE = new Date(0);

const toDate = (value?: string): Date => {
  if (!value) {
    return EMPTY_DATE;
  }

  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : EMPTY_DATE;
};

const compareStrings = (left: string, right: string): number =>
  left.localeCompare(right, "en", { sensitivity: "base" });

const normalizeStatus = (status?: string | null): string => (status ?? "").trim().toUpperCase();

const statusToToneByKeyword = (status: string): StatusPresentation["tone"] => {
  if (status.includes("ACTIVE") || status.includes("PAID") || status.includes("COMPLETE")) {
    return "success";
  }

  if (status.includes("PENDING") || status.includes("SCHEDULED") || status.includes("EXPIRING")) {
    return "warning";
  }

  if (
    status.includes("INACTIVE") ||
    status.includes("EXPIRED") ||
    status.includes("REJECTED") ||
    status.includes("CANCELLED")
  ) {
    return "danger";
  }

  if (status.includes("FROZEN") || status.includes("RESCHEDULED")) {
    return "info";
  }

  return "secondary";
};

export const toEnumLabel = (value: string): string => {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const getStatusPresentation = (
  value: string | null | undefined,
  fallbackLabel = "Unknown",
): StatusPresentation => {
  const normalized = normalizeStatus(value);

  if (!normalized) {
    return {
      label: fallbackLabel,
      tone: "secondary",
    };
  }

  const preset = STATUS_PRESENTATION_BY_VALUE[normalized];

  if (preset) {
    return preset;
  }

  return {
    label: toEnumLabel(normalized),
    tone: statusToToneByKeyword(normalized),
  };
};

export const formatDisplayDate = (value?: string): string => {
  const parsed = toDate(value);

  if (!isValid(parsed) || parsed.getTime() === 0) {
    return "-";
  }

  return format(parsed, "MMM d, yyyy");
};

export const formatDisplayDateTime = (value?: string): string => {
  const parsed = toDate(value);

  if (!isValid(parsed) || parsed.getTime() === 0) {
    return "-";
  }

  return format(parsed, "MMM d, yyyy p");
};

export const formatCurrency = (amount: number, currency = "USD"): string => {
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
};

const getCurrentSubscription = (
  subscriptions: MemberSubscription[],
  now = new Date(),
): MemberSubscription | undefined => {
  if (subscriptions.length === 0) {
    return undefined;
  }

  const byLatestEndDate = [...subscriptions].sort((left, right) =>
    compareAsc(toDate(right.endDate), toDate(left.endDate)),
  );

  const activeSubscription = byLatestEndDate.find((subscription) => {
    const status = normalizeStatus(subscription.status);
    const expiryDate = toDate(subscription.endDate);

    if (!isValid(expiryDate) || expiryDate.getTime() === 0) {
      return status === "ACTIVE";
    }

    const stillValid = !isBefore(endOfDay(expiryDate), startOfDay(now));

    return status === "ACTIVE" && stillValid;
  });

  return activeSubscription ?? byLatestEndDate[0];
};

const getMembershipDisplayState = (
  rawStatus: string,
  expiryDate: string | undefined,
  now = new Date(),
): StatusPresentation => {
  const normalized = normalizeStatus(rawStatus);

  if (normalized === "FROZEN") {
    return { label: "Frozen", tone: "info" };
  }

  if (normalized === "PENDING") {
    return { label: "Pending", tone: "warning" };
  }

  if (normalized === "EXPIRED" || normalized === "CANCELLED") {
    return { label: "Expired", tone: "danger" };
  }

  const expiry = toDate(expiryDate);

  if (!isValid(expiry) || expiry.getTime() === 0) {
    return { label: "Active", tone: "success" };
  }

  if (isBefore(endOfDay(expiry), startOfDay(now))) {
    return { label: "Expired", tone: "danger" };
  }

  const expirySoonBoundary = new Date(now);
  expirySoonBoundary.setDate(expirySoonBoundary.getDate() + EXPIRY_SOON_DAYS);

  if (!isAfter(startOfDay(expiry), endOfDay(expirySoonBoundary))) {
    return { label: "Expiring", tone: "warning" };
  }

  return { label: "Active", tone: "success" };
};

const getLatestPaymentMap = (
  payments: MemberPaymentRecord[],
): Map<string, MemberPaymentRecord> => {
  return payments.reduce<Map<string, MemberPaymentRecord>>((map, payment) => {
    if (!payment.subscriptionId) {
      return map;
    }

    const previous = map.get(payment.subscriptionId);

    if (!previous || compareAsc(toDate(previous.createdAt), toDate(payment.createdAt)) < 0) {
      map.set(payment.subscriptionId, payment);
    }

    return map;
  }, new Map());
};

const getLastCheckInMap = (attendance: AttendanceRecord[]): Map<string, string> => {
  return attendance.reduce<Map<string, string>>((map, record) => {
    const previous = map.get(record.memberId);

    if (!previous || compareAsc(toDate(previous), toDate(record.checkInTime)) < 0) {
      map.set(record.memberId, record.checkInTime);
    }

    return map;
  }, new Map());
};

const isCurrentMonth = (value: string, now = new Date()): boolean => {
  const date = toDate(value);

  if (!isValid(date) || date.getTime() === 0) {
    return false;
  }

  return isSameMonth(date, now);
};

export const buildMemberListRecords = (
  members: MemberProfile[],
  payments: MemberPaymentRecord[],
  attendance: AttendanceRecord[],
  now = new Date(),
): MemberListRecord[] => {
  const latestPaymentBySubscription = getLatestPaymentMap(payments);
  const lastCheckInByMember = getLastCheckInMap(attendance);

  return members
    .map((member) => {
      const subscription = getCurrentSubscription(member.subscriptions, now);
      const membershipState = getMembershipDisplayState(subscription?.status ?? "", subscription?.endDate, now);
      const latestPayment = subscription?.id
        ? latestPaymentBySubscription.get(subscription.id)
        : undefined;
      const paymentState = latestPayment
        ? getStatusPresentation(latestPayment.status, "Unknown")
        : { label: "Not Recorded", tone: "secondary" as const };
      const lastCheckIn = lastCheckInByMember.get(member.id);

      const lastActivityAt = [lastCheckIn, member.updatedAt]
        .filter((value): value is string => Boolean(value))
        .sort((left, right) => compareAsc(toDate(right), toDate(left)))[0];

      return {
        id: member.id,
        fullName: `${member.firstName} ${member.lastName}`.trim() || member.email,
        email: member.email,
        phone: member.phone,
        planName: subscription?.membershipPlanName ?? "No Plan",
        planId: subscription?.membershipPlanId,
        currentSubscriptionId: subscription?.id,
        membershipStatus: normalizeStatus(subscription?.status) || "UNKNOWN",
        membershipDisplayStatus: membershipState.label,
        membershipStatusTone: membershipState.tone,
        expiryDate: subscription?.endDate,
        paymentStatus: paymentState.label,
        paymentStatusTone: paymentState.tone,
        lastCheckIn,
        lastActivityAt,
        isActive: member.isActive,
        joinedAt: member.createdAt,
      } satisfies MemberListRecord;
    })
    .sort((left, right) => compareStrings(left.fullName, right.fullName));
};

export const calculateMemberOverviewMetrics = (
  members: MemberProfile[],
  rows: MemberListRecord[],
  now = new Date(),
): MemberOverviewMetrics => {
  const activeMembers = rows.filter((row) => row.isActive).length;
  const expiringMemberships = rows.filter((row) => row.membershipDisplayStatus === "Expiring").length;
  const inactiveMembers = rows.filter((row) => !row.isActive).length;
  const newMembersThisMonth = members.filter((member) => isCurrentMonth(member.createdAt, now)).length;

  return {
    totalMembers: members.length,
    activeMembers,
    expiringMemberships,
    inactiveMembers,
    newMembersThisMonth,
  };
};

const isWithinDateRange = (dateValue: string | undefined, from: string, to: string): boolean => {
  if (!dateValue) {
    return false;
  }

  const value = toDate(dateValue);

  if (!isValid(value) || value.getTime() === 0) {
    return false;
  }

  const fromDate = from ? toDate(from) : undefined;
  const toDateValue = to ? toDate(to) : undefined;

  if (fromDate && isValid(fromDate) && fromDate.getTime() !== 0 && isBefore(value, startOfDay(fromDate))) {
    return false;
  }

  if (toDateValue && isValid(toDateValue) && toDateValue.getTime() !== 0 && isAfter(value, endOfDay(toDateValue))) {
    return false;
  }

  return true;
};

export const applyMemberFilters = (
  rows: MemberListRecord[],
  filters: MemberFilterState,
  now = new Date(),
): MemberListRecord[] => {
  const query = filters.search.trim().toLowerCase();

  const filtered = rows.filter((row) => {
    const matchesSearch =
      query.length === 0 ||
      row.fullName.toLowerCase().includes(query) ||
      row.email.toLowerCase().includes(query) ||
      row.phone?.toLowerCase().includes(query);

    const matchesMembershipStatus =
      filters.membershipStatus === "all" || normalizeStatus(row.membershipStatus) === normalizeStatus(filters.membershipStatus);

    const matchesPlan = filters.planId === "all" || row.planId === filters.planId;

    const matchesExpiryRange =
      (!filters.expiryFrom && !filters.expiryTo) ||
      isWithinDateRange(row.expiryDate, filters.expiryFrom, filters.expiryTo);

    const matchesQuickFilter = (() => {
      switch (filters.quickFilter) {
        case "active":
          return row.isActive;
        case "expiring":
          return row.membershipDisplayStatus === "Expiring";
        case "inactive":
          return !row.isActive;
        case "new":
          return isCurrentMonth(row.joinedAt, now);
        case "total":
        case "all":
        default:
          return true;
      }
    })();

    return matchesSearch && matchesMembershipStatus && matchesPlan && matchesExpiryRange && matchesQuickFilter;
  });

  const sorted = [...filtered].sort((left, right) => {
    switch (filters.sort) {
      case "expiry_asc":
        return compareAsc(toDate(left.expiryDate), toDate(right.expiryDate));
      case "expiry_desc":
        return compareAsc(toDate(right.expiryDate), toDate(left.expiryDate));
      case "activity_asc":
        return compareAsc(toDate(left.lastActivityAt), toDate(right.lastActivityAt));
      case "activity_desc":
      default:
        return compareAsc(toDate(right.lastActivityAt), toDate(left.lastActivityAt));
    }
  });

  return sorted;
};

export const extractMemberStatusOptions = (rows: MemberListRecord[]): string[] => {
  return Array.from(new Set(rows.map((row) => row.membershipStatus).filter((value) => value !== "UNKNOWN"))).sort(
    compareStrings,
  );
};

export const buildMemberFormValuesFromProfile = (member: MemberProfile): MemberFormValues => {
  return {
    email: member.email,
    password: "",
    firstName: member.firstName,
    lastName: member.lastName,
    phone: member.phone ?? "",
    address: member.address ?? "",
    avatarUrl: member.avatarUrl ?? "",
    dateOfBirth: member.dateOfBirth ? format(toDate(member.dateOfBirth), "yyyy-MM-dd") : "",
    gender: member.gender ?? "",
    height: member.height,
    currentWeight: member.currentWeight,
    targetWeight: member.targetWeight,
    emergencyContact: member.emergencyContact ?? "",
  };
};

const isSessionInMonth = (dateValue: string, now = new Date()): boolean => {
  const date = toDate(dateValue);

  if (!isValid(date) || date.getTime() === 0) {
    return false;
  }

  return isSameMonth(date, now);
};

export const buildTrainerListRecords = (
  trainers: TrainerProfile[],
  sessions: TrainerSessionRecord[],
  now = new Date(),
): TrainerListRecord[] => {
  return trainers.map((trainer) => {
    const relatedSessions = sessions.filter((session) => session.trainerId === trainer.id);
    const sessionsThisMonth = relatedSessions.filter((session) => isSessionInMonth(session.sessionDate, now)).length;

    const upcomingActiveSessions = relatedSessions.filter((session) => {
      const normalizedStatus = normalizeStatus(session.status);
      return SESSION_ACTIVE_STATUSES.has(normalizedStatus) && !isBefore(toDate(session.sessionDate), startOfDay(now));
    });

    const assignedMembers = new Set(upcomingActiveSessions.map((session) => session.memberId));

    return {
      id: trainer.id,
      fullName: `${trainer.firstName} ${trainer.lastName}`.trim() || trainer.email,
      email: trainer.email,
      specialization: trainer.specializations[0] ?? "General",
      specializations: trainer.specializations,
      certifications: trainer.certifications,
      isActive: trainer.isActive,
      joinDate: trainer.createdAt,
      assignedMembers: assignedMembers.size,
      sessionsThisMonth,
      upcomingSessions: upcomingActiveSessions.length,
      workload: assignedMembers.size + upcomingActiveSessions.length,
    };
  });
};

export const calculateTrainerOverviewMetrics = (
  rows: TrainerListRecord[],
): TrainerOverviewMetrics => {
  return {
    totalTrainers: rows.length,
    activeTrainers: rows.filter((row) => row.isActive).length,
    assignedMembers: rows.reduce((sum, row) => sum + row.assignedMembers, 0),
    sessionsThisMonth: rows.reduce((sum, row) => sum + row.sessionsThisMonth, 0),
  };
};

export const applyTrainerFilters = (
  rows: TrainerListRecord[],
  filters: TrainerFilterState,
): TrainerListRecord[] => {
  const query = filters.search.trim().toLowerCase();

  const filtered = rows.filter((row) => {
    const matchesSearch =
      query.length === 0 ||
      row.fullName.toLowerCase().includes(query) ||
      row.specialization.toLowerCase().includes(query) ||
      row.specializations.some((specialization) => specialization.toLowerCase().includes(query));

    const matchesStatus =
      filters.activeStatus === "all" ||
      (filters.activeStatus === "active" ? row.isActive : !row.isActive);

    return matchesSearch && matchesStatus;
  });

  return [...filtered].sort((left, right) => {
    switch (filters.sort) {
      case "workload_asc":
        return left.workload - right.workload;
      case "workload_desc":
        return right.workload - left.workload;
      case "join_asc":
        return compareAsc(toDate(left.joinDate), toDate(right.joinDate));
      case "join_desc":
        return compareAsc(toDate(right.joinDate), toDate(left.joinDate));
      case "name_desc":
        return compareStrings(right.fullName, left.fullName);
      case "name_asc":
      default:
        return compareStrings(left.fullName, right.fullName);
    }
  });
};

export const buildTrainerAssignedMembers = (
  trainerId: string,
  sessions: TrainerSessionRecord[],
  now = new Date(),
): TrainerAssignedMember[] => {
  const filtered = sessions.filter((session) => {
    if (session.trainerId !== trainerId) {
      return false;
    }

    const normalizedStatus = normalizeStatus(session.status);
    return SESSION_ACTIVE_STATUSES.has(normalizedStatus) && !isBefore(toDate(session.sessionDate), startOfDay(now));
  });

  const byMember = filtered.reduce<Map<string, TrainerAssignedMember>>((map, session) => {
    const current = map.get(session.memberId);
    const nextSessionAt = current?.nextSessionAt
      ? compareAsc(toDate(session.sessionDate), toDate(current.nextSessionAt)) < 0
        ? session.sessionDate
        : current.nextSessionAt
      : session.sessionDate;

    map.set(session.memberId, {
      memberId: session.memberId,
      memberName: session.memberName ?? "Unknown Member",
      memberEmail: session.memberEmail,
      activeSessions: (current?.activeSessions ?? 0) + 1,
      nextSessionAt,
      sessionIds: [...(current?.sessionIds ?? []), session.id],
    });

    return map;
  }, new Map());

  return Array.from(byMember.values()).sort((left, right) => {
    const sessionsDiff = right.activeSessions - left.activeSessions;

    if (sessionsDiff !== 0) {
      return sessionsDiff;
    }

    return compareStrings(left.memberName, right.memberName);
  });
};

export const buildTrainerPerformanceSummary = (
  trainerId: string,
  sessions: TrainerSessionRecord[],
): TrainerPerformanceSummary => {
  const trainerSessions = sessions.filter((session) => session.trainerId === trainerId);
  const completedSessions = trainerSessions.filter(
    (session) => normalizeStatus(session.status) === "COMPLETED",
  );

  const totalDuration = completedSessions.reduce((sum, session) => sum + session.duration, 0);
  const totalRate = completedSessions.reduce((sum, session) => sum + session.rate, 0);

  return {
    totalSessions: trainerSessions.length,
    completedSessions: completedSessions.length,
    completionRate:
      trainerSessions.length > 0
        ? Math.round((completedSessions.length / trainerSessions.length) * 100)
        : 0,
    averageSessionDuration:
      completedSessions.length > 0 ? Math.round(totalDuration / completedSessions.length) : 0,
    averageSessionRate: completedSessions.length > 0 ? totalRate / completedSessions.length : 0,
  };
};

export const buildTrainerFormValuesFromProfile = (trainer: TrainerProfile): TrainerFormValues => {
  return {
    email: trainer.email,
    password: "",
    firstName: trainer.firstName,
    lastName: trainer.lastName,
    address: trainer.address ?? "",
    avatarUrl: trainer.avatarUrl ?? "",
    specializations: trainer.specializations.join(", "),
    certifications: trainer.certifications.join(", "),
    experience: trainer.experience,
    hourlyRate: trainer.hourlyRate,
  };
};

export const buildStaffListRecords = (staff: StaffProfile[]): StaffListRecord[] => {
  return staff.map((item) => ({
    id: item.id,
    fullName: `${item.firstName} ${item.lastName}`.trim() || item.email,
    email: item.email,
    phone: item.phone,
    role: normalizeStatus(item.staffRole),
    roleLabel: toEnumLabel(item.staffRole),
    isActive: item.isActive,
    joinDate: item.hireDate,
    department: item.department,
    position: item.position,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
};

export const calculateStaffOverviewMetrics = (
  rows: StaffListRecord[],
  now = new Date(),
): StaffOverviewMetrics => {
  const rolesDistributionMap = rows.reduce<Map<string, number>>((map, row) => {
    map.set(row.role, (map.get(row.role) ?? 0) + 1);
    return map;
  }, new Map());

  const rolesDistribution = Array.from(rolesDistributionMap.entries())
    .map(([role, count]) => ({
      role,
      roleLabel: toEnumLabel(role),
      count,
    }))
    .sort((left, right) => right.count - left.count);

  return {
    totalStaff: rows.length,
    activeStaff: rows.filter((row) => row.isActive).length,
    newStaffThisMonth: rows.filter((row) => isCurrentMonth(row.joinDate, now)).length,
    rolesDistribution,
  };
};

export const applyStaffFilters = (
  rows: StaffListRecord[],
  filters: StaffFilterState,
): StaffListRecord[] => {
  const query = filters.search.trim().toLowerCase();

  const filtered = rows.filter((row) => {
    const matchesSearch =
      query.length === 0 ||
      row.fullName.toLowerCase().includes(query) ||
      row.email.toLowerCase().includes(query);

    const matchesRole = filters.role === "all" || row.role === filters.role;

    return matchesSearch && matchesRole;
  });

  return [...filtered].sort((left, right) => {
    switch (filters.sort) {
      case "join_asc":
        return compareAsc(toDate(left.joinDate), toDate(right.joinDate));
      case "join_desc":
        return compareAsc(toDate(right.joinDate), toDate(left.joinDate));
      case "name_desc":
        return compareStrings(right.fullName, left.fullName);
      case "name_asc":
      default:
        return compareStrings(left.fullName, right.fullName);
    }
  });
};

export const extractStaffRoleOptions = (rows: StaffListRecord[]): string[] => {
  return Array.from(new Set(rows.map((row) => row.role))).sort(compareStrings);
};

export const buildStaffFormValuesFromProfile = (staff: StaffProfile): StaffFormValues => {
  return {
    email: staff.email,
    password: "",
    firstName: staff.firstName,
    lastName: staff.lastName,
    phone: staff.phone ?? "",
    address: staff.address ?? "",
    avatarUrl: staff.avatarUrl ?? "",
    staffRole: normalizeStatus(staff.staffRole),
    employeeId: staff.employeeId,
    hireDate: staff.hireDate ? format(toDate(staff.hireDate), "yyyy-MM-dd") : "",
    department: staff.department ?? "",
    position: staff.position,
    emergencyContact: staff.emergencyContact ?? "",
  };
};

export const splitCommaSeparatedValues = (value: string): string[] => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};
