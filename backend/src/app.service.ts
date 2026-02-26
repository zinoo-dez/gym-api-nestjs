import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from './prisma/prisma.service';
import {
  type DashboardExportFormat,
  type DashboardExportQueryDto,
  type DashboardFiltersDto,
} from './dto/dashboard-filters.dto';

export interface TimeSeriesPoint {
  label: string;
  value: number;
}

interface DashboardRangeWindow {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
}

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Gym API is running';
  }

  async checkHealth(): Promise<{
    status: string;
    timestamp: string;
    database: string;
    responseTime: number;
    details?: string;
  }> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        responseTime: Date.now() - start,
      };
    } catch {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        responseTime: Date.now() - start,
        details: 'Database ping failed',
      };
    }
  }

  async checkDatabaseHealth(): Promise<{
    status: string;
    timestamp: string;
    database: string;
    responseTime: number;
    details?: string;
  }> {
    return this.checkHealth();
  }

  async getDashboardStats(filters?: DashboardFiltersDto) {
    const now = new Date();
    const { start, end, previousStart, previousEnd } =
      this.resolveDashboardRange(filters);
    const classCategory = this.normalizeClassCategory(filters?.classCategory);

    const [
      totalMembers,
      currentRangeMembers,
      previousRangeMembers,
      activeMemberships,
      previousActiveMemberships,
      expiringMemberships,
      currentRangeCheckIns,
      previousRangeCheckIns,
      currentRangeSubscriptions,
      previousRangeSubscriptions,
    ] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      this.prisma.member.count({
        where: { createdAt: { gte: previousStart, lte: previousEnd } },
      }),
      this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          startDate: { lte: end },
          endDate: { gte: end },
        },
      }),
      this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          startDate: { lte: previousEnd },
          endDate: { gte: previousEnd },
        },
      }),
      this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          endDate: {
            gte: end,
            lte: new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.getAttendanceCountForRange(start, end, classCategory),
      this.getAttendanceCountForRange(previousStart, previousEnd, classCategory),
      this.prisma.subscription.findMany({
        where: { startDate: { gte: start, lte: end } },
        include: { membershipPlan: true },
      }),
      this.prisma.subscription.findMany({
        where: { startDate: { gte: previousStart, lte: previousEnd } },
        include: { membershipPlan: true },
      }),
    ]);

    const currentRangeRevenue = currentRangeSubscriptions.reduce(
      (sum, sub) => sum + (sub.membershipPlan?.price ?? 0),
      0,
    );
    const previousRangeRevenue = previousRangeSubscriptions.reduce(
      (sum, sub) => sum + (sub.membershipPlan?.price ?? 0),
      0,
    );

    const memberChange = currentRangeMembers - previousRangeMembers;
    const activeMembershipChange =
      activeMemberships - previousActiveMemberships;
    const checkInChange = currentRangeCheckIns - previousRangeCheckIns;
    const revenueChange = currentRangeRevenue - previousRangeRevenue;

    return {
      totalMembers: {
        value: totalMembers,
        change: memberChange,
        type: memberChange >= 0 ? 'increase' : 'decrease',
      },
      activeMemberships: {
        value: activeMemberships,
        change: activeMembershipChange,
        type: activeMembershipChange >= 0 ? 'increase' : 'decrease',
      },
      expiringMemberships: {
        value: expiringMemberships,
        change: 0,
        type: 'decrease',
      },
      todayCheckIns: {
        value: currentRangeCheckIns,
        change: checkInChange,
        type: checkInChange >= 0 ? 'increase' : 'decrease',
      },
      monthlyRevenue: {
        value: Number(currentRangeRevenue.toFixed(2)),
        change: Number(revenueChange.toFixed(2)),
        type: revenueChange >= 0 ? 'increase' : 'decrease',
      },
      newSignups: {
        value: currentRangeMembers,
        change: memberChange,
        type: memberChange >= 0 ? 'increase' : 'decrease',
      },
      filters: {
        range: filters?.range ?? 'custom',
        period: filters?.period ?? 'daily',
        startDate: this.dayKey(start),
        endDate: this.dayKey(end),
        branch: filters?.branch ?? 'all',
        classCategory: classCategory ?? 'all',
      },
      generatedAt: now.toISOString(),
    };
  }

  async getRecentMembers() {
    const recentMembers = await this.prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { membershipPlan: true },
        },
      },
    });

    return recentMembers.map((member) => {
      const subscription = member.subscriptions[0];
      return {
        id: member.id,
        name: `${member.user.firstName} ${member.user.lastName}`,
        email: member.user.email,
        plan: subscription?.membershipPlan?.name ?? 'No Plan',
        joined: member.createdAt.toISOString().split('T')[0],
        status: subscription?.status ?? 'ACTIVE',
      };
    });
  }

  async getPopularClasses() {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    const schedules = await this.prisma.classSchedule.findMany({
      where: {
        startTime: { gte: startOfToday, lt: endOfToday },
        isActive: true,
      },
      include: {
        class: true,
        trainer: { include: { user: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { bookings: { _count: 'desc' } },
      take: 5,
    });

    return schedules.map((schedule) => ({
      id: schedule.id,
      name: schedule.class.name,
      trainer: `${schedule.trainer.user.firstName} ${schedule.trainer.user.lastName}`,
      enrolled: schedule._count.bookings,
      capacity: schedule.class.maxCapacity,
      time: schedule.startTime.toISOString(),
    }));
  }

  async getUpcomingClasses(days = 7) {
    const now = new Date();
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const schedules = await this.prisma.classSchedule.findMany({
      where: {
        startTime: { gte: now, lte: end },
        isActive: true,
      },
      include: {
        class: true,
        trainer: { include: { user: true } },
        bookings: {
          where: { status: 'CONFIRMED' },
          select: { id: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const totalUpcomingClasses = schedules.length;
    const totalCapacity = schedules.reduce(
      (sum, schedule) => sum + (schedule.class?.maxCapacity ?? 0),
      0,
    );
    const totalBookings = schedules.reduce(
      (sum, schedule) => sum + schedule.bookings.length,
      0,
    );

    const topClasses = schedules
      .map((schedule) => ({
        id: schedule.id,
        name: schedule.class.name,
        trainer: `${schedule.trainer.user.firstName} ${schedule.trainer.user.lastName}`,
        booked: schedule.bookings.length,
        capacity: schedule.class.maxCapacity,
        startTime: schedule.startTime.toISOString(),
      }))
      .sort((a, b) => b.booked - a.booked)
      .slice(0, 5);

    return {
      windowDays: days,
      totalUpcomingClasses,
      totalCapacity,
      totalBookings,
      utilization:
        totalCapacity > 0
          ? Number(((totalBookings / totalCapacity) * 100).toFixed(1))
          : 0,
      topClasses,
    };
  }

  async getRecentActivity(filters?: DashboardFiltersDto) {
    const { start, end } = this.resolveDashboardRange(filters);
    const classCategory = this.normalizeClassCategory(filters?.classCategory);

    const [attendance, bookings] = await Promise.all([
      this.prisma.attendance.findMany({
        where: {
          checkInTime: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { checkInTime: 'desc' },
        take: 20,
        include: { member: { include: { user: true } } },
      }),
      this.prisma.classBooking.findMany({
        where: {
          bookedAt: {
            gte: start,
            lte: end,
          },
          ...(classCategory
            ? {
                classSchedule: {
                  class: {
                    category: {
                      equals: classCategory,
                      mode: 'insensitive' as const,
                    },
                  },
                },
              }
            : {}),
        },
        orderBy: { bookedAt: 'desc' },
        take: 20,
        include: {
          member: { include: { user: true } },
          classSchedule: { include: { class: true } },
        },
      }),
    ]);

    const activity = [
      ...attendance.map((record) => ({
        id: record.id,
        member: `${record.member.user.firstName} ${record.member.user.lastName}`.trim(),
        action: 'Check-in',
        detail: `${record.member.user.firstName} ${record.member.user.lastName} checked in`,
        category: record.type === 'CLASS_ATTENDANCE' ? 'Class' : 'Gym Visit',
        classCategory: undefined as string | undefined,
        status: 'completed',
        time: record.checkInTime,
      })),
      ...bookings.map((record) => ({
        id: record.id,
        member: `${record.member.user.firstName} ${record.member.user.lastName}`.trim(),
        action: 'Class booking',
        detail: `${record.member.user.firstName} ${record.member.user.lastName} booked ${record.classSchedule.class.name}`,
        category: 'Class',
        classCategory: record.classSchedule.class.category,
        status: record.status.toLowerCase(),
        time: record.bookedAt,
      })),
    ]
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 6);

    return activity.map((item) => ({
      id: item.id,
      member: item.member,
      action: item.action,
      detail: item.detail,
      category: item.category,
      status: item.status,
      classCategory: item.classCategory,
      time: item.time.toISOString(),
    }));
  }

  async getReportingAnalytics(filters?: DashboardFiltersDto) {
    const now = new Date();
    const { start, end, previousStart, previousEnd } =
      this.resolveDashboardRange(filters);
    const classCategory = this.normalizeClassCategory(filters?.classCategory);
    const startOfRangeMonth = new Date(start.getFullYear(), start.getMonth(), 1);

    const [
      payments,
      productSales,
      trainerSessions,
      members,
      subscriptions,
      attendance,
      classBookings,
      classes,
      trainers,
      equipment,
      invoices,
      activeMembersCurrentPeriod,
      activeMembersPreviousPeriod,
    ] = await Promise.all([
      this.prisma.payment.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { amount: true, status: true, createdAt: true },
      }),
      this.prisma.productSale.findMany({
        where: {
          soldAt: { gte: start, lte: end },
          status: 'COMPLETED',
        },
        select: { total: true, soldAt: true },
      }),
      this.prisma.trainerSession.findMany({
        where: {
          sessionDate: { gte: start, lte: end },
          status: { in: ['SCHEDULED', 'COMPLETED'] },
        },
        select: {
          rate: true,
          duration: true,
          status: true,
          sessionDate: true,
          trainerId: true,
        },
      }),
      this.prisma.member.findMany({
        select: { id: true, createdAt: true, gender: true, dateOfBirth: true },
      }),
      this.prisma.subscription.findMany({
        where: {
          OR: [
            {
              startDate: { lte: end },
              endDate: { gte: start },
            },
            { status: 'ACTIVE' },
          ],
        },
        select: {
          startDate: true,
          endDate: true,
          status: true,
          membershipPlanId: true,
          memberId: true,
        },
      }),
      this.prisma.attendance.findMany({
        where: { checkInTime: { gte: start, lte: end } },
        select: { memberId: true, checkInTime: true, type: true },
      }),
      this.prisma.classBooking.findMany({
        where: {
          bookedAt: { gte: start, lte: end },
          ...(classCategory
            ? {
                classSchedule: {
                  class: {
                    category: {
                      equals: classCategory,
                      mode: 'insensitive' as const,
                    },
                  },
                },
              }
            : {}),
        },
        select: { classScheduleId: true, status: true, bookedAt: true },
      }),
      this.prisma.class.findMany({
        where: classCategory
          ? {
              category: {
                equals: classCategory,
                mode: 'insensitive' as const,
              },
            }
          : undefined,
        select: { id: true, name: true, category: true, maxCapacity: true },
      }),
      this.prisma.trainer.findMany({ select: { id: true } }),
      this.prisma.equipment.findMany({
        where: { isActive: true },
        select: { category: true },
      }),
      this.prisma.invoice.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { total: true, status: true, dueDate: true },
      }),
      this.prisma.attendance.groupBy({
        by: ['memberId'],
        where: { checkInTime: { gte: start, lte: end } },
      }),
      this.prisma.attendance.groupBy({
        by: ['memberId'],
        where: { checkInTime: { gte: previousStart, lte: previousEnd } },
      }),
    ]);

    const membershipRevenueByDay = new Map<string, number>();
    const productRevenueByDay = new Map<string, number>();
    const sessionRevenueByDay = new Map<string, number>();

    for (const payment of payments) {
      if (payment.status !== 'PAID') continue;
      const key = this.dayKey(payment.createdAt);
      membershipRevenueByDay.set(
        key,
        (membershipRevenueByDay.get(key) ?? 0) + payment.amount,
      );
    }
    for (const sale of productSales) {
      const key = this.dayKey(sale.soldAt);
      productRevenueByDay.set(
        key,
        (productRevenueByDay.get(key) ?? 0) + sale.total,
      );
    }
    for (const session of trainerSessions) {
      const key = this.dayKey(session.sessionDate);
      const sessionAmount = session.status === 'COMPLETED' ? session.rate : 0;
      sessionRevenueByDay.set(
        key,
        (sessionRevenueByDay.get(key) ?? 0) + sessionAmount,
      );
    }

    const dailyRevenue = this.buildDaySeries(start, end, (key) => {
      return (
        (membershipRevenueByDay.get(key) ?? 0) +
        (productRevenueByDay.get(key) ?? 0) +
        (sessionRevenueByDay.get(key) ?? 0)
      );
    });

    const weeklyRevenue = this.aggregateSeriesByWeek(dailyRevenue);
    const monthlyRevenue = this.buildMonthlySeries(
      startOfRangeMonth,
      end,
      (monthKey, from, to) => {
        let total = 0;
        for (const [key, amount] of membershipRevenueByDay) {
          if (this.keyInRange(key, from, to)) total += amount;
        }
        for (const [key, amount] of productRevenueByDay) {
          if (this.keyInRange(key, from, to)) total += amount;
        }
        for (const [key, amount] of sessionRevenueByDay) {
          if (this.keyInRange(key, from, to)) total += amount;
        }
        return { label: monthKey, value: Number(total.toFixed(2)) };
      },
    );

    const membershipRevenueTotal = this.sumMapValues(membershipRevenueByDay);
    const productRevenueTotal = this.sumMapValues(productRevenueByDay);
    const sessionRevenueTotal = this.sumMapValues(sessionRevenueByDay);

    const invoicedAmount = invoices.reduce(
      (sum, invoice) => sum + invoice.total,
      0,
    );
    const collectedAmount = invoices
      .filter((invoice) => invoice.status === 'PAID')
      .reduce((sum, invoice) => sum + invoice.total, 0);

    const outstandingFromInvoices = invoices
      .filter(
        (invoice) => invoice.status === 'SENT' || invoice.status === 'OVERDUE',
      )
      .reduce((sum, invoice) => sum + invoice.total, 0);
    const outstandingFromPendingPayments = payments
      .filter((payment) => payment.status === 'PENDING')
      .reduce((sum, payment) => sum + payment.amount, 0);

    const totalMembers = members.length;
    const membersCreatedInRange = members.filter(
      (member) => member.createdAt >= start && member.createdAt <= end,
    );
    const memberGrowthTrends = this.buildMonthlyMemberGrowth(
      startOfRangeMonth,
      end,
      membersCreatedInRange,
    );

    const totalSubscriptions = subscriptions.length;
    const churnedSubscriptions = subscriptions.filter(
      (s) =>
        (s.status === 'CANCELLED' || s.status === 'EXPIRED') &&
        s.endDate >= start &&
        s.endDate <= end,
    ).length;
    const churnRate =
      totalSubscriptions > 0
        ? Number(((churnedSubscriptions / totalSubscriptions) * 100).toFixed(2))
        : 0;

    const activeMemberIds = new Set(
      activeMembersCurrentPeriod.map((item) => item.memberId),
    );
    const previousActiveMemberIds = new Set(
      activeMembersPreviousPeriod.map((item) => item.memberId),
    );

    const genderDistribution: Record<string, number> = {};
    const ageBuckets = {
      under18: 0,
      age18to25: 0,
      age26to35: 0,
      age36to45: 0,
      age46plus: 0,
      unknown: 0,
    };

    for (const member of membersCreatedInRange) {
      const gender = member.gender?.trim() || 'Unknown';
      genderDistribution[gender] = (genderDistribution[gender] ?? 0) + 1;

      const age = member.dateOfBirth
        ? this.calculateAge(member.dateOfBirth, now)
        : null;
      if (age === null) {
        ageBuckets.unknown += 1;
      } else if (age < 18) {
        ageBuckets.under18 += 1;
      } else if (age <= 25) {
        ageBuckets.age18to25 += 1;
      } else if (age <= 35) {
        ageBuckets.age26to35 += 1;
      } else if (age <= 45) {
        ageBuckets.age36to45 += 1;
      } else {
        ageBuckets.age46plus += 1;
      }
    }

    const membershipPlanDistributionCount = new Map<string, number>();
    const uniquePlanIds = new Set(subscriptions.map((s) => s.membershipPlanId));
    const plans = await this.prisma.membershipPlan.findMany({
      where: { id: { in: Array.from(uniquePlanIds) } },
      select: { id: true, name: true },
    });
    const planNameMap = new Map(plans.map((p) => [p.id, p.name]));
    const distributionSource = subscriptions.filter(
      (sub) => sub.startDate <= end && sub.endDate >= start,
    );

    for (const sub of distributionSource) {
      const planName = planNameMap.get(sub.membershipPlanId) ?? 'Unknown Plan';
      membershipPlanDistributionCount.set(
        planName,
        (membershipPlanDistributionCount.get(planName) ?? 0) + 1,
      );
    }

    const peakHoursCount = new Map<number, number>();
    for (const checkIn of attendance) {
      const hour = checkIn.checkInTime.getHours();
      peakHoursCount.set(hour, (peakHoursCount.get(hour) ?? 0) + 1);
    }
    const peakHoursAnalysis = Array.from({ length: 24 }, (_, hour) => ({
      label: `${String(hour).padStart(2, '0')}:00`,
      value: peakHoursCount.get(hour) ?? 0,
    }));

    const classScheduleIds = Array.from(
      new Set(classBookings.map((booking) => booking.classScheduleId)),
    );
    const schedules = await this.prisma.classSchedule.findMany({
      where: { id: { in: classScheduleIds } },
      select: { id: true, classId: true, trainerId: true },
    });
    const scheduleClassMap = new Map(
      schedules.map((schedule) => [schedule.id, schedule.classId]),
    );
    const scheduleTrainerMap = new Map(
      schedules.map((schedule) => [schedule.id, schedule.trainerId]),
    );
    const classNameMap = new Map(
      classes.map((gymClass) => [gymClass.id, gymClass.name]),
    );
    const classCategoryMap = new Map(
      classes.map((gymClass) => [gymClass.id, gymClass.category]),
    );

    const classAttendanceCount = new Map<string, number>();
    const trainerSessionsCount = new Map<string, number>();
    const equipmentUsageByCategory = new Map<string, number>();

    for (const booking of classBookings) {
      if (booking.status !== 'CONFIRMED' && booking.status !== 'COMPLETED')
        continue;
      const classId = scheduleClassMap.get(booking.classScheduleId);
      if (!classId) continue;
      const className = classNameMap.get(classId) ?? 'Unknown Class';
      classAttendanceCount.set(
        className,
        (classAttendanceCount.get(className) ?? 0) + 1,
      );

      const bookingClassCategory = classCategoryMap.get(classId) ?? 'GENERAL';
      equipmentUsageByCategory.set(
        bookingClassCategory,
        (equipmentUsageByCategory.get(bookingClassCategory) ?? 0) + 1,
      );

      const trainerId = scheduleTrainerMap.get(booking.classScheduleId);
      if (trainerId) {
        trainerSessionsCount.set(
          trainerId,
          (trainerSessionsCount.get(trainerId) ?? 0) + 1,
        );
      }
    }

    for (const session of trainerSessions) {
      trainerSessionsCount.set(
        session.trainerId,
        (trainerSessionsCount.get(session.trainerId) ?? 0) + 1,
      );
    }

    const trainerUtilization = {
      totalTrainers: trainers.length,
      engagedTrainers: trainerSessionsCount.size,
      utilizationRate:
        trainers.length > 0
          ? Number(
              ((trainerSessionsCount.size / trainers.length) * 100).toFixed(2),
            )
          : 0,
      topTrainersBySessions: await Promise.all(
        Array.from(trainerSessionsCount.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(async ([trainerId, sessionsCount]) => {
            const trainer = await this.prisma.trainer.findUnique({
              where: { id: trainerId },
              select: { user: { select: { firstName: true, lastName: true } } },
            });
            const fullName = trainer?.user
              ? `${trainer.user.firstName} ${trainer.user.lastName}`
              : 'Unknown Trainer';
            return { trainerId, trainerName: fullName, sessionsCount };
          }),
      ),
    };

    const averageMemberLifetimeValue =
      totalMembers > 0
        ? Number(
            (
              (membershipRevenueTotal +
                productRevenueTotal +
                sessionRevenueTotal) /
              totalMembers
            ).toFixed(2),
          )
        : 0;

    const equipmentInventoryByCategory = equipment.reduce<
      Record<string, number>
    >((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    }, {});

    return {
      generatedAt: now.toISOString(),
      revenueReports: {
        dailyRevenue,
        weeklyRevenue,
        monthlyRevenue,
        revenueBySource: {
          memberships: Number(membershipRevenueTotal.toFixed(2)),
          products: Number(productRevenueTotal.toFixed(2)),
          sessions: Number(sessionRevenueTotal.toFixed(2)),
        },
        paymentCollection: {
          invoicedAmount: Number(invoicedAmount.toFixed(2)),
          collectedAmount: Number(collectedAmount.toFixed(2)),
          collectionRate:
            invoicedAmount > 0
              ? Number(((collectedAmount / invoicedAmount) * 100).toFixed(2))
              : 0,
        },
        outstandingPayments: {
          invoiceOutstanding: Number(outstandingFromInvoices.toFixed(2)),
          pendingPayments: Number(outstandingFromPendingPayments.toFixed(2)),
          totalOutstanding: Number(
            (outstandingFromInvoices + outstandingFromPendingPayments).toFixed(
              2,
            ),
          ),
        },
      },
      memberAnalytics: {
        growthTrends: memberGrowthTrends,
        churnRate,
        activeVsInactive: {
          activeMembers: activeMemberIds.size,
          inactiveMembers: Math.max(totalMembers - activeMemberIds.size, 0),
          previousPeriodActiveMembers: previousActiveMemberIds.size,
        },
        demographics: {
          genderDistribution,
          ageDistribution: ageBuckets,
        },
        membershipPlanDistribution: Array.from(
          membershipPlanDistributionCount.entries(),
        ).map(([planName, count]) => ({
          planName,
          count,
        })),
      },
      operationalMetrics: {
        peakHoursAnalysis,
        classAttendanceTrends: Array.from(classAttendanceCount.entries())
          .map(([className, attendanceCount]) => ({
            className,
            attendanceCount,
          }))
          .sort((a, b) => b.attendanceCount - a.attendanceCount)
          .slice(0, 8),
        trainerUtilization,
        equipmentUsagePatterns: {
          usageByClassCategory: Array.from(
            equipmentUsageByCategory.entries(),
          ).map(([category, usage]) => ({
            category,
            usage,
          })),
          activeEquipmentByCategory: equipmentInventoryByCategory,
        },
        averageMemberLifetimeValue,
      },
      filters: {
        range: filters?.range ?? 'custom',
        period: filters?.period ?? 'daily',
        startDate: this.dayKey(start),
        endDate: this.dayKey(end),
        branch: filters?.branch ?? 'all',
        classCategory: classCategory ?? 'all',
      },
      filterOptions: {
        branches: [],
        classCategories: Array.from(
          new Set(classes.map((gymClass) => gymClass.category)),
        ),
      },
    };
  }

  async exportDashboardReport(query: DashboardExportQueryDto): Promise<{
    filename: string;
    mimeType: string;
    buffer: Buffer;
  }> {
    const format: DashboardExportFormat = query.format ?? 'csv';
    const generatedAt = new Date();
    const [stats, analytics, recentActivity] = await Promise.all([
      this.getDashboardStats(query),
      this.getReportingAnalytics(query),
      this.getRecentActivity(query),
    ]);

    const baseName = `dashboard-report-${this.dayKey(generatedAt)}`;

    if (format === 'pdf') {
      const buffer = await this.buildDashboardPdf({
        generatedAt,
        query,
        stats,
        analytics,
        recentActivity,
      });

      return {
        filename: `${baseName}.pdf`,
        mimeType: 'application/pdf',
        buffer,
      };
    }

    const csv = this.buildDashboardCsv({
      generatedAt,
      query,
      stats,
      analytics,
      recentActivity,
    });

    return {
      filename: `${baseName}.csv`,
      mimeType: 'text/csv; charset=utf-8',
      buffer: Buffer.from(csv, 'utf8'),
    };
  }

  private async buildDashboardPdf(input: {
    generatedAt: Date;
    query: DashboardFiltersDto;
    stats: any;
    analytics: any;
    recentActivity: any[];
  }): Promise<Buffer> {
    const { generatedAt, query, stats, analytics, recentActivity } = input;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (error: Error) => reject(error));

      doc.fontSize(20).text('Gym Dashboard Report', { align: 'left' });
      doc.moveDown(0.25);
      doc
        .fontSize(10)
        .fillColor('#555')
        .text(`Generated: ${generatedAt.toISOString()}`)
        .text(
          `Range: ${query.startDate ?? '-'} to ${query.endDate ?? '-'} (${query.range ?? 'custom'})`,
        )
        .text(`Period: ${query.period ?? 'daily'}`)
        .text(`Class Category: ${query.classCategory ?? 'all'}`);

      doc.moveDown();
      doc.fillColor('#000').fontSize(14).text('Summary');
      doc.moveDown(0.3);
      doc
        .fontSize(11)
        .text(
          `Total Revenue: ${this.formatCurrencyValue(stats?.monthlyRevenue?.value ?? 0)}`,
        )
        .text(`Active Members: ${stats?.activeMemberships?.value ?? 0}`)
        .text(`Attendance: ${stats?.todayCheckIns?.value ?? 0}`)
        .text(`New Signups: ${stats?.newSignups?.value ?? 0}`);

      doc.moveDown();
      doc.fontSize(14).text('Revenue (Daily)');
      doc.moveDown(0.3);

      const dailyRevenue: Array<{ label: string; value: number }> =
        analytics?.revenueReports?.dailyRevenue ?? [];
      for (const point of dailyRevenue.slice(-14)) {
        doc
          .fontSize(10)
          .text(`${point.label}: ${this.formatCurrencyValue(point.value)}`);
      }

      doc.moveDown();
      doc.fontSize(14).text('Recent Activity');
      doc.moveDown(0.3);
      for (const item of recentActivity.slice(0, 8)) {
        const time = typeof item?.time === 'string' ? item.time : '-';
        const detail = typeof item?.detail === 'string' ? item.detail : '';
        doc.fontSize(10).text(`${time} - ${detail}`);
      }

      doc.end();
    });
  }

  private buildDashboardCsv(input: {
    generatedAt: Date;
    query: DashboardFiltersDto;
    stats: any;
    analytics: any;
    recentActivity: any[];
  }): string {
    const { generatedAt, query, stats, analytics, recentActivity } = input;
    const lines: string[] = [];
    const pushRow = (...columns: Array<string | number>) => {
      lines.push(columns.map((value) => this.escapeCsv(value)).join(','));
    };

    pushRow('section', 'key', 'value');
    pushRow('meta', 'generatedAt', generatedAt.toISOString());
    pushRow('meta', 'range', query.range ?? 'custom');
    pushRow('meta', 'period', query.period ?? 'daily');
    pushRow('meta', 'startDate', query.startDate ?? '');
    pushRow('meta', 'endDate', query.endDate ?? '');
    pushRow('meta', 'branch', query.branch ?? 'all');
    pushRow('meta', 'classCategory', query.classCategory ?? 'all');

    pushRow('summary', 'totalMembers', stats?.totalMembers?.value ?? 0);
    pushRow('summary', 'activeMemberships', stats?.activeMemberships?.value ?? 0);
    pushRow('summary', 'expiringMemberships', stats?.expiringMemberships?.value ?? 0);
    pushRow('summary', 'attendance', stats?.todayCheckIns?.value ?? 0);
    pushRow('summary', 'revenue', stats?.monthlyRevenue?.value ?? 0);
    pushRow('summary', 'newSignups', stats?.newSignups?.value ?? 0);

    const dailyRevenue: Array<{ label: string; value: number }> =
      analytics?.revenueReports?.dailyRevenue ?? [];
    for (const point of dailyRevenue) {
      pushRow('revenue_daily', point.label, point.value);
    }

    for (const item of recentActivity) {
      pushRow(
        'activity',
        item?.id ?? '',
        `${item?.time ?? ''} ${item?.action ?? ''} ${item?.detail ?? ''}`.trim(),
      );
    }

    return lines.join('\n');
  }

  private escapeCsv(value: string | number): string {
    const asString = String(value ?? '');
    if (
      asString.includes(',') ||
      asString.includes('"') ||
      asString.includes('\n')
    ) {
      return `"${asString.replace(/"/g, '""')}"`;
    }
    return asString;
  }

  private formatCurrencyValue(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private async getAttendanceCountForRange(
    start: Date,
    end: Date,
    classCategory: string | null,
  ): Promise<number> {
    if (!classCategory) {
      return this.prisma.attendance.count({
        where: {
          checkInTime: {
            gte: start,
            lte: end,
          },
        },
      });
    }

    return this.prisma.classBooking.count({
      where: {
        bookedAt: {
          gte: start,
          lte: end,
        },
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
        classSchedule: {
          class: {
            category: {
              equals: classCategory,
              mode: 'insensitive',
            },
          },
        },
      },
    });
  }

  private normalizeClassCategory(value?: string): string | null {
    const normalized = value?.trim();
    if (!normalized || normalized.toLowerCase() === 'all') {
      return null;
    }
    return normalized;
  }

  private parseDateBoundary(
    value: string | undefined,
    boundary: 'start' | 'end',
  ): Date | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    if (boundary === 'start') {
      return new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
        0,
        0,
        0,
        0,
      );
    }

    return new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate(),
      23,
      59,
      59,
      999,
    );
  }

  private resolveDashboardRange(filters?: DashboardFiltersDto): DashboardRangeWindow {
    const now = new Date();
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );

    const explicitStart = this.parseDateBoundary(filters?.startDate, 'start');
    const explicitEnd = this.parseDateBoundary(filters?.endDate, 'end');

    let start: Date;
    let end: Date;

    if (explicitStart && explicitEnd) {
      start = explicitStart;
      end = explicitEnd;
    } else if (filters?.range === 'today') {
      start = startOfToday;
      end = endOfToday;
    } else if (filters?.range === 'last7days') {
      end = endOfToday;
      start = new Date(endOfToday);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    } else {
      end = endOfToday;
      start = new Date(endOfToday);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
    }

    if (start.getTime() > end.getTime()) {
      const swap = start;
      start = end;
      end = swap;
    }

    const durationMs = Math.max(end.getTime() - start.getTime() + 1, 1);
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - durationMs + 1);

    return {
      start,
      end,
      previousStart,
      previousEnd,
    };
  }

  private dayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private keyInRange(key: string, from: Date, to: Date): boolean {
    const date = new Date(`${key}T00:00:00.000Z`);
    return date >= from && date < to;
  }

  private sumMapValues(map: Map<string, number>): number {
    return Array.from(map.values()).reduce((sum, value) => sum + value, 0);
  }

  private buildDaySeries(
    start: Date,
    end: Date,
    getValue: (dayKey: string) => number,
  ): TimeSeriesPoint[] {
    const series: TimeSeriesPoint[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = this.dayKey(cursor);
      series.push({ label: key, value: Number(getValue(key).toFixed(2)) });
      cursor.setDate(cursor.getDate() + 1);
    }
    return series;
  }

  private aggregateSeriesByWeek(series: TimeSeriesPoint[]): TimeSeriesPoint[] {
    const weekBuckets = new Map<string, number>();
    for (const point of series) {
      const date = new Date(`${point.label}T00:00:00.000Z`);
      const weekStart = new Date(date);
      const day = weekStart.getUTCDay();
      const diff = day === 0 ? -6 : 1 - day;
      weekStart.setUTCDate(weekStart.getUTCDate() + diff);
      const key = weekStart.toISOString().slice(0, 10);
      weekBuckets.set(key, (weekBuckets.get(key) ?? 0) + point.value);
    }
    return Array.from(weekBuckets.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, value]) => ({ label, value: Number(value.toFixed(2)) }));
  }

  private buildMonthlySeries(
    start: Date,
    end: Date,
    resolve: (
      monthKey: string,
      monthStart: Date,
      monthEnd: Date,
    ) => TimeSeriesPoint,
  ): TimeSeriesPoint[] {
    const series: TimeSeriesPoint[] = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const final = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= final) {
      const monthStart = new Date(cursor);
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
      series.push(resolve(monthKey, monthStart, monthEnd));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return series;
  }

  private buildMonthlyMemberGrowth(
    start: Date,
    end: Date,
    members: Array<{ createdAt: Date }>,
  ): TimeSeriesPoint[] {
    const memberCountByMonth = new Map<string, number>();
    for (const member of members) {
      const key = `${member.createdAt.getFullYear()}-${String(member.createdAt.getMonth() + 1).padStart(2, '0')}`;
      memberCountByMonth.set(key, (memberCountByMonth.get(key) ?? 0) + 1);
    }

    return this.buildMonthlySeries(start, end, (monthKey) => ({
      label: monthKey,
      value: memberCountByMonth.get(monthKey) ?? 0,
    }));
  }

  private calculateAge(dateOfBirth: Date, now: Date): number {
    let age = now.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = now.getMonth() - dateOfBirth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && now.getDate() < dateOfBirth.getDate())
    ) {
      age -= 1;
    }
    return age;
  }
}
