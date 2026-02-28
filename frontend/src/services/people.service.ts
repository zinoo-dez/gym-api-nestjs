import api, { getAllPages } from "./api";
import type { ApiEnvelope, ApiPaginatedResponse } from "./api.types";

import {
    AttendanceRecord,
    AttendanceReport,
    BookableMemberOption,
    MemberPaymentRecord,
    MemberProfile,
    MemberSubscription,
    MembershipPlanOption,
    StaffProfile,
    TrainerClassScheduleRecord,
    TrainerInstructorProfile,
    TrainerProfile,
    TrainerSessionRecord,
} from "@/features/people";

interface MemberSubscriptionPlanApi {
    id: string;
    name: string;
    price: number;
    duration?: number;
    durationDays?: number;
}

interface MemberSubscriptionApi {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    membershipPlan?: MemberSubscriptionPlanApi;
}

interface MemberApi {
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
    subscriptions?: MemberSubscriptionApi[];
}

interface PaymentApi {
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
    subscription?: {
        membershipPlan?: {
            name?: string;
        };
    };
}

interface AttendanceApi {
    id: string;
    memberId: string;
    classScheduleId?: string;
    checkInTime: string;
    checkOutTime?: string;
    type: string;
    createdAt: string;
}

interface AttendanceReportApi {
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

interface MembershipPlanApi {
    id: string;
    name: string;
    price: number;
    duration?: number;
    durationDays?: number;
}

interface TrainerApi {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    address?: string;
    avatarUrl?: string;
    specializations?: string[];
    certifications?: string[];
    isActive: boolean;
    experience?: number;
    hourlyRate?: number;
    createdAt: string;
    updatedAt: string;
}

interface TrainerSessionApi {
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
    trainerId: string;
    sessionDate: string;
    member?: {
        id: string;
        user?: {
            firstName?: string;
            lastName?: string;
            email?: string;
        };
    };
    trainer?: {
        id: string;
        user?: {
            firstName?: string;
            lastName?: string;
        };
    };
}

interface ProgressApi {
    id: string;
    memberId: string;
    recordedAt: string;
    notes?: string;
    weight?: number;
    bmi?: number;
    bodyFat?: number;
    muscleMass?: number;
}

interface ClassScheduleApi {
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

interface InstructorProfileApi {
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

interface StaffApi {
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

interface MemberPayload {
    email: string;
    password: string;
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
}

interface MemberUpdatePayload {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    avatarUrl?: string;
    dateOfBirth?: string;
    gender?: string;
    height?: number;
    currentWeight?: number;
    targetWeight?: number;
    emergencyContact?: string;
}

interface TrainerPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    address?: string;
    avatarUrl?: string;
    specializations: string[];
    certifications?: string[];
    experience?: number;
    hourlyRate?: number;
}

interface TrainerUpdatePayload {
    firstName?: string;
    lastName?: string;
    address?: string;
    avatarUrl?: string;
    specializations?: string[];
    certifications?: string[];
    experience?: number;
    hourlyRate?: number;
}

interface StaffPayload {
    email: string;
    password: string;
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
}

interface StaffUpdatePayload {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    avatarUrl?: string;
    staffRole?: string;
    employeeId?: string;
    hireDate?: string;
    department?: string;
    position?: string;
    emergencyContact?: string;
}

interface TrainerSessionCreatePayload {
    memberId: string;
    trainerId: string;
    sessionDate: string;
    duration: number;
    title: string;
    description?: string;
    notes?: string;
    rate: number;
}

interface MembershipAssignPayload {
    memberId: string;
    planId: string;
    startDate: string;
}

const undefinedIfEmpty = (value: string | undefined): string | undefined => {
    if (!value) {
        return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
};

const toMemberSubscription = (
    subscription: MemberSubscriptionApi,
): MemberSubscription => ({
    id: subscription.id,
    status: subscription.status,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    membershipPlanId: subscription.membershipPlan?.id,
    membershipPlanName: subscription.membershipPlan?.name,
    membershipPlanPrice: subscription.membershipPlan?.price,
    membershipPlanDurationDays: Number(
        subscription.membershipPlan?.durationDays ??
        subscription.membershipPlan?.duration ??
        0,
    ),
});

const toMemberProfile = (member: MemberApi): MemberProfile => ({
    id: member.id,
    email: member.email,
    firstName: member.firstName,
    lastName: member.lastName,
    phone: member.phone,
    address: member.address,
    avatarUrl: member.avatarUrl,
    dateOfBirth: member.dateOfBirth,
    gender: member.gender,
    height: member.height,
    currentWeight: member.currentWeight,
    targetWeight: member.targetWeight,
    emergencyContact: member.emergencyContact,
    isActive: Boolean(member.isActive),
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
    subscriptions: (member.subscriptions ?? []).map(toMemberSubscription),
});

const toPaymentRecord = (payment: PaymentApi): MemberPaymentRecord => ({
    id: payment.id,
    memberId: payment.memberId,
    subscriptionId: payment.subscriptionId,
    amount: Number(payment.amount ?? 0),
    currency: payment.currency ?? "USD",
    methodType: payment.methodType,
    provider: payment.provider,
    transactionNo: payment.transactionNo,
    screenshotUrl: payment.screenshotUrl,
    status: payment.status,
    adminNote: payment.adminNote,
    description: payment.description,
    paidAt: payment.paidAt,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    planName: payment.subscription?.membershipPlan?.name,
});

const toAttendanceRecord = (attendance: AttendanceApi): AttendanceRecord => ({
    id: attendance.id,
    memberId: attendance.memberId,
    classScheduleId: attendance.classScheduleId,
    checkInTime: attendance.checkInTime,
    checkOutTime: attendance.checkOutTime,
    type: attendance.type,
    createdAt: attendance.createdAt,
});

const toAttendanceReport = (report: AttendanceReportApi): AttendanceReport => ({
    memberId: report.memberId,
    memberName: report.memberName,
    startDate: report.startDate,
    endDate: report.endDate,
    totalGymVisits: Number(report.totalGymVisits ?? 0),
    totalClassAttendances: Number(report.totalClassAttendances ?? 0),
    totalVisits: Number(report.totalVisits ?? 0),
    averageVisitsPerWeek: Number(report.averageVisitsPerWeek ?? 0),
    peakVisitHours: report.peakVisitHours ?? [],
    visitsByDayOfWeek: report.visitsByDayOfWeek ?? [],
});

const toMembershipPlanOption = (
    plan: MembershipPlanApi,
): MembershipPlanOption => ({
    id: plan.id,
    name: plan.name,
    price: Number(plan.price ?? 0),
    durationDays: Number(plan.durationDays ?? plan.duration ?? 0),
});

const toTrainerProfile = (trainer: TrainerApi): TrainerProfile => ({
    id: trainer.id,
    email: trainer.email,
    firstName: trainer.firstName,
    lastName: trainer.lastName,
    address: trainer.address,
    avatarUrl: trainer.avatarUrl,
    specializations: trainer.specializations ?? [],
    certifications: trainer.certifications ?? [],
    isActive: Boolean(trainer.isActive),
    experience: trainer.experience,
    hourlyRate: trainer.hourlyRate,
    createdAt: trainer.createdAt,
    updatedAt: trainer.updatedAt,
});

const toTrainerSessionRecord = (
    session: TrainerSessionApi,
): TrainerSessionRecord => ({
    id: session.id,
    status: session.status,
    title: session.title,
    description: session.description,
    duration: Number(session.duration ?? 0),
    notes: session.notes,
    rate: Number(session.rate ?? 0),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    memberId: session.memberId,
    memberName: session.member?.user
        ? `${session.member.user.firstName ?? ""} ${session.member.user.lastName ?? ""}`.trim()
        : undefined,
    memberEmail: session.member?.user?.email,
    trainerId: session.trainerId,
    trainerName: session.trainer?.user
        ? `${session.trainer.user.firstName ?? ""} ${session.trainer.user.lastName ?? ""}`.trim()
        : undefined,
    sessionDate: session.sessionDate,
});

const toTrainerClassScheduleRecord = (
    classSchedule: ClassScheduleApi,
): TrainerClassScheduleRecord => ({
    id: classSchedule.id,
    name: classSchedule.name,
    description: classSchedule.description,
    trainerId: classSchedule.trainerId,
    trainerName: classSchedule.trainerName,
    schedule: classSchedule.schedule,
    duration: Number(classSchedule.duration ?? 0),
    capacity: Number(classSchedule.capacity ?? 0),
    classType: classSchedule.classType,
    isActive: Boolean(classSchedule.isActive),
    availableSlots: classSchedule.availableSlots,
    createdAt: classSchedule.createdAt,
    updatedAt: classSchedule.updatedAt,
});

const toInstructorProfile = (
    profile: InstructorProfileApi,
): TrainerInstructorProfile => ({
    trainerId: profile.trainerId,
    fullName: profile.fullName,
    bio: profile.bio,
    specializations: profile.specializations ?? [],
    experience: Number(profile.experience ?? 0),
    certifications: profile.certifications,
    averageRating: Number(profile.averageRating ?? 0),
    ratingsCount: Number(profile.ratingsCount ?? 0),
    classHistory: {
        pastClassesCount: Number(profile.classHistory?.pastClassesCount ?? 0),
        upcomingClassesCount: Number(
            profile.classHistory?.upcomingClassesCount ?? 0,
        ),
        topClassTypes: profile.classHistory?.topClassTypes ?? [],
    },
});

const toStaffProfile = (staff: StaffApi): StaffProfile => ({
    id: staff.id,
    email: staff.email,
    firstName: staff.firstName,
    lastName: staff.lastName,
    phone: staff.phone,
    address: staff.address,
    avatarUrl: staff.avatarUrl,
    staffRole: staff.staffRole,
    employeeId: staff.employeeId,
    hireDate: staff.hireDate,
    department: staff.department,
    position: staff.position,
    emergencyContact: staff.emergencyContact,
    isActive: Boolean(staff.isActive),
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
});

const toProgressRecord = (progress: ProgressApi) => ({
    id: progress.id,
    memberId: progress.memberId,
    recordedAt: progress.recordedAt,
    notes: progress.notes,
    weight: progress.weight,
    bmi: progress.bmi,
    bodyFat: progress.bodyFat,
    muscleMass: progress.muscleMass,
});

export const peopleService = {
    async listMembers(): Promise<MemberProfile[]> {
        const members = await getAllPages<MemberApi>("/members");
        return members.map(toMemberProfile);
    },

    async getMemberById(memberId: string): Promise<MemberProfile> {
        const response = await api.get<ApiEnvelope<MemberApi>>(
            `/members/${memberId}`,
        );
        return toMemberProfile(response.data.data);
    },

    async createMember(payload: MemberPayload): Promise<MemberProfile> {
        const response = await api.post<ApiEnvelope<MemberApi>>(
            "/members",
            payload,
        );
        return toMemberProfile(response.data.data);
    },

    async updateMember(
        memberId: string,
        payload: MemberUpdatePayload,
    ): Promise<MemberProfile> {
        const response = await api.patch<ApiEnvelope<MemberApi>>(
            `/members/${memberId}`,
            payload,
        );
        return toMemberProfile(response.data.data);
    },

    async deactivateMember(memberId: string): Promise<void> {
        await api.patch(`/members/${memberId}/deactivate`);
    },

    async activateMember(memberId: string): Promise<void> {
        await api.patch(`/members/${memberId}/activate`);
    },

    async listAttendance(filters?: {
        memberId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<AttendanceRecord[]> {
        const attendance = await getAllPages<AttendanceApi>("/attendance", {
            memberId: filters?.memberId,
            startDate: filters?.startDate,
            endDate: filters?.endDate,
        });

        return attendance.map(toAttendanceRecord);
    },

    async getAttendanceReport(
        memberId: string,
        startDate?: string,
        endDate?: string,
    ): Promise<AttendanceReport> {
        const response = await api.get<ApiEnvelope<AttendanceReportApi>>(
            `/attendance/report/${memberId}`,
            {
                params: {
                    startDate,
                    endDate,
                },
            },
        );

        return toAttendanceReport(response.data.data);
    },

    async listPayments(filters?: {
        memberId?: string;
    }): Promise<MemberPaymentRecord[]> {
        const payments = await getAllPages<PaymentApi>("/payments", {
            memberId: filters?.memberId,
        });

        return payments.map(toPaymentRecord);
    },

    async listMembershipPlans(): Promise<MembershipPlanOption[]> {
        const plans = await getAllPages<MembershipPlanApi>("/membership-plans");
        return plans.map(toMembershipPlanOption);
    },

    async assignMembership(payload: MembershipAssignPayload): Promise<void> {
        await api.post("/memberships", payload);
    },

    async changeMembershipPlan(
        memberId: string,
        newPlanId: string,
    ): Promise<void> {
        await api.post(`/memberships/${memberId}/upgrade`, {
            newPlanId,
        });
    },

    async createPayment(payload: {
        memberId?: string;
        subscriptionId?: string;
        amount: number;
        currency?: string;
        methodType?: string;
        paymentMethod?: string;
        provider?: string;
        transactionNo?: string;
        screenshotUrl?: string;
        description?: string;
        notes?: string;
        status?: string;
    }): Promise<MemberPaymentRecord> {
        const response = await api.post<ApiEnvelope<PaymentApi>>(
            "/payments",
            payload,
        );
        return toPaymentRecord(response.data.data);
    },

    async freezeMembership(subscriptionId: string): Promise<void> {
        await api.post(`/memberships/${subscriptionId}/freeze`);
    },

    async unfreezeMembership(subscriptionId: string): Promise<void> {
        await api.post(`/memberships/${subscriptionId}/unfreeze`);
    },

    async listTrainers(): Promise<TrainerProfile[]> {
        const trainers = await getAllPages<TrainerApi>("/trainers");
        return trainers.map(toTrainerProfile);
    },

    async getTrainerById(trainerId: string): Promise<TrainerProfile> {
        const response = await api.get<ApiEnvelope<TrainerApi>>(
            `/trainers/${trainerId}`,
        );
        return toTrainerProfile(response.data.data);
    },

    async createTrainer(payload: TrainerPayload): Promise<TrainerProfile> {
        const response = await api.post<ApiEnvelope<TrainerApi>>(
            "/trainers",
            payload,
        );
        return toTrainerProfile(response.data.data);
    },

    async updateTrainer(
        trainerId: string,
        payload: TrainerUpdatePayload,
    ): Promise<TrainerProfile> {
        const response = await api.patch<ApiEnvelope<TrainerApi>>(
            `/trainers/${trainerId}`,
            payload,
        );
        return toTrainerProfile(response.data.data);
    },

    async deactivateTrainer(trainerId: string): Promise<void> {
        await api.delete(`/trainers/${trainerId}`);
    },

    async listTrainerSessions(filters?: {
        trainerId?: string;
        memberId?: string;
        status?: string;
        upcomingOnly?: boolean;
    }): Promise<TrainerSessionRecord[]> {
        const response = await api.get<ApiEnvelope<TrainerSessionApi[]>>(
            "/trainer-sessions",
            {
                params: {
                    trainerId: filters?.trainerId,
                    memberId: filters?.memberId,
                    status: filters?.status,
                    upcomingOnly: filters?.upcomingOnly,
                },
            },
        );

        return (response.data.data ?? []).map(toTrainerSessionRecord);
    },

    async createTrainerSession(
        payload: TrainerSessionCreatePayload,
    ): Promise<TrainerSessionRecord> {
        const response = await api.post<ApiEnvelope<TrainerSessionApi>>(
            "/trainer-sessions",
            payload,
        );
        return toTrainerSessionRecord(response.data.data);
    },

    async completeTrainerSession(
        sessionId: string,
    ): Promise<TrainerSessionRecord> {
        const response = await api.patch<ApiEnvelope<TrainerSessionApi>>(
            `/trainer-sessions/${sessionId}/complete`,
        );
        return toTrainerSessionRecord(response.data.data);
    },

    async listBookableMembers(): Promise<BookableMemberOption[]> {
        const response = await api.get<ApiEnvelope<BookableMemberOption[]>>(
            "/trainer-sessions/bookable-members",
        );

        return response.data.data ?? [];
    },

    async getMemberProgress(memberId: string) {
        const response = await api.get<ApiEnvelope<ProgressApi[]>>(
            `/trainer-sessions/member/${memberId}/progress`,
        );

        return (response.data.data ?? []).map(toProgressRecord);
    },

    async listTrainerClassSchedules(filters?: {
        trainerId?: string;
    }): Promise<TrainerClassScheduleRecord[]> {
        const classes = await getAllPages<ClassScheduleApi>("/classes", {
            trainerId: filters?.trainerId,
        });

        return classes.map(toTrainerClassScheduleRecord);
    },

    async getInstructorProfile(
        trainerId: string,
    ): Promise<TrainerInstructorProfile> {
        const response = await api.get<ApiEnvelope<InstructorProfileApi>>(
            `/classes/instructors/${trainerId}/profile`,
        );

        return toInstructorProfile(response.data.data);
    },

    async listStaff(): Promise<StaffProfile[]> {
        const staff = await getAllPages<StaffApi>("/staff");
        return staff.map(toStaffProfile);
    },

    async getStaffById(staffId: string): Promise<StaffProfile> {
        const response = await api.get<ApiEnvelope<StaffApi>>(`/staff/${staffId}`);
        return toStaffProfile(response.data.data);
    },

    async createStaff(payload: StaffPayload): Promise<StaffProfile> {
        const response = await api.post<ApiEnvelope<StaffApi>>("/staff", payload);
        return toStaffProfile(response.data.data);
    },

    async updateStaff(
        staffId: string,
        payload: StaffUpdatePayload,
    ): Promise<StaffProfile> {
        const response = await api.patch<ApiEnvelope<StaffApi>>(
            `/staff/${staffId}`,
            payload,
        );
        return toStaffProfile(response.data.data);
    },

    async deactivateStaff(staffId: string): Promise<void> {
        await api.delete(`/staff/${staffId}`);
    },

    toMemberCreatePayload(values: {
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
    }): MemberPayload {
        return {
            email: values.email.trim(),
            password: values.password,
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            phone: undefinedIfEmpty(values.phone),
            address: undefinedIfEmpty(values.address),
            avatarUrl: undefinedIfEmpty(values.avatarUrl),
            dateOfBirth: undefinedIfEmpty(values.dateOfBirth),
            gender: undefinedIfEmpty(values.gender),
            height: values.height,
            currentWeight: values.currentWeight,
            targetWeight: values.targetWeight,
            emergencyContact: undefinedIfEmpty(values.emergencyContact),
        };
    },

    toMemberUpdatePayload(values: {
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
    }): MemberUpdatePayload {
        return {
            firstName: undefinedIfEmpty(values.firstName),
            lastName: undefinedIfEmpty(values.lastName),
            phone: undefinedIfEmpty(values.phone),
            address: undefinedIfEmpty(values.address),
            avatarUrl: undefinedIfEmpty(values.avatarUrl),
            dateOfBirth: undefinedIfEmpty(values.dateOfBirth),
            gender: undefinedIfEmpty(values.gender),
            height: values.height,
            currentWeight: values.currentWeight,
            targetWeight: values.targetWeight,
            emergencyContact: undefinedIfEmpty(values.emergencyContact),
        };
    },

    toTrainerCreatePayload(values: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        address: string;
        avatarUrl: string;
        specializations: string[];
        certifications: string[];
        experience?: number;
        hourlyRate?: number;
    }): TrainerPayload {
        return {
            email: values.email.trim(),
            password: values.password,
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            address: undefinedIfEmpty(values.address),
            avatarUrl: undefinedIfEmpty(values.avatarUrl),
            specializations: values.specializations,
            certifications:
                values.certifications.length > 0 ? values.certifications : undefined,
            experience: values.experience,
            hourlyRate: values.hourlyRate,
        };
    },

    toTrainerUpdatePayload(values: {
        firstName: string;
        lastName: string;
        address: string;
        avatarUrl: string;
        specializations: string[];
        certifications: string[];
        experience?: number;
        hourlyRate?: number;
    }): TrainerUpdatePayload {
        return {
            firstName: undefinedIfEmpty(values.firstName),
            lastName: undefinedIfEmpty(values.lastName),
            address: undefinedIfEmpty(values.address),
            avatarUrl: undefinedIfEmpty(values.avatarUrl),
            specializations: values.specializations,
            certifications:
                values.certifications.length > 0 ? values.certifications : undefined,
            experience: values.experience,
            hourlyRate: values.hourlyRate,
        };
    },

    toStaffCreatePayload(values: {
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
    }): StaffPayload {
        return {
            email: values.email.trim(),
            password: values.password,
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            phone: undefinedIfEmpty(values.phone),
            address: undefinedIfEmpty(values.address),
            avatarUrl: undefinedIfEmpty(values.avatarUrl),
            staffRole: values.staffRole,
            employeeId: values.employeeId.trim(),
            hireDate: values.hireDate,
            department: undefinedIfEmpty(values.department),
            position: values.position.trim(),
            emergencyContact: undefinedIfEmpty(values.emergencyContact),
        };
    },

    toStaffUpdatePayload(values: {
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
    }): StaffUpdatePayload {
        return {
            firstName: undefinedIfEmpty(values.firstName),
            lastName: undefinedIfEmpty(values.lastName),
            phone: undefinedIfEmpty(values.phone),
            address: undefinedIfEmpty(values.address),
            avatarUrl: undefinedIfEmpty(values.avatarUrl),
            staffRole: undefinedIfEmpty(values.staffRole),
            employeeId: undefinedIfEmpty(values.employeeId),
            hireDate: undefinedIfEmpty(values.hireDate),
            department: undefinedIfEmpty(values.department),
            position: undefinedIfEmpty(values.position),
            emergencyContact: undefinedIfEmpty(values.emergencyContact),
        };
    },
};
