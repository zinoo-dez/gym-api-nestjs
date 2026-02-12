import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

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
      };
    }
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
}
