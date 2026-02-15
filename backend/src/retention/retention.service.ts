import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  RetentionRiskLevel,
  RetentionTaskStatus,
  SubscriptionStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { PaginatedResponseDto } from '../common/dto';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BulkUpdateRetentionTasksDto,
  BulkUpdateRetentionTasksResponseDto,
  RecalculateRetentionResponseDto,
  RetentionMemberDetailDto,
  RetentionMemberFiltersDto,
  RetentionMemberResponseDto,
  RetentionOverviewDto,
  RetentionTaskFiltersDto,
  RetentionTaskResponseDto,
  UpdateRetentionTaskDto,
} from './dto';

type MemberRiskSnapshot = {
  memberId: string;
  fullName: string;
  email: string;
  riskLevel: RetentionRiskLevel;
  score: number;
  reasons: string[];
  lastCheckInAt?: Date;
  daysSinceCheckIn?: number;
  subscriptionEndsAt?: Date;
  unpaidPendingCount: number;
  lastEvaluatedAt: Date;
};

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);
  private readonly followUpTaskCooldownDays = 14;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getOverview(): Promise<RetentionOverviewDto> {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [grouped, newHighThisWeek, openTasks, evaluatedMembers] =
      await Promise.all([
        this.prisma.memberRetentionRisk.groupBy({
          by: ['riskLevel'],
          _count: { _all: true },
        }),
        this.prisma.memberRetentionRisk.count({
          where: {
            riskLevel: RetentionRiskLevel.HIGH,
            updatedAt: { gte: weekAgo },
          },
        }),
        this.prisma.retentionTask.count({
          where: {
            status: {
              in: [RetentionTaskStatus.OPEN, RetentionTaskStatus.IN_PROGRESS],
            },
          },
        }),
        this.prisma.memberRetentionRisk.count(),
      ]);

    const counts = {
      highRisk: 0,
      mediumRisk: 0,
      lowRisk: 0,
    };

    for (const item of grouped) {
      if (item.riskLevel === RetentionRiskLevel.HIGH) {
        counts.highRisk = item._count._all;
      } else if (item.riskLevel === RetentionRiskLevel.MEDIUM) {
        counts.mediumRisk = item._count._all;
      } else {
        counts.lowRisk = item._count._all;
      }
    }

    return {
      ...counts,
      newHighThisWeek,
      openTasks,
      evaluatedMembers,
    };
  }

  async getMembers(
    filters: RetentionMemberFiltersDto,
  ): Promise<PaginatedResponseDto<RetentionMemberResponseDto>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.riskLevel ? { riskLevel: filters.riskLevel } : {}),
      ...(typeof filters.minScore === 'number'
        ? { score: { gte: filters.minScore } }
        : {}),
      ...(filters.search
        ? {
            member: {
              user: {
                OR: [
                  {
                    firstName: {
                      contains: filters.search,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    lastName: {
                      contains: filters.search,
                      mode: 'insensitive' as const,
                    },
                  },
                  {
                    email: {
                      contains: filters.search,
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              },
            },
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      this.prisma.memberRetentionRisk.count({ where }),
      this.prisma.memberRetentionRisk.findMany({
        where,
        include: {
          member: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          },
        },
        orderBy: [
          { riskLevel: 'desc' },
          { score: 'desc' },
          { updatedAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
    ]);

    const data = rows.map((row) => this.toMemberDto(row));
    return new PaginatedResponseDto(data, page, limit, total);
  }

  async getMemberDetail(memberId: string): Promise<RetentionMemberDetailDto> {
    const risk = await this.prisma.memberRetentionRisk.findUnique({
      where: { memberId },
      include: {
        member: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
            subscriptions: {
              orderBy: { endDate: 'desc' },
              take: 3,
              include: { membershipPlan: true },
            },
          },
        },
      },
    });

    if (!risk) {
      throw new NotFoundException(
        `Retention risk profile not found for member ${memberId}`,
      );
    }

    const tasks = await this.prisma.retentionTask.findMany({
      where: { memberId },
      include: {
        assignedTo: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      risk: this.toMemberDto(risk),
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        note: task.note ?? undefined,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ?? undefined,
        createdAt: task.createdAt,
        assignedToEmail: task.assignedTo?.email ?? undefined,
      })),
      recentSubscriptions: risk.member.subscriptions.map((sub) => ({
        id: sub.id,
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        planName: sub.membershipPlan?.name ?? undefined,
      })),
    };
  }

  async recalculateAll(): Promise<RecalculateRetentionResponseDto> {
    const members = await this.prisma.member.findMany({
      where: {
        user: {
          status: UserStatus.ACTIVE,
        },
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        attendance: {
          orderBy: { checkInTime: 'desc' },
          take: 1,
          select: { checkInTime: true },
        },
        subscriptions: {
          where: {
            status: {
              in: [
                SubscriptionStatus.ACTIVE,
                SubscriptionStatus.PENDING,
                SubscriptionStatus.FROZEN,
              ],
            },
          },
          orderBy: { endDate: 'asc' },
          take: 1,
          select: {
            endDate: true,
          },
        },
        payments: {
          where: {
            OR: [
              { status: 'PENDING' },
              {
                status: 'REJECTED',
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            ],
          },
          select: { status: true },
        },
      },
    });

    const summary: RecalculateRetentionResponseDto = {
      processed: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const member of members) {
      const snapshot = this.buildSnapshot({
        memberId: member.id,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        email: member.user.email,
        lastCheckInAt: member.attendance[0]?.checkInTime,
        subscriptionEndsAt: member.subscriptions[0]?.endDate,
        unpaidPendingCount: member.payments.filter(
          (p) => p.status === 'PENDING',
        ).length,
        hasRecentRejectedPayment: member.payments.some(
          (p) => p.status === 'REJECTED',
        ),
      });

      await this.prisma.memberRetentionRisk.upsert({
        where: { memberId: member.id },
        update: {
          riskLevel: snapshot.riskLevel,
          score: snapshot.score,
          reasons: snapshot.reasons,
          lastCheckInAt: snapshot.lastCheckInAt,
          daysSinceCheckIn: snapshot.daysSinceCheckIn,
          subscriptionEndsAt: snapshot.subscriptionEndsAt,
          unpaidPendingCount: snapshot.unpaidPendingCount,
          lastEvaluatedAt: snapshot.lastEvaluatedAt,
        },
        create: {
          memberId: member.id,
          riskLevel: snapshot.riskLevel,
          score: snapshot.score,
          reasons: snapshot.reasons,
          lastCheckInAt: snapshot.lastCheckInAt,
          daysSinceCheckIn: snapshot.daysSinceCheckIn,
          subscriptionEndsAt: snapshot.subscriptionEndsAt,
          unpaidPendingCount: snapshot.unpaidPendingCount,
          lastEvaluatedAt: snapshot.lastEvaluatedAt,
        },
      });

      if (snapshot.riskLevel === RetentionRiskLevel.HIGH) {
        await this.ensureFollowUpTask(member.id, snapshot.fullName);
      }

      summary.processed += 1;
      if (snapshot.riskLevel === RetentionRiskLevel.HIGH) summary.high += 1;
      else if (snapshot.riskLevel === RetentionRiskLevel.MEDIUM)
        summary.medium += 1;
      else summary.low += 1;
    }

    return summary;
  }

  async getTasks(
    filters: RetentionTaskFiltersDto,
  ): Promise<PaginatedResponseDto<RetentionTaskResponseDto>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(typeof filters.priority === 'number'
        ? { priority: filters.priority }
        : {}),
      ...(filters.assignedToId ? { assignedToId: filters.assignedToId } : {}),
      ...(filters.memberId ? { memberId: filters.memberId } : {}),
    };

    const [total, rows] = await Promise.all([
      this.prisma.retentionTask.count({ where }),
      this.prisma.retentionTask.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, email: true } },
          member: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          },
        },
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    const data = rows.map((row) => this.toTaskDto(row));
    return new PaginatedResponseDto(data, page, limit, total);
  }

  async updateTask(
    id: string,
    dto: UpdateRetentionTaskDto,
    changedByUserId?: string,
  ): Promise<RetentionTaskResponseDto> {
    const existing = await this.prisma.retentionTask.findUnique({
      where: { id },
      include: {
        member: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Retention task with ID ${id} not found`);
    }

    if (dto.assignedToId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: dto.assignedToId },
        select: { id: true, role: true },
      });
      if (!assignee) {
        throw new NotFoundException(
          `Assignee user with ID ${dto.assignedToId} not found`,
        );
      }
      if (
        assignee.role !== UserRole.ADMIN &&
        assignee.role !== UserRole.STAFF
      ) {
        throw new NotFoundException('Assignee must be an ADMIN or STAFF user');
      }
    }

    const nextStatus = dto.status ?? existing.status;
    const resolvedAtUpdate =
      dto.status === RetentionTaskStatus.DONE
        ? new Date()
        : dto.status
          ? null
          : undefined;

    const updated = await this.prisma.retentionTask.update({
      where: { id },
      data: {
        status: dto.status,
        priority: dto.priority,
        assignedToId: dto.assignedToId,
        note: dto.note,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        resolvedAt: resolvedAtUpdate,
      },
      include: {
        assignedTo: { select: { id: true, email: true } },
        member: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    const historyData = this.buildHistoryEntry({
      taskId: existing.id,
      changedByUserId,
      fromStatus: existing.status,
      toStatus: updated.status,
      fromPriority: existing.priority,
      toPriority: updated.priority,
      fromAssignedToId: existing.assignedToId,
      toAssignedToId: updated.assignedToId,
      fromNote: existing.note,
      toNote: updated.note,
      fromDueDate: existing.dueDate,
      toDueDate: updated.dueDate,
    });
    if (historyData) {
      await this.prisma.retentionTaskHistory.create({ data: historyData });
    }

    if (nextStatus === RetentionTaskStatus.DONE) {
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'Retention task completed',
        message: `Task "${updated.title}" was completed.`,
        type: 'success',
        actionUrl: '/admin/retention/tasks',
      });
    }

    return this.toTaskDto(updated);
  }

  async bulkUpdateTasks(
    dto: BulkUpdateRetentionTasksDto,
    changedByUserId?: string,
  ): Promise<BulkUpdateRetentionTasksResponseDto> {
    const hasUpdatableField =
      dto.status !== undefined ||
      dto.priority !== undefined ||
      dto.assignedToId !== undefined ||
      dto.note !== undefined ||
      dto.dueDate !== undefined;

    if (!hasUpdatableField) {
      throw new BadRequestException('At least one field to update is required');
    }

    if (dto.assignedToId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: dto.assignedToId },
        select: { id: true, role: true },
      });
      if (!assignee) {
        throw new NotFoundException(
          `Assignee user with ID ${dto.assignedToId} not found`,
        );
      }
      if (
        assignee.role !== UserRole.ADMIN &&
        assignee.role !== UserRole.STAFF
      ) {
        throw new NotFoundException('Assignee must be an ADMIN or STAFF user');
      }
    }

    const resolvedAtUpdate =
      dto.status === RetentionTaskStatus.DONE
        ? new Date()
        : dto.status
          ? null
          : undefined;

    const existingTasks = await this.prisma.retentionTask.findMany({
      where: { id: { in: dto.taskIds } },
      select: {
        id: true,
        status: true,
        priority: true,
        assignedToId: true,
        note: true,
        dueDate: true,
      },
    });

    const result = await this.prisma.retentionTask.updateMany({
      where: { id: { in: dto.taskIds } },
      data: {
        status: dto.status,
        priority: dto.priority,
        assignedToId: dto.assignedToId,
        note: dto.note,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        resolvedAt: resolvedAtUpdate,
      },
    });

    const historyRows = existingTasks
      .map((task) =>
        this.buildHistoryEntry({
          taskId: task.id,
          changedByUserId,
          fromStatus: task.status,
          toStatus: dto.status ?? task.status,
          fromPriority: task.priority,
          toPriority: dto.priority ?? task.priority,
          fromAssignedToId: task.assignedToId,
          toAssignedToId: dto.assignedToId ?? task.assignedToId,
          fromNote: task.note,
          toNote: dto.note ?? task.note,
          fromDueDate: task.dueDate,
          toDueDate: dto.dueDate ? new Date(dto.dueDate) : task.dueDate,
        }),
      )
      .filter((row) => !!row);

    if (historyRows.length > 0) {
      await this.prisma.retentionTaskHistory.createMany({
        data: historyRows,
      });
    }

    if (dto.status === RetentionTaskStatus.DONE && result.count > 0) {
      await this.notificationsService.createForRole({
        role: UserRole.ADMIN,
        title: 'Retention tasks completed',
        message: `${result.count} retention task(s) were marked as completed.`,
        type: 'success',
        actionUrl: '/admin/retention/tasks',
      });
    }

    return { updatedCount: result.count };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleNightlyRiskRecomputation() {
    this.logger.log('Running nightly retention risk recomputation...');
    try {
      const result = await this.recalculateAll();
      this.logger.log(
        `Retention recomputation completed: processed=${result.processed}, high=${result.high}, medium=${result.medium}, low=${result.low}`,
      );
    } catch (error) {
      this.logger.error(
        'Nightly retention recomputation failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async ensureFollowUpTask(memberId: string, fullName: string) {
    const existing = await this.prisma.retentionTask.findFirst({
      where: {
        memberId,
        status: {
          in: [RetentionTaskStatus.OPEN, RetentionTaskStatus.IN_PROGRESS],
        },
      },
      select: { id: true },
    });

    if (existing) return;

    const cooldownCutoff = new Date(
      Date.now() - this.followUpTaskCooldownDays * 24 * 60 * 60 * 1000,
    );
    const recentResolvedTask = await this.prisma.retentionTask.findFirst({
      where: {
        memberId,
        status: {
          in: [RetentionTaskStatus.DONE, RetentionTaskStatus.DISMISSED],
        },
        OR: [
          { resolvedAt: { gte: cooldownCutoff } },
          { updatedAt: { gte: cooldownCutoff } },
        ],
      },
      select: { id: true },
    });

    if (recentResolvedTask) return;

    const assignedToId = await this.findAutoAssigneeId();

    await this.prisma.retentionTask.create({
      data: {
        memberId,
        assignedToId,
        status: RetentionTaskStatus.OPEN,
        priority: 1,
        title: 'Follow up high-risk member',
        note: 'Contact this member and offer support before they churn.',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    });

    await this.notificationsService.createForRole({
      role: UserRole.ADMIN,
      title: 'High-risk member follow-up created',
      message: `${fullName} was marked as high risk. A follow-up task was created.`,
      type: 'warning',
      actionUrl: '/admin/retention/tasks',
    });
  }

  private async findAutoAssigneeId(): Promise<string | undefined> {
    const candidates = await this.prisma.user.findMany({
      where: {
        status: UserStatus.ACTIVE,
        role: { in: [UserRole.ADMIN, UserRole.STAFF] },
      },
      select: { id: true, createdAt: true },
    });

    if (!candidates.length) {
      return undefined;
    }

    const openWorkloads = await this.prisma.retentionTask.groupBy({
      by: ['assignedToId'],
      where: {
        assignedToId: { in: candidates.map((candidate) => candidate.id) },
        status: {
          in: [RetentionTaskStatus.OPEN, RetentionTaskStatus.IN_PROGRESS],
        },
      },
      _count: { _all: true },
    });

    const workloadByUserId = new Map<string, number>();
    for (const workload of openWorkloads) {
      if (!workload.assignedToId) continue;
      workloadByUserId.set(workload.assignedToId, workload._count._all);
    }

    const bestCandidate = [...candidates].sort((a, b) => {
      const aWorkload = workloadByUserId.get(a.id) ?? 0;
      const bWorkload = workloadByUserId.get(b.id) ?? 0;
      if (aWorkload !== bWorkload) return aWorkload - bWorkload;
      const createdAtDiff = a.createdAt.getTime() - b.createdAt.getTime();
      if (createdAtDiff !== 0) return createdAtDiff;
      return a.id.localeCompare(b.id);
    })[0];

    return bestCandidate?.id;
  }

  private buildHistoryEntry(input: {
    taskId: string;
    changedByUserId?: string;
    fromStatus: RetentionTaskStatus | null;
    toStatus: RetentionTaskStatus | null;
    fromPriority: number | null;
    toPriority: number | null;
    fromAssignedToId: string | null;
    toAssignedToId: string | null;
    fromNote: string | null;
    toNote: string | null;
    fromDueDate: Date | null;
    toDueDate: Date | null;
  }) {
    const changed =
      input.fromStatus !== input.toStatus ||
      input.fromPriority !== input.toPriority ||
      input.fromAssignedToId !== input.toAssignedToId ||
      input.fromNote !== input.toNote ||
      !this.areDatesEqual(input.fromDueDate, input.toDueDate);

    if (!changed) return null;

    return {
      taskId: input.taskId,
      changedByUserId: input.changedByUserId,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      fromPriority: input.fromPriority,
      toPriority: input.toPriority,
      fromAssignedToId: input.fromAssignedToId,
      toAssignedToId: input.toAssignedToId,
      fromNote: input.fromNote,
      toNote: input.toNote,
      fromDueDate: input.fromDueDate,
      toDueDate: input.toDueDate,
    };
  }

  private areDatesEqual(a: Date | null, b: Date | null): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.getTime() === b.getTime();
  }

  private buildSnapshot(input: {
    memberId: string;
    firstName: string;
    lastName: string;
    email: string;
    lastCheckInAt?: Date;
    subscriptionEndsAt?: Date;
    unpaidPendingCount: number;
    hasRecentRejectedPayment: boolean;
  }): MemberRiskSnapshot {
    const reasons: string[] = [];
    let score = 0;

    const daysSinceCheckIn = input.lastCheckInAt
      ? Math.floor(
          (Date.now() - input.lastCheckInAt.getTime()) / (24 * 60 * 60 * 1000),
        )
      : undefined;

    if (!input.lastCheckInAt) {
      score += 50;
      reasons.push('NO_CHECKIN_HISTORY');
    } else if ((daysSinceCheckIn ?? 0) >= 14) {
      score += 50;
      reasons.push('NO_CHECKIN_14_DAYS');
    }

    if (input.subscriptionEndsAt) {
      const daysToExpiry = Math.floor(
        (input.subscriptionEndsAt.getTime() - Date.now()) /
          (24 * 60 * 60 * 1000),
      );
      if (daysToExpiry >= 0 && daysToExpiry <= 7) {
        score += 25;
        reasons.push('SUBSCRIPTION_ENDING_7_DAYS');
      }
    }

    if (input.unpaidPendingCount > 0) {
      score += 20;
      reasons.push('HAS_PENDING_PAYMENTS');
    }

    if (input.hasRecentRejectedPayment) {
      score += 15;
      reasons.push('RECENT_REJECTED_PAYMENT');
    }

    score = Math.min(100, Math.max(0, score));
    const riskLevel =
      score >= 60
        ? RetentionRiskLevel.HIGH
        : score >= 30
          ? RetentionRiskLevel.MEDIUM
          : RetentionRiskLevel.LOW;

    return {
      memberId: input.memberId,
      fullName: `${input.firstName} ${input.lastName}`.trim(),
      email: input.email,
      riskLevel,
      score,
      reasons,
      lastCheckInAt: input.lastCheckInAt,
      daysSinceCheckIn,
      subscriptionEndsAt: input.subscriptionEndsAt,
      unpaidPendingCount: input.unpaidPendingCount,
      lastEvaluatedAt: new Date(),
    };
  }

  private toMemberDto(row: {
    memberId: string;
    riskLevel: RetentionRiskLevel;
    score: number;
    reasons: string[];
    lastCheckInAt: Date | null;
    daysSinceCheckIn: number | null;
    subscriptionEndsAt: Date | null;
    unpaidPendingCount: number;
    lastEvaluatedAt: Date;
    member: {
      user: {
        firstName: string;
        lastName: string;
        email: string;
      };
    };
  }): RetentionMemberResponseDto {
    return {
      memberId: row.memberId,
      fullName:
        `${row.member.user.firstName} ${row.member.user.lastName}`.trim(),
      email: row.member.user.email,
      riskLevel: row.riskLevel,
      score: row.score,
      reasons: row.reasons,
      lastCheckInAt: row.lastCheckInAt ?? undefined,
      daysSinceCheckIn: row.daysSinceCheckIn ?? undefined,
      subscriptionEndsAt: row.subscriptionEndsAt ?? undefined,
      unpaidPendingCount: row.unpaidPendingCount,
      lastEvaluatedAt: row.lastEvaluatedAt,
    };
  }

  private toTaskDto(row: {
    id: string;
    memberId: string;
    assignedToId: string | null;
    status: RetentionTaskStatus;
    priority: number;
    title: string;
    note: string | null;
    dueDate: Date | null;
    resolvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    assignedTo: { id: string; email: string } | null;
    member: {
      user: {
        firstName: string;
        lastName: string;
        email: string;
      };
    };
  }): RetentionTaskResponseDto {
    return {
      id: row.id,
      memberId: row.memberId,
      memberName:
        `${row.member.user.firstName} ${row.member.user.lastName}`.trim(),
      memberEmail: row.member.user.email,
      assignedToId: row.assignedToId ?? undefined,
      assignedToEmail: row.assignedTo?.email ?? undefined,
      status: row.status,
      priority: row.priority,
      title: row.title,
      note: row.note ?? undefined,
      dueDate: row.dueDate ?? undefined,
      resolvedAt: row.resolvedAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
