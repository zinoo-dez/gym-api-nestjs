import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

interface TimeSeriesPoint {
  label: string;
  value: number;
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

  async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfYesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalMembers,
      currentMonthMembers,
      lastMonthMembers,
      activeMemberships,
      expiringMemberships,
      todayCheckIns,
      yesterdayCheckIns,
      currentMonthSubscriptions,
      lastMonthSubscriptions,
    ] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.member.count({
        where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
      }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          endDate: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.attendance.count({
        where: { checkInTime: { gte: startOfToday } },
      }),
      this.prisma.attendance.count({
        where: {
          checkInTime: { gte: startOfYesterday, lt: startOfToday },
        },
      }),
      this.prisma.subscription.findMany({
        where: { startDate: { gte: startOfMonth } },
        include: { membershipPlan: true },
      }),
      this.prisma.subscription.findMany({
        where: { startDate: { gte: startOfLastMonth, lt: startOfMonth } },
        include: { membershipPlan: true },
      }),
    ]);

    const currentMonthRevenue = currentMonthSubscriptions.reduce(
      (sum, sub) => sum + (sub.membershipPlan?.price ?? 0),
      0,
    );
    const lastMonthRevenue = lastMonthSubscriptions.reduce(
      (sum, sub) => sum + (sub.membershipPlan?.price ?? 0),
      0,
    );

    const memberChange = currentMonthMembers - lastMonthMembers;
    const checkInChange = todayCheckIns - yesterdayCheckIns;
    const revenueChange = currentMonthRevenue - lastMonthRevenue;

    return {
      totalMembers: {
        value: totalMembers,
        change: memberChange,
        type: memberChange >= 0 ? 'increase' : 'decrease',
      },
      activeMemberships: {
        value: activeMemberships,
        change: 0,
        type: 'increase',
      },
      expiringMemberships: {
        value: expiringMemberships,
        change: 0,
        type: 'decrease',
      },
      todayCheckIns: {
        value: todayCheckIns,
        change: checkInChange,
        type: checkInChange >= 0 ? 'increase' : 'decrease',
      },
      monthlyRevenue: {
        value: Number(currentMonthRevenue.toFixed(2)),
        change: Number(revenueChange.toFixed(2)),
        type: revenueChange >= 0 ? 'increase' : 'decrease',
      },
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

  async getRecentActivity() {
    const [attendance, bookings] = await Promise.all([
      this.prisma.attendance.findMany({
        orderBy: { checkInTime: 'desc' },
        take: 5,
        include: { member: { include: { user: true } } },
      }),
      this.prisma.classBooking.findMany({
        orderBy: { bookedAt: 'desc' },
        take: 5,
        include: {
          member: { include: { user: true } },
          classSchedule: { include: { class: true } },
        },
      }),
    ]);

    const activity = [
      ...attendance.map((record) => ({
        action: 'Check-in',
        detail: `${record.member.user.firstName} ${record.member.user.lastName} checked in`,
        time: record.checkInTime,
      })),
      ...bookings.map((record) => ({
        action: 'Class booking',
        detail: `${record.member.user.firstName} ${record.member.user.lastName} booked ${record.classSchedule.class.name}`,
        time: record.bookedAt,
      })),
    ]
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 6);

    return activity.map((item) => ({
      action: item.action,
      detail: item.detail,
      time: item.time.toISOString(),
    }));
  }

  async getReportingAnalytics() {
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const start90Days = new Date(now.getTime() - 89 * dayMs);
    const start30Days = new Date(now.getTime() - 29 * dayMs);
    const start12Months = new Date(now.getFullYear(), now.getMonth() - 11, 1);

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
      activeMembersLast30,
      activeMembersPrev30,
    ] = await Promise.all([
      this.prisma.payment.findMany({
        where: { createdAt: { gte: start90Days } },
        select: { amount: true, status: true, createdAt: true },
      }),
      this.prisma.productSale.findMany({
        where: { soldAt: { gte: start90Days }, status: 'COMPLETED' },
        select: { total: true, soldAt: true },
      }),
      this.prisma.trainerSession.findMany({
        where: {
          sessionDate: { gte: start90Days },
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
        select: {
          startDate: true,
          endDate: true,
          status: true,
          membershipPlanId: true,
          memberId: true,
        },
      }),
      this.prisma.attendance.findMany({
        where: { checkInTime: { gte: start90Days } },
        select: { memberId: true, checkInTime: true, type: true },
      }),
      this.prisma.classBooking.findMany({
        where: { bookedAt: { gte: start90Days } },
        select: { classScheduleId: true, status: true, bookedAt: true },
      }),
      this.prisma.class.findMany({
        select: { id: true, name: true, category: true, maxCapacity: true },
      }),
      this.prisma.trainer.findMany({ select: { id: true } }),
      this.prisma.equipment.findMany({
        where: { isActive: true },
        select: { category: true },
      }),
      this.prisma.invoice.findMany({
        where: { createdAt: { gte: start90Days } },
        select: { total: true, status: true, dueDate: true },
      }),
      this.prisma.attendance.groupBy({
        by: ['memberId'],
        where: { checkInTime: { gte: start30Days } },
      }),
      this.prisma.attendance.groupBy({
        by: ['memberId'],
        where: {
          checkInTime: {
            gte: new Date(start30Days.getTime() - 30 * dayMs),
            lt: start30Days,
          },
        },
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

    const dailyRevenue = this.buildDaySeries(start30Days, now, (key) => {
      return (
        (membershipRevenueByDay.get(key) ?? 0) +
        (productRevenueByDay.get(key) ?? 0) +
        (sessionRevenueByDay.get(key) ?? 0)
      );
    });

    const weeklyRevenue = this.aggregateSeriesByWeek(dailyRevenue);
    const monthlyRevenue = this.buildMonthlySeries(
      start12Months,
      now,
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
    const memberGrowthTrends = this.buildMonthlyMemberGrowth(
      start12Months,
      now,
      members,
    );

    const totalSubscriptions = subscriptions.length;
    const churnedSubscriptions = subscriptions.filter(
      (s) =>
        (s.status === 'CANCELLED' || s.status === 'EXPIRED') &&
        s.endDate >= start90Days,
    ).length;
    const churnRate =
      totalSubscriptions > 0
        ? Number(((churnedSubscriptions / totalSubscriptions) * 100).toFixed(2))
        : 0;

    const activeMemberIds = new Set(
      activeMembersLast30.map((item) => item.memberId),
    );
    const previousActiveMemberIds = new Set(
      activeMembersPrev30.map((item) => item.memberId),
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

    for (const member of members) {
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
    for (const sub of subscriptions) {
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

      const classCategory = classCategoryMap.get(classId) ?? 'GENERAL';
      equipmentUsageByCategory.set(
        classCategory,
        (equipmentUsageByCategory.get(classCategory) ?? 0) + 1,
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
