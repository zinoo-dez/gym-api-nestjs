import axios from "axios";
import { addMinutes, differenceInMinutes } from "date-fns";

import { clampNumber, type AttendanceStatus } from "@/features/classes";
import type {
  ClassScheduleFilters,
  ClassSession,
  MemberSearchOption,
  RescheduleClassInput,
  RosterMember,
  SaveClassInput,
  UpdateRosterStatusInput,
} from "@/features/classes";

import api from "./api";

interface ApiEnvelope<T> {
  data: T;
}

type GenericRecord = Record<string, unknown>;

const CLASS_LIST_ENDPOINTS = ["/classes", "/class-schedules"] as const;
const CLASS_CREATE_ENDPOINTS = ["/classes", "/class-schedules"] as const;

const isRecord = (value: unknown): value is GenericRecord =>
  typeof value === "object" && value !== null;

const asRecord = (value: unknown): GenericRecord | null => (isRecord(value) ? value : null);

const asString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const asNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toDate = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const extractPayload = <T>(value: unknown): T => {
  if (isRecord(value) && "data" in value) {
    return value.data as T;
  }

  return value as T;
};

const toArrayPayload = <T>(value: unknown): T[] => {
  const payload = extractPayload<unknown>(value);

  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (isRecord(payload) && Array.isArray(payload.data)) {
    return payload.data as T[];
  }

  return [];
};

const shouldTryFallback = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const statusCode = error.response?.status;
  return statusCode === 400 || statusCode === 404 || statusCode === 405 || statusCode === 501;
};

const requestWithFallback = async <T>(attempts: Array<() => Promise<T>>): Promise<T> => {
  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error) {
      lastError = error;

      if (!shouldTryFallback(error)) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("Unable to complete class scheduling request.");
};

const toClassSession = (row: unknown): ClassSession => {
  const record = asRecord(row) ?? {};

  const className = asString(record.className) ?? asString(record.name) ?? "Untitled class";
  const category = (
    asString(record.classType) ?? asString(record.category) ?? asString(record.classCategory) ?? "OTHER"
  ).toUpperCase();

  const instructorId =
    asString(record.instructorId) ?? asString(record.trainerId) ?? asString(record.coachId) ?? "";

  const instructorName =
    asString(record.instructorName) ?? asString(record.trainerName) ?? asString(record.coachName) ?? "";

  const startDate =
    toDate(record.startTime) ?? toDate(record.schedule) ?? toDate(record.startDate) ?? new Date();

  const duration = Math.max(
    Math.trunc(asNumber(record.duration) ?? asNumber(record.durationMinutes) ?? 60),
    15,
  );

  const endDate = toDate(record.endTime) ?? addMinutes(startDate, duration);

  const maxCapacity = Math.max(
    Math.trunc(asNumber(record.maxCapacity) ?? asNumber(record.capacity) ?? 20),
    1,
  );

  const availableFromApi = asNumber(record.availableSlots) ?? asNumber(record.openSlots);
  const bookedFromApi =
    asNumber(record.bookedCount) ?? asNumber(record.currentBookings) ?? asNumber(record.attendanceCount);

  const inferredBooked =
    bookedFromApi ?? (typeof availableFromApi === "number" ? maxCapacity - availableFromApi : 0);

  const bookedCount = clampNumber(Math.max(Math.trunc(inferredBooked), 0), 0, maxCapacity);
  const availableSlots = clampNumber(
    Math.max(Math.trunc(availableFromApi ?? maxCapacity - bookedCount), 0),
    0,
    maxCapacity,
  );

  const occupancyRatio = maxCapacity > 0 ? bookedCount / maxCapacity : 0;

  const recurrenceRule = asString(record.recurrenceRule);
  const occurrences = Math.trunc(asNumber(record.occurrences) ?? 0) || undefined;

  const id =
    asString(record.id) ??
    `${className.toLowerCase().replace(/\s+/g, "-")}-${startDate.toISOString()}`;

  return {
    id,
    className,
    description: asString(record.description),
    category,
    instructorId,
    instructorName,
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
    maxCapacity,
    bookedCount,
    availableSlots,
    occupancyRatio,
    isActive: record.isActive !== false,
    recurrenceRule,
    occurrences,
  };
};

const normalizeRosterStatus = (
  status: unknown,
  checkedInAt: unknown,
): AttendanceStatus => {
  if (checkedInAt) {
    return "ATTENDED";
  }

  const normalized = (asString(status) ?? "").toUpperCase();

  if (normalized === "ATTENDED" || normalized === "COMPLETED" || normalized === "CHECKED_IN") {
    return "ATTENDED";
  }

  if (normalized === "NO_SHOW" || normalized === "NOSHOW") {
    return "NO_SHOW";
  }

  if (normalized === "CANCELLED" || normalized === "CANCELED") {
    return "CANCELLED";
  }

  return "BOOKED";
};

const toRosterMember = (row: unknown): RosterMember => {
  const record = asRecord(row) ?? {};
  const member = asRecord(record.member) ?? {};
  const user = asRecord(member.user) ?? {};

  const memberId = asString(record.memberId) ?? asString(member.id) ?? "";
  const firstName = asString(record.firstName) ?? asString(member.firstName) ?? asString(user.firstName) ?? "";
  const lastName = asString(record.lastName) ?? asString(member.lastName) ?? asString(user.lastName) ?? "";
  const generatedName = `${firstName} ${lastName}`.trim();

  const memberName =
    asString(record.memberName) ??
    asString(record.fullName) ??
    (generatedName.length > 0 ? generatedName : "Unknown member");
  const memberEmail = asString(record.memberEmail) ?? asString(record.email) ?? asString(user.email);

  const checkedInAt = asString(record.checkedInAt);
  const status = normalizeRosterStatus(record.status, checkedInAt);

  const bookingId =
    asString(record.bookingId) ?? (asString(record.classScheduleId) ? asString(record.id) : undefined);

  const attendanceId = asString(record.attendanceId);

  return {
    id: attendanceId ?? bookingId ?? memberId,
    memberId,
    memberName,
    memberEmail,
    status,
    bookingId,
    attendanceId,
    bookedAt: asString(record.bookedAt) ?? asString(record.createdAt),
    checkedInAt,
  };
};

const toMemberSearchOption = (row: unknown): MemberSearchOption | null => {
  const record = asRecord(row) ?? {};
  const user = asRecord(record.user) ?? {};

  const memberId = asString(record.memberId) ?? asString(record.id);

  if (!memberId) {
    return null;
  }

  const firstName = asString(record.firstName) ?? asString(user.firstName) ?? "";
  const lastName = asString(record.lastName) ?? asString(user.lastName) ?? "";
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    memberId,
    fullName: fullName.length > 0 ? fullName : "Unnamed member",
    email: asString(record.email) ?? asString(user.email) ?? "",
  };
};

const toCreatePayload = (input: SaveClassInput): Record<string, string | number> => {
  const startDate = new Date(input.startTime);
  const endDate = new Date(input.endTime);
  const duration = Math.max(differenceInMinutes(endDate, startDate), 15);

  const payload: Record<string, string | number> = {
    name: input.className.trim(),
    classType: input.category,
    trainerId: input.instructorId,
    schedule: input.startTime,
    duration,
    capacity: Math.max(Math.trunc(input.maxCapacity), 1),
  };

  const description = input.description?.trim();

  if (description) {
    payload.description = description;
  }

  if (input.recurrenceRule) {
    payload.recurrenceRule = input.recurrenceRule;
  }

  if (typeof input.occurrences === "number" && Number.isFinite(input.occurrences)) {
    payload.occurrences = Math.max(Math.trunc(input.occurrences), 1);
  }

  return payload;
};

const toUpdatePayload = (input: Partial<SaveClassInput>): Record<string, string | number> => {
  const payload: Record<string, string | number> = {};

  if (typeof input.className === "string" && input.className.trim().length > 0) {
    payload.name = input.className.trim();
  }

  if (typeof input.description === "string") {
    const description = input.description.trim();
    if (description.length > 0) {
      payload.description = description;
    }
  }

  if (typeof input.category === "string" && input.category.trim().length > 0) {
    payload.classType = input.category;
  }

  if (typeof input.instructorId === "string" && input.instructorId.trim().length > 0) {
    payload.trainerId = input.instructorId;
  }

  if (typeof input.maxCapacity === "number" && Number.isFinite(input.maxCapacity)) {
    payload.capacity = Math.max(Math.trunc(input.maxCapacity), 1);
  }

  if (input.startTime) {
    payload.schedule = input.startTime;
  }

  if (input.startTime && input.endTime) {
    const duration = Math.max(
      differenceInMinutes(new Date(input.endTime), new Date(input.startTime)),
      15,
    );
    payload.duration = duration;
  }

  return payload;
};

const cancelBooking = async (bookingId: string): Promise<void> => {
  await api.delete(`/classes/bookings/${bookingId}`);
};

const updateBookingStatus = async (
  bookingId: string,
  status: "CONFIRMED" | "NO_SHOW" | "CANCELLED" | "COMPLETED",
): Promise<void> => {
  await api.patch(`/classes/bookings/${bookingId}/status`, { status });
};

const buildClassListParams = (filters: ClassScheduleFilters): Record<string, string | number> => ({
  page: 1,
  limit: 500,
  // Backend ClassFiltersDto only supports startDate/endDate (not from/to).
  startDate: filters.startDate,
  endDate: filters.endDate,
});

export const classSchedulingService = {
  async listClasses(filters: ClassScheduleFilters): Promise<ClassSession[]> {
    const params = buildClassListParams(filters);

    const attempts = CLASS_LIST_ENDPOINTS.map(
      (endpoint) => async (): Promise<ClassSession[]> => {
        const response = await api.get<ApiEnvelope<unknown>>(endpoint, { params });
        const rows = toArrayPayload<unknown>(response.data);

        const filterStart = new Date(filters.startDate).getTime();
        const filterEnd = new Date(filters.endDate).getTime();

        return rows
          .map(toClassSession)
          .filter((session) => {
            const schedule = new Date(session.startTime).getTime();
            return schedule >= filterStart && schedule <= filterEnd;
          })
          .sort((left, right) =>
            new Date(left.startTime).getTime() - new Date(right.startTime).getTime(),
          );
      },
    );

    return requestWithFallback(attempts);
  },

  async createClass(input: SaveClassInput): Promise<ClassSession> {
    const payload = toCreatePayload(input);

    const attempts = CLASS_CREATE_ENDPOINTS.map(
      (endpoint) => async (): Promise<ClassSession> => {
        const response = await api.post<ApiEnvelope<unknown>>(endpoint, payload);
        const responsePayload = extractPayload<unknown>(response.data);

        if (Array.isArray(responsePayload)) {
          return toClassSession(responsePayload[0]);
        }

        return toClassSession(responsePayload);
      },
    );

    return requestWithFallback(attempts);
  },

  async updateClass(classId: string, input: Partial<SaveClassInput>): Promise<ClassSession> {
    const payload = toUpdatePayload(input);

    const attempts: Array<() => Promise<ClassSession>> = [
      async () => {
        const response = await api.patch<ApiEnvelope<unknown>>(`/classes/${classId}`, payload);
        return toClassSession(extractPayload(response.data));
      },
      async () => {
        const response = await api.patch<ApiEnvelope<unknown>>(`/classes/schedules/${classId}`, payload);
        return toClassSession(extractPayload(response.data));
      },
      async () => {
        const response = await api.put<ApiEnvelope<unknown>>(`/classes/schedules/${classId}`, payload);
        return toClassSession(extractPayload(response.data));
      },
    ];

    return requestWithFallback(attempts);
  },

  async rescheduleClass(input: RescheduleClassInput): Promise<ClassSession> {
    return this.updateClass(input.classId, {
      startTime: input.startTime,
      endTime: input.endTime,
    });
  },

  async deleteClass(classId: string): Promise<void> {
    const attempts: Array<() => Promise<void>> = [
      async () => {
        await api.delete(`/classes/${classId}`);
      },
      async () => {
        await api.delete(`/classes/schedules/${classId}`);
      },
      async () => {
        await api.patch(`/classes/schedules/${classId}`, { isActive: false });
      },
    ];

    await requestWithFallback(attempts);
  },

  async getClassRoster(classId: string): Promise<RosterMember[]> {
    const directRosterAttempts: Array<() => Promise<RosterMember[]>> = [
      async () => {
        const response = await api.get<ApiEnvelope<unknown>>(`/classes/${classId}/roster`);
        return toArrayPayload<unknown>(response.data).map(toRosterMember);
      },
      async () => {
        const response = await api.get<ApiEnvelope<unknown>>(`/classes/schedules/${classId}/roster`);
        return toArrayPayload<unknown>(response.data).map(toRosterMember);
      },
      async () => {
        const response = await api.get<ApiEnvelope<unknown>>("/classes/bookings", {
          params: {
            classScheduleId: classId,
          },
        });

        return toArrayPayload<unknown>(response.data).map(toRosterMember);
      },
    ];

    const roster = await requestWithFallback(directRosterAttempts);

    return roster
      .filter((member) => member.memberId.length > 0)
      .sort((left, right) => left.memberName.localeCompare(right.memberName));
  },

  async updateAttendanceStatus(input: UpdateRosterStatusInput): Promise<void> {
    if (input.status === "ATTENDED") {
      await api.post("/attendance/check-in", {
        memberId: input.memberId,
        classScheduleId: input.classId,
        type: "CLASS_ATTENDANCE",
      });
      return;
    }

    if (input.status === "BOOKED") {
      if (input.bookingId) {
        await updateBookingStatus(input.bookingId, "CONFIRMED");
        return;
      }

      await this.addMemberToClass(input.classId, input.memberId);
      return;
    }

    if (input.status === "NO_SHOW") {
      if (!input.bookingId) {
        throw new Error("No booking record found for member.");
      }

      await updateBookingStatus(input.bookingId, "NO_SHOW");
      return;
    }

    if (input.status === "CANCELLED") {
      if (!input.bookingId) {
        throw new Error("No booking record found for member.");
      }

      await cancelBooking(input.bookingId);
    }
  },

  async addMemberToClass(classId: string, memberId: string): Promise<void> {
    const payload = { memberId };

    const attempts: Array<() => Promise<void>> = [
      async () => {
        await api.post(`/classes/${classId}/roster`, payload);
      },
      async () => {
        await api.post(`/classes/schedules/${classId}/book`, payload);
      },
      async () => {
        await api.post(`/classes/${classId}/book`, payload);
      },
    ];

    await requestWithFallback(attempts);
  },

  async searchMembers(searchTerm: string): Promise<MemberSearchOption[]> {
    const normalizedSearch = searchTerm.trim();

    if (normalizedSearch.length < 2) {
      return [];
    }

    const query = normalizedSearch.toLowerCase();

    const fetchAttempts: Array<() => Promise<MemberSearchOption[]>> = [
      async () => {
        const response = await api.get<ApiEnvelope<unknown>>("/members", {
          params: {
            search: normalizedSearch,
            page: 1,
            limit: 25,
          },
        });

        return toArrayPayload<unknown>(response.data)
          .map(toMemberSearchOption)
          .filter((option): option is MemberSearchOption => option !== null);
      },
      async () => {
        const response = await api.get<ApiEnvelope<unknown>>("/members/search", {
          params: {
            q: normalizedSearch,
            page: 1,
            limit: 25,
          },
        });

        return toArrayPayload<unknown>(response.data)
          .map(toMemberSearchOption)
          .filter((option): option is MemberSearchOption => option !== null);
      },
    ];

    let members = await requestWithFallback(fetchAttempts);

    if (members.length === 0) {
      const response = await api.get<ApiEnvelope<unknown>>("/members", {
        params: {
          page: 1,
          limit: 200,
        },
      });

      members = toArrayPayload<unknown>(response.data)
        .map(toMemberSearchOption)
        .filter((option): option is MemberSearchOption => option !== null);
    }

    const deduped = new Map<string, MemberSearchOption>();

    for (const member of members) {
      const identity = `${member.fullName} ${member.email}`.trim().toLowerCase();

      if (identity.includes(query) || member.memberId.toLowerCase().includes(query)) {
        deduped.set(member.memberId, member);
      }
    }

    return Array.from(deduped.values())
      .sort((left, right) => left.fullName.localeCompare(right.fullName))
      .slice(0, 20);
  },
};
