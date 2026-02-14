import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Gym Management API is running!';
  }

  async checkHealth(): Promise<{
    status: string;
    timestamp: string;
    database: string;
    responseTime: number;
  }> {
    const startTime = Date.now();

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        responseTime: Date.now() - startTime,
      };
    }
  }

  async getDashboardStats() {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const totalMembers = await this.prisma.member.count();
    const lastMonthMembers = await this.prisma.member.count({
      where: { createdAt: { lt: startOfMonth } },
    });

    const activeSubscriptions = await this.prisma.subscription.count({
      where: { status: 'ACTIVE', endDate: { gte: now } },
    });
    const lastMonthActiveSubscriptions = await this.prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        endDate: { gte: lastMonth, lt: startOfMonth },
      },
    });

    const todayCheckIns = await this.prisma.attendance.count({
      where: { checkInTime: { gte: startOfDay } },
    });
    const yesterday = new Date(startOfDay);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayCheckIns = await this.prisma.attendance.count({
      where: { checkInTime: { gte: yesterday, lt: startOfDay } },
    });

    const monthlySubscriptions = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE', startDate: { gte: startOfMonth } },
      include: { membershipPlan: { select: { price: true } } },
    });
    const monthlyRevenue = monthlySubscriptions.reduce(
      (sum, sub) => sum + Number(sub.membershipPlan.price),
      0,
    );

    const lastMonthSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        startDate: { gte: lastMonth, lt: startOfMonth },
      },
      include: { membershipPlan: { select: { price: true } } },
    });
    const lastMonthRevenue = lastMonthSubscriptions.reduce(
      (sum, sub) => sum + Number(sub.membershipPlan.price),
      0,
    );

    const memberChange = lastMonthMembers
      ? Math.round(((totalMembers - lastMonthMembers) / lastMonthMembers) * 100)
      : 0;
    const subscriptionChange = lastMonthActiveSubscriptions
      ? Math.round(
          ((activeSubscriptions - lastMonthActiveSubscriptions) /
            lastMonthActiveSubscriptions) *
            100,
        )
      : 0;
    const checkInChange = yesterdayCheckIns
      ? Math.round(
          ((todayCheckIns - yesterdayCheckIns) / yesterdayCheckIns) * 100,
        )
      : 0;
    const revenueChange = lastMonthRevenue
      ? Math.round(
          ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
        )
      : 0;

    return {
      totalMembers: {
        value: totalMembers,
        change: Math.abs(memberChange),
        type: memberChange >= 0 ? 'increase' : 'decrease',
      },
      activeMemberships: {
        value: activeSubscriptions,
        change: Math.abs(subscriptionChange),
        type: subscriptionChange >= 0 ? 'increase' : 'decrease',
      },
      todayCheckIns: {
        value: todayCheckIns,
        change: Math.abs(checkInChange),
        type: checkInChange >= 0 ? 'increase' : 'decrease',
      },
      monthlyRevenue: {
        value: monthlyRevenue,
        change: Math.abs(revenueChange),
        type: revenueChange >= 0 ? 'increase' : 'decrease',
      },
    };
  }

  async getRecentMembers(limit: number = 5) {
    const members = await this.prisma.member.findMany({
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { membershipPlan: { select: { name: true } } },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return members.map((member) => ({
      id: member.id,
      name: `${member.user.firstName} ${member.user.lastName}`,
      email: member.user.email,
      plan: member.subscriptions[0]?.membershipPlan.name || 'No Plan',
      joined: this.getRelativeTime(member.createdAt),
      status: member.subscriptions[0]?.status.toLowerCase() || 'pending',
    }));
  }

  async getPopularClasses(limit: number = 5) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const classSchedules = await this.prisma.classSchedule.findMany({
      where: {
        isActive: true,
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        class: { select: { name: true, maxCapacity: true } },
        trainer: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        bookings: { where: { status: 'CONFIRMED' } },
      },
      orderBy: { bookings: { _count: 'desc' } },
      take: limit,
    });

    return classSchedules.map((schedule) => ({
      id: schedule.id,
      name: schedule.class.name,
      trainer: `${schedule.trainer.user.firstName} ${schedule.trainer.user.lastName}`,
      enrolled: schedule.bookings.length,
      capacity: schedule.class.maxCapacity,
      time: this.formatTime(schedule.startTime),
    }));
  }

  async getRecentActivity(limit: number = 5) {
    const activities: Array<{ action: string; detail: string; time: string }> =
      [];

    const recentMembers = await this.prisma.member.findMany({
      include: {
        user: { select: { firstName: true, lastName: true } },
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { membershipPlan: true },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 2,
    });

    recentMembers.forEach((member) => {
      activities.push({
        action: 'New member joined',
        detail: `${member.user.firstName} ${member.user.lastName} signed up for ${member.subscriptions[0]?.membershipPlan.name || 'a'} plan`,
        time: this.getRelativeTime(member.createdAt),
      });
    });

    const recentBookings = await this.prisma.classBooking.findMany({
      where: { status: 'CONFIRMED' },
      include: {
        classSchedule: {
          include: { class: { select: { name: true } } },
        },
      },
      orderBy: { bookedAt: 'desc' },
      take: 2,
    });

    if (recentBookings.length > 0) {
      const bookingGroups = new Map<string, number>();
      recentBookings.forEach((booking) => {
        const key = `${booking.classSchedule.class.name}-${booking.bookedAt.toISOString().split('T')[0]}`;
        bookingGroups.set(key, (bookingGroups.get(key) || 0) + 1);
      });

      Array.from(bookingGroups.entries())
        .slice(0, 1)
        .forEach(([key, count]) => {
          const className = key.split('-')[0];
          activities.push({
            action: 'Class booking',
            detail: `${count} member${count > 1 ? 's' : ''} booked ${className}`,
            time: this.getRelativeTime(recentBookings[0].bookedAt),
          });
        });
    }

    const recentTrainers = await this.prisma.trainer.findMany({
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    recentTrainers.forEach((trainer) => {
      activities.push({
        action: 'Trainer added',
        detail: `New trainer ${trainer.user.firstName} ${trainer.user.lastName} added`,
        time: this.getRelativeTime(trainer.createdAt),
      });
    });

    return activities.slice(0, limit);
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? '1 minute ago' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}
